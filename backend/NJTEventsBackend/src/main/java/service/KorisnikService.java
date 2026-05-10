package service;

import dto.KorisnikUpdateDTO;
import entities.Korisnik;
import exceptions.ConflictException;
import exceptions.ResourceNotFoundException;
import exceptions.ValidationException;
import java.time.LocalDate;
import repository.KorisnikRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import repository.RezervacijaRepository;

@Service
public class KorisnikService {

    private final KorisnikRepository korisnikRepository;
    private final PasswordEncoder passwordEncoder;
    private final RezervacijaRepository rezervacijaRepository;

    public KorisnikService(KorisnikRepository korisnikRepository,
            PasswordEncoder passwordEncoder,
            RezervacijaRepository rezervacijaRepository) {
        this.korisnikRepository = korisnikRepository;
        this.passwordEncoder = passwordEncoder;
        this.rezervacijaRepository = rezervacijaRepository;
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

    public Korisnik sacuvajKorisnika(Korisnik korisnik) {
        Optional<Korisnik> postojeci = korisnikRepository.findByEmail(korisnik.getEmail());
        if (postojeci.isPresent() && postojeci.get().getKorisnikID() != korisnik.getKorisnikID()) {
            throw new ConflictException("Korisnik sa ovim emailom već postoji!");
        }
        korisnik.setSifra(passwordEncoder.encode(korisnik.getSifra()));
        return korisnikRepository.save(korisnik);
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
