package service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import exceptions.EmailSendException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class EmailServiceTest {

    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final EmailService emailService = new EmailService(mailSender, "fonsale@gmail.com");

    @Test
    void saljePorukuSaPrivremenomSifrom() {
        emailService.posaljiPrivremenuSifru("ana@example.com", "Ana", "aX3k#9mQ");

        ArgumentCaptor<SimpleMailMessage> poruka = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(poruka.capture());
        assertEquals("fonsale@gmail.com", poruka.getValue().getFrom());
        assertArrayEquals(new String[]{"ana@example.com"}, poruka.getValue().getTo());
        assertTrue(poruka.getValue().getText().contains("aX3k#9mQ"));
    }

    @Test
    void greskaSmtpServeraSeMapiraUEmailSendException() {
        doThrow(new MailSendException("535 Authentication failed")).when(mailSender).send(any(SimpleMailMessage.class));

        assertThrows(EmailSendException.class,
                () -> emailService.posaljiPrivremenuSifru("ana@example.com", "Ana", "aX3k#9mQ"));
    }
}
