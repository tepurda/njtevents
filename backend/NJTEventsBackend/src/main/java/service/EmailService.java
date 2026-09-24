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
        SimpleMailMessage poruka = new SimpleMailMessage();
        poruka.setFrom(posiljalac);
        poruka.setTo(email);
        poruka.setSubject("NJT Events — podaci za prijavu");
        poruka.setText("""
                Poštovani/a %s,

                Za Vas je kreiran nalog u sistemu NJT Events za rezervaciju sala na FON-u.

                Email: %s
                Privremena šifra: %s

                Preporučujemo da nakon prve prijave promenite šifru (opcija "Promeni šifru").

                NJT Events
                """.formatted(ime, email, privremenaSifra));

        try {
            mailSender.send(poruka);
            log.info("Poslata privremena šifra na {}", email);
        } catch (MailException e) {
            log.error("Slanje emaila na {} nije uspelo", email, e);
            throw new EmailSendException(
                    "Slanje emaila sa šifrom nije uspelo. Korisnik nije kreiran — pokušajte ponovo.", e);
        }
    }
}
