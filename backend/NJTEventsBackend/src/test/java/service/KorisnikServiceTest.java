package service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import dto.PromenaSifreDTO;
import entities.Administrator;
import entities.Korisnik;
import entities.Rezervacija;
import entities.StatusZahteva;
import entities.ZahtevZaOdobrenje;
import exceptions.ConflictException;
import exceptions.EmailSendException;
import exceptions.ResourceNotFoundException;
import exceptions.ValidationException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import repository.AdministratorRepository;
import repository.KorisnikRepository;
import repository.RezervacijaRepository;

class KorisnikServiceTest {

    private KorisnikRepository korisnikRepository;
    private AdministratorRepository administratorRepository;
    private RezervacijaRepository rezervacijaRepository;
    private EmailService emailService;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private KorisnikService service;

    @BeforeEach
    void setUp() {
        korisnikRepository = mock(KorisnikRepository.class);
        administratorRepository = mock(AdministratorRepository.class);
        rezervacijaRepository = mock(RezervacijaRepository.class);
        emailService = mock(EmailService.class);
        service = new KorisnikService(korisnikRepository, encoder,
                rezervacijaRepository, new PasswordGenerator(), emailService, administratorRepository);
        when(korisnikRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(administratorRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(administratorRepository.findByEmail(any())).thenReturn(Optional.empty());
    }

    private static Korisnik noviKorisnik() {
        Korisnik k = new Korisnik();
        k.setIme("Ana");
        k.setPrezime("Anić");
        k.setEmail("ana@example.com");
        return k;
    }

    @Test
    void kreirajKorisnika_cuvaBcryptHesISaljeIstuSifruEmailom() {
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.empty());

        Korisnik sacuvan = service.kreirajKorisnika(noviKorisnik());

        ArgumentCaptor<String> poslataSifra = ArgumentCaptor.forClass(String.class);
        verify(emailService).posaljiPrivremenuSifru(eq("ana@example.com"), eq("Ana"), poslataSifra.capture());
        assertNotEquals(poslataSifra.getValue(), sacuvan.getSifra(), "u bazi ne sme biti plain šifra");
        assertTrue(encoder.matches(poslataSifra.getValue(), sacuvan.getSifra()));
    }

    @Test
    void kreirajKorisnika_postojeciEmail_bacaConflictINeSaljeEmail() {
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(new Korisnik()));

        assertThrows(ConflictException.class, () -> service.kreirajKorisnika(noviKorisnik()));
        verify(korisnikRepository, never()).saveAndFlush(any());
        verifyNoInteractions(emailService);
    }

    @Test
    void kreirajKorisnika_neuspesanEmail_propagiraIzuzetakZaRollback() {
        when(korisnikRepository.findByEmail(any())).thenReturn(Optional.empty());
        doThrow(new EmailSendException("SMTP", null))
                .when(emailService).posaljiPrivremenuSifru(any(), any(), any());

        // RuntimeException iz @Transactional metode → Spring poništava transakciju
        assertThrows(EmailSendException.class, () -> service.kreirajKorisnika(noviKorisnik()));
    }

    @Test
    void kreirajKorisnika_emailPripadaAdminu_bacaConflict() {
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.empty());
        when(administratorRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(new Administrator()));

        assertThrows(ConflictException.class, () -> service.kreirajKorisnika(noviKorisnik()));
        verifyNoInteractions(emailService);
    }

    // ---------- Unapređivanje u administratora ----------

    private static Rezervacija rezervacija(StatusZahteva status) {
        Rezervacija r = new Rezervacija();
        ZahtevZaOdobrenje z = new ZahtevZaOdobrenje();
        z.setStatus(status);
        r.setZahtev(z);
        return r;
    }

    private Korisnik postojeciKorisnik(List<Rezervacija> rezervacije) {
        Korisnik k = noviKorisnik();
        k.setKorisnikID(7);
        k.setSifra(encoder.encode("mojaSifra1"));
        rezervacije.forEach(r -> r.setKorisnik(k));
        k.setRezervacije(rezervacije);
        when(korisnikRepository.findById(7)).thenReturn(Optional.of(k));
        return k;
    }

    @Test
    void unapredi_praviAdminaSaIstimHesom_prebacujeRezervacije_briseKorisnika() {
        Rezervacija odobrena = rezervacija(StatusZahteva.ODOBRENO);
        Rezervacija odbijena = rezervacija(StatusZahteva.ODBIJENO);
        Korisnik k = postojeciKorisnik(new ArrayList<>(List.of(odobrena, odbijena)));
        String hesPre = k.getSifra();

        Administrator admin = service.unaprediUAdministratora(7);

        assertEquals("Ana", admin.getIme());
        assertEquals("Anić", admin.getPrezime());
        assertEquals("ana@example.com", admin.getEmail());
        assertEquals(hesPre, admin.getSifra(), "heš se prenosi, ne enkodira ponovo");
        assertTrue(encoder.matches("mojaSifra1", admin.getSifra()));
        for (Rezervacija r : List.of(odobrena, odbijena)) {
            assertNull(r.getKorisnik());
            assertSame(admin, r.getAdministrator());
        }
        verify(rezervacijaRepository).saveAll(List.of(odobrena, odbijena));
        verify(korisnikRepository).delete(k);
    }

    @Test
    void unapredi_zahtevNaCekanju_odbijaINistaNeMenja() {
        postojeciKorisnik(new ArrayList<>(List.of(rezervacija(StatusZahteva.NA_CEKANJU))));

        ValidationException ex = assertThrows(ValidationException.class,
                () -> service.unaprediUAdministratora(7));
        assertTrue(ex.getMessage().contains("1 zahtev na čekanju"), ex.getMessage());
        verify(administratorRepository, never()).save(any());
        verify(korisnikRepository, never()).delete(any());
    }

    @Test
    void unapredi_adminSaIstimEmailomVecPostoji_bacaConflict() {
        postojeciKorisnik(new ArrayList<>());
        when(administratorRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(new Administrator()));

        assertThrows(ConflictException.class, () -> service.unaprediUAdministratora(7));
        verify(korisnikRepository, never()).delete(any());
    }

    @Test
    void unapredi_nepostojeciKorisnik_baca404() {
        when(korisnikRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.unaprediUAdministratora(99));
    }

    // ---------- Promena šifre ----------

    @Test
    void promeniSifru_ispravnaStaraSifra_cuvaNoviHes() {
        Korisnik k = noviKorisnik();
        k.setSifra(encoder.encode("staraSifra1"));
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(k));

        service.promeniSifru("ana@example.com", new PromenaSifreDTO("staraSifra1", "novaSifra1"));

        verify(korisnikRepository).save(k);
        assertTrue(encoder.matches("novaSifra1", k.getSifra()));
    }

    @Test
    void promeniSifru_pogresnaStaraSifra_baca400INeCuva() {
        Korisnik k = noviKorisnik();
        k.setSifra(encoder.encode("staraSifra1"));
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(k));

        assertThrows(ValidationException.class,
                () -> service.promeniSifru("ana@example.com", new PromenaSifreDTO("pogresna", "novaSifra1")));
        verify(korisnikRepository, never()).save(any());
    }

    @Test
    void promeniSifru_istaSifra_odbija() {
        Korisnik k = noviKorisnik();
        k.setSifra(encoder.encode("staraSifra1"));
        when(korisnikRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(k));

        assertThrows(ValidationException.class,
                () -> service.promeniSifru("ana@example.com", new PromenaSifreDTO("staraSifra1", "staraSifra1")));
    }
}
