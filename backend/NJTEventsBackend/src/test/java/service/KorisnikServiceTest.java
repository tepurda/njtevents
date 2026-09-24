package service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import dto.PromenaSifreDTO;
import entities.Korisnik;
import exceptions.ConflictException;
import exceptions.EmailSendException;
import exceptions.ValidationException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import repository.KorisnikRepository;
import repository.RezervacijaRepository;

class KorisnikServiceTest {

    private KorisnikRepository korisnikRepository;
    private EmailService emailService;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private KorisnikService service;

    @BeforeEach
    void setUp() {
        korisnikRepository = mock(KorisnikRepository.class);
        emailService = mock(EmailService.class);
        service = new KorisnikService(korisnikRepository, encoder,
                mock(RezervacijaRepository.class), new PasswordGenerator(), emailService);
        when(korisnikRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
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
