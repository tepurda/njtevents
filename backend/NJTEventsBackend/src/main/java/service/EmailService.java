package service;

import exceptions.EmailSendException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String posiljalac;

    public EmailService(JavaMailSender mailSender,
            @Value("${spring.mail.username}") String posiljalac) {
        this.mailSender = mailSender;
        this.posiljalac = posiljalac;
    }

    /**
     * Šalje novom korisniku podatke za prijavu. Poziva se sinhrono unutar transakcije
     * kreiranja korisnika — ako slanje ne uspe, baca EmailSendException i nalog se ne čuva.
     */
    public void posaljiPrivremenuSifru(String email, String ime, String privremenaSifra) {
        posalji(email, "NJT Events — podaci za prijavu", """
                Poštovani/a %s,

                Za Vas je kreiran nalog u sistemu NJT Events za rezervaciju sala na FON-u.

                Email: %s
                Privremena šifra: %s

                Preporučujemo da nakon prve prijave promenite šifru (opcija "Promeni šifru").

                NJT Events
                """.formatted(ime, email, privremenaSifra),
                "Slanje emaila sa šifrom nije uspelo. Korisnik nije kreiran — pokušajte ponovo.");
    }

    /** Šalje jednokratni link za promenu šifre ("Zaboravljena šifra"). */
    public void posaljiLinkZaReset(String email, String ime, String link, long trajanjeMinuta) {
        posalji(email, "NJT Events — promena šifre", """
                Poštovani/a %s,

                Primili smo zahtev za promenu šifre za Vaš nalog u sistemu NJT Events.
                Novu šifru možete postaviti preko sledećeg linka:

                %s

                Link važi %d minuta i može se iskoristiti samo jednom.
                Ako niste Vi zatražili promenu šifre, slobodno ignorišite ovaj email — Vaša šifra ostaje ista.

                NJT Events
                """.formatted(ime, link, trajanjeMinuta),
                "Slanje emaila nije uspelo. Pokušajte ponovo za nekoliko minuta.");
    }

    private void posalji(String primalac, String naslov, String tekst, String porukaGreske) {
        SimpleMailMessage poruka = new SimpleMailMessage();
        poruka.setFrom(posiljalac);
        poruka.setTo(primalac);
        poruka.setSubject(naslov);
        poruka.setText(tekst);

        try {
            mailSender.send(poruka);
            log.info("Poslat email \"{}\" na {}", naslov, primalac);
        } catch (MailException e) {
            log.error("Slanje emaila \"{}\" na {} nije uspelo", naslov, primalac, e);
            throw new EmailSendException(porukaGreske, e);
        }
    }
}
