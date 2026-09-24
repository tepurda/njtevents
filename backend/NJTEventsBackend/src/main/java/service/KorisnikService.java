package service;

import dto.KorisnikUpdateDTO;
import dto.PromenaSifreDTO;
import entities.Administrator;
import entities.Korisnik;
import entities.Rezervacija;
import entities.StatusZahteva;
import exceptions.ConflictException;
import exceptions.ResourceNotFoundException;
import exceptions.ValidationException;
import java.time.LocalDate;
import repository.AdministratorRepository;
import repository.KorisnikRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import repository.RezervacijaRepository;

@Service
public class KorisnikService {

    private final KorisnikRepository korisnikRepository;
    private final PasswordEncoder passwordEncoder;
    private final RezervacijaRepository rezervacijaRepository;
    private final PasswordGenerator passwordGenerator;
    private final EmailService emailService;
    private final AdministratorRepository administratorRepository;

    public KorisnikService(KorisnikRepository korisnikRepository,
            PasswordEncoder passwordEncoder,
            RezervacijaRepository rezervacijaRepository,
            PasswordGenerator passwordGenerator,
            EmailService emailService,
            AdministratorRepository administratorRepository) {
        this.korisnikRepository = korisnikRepository;
        this.passwordEncoder = passwordEncoder;
        this.rezervacijaRepository = rezervacijaRepository;
        this.passwordGenerator = passwordGenerator;
        this.emailService = emailService;
        this.administratorRepository = administratorRepository;
    }

    public List<Korisnik> getSviKorisnici() {
        return korisnikRepository.findAll();
    }

    public Optional<Korisnik> getKorisnikById(int id) {
        return korisnikRepository.findById(id);
    }

    
    public Korisnik azurirajKorisnika(int id, KorisnikUpdateDTO dto) {
    Korisnik postojeci = korisnikRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

    if (dto.getIme() != null && !dto.getIme().isBlank()) {
        postojeci.setIme(dto.getIme());
    }
    if (dto.getPrezime() != null && !dto.getPrezime().isBlank()) {
        postojeci.setPrezime(dto.getPrezime());
    }
    if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
        Optional<Korisnik> emailPostoji = korisnikRepository.findByEmail(dto.getEmail());
        if (emailPostoji.isPresent() && emailPostoji.get().getKorisnikID() != id) {
            throw new ConflictException("Korisnik sa ovim emailom već postoji!");
        }
        postojeci.setEmail(dto.getEmail());
    }
    if (dto.getSifra() != null && !dto.getSifra().isBlank()) {
        if (dto.getSifra().length() < 6) {
            throw new ValidationException("Šifra mora imati najmanje 6 karaktera!");
        }
        postojeci.setSifra(passwordEncoder.encode(dto.getSifra()));
    }

    return korisnikRepository.save(postojeci);
}
    
    
    
    public Optional<Korisnik> getKorisnikByEmail(String email) {
        return korisnikRepository.findByEmail(email);
    }

    /**
     * Kreira korisnika sa nasumičnom privremenom šifrom i šalje je emailom.
     * Email se šalje unutar transakcije: ako slanje ne uspe (EmailSendException),
     * transakcija se poništava i korisnik se ne čuva u bazi.
     */
    @Transactional
    public Korisnik kreirajKorisnika(Korisnik korisnik) {
        if (korisnikRepository.findByEmail(korisnik.getEmail()).isPresent()) {
            throw new ConflictException("Korisnik sa ovim emailom već postoji!");
        }
        if (administratorRepository.findByEmail(korisnik.getEmail()).isPresent()) {
            throw new ConflictException("Administrator sa ovim emailom već postoji!");
        }
        String privremenaSifra = passwordGenerator.generisi();
        korisnik.setSifra(passwordEncoder.encode(privremenaSifra));
        // flush pre slanja emaila — eventualna greška baze (npr. unique email) javlja se pre nego što email ode
        Korisnik sacuvan = korisnikRepository.saveAndFlush(korisnik);
        emailService.posaljiPrivremenuSifru(sacuvan.getEmail(), sacuvan.getIme(), privremenaSifra);
        return sacuvan;
    }

    /**
     * Korisnik menja sopstvenu šifru. Email se uzima iz JWT tokena, ne iz zahteva.
     * Pogrešna trenutna šifra vraća 400 (ne 401), da frontend interceptor ne bi izlogovao korisnika.
     */
    @Transactional
    public void promeniSifru(String email, PromenaSifreDTO dto) {
        Korisnik korisnik = korisnikRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (!passwordEncoder.matches(dto.getStaraSifra(), korisnik.getSifra())) {
            throw new ValidationException("Trenutna šifra nije ispravna!");
        }
        if (dto.getStaraSifra().equals(dto.getNovaSifra())) {
            throw new ValidationException("Nova šifra mora biti različita od trenutne!");
        }
        korisnik.setSifra(passwordEncoder.encode(dto.getNovaSifra()));
        korisnikRepository.save(korisnik);
    }

    /**
     * Unapređuje korisnika u administratora ("premeštanje" — Korisnik i Administrator su odvojene tabele):
     * 1. pravi se Administrator sa istim imenom, prezimenom, emailom i istim BCrypt hešom šifre
     *    (osoba se prijavljuje istom šifrom, sada kao admin);
     * 2. sve rezervacije korisnika prelaze na novi admin nalog (istorija se čuva);
     * 3. red u tabeli Korisnik se briše.
     * Odbija se ako korisnik ima zahteve na čekanju — admin ih prvo mora obraditi.
     */
    @Transactional
    public Administrator unaprediUAdministratora(int id) {
        Korisnik korisnik = korisnikRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (administratorRepository.findByEmail(korisnik.getEmail()).isPresent()) {
            throw new ConflictException("Administrator sa ovim emailom već postoji!");
        }

        List<Rezervacija> rezervacije = korisnik.getRezervacije() != null
                ? korisnik.getRezervacije() : List.of();

        long naCekanju = rezervacije.stream()
                .filter(r -> r.getZahtev() != null && r.getZahtev().getStatus() == StatusZahteva.NA_CEKANJU)
                .count();
        if (naCekanju > 0) {
            throw new ValidationException("Korisnik ima " + naCekanju
                    + (naCekanju == 1 ? " zahtev" : " zahteva")
                    + " na čekanju. Odobrite ili odbijte ih pre unapređivanja.");
        }

        Administrator admin = new Administrator();
        admin.setIme(korisnik.getIme());
        admin.setPrezime(korisnik.getPrezime());
        admin.setEmail(korisnik.getEmail());
        admin.setSifra(korisnik.getSifra()); // već je BCrypt heš — ne enkodirati ponovo
        Administrator noviAdmin = administratorRepository.save(admin);

        for (Rezervacija r : rezervacije) {
            r.setKorisnik(null);
            r.setAdministrator(noviAdmin);
        }
        rezervacijaRepository.saveAll(rezervacije);

        korisnikRepository.delete(korisnik);
        return noviAdmin;
    }

    public void obrisiKorisnika(int id) {
        Korisnik korisnik = korisnikRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        LocalDate danas = LocalDate.now();

        // Proveri buduće rezervacije
        boolean imaBuduceRezervacije = korisnik.getRezervacije() != null
                && korisnik.getRezervacije().stream()
                        .anyMatch(r -> !r.getDatum().isBefore(danas));

        if (imaBuduceRezervacije) {
            throw new ValidationException("Korisnik se ne može obrisati jer ima aktivne rezervacije u budućnosti!");
        }

        // Postavi korisnika na null za prošle rezervacije
        if (korisnik.getRezervacije() != null) {
            korisnik.getRezervacije().stream()
                    .filter(r -> r.getDatum().isBefore(danas))
                    .forEach(r -> {
                        r.setKorisnik(null);
                        rezervacijaRepository.save(r);
                    });
        }

        korisnikRepository.deleteById(id);
    }
}
