package service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import entities.Administrator;
import entities.Korisnik;
import entities.TokenZaResetSifre;
import exceptions.EmailSendException;
import exceptions.ValidationException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import repository.AdministratorRepository;
import repository.KorisnikRepository;
import repository.TokenZaResetSifreRepository;

class ResetSifreServiceTest {

    private static final ZoneId ZONA = ZoneId.of("Europe/Belgrade");
    private static final Clock SAT = Clock.fixed(Instant.parse("2026-09-24T10:00:00Z"), ZONA);
    private static final LocalDateTime SADA = LocalDateTime.now(SAT);

    private TokenZaResetSifreRepository tokenRepository;
    private KorisnikRepository korisnikRepository;
    private AdministratorRepository administratorRepository;
    private EmailService emailService;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private ResetSifreService service;

    @BeforeEach
    void setUp() {
        tokenRepository = mock(TokenZaResetSifreRepository.class);
        korisnikRepository = mock(KorisnikRepository.class);
        administratorRepository = mock(AdministratorRepository.class);
        emailService = mock(EmailService.class);
        service = new ResetSifreService(tokenRepository, korisnikRepository, administratorRepository,
                encoder, emailService, "http://localhost:3000/", SAT);
        when(administratorRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(korisnikRepository.findByEmail(any())).thenReturn(Optional.empty());
    }

    private Korisnik korisnik() {
        Korisnik k = new Korisnik();
        k.setIme("Ana");
        k.setEmail("ana@example.com");
        k.setSifra(encoder.encode("staraSifra1"));
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(k));
        return k;
    }

    /** Pokreće zahtev i vraća sirovi token iz linka poslatog emailom. */
    private String zatraziIUhvatiToken(String email) {
        service.zatraziReset(email);
        ArgumentCaptor<String> link = ArgumentCaptor.forClass(String.class);
        verify(emailService).posaljiLinkZaReset(eq(email), any(), link.capture(), eq(30L));
        assertTrue(link.getValue().startsWith("http://localhost:3000/reset-sifre?token="), link.getValue());
        return link.getValue().substring(link.getValue().indexOf("token=") + 6);
    }

    @Test
    void zatraziReset_postojeciKorisnik_cuvaSamoHesTokenaISaljeLink() {
        korisnik();

        String token = zatraziIUhvatiToken("ana@example.com");

        ArgumentCaptor<TokenZaResetSifre> sacuvan = ArgumentCaptor.forClass(TokenZaResetSifre.class);
        verify(tokenRepository).save(sacuvan.capture());
        assertNotEquals(token, sacuvan.getValue().getTokenHash(), "u bazi ne sme biti sirovi token");
        assertEquals(ResetSifreService.hes(token), sacuvan.getValue().getTokenHash());
        assertEquals(SADA.plusMinutes(30), sacuvan.getValue().getIstice());
        verify(tokenRepository).obrisiZaEmail("ana@example.com");
    }

    @Test
    void zatraziReset_nepostojeciNalog_tihoSeZavrsava() {
        assertDoesNotThrow(() -> service.zatraziReset("nema@example.com"));
        verifyNoInteractions(emailService);
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void zatraziReset_ponovljenUnutarMinuta_neSaljeNoviEmail() {
        korisnik();
        when(tokenRepository.existsByEmailAndKreiranAfter("ana@example.com", SADA.minusSeconds(60)))
                .thenReturn(true);

        service.zatraziReset("ana@example.com");

        verifyNoInteractions(emailService);
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void zatraziReset_radiIZaAdministratora() {
        Administrator a = new Administrator();
        a.setIme("Admin");
        a.setEmail("admin@example.com");
        when(administratorRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(a));

        zatraziIUhvatiToken("admin@example.com");
    }

    @Test
    void zatraziReset_neuspesanEmail_propagiraIzuzetakZaRollback() {
        korisnik();
        doThrow(new EmailSendException("SMTP", null))
                .when(emailService).posaljiLinkZaReset(any(), any(), any(), anyLong());

        assertThrows(EmailSendException.class, () -> service.zatraziReset("ana@example.com"));
    }

    @Test
    void resetujSifru_ispravanToken_menjaSifruIBriseToken() {
        Korisnik k = korisnik();
        when(tokenRepository.findByTokenHash(ResetSifreService.hes("abc")))
                .thenReturn(Optional.of(new TokenZaResetSifre("h", "ana@example.com", SADA, SADA.plusMinutes(30))));

        service.resetujSifru("abc", "novaSifra1");

        assertTrue(encoder.matches("novaSifra1", k.getSifra()));
        verify(korisnikRepository).save(k);
        verify(tokenRepository).obrisiZaEmail("ana@example.com");
    }

    @Test
    void resetujSifru_istekaoToken_odbija() {
        Korisnik k = korisnik();
        String stariHes = k.getSifra();
        when(tokenRepository.findByTokenHash(any()))
                .thenReturn(Optional.of(new TokenZaResetSifre("h", "ana@example.com",
                        SADA.minusMinutes(31), SADA.minusMinutes(1))));

        assertThrows(ValidationException.class, () -> service.resetujSifru("abc", "novaSifra1"));
        assertEquals(stariHes, k.getSifra());
    }

    @Test
    void proveriToken_vazeciToken_prolaziBezMenjanjaSifre() {
        Korisnik k = korisnik();
        String stariHes = k.getSifra();
        when(tokenRepository.findByTokenHash(ResetSifreService.hes("abc")))
                .thenReturn(Optional.of(new TokenZaResetSifre("h", "ana@example.com", SADA, SADA.plusMinutes(30))));

        assertDoesNotThrow(() -> service.proveriToken("abc"));
        assertEquals(stariHes, k.getSifra());
        verify(tokenRepository, never()).obrisiZaEmail(any());
    }

    @Test
    void proveriToken_istekaoIliIskoriscen_odbija() {
        when(tokenRepository.findByTokenHash(ResetSifreService.hes("istekao")))
                .thenReturn(Optional.of(new TokenZaResetSifre("h", "ana@example.com",
                        SADA.minusMinutes(31), SADA.minusMinutes(1))));
        when(tokenRepository.findByTokenHash(ResetSifreService.hes("iskoriscen"))).thenReturn(Optional.empty());

        assertThrows(ValidationException.class, () -> service.proveriToken("istekao"));
        assertThrows(ValidationException.class, () -> service.proveriToken("iskoriscen"));
    }

    @Test
    void resetujSifru_nepostojeciIliIskoriscenToken_odbija() {
        when(tokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());
        assertThrows(ValidationException.class, () -> service.resetujSifru("abc", "novaSifra1"));
    }
}
