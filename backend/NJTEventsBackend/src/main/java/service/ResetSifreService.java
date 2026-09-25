package service;

import entities.Administrator;
import entities.Korisnik;
import entities.TokenZaResetSifre;
import exceptions.ValidationException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.AdministratorRepository;
import repository.KorisnikRepository;
import repository.TokenZaResetSifreRepository;

/**
 * "Zaboravljena šifra" preko jednokratnog linka.
 * Važi i za Korisnika i za Administratora (isti redosled pretrage kao kod prijave: prvo admin).
 */
@Service
public class ResetSifreService {

    static final Duration TRAJANJE_TOKENA = Duration.ofMinutes(30);
    /** Najmanji razmak između dva emaila za isti nalog — štiti od zatrpavanja nečijeg inboxa. */
    static final Duration PAUZA_IZMEDJU_ZAHTEVA = Duration.ofSeconds(60);

    static final String PORUKA_NEVAZECI_LINK =
            "Link za promenu šifre je istekao ili je već iskorišćen. Zatražite novi.";

    private static final Logger log = LoggerFactory.getLogger(ResetSifreService.class);

    private final TokenZaResetSifreRepository tokenRepository;
    private final KorisnikRepository korisnikRepository;
    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String frontendUrl;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    @Autowired
    public ResetSifreService(TokenZaResetSifreRepository tokenRepository,
            KorisnikRepository korisnikRepository,
            AdministratorRepository administratorRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this(tokenRepository, korisnikRepository, administratorRepository,
                passwordEncoder, emailService, frontendUrl, Clock.systemDefaultZone());
    }

    ResetSifreService(TokenZaResetSifreRepository tokenRepository,
            KorisnikRepository korisnikRepository,
            AdministratorRepository administratorRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            String frontendUrl,
            Clock clock) {
        this.tokenRepository = tokenRepository;
        this.korisnikRepository = korisnikRepository;
        this.administratorRepository = administratorRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        this.clock = clock;
    }

    /**
     * Šalje link za promenu šifre ako nalog postoji.
     * Ako nalog ne postoji, tiho se završava — kontroler uvek vraća isti odgovor,
     * da niko ne bi mogao da proverava koje email adrese imaju nalog.
     */
    @Transactional
    public void zatraziReset(String email) {
        String adresa = email.trim();
        Optional<String> ime = pronadjiIme(adresa);
        if (ime.isEmpty()) {
            log.info("Zahtev za reset šifre za nepostojeći nalog: {}", adresa);
            return;
        }

        LocalDateTime sada = LocalDateTime.now(clock);
        if (tokenRepository.existsByEmailAndKreiranAfter(adresa, sada.minus(PAUZA_IZMEDJU_ZAHTEVA))) {
            log.info("Zahtev za reset šifre za {} ignorisan — link je poslat pre manje od {}s",
                    adresa, PAUZA_IZMEDJU_ZAHTEVA.toSeconds());
            return;
        }

        // Novi zahtev poništava sve prethodne linkove za taj nalog
        tokenRepository.obrisiZaEmail(adresa);

        String token = generisiToken();
        tokenRepository.save(new TokenZaResetSifre(hes(token), adresa, sada, sada.plus(TRAJANJE_TOKENA)));

        // Ako slanje ne uspe, EmailSendException poništava transakciju (token se ne čuva) → 503
        emailService.posaljiLinkZaReset(adresa, ime.get(),
                frontendUrl + "/reset-sifre?token=" + token, TRAJANJE_TOKENA.toMinutes());
    }

    /**
     * Proverava link bez menjanja šifre — frontend je poziva čim se otvori strana,
     * da za iskorišćen ili istekao link odmah prikaže grešku umesto forme.
     */
    @Transactional(readOnly = true)
    public void proveriToken(String token) {
        vazeciToken(token);
    }

    /** Postavlja novu šifru ako je token ispravan i nije istekao. Token se nakon upotrebe briše. */
    @Transactional
    public void resetujSifru(String token, String novaSifra) {
        TokenZaResetSifre zapis = vazeciToken(token);

        String email = zapis.getEmail();
        String hesSifre = passwordEncoder.encode(novaSifra);

        Optional<Administrator> admin = administratorRepository.findByEmail(email);
        if (admin.isPresent()) {
            admin.get().setSifra(hesSifre);
            administratorRepository.save(admin.get());
        } else {
            Korisnik korisnik = korisnikRepository.findByEmail(email)
                    // nalog je u međuvremenu obrisan
                    .orElseThrow(() -> new ValidationException(PORUKA_NEVAZECI_LINK));
            korisnik.setSifra(hesSifre);
            korisnikRepository.save(korisnik);
        }

        tokenRepository.obrisiZaEmail(email);
        log.info("Šifra resetovana za {}", email);
    }

    /** Svakog sata briše istekle tokene. */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void obrisiIstekleTokene() {
        int obrisano = tokenRepository.obrisiIstekle(LocalDateTime.now(clock));
        if (obrisano > 0) {
            log.info("Obrisano isteklih tokena za reset šifre: {}", obrisano);
        }
    }

    private TokenZaResetSifre vazeciToken(String token) {
        return tokenRepository.findByTokenHash(hes(token))
                .filter(t -> t.getIstice().isAfter(LocalDateTime.now(clock)))
                .orElseThrow(() -> new ValidationException(PORUKA_NEVAZECI_LINK));
    }

    private Optional<String> pronadjiIme(String email) {
        Optional<String> admin = administratorRepository.findByEmail(email).map(Administrator::getIme);
        return admin.isPresent() ? admin : korisnikRepository.findByEmail(email).map(Korisnik::getIme);
    }

    private String generisiToken() {
        byte[] bajtovi = new byte[32];
        random.nextBytes(bajtovi);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bajtovi);
    }

    static String hes(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 nije dostupan", e);
        }
    }
}
