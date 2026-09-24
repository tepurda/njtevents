package service;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/**
 * Generiše nasumične privremene šifre.
 * Garantuje bar jedno malo slovo, veliko slovo, cifru i specijalni znak.
 * Izostavljeni su vizuelno slični karakteri (0/O, 1/l/I) da bi šifra bila lakša za prepisivanje iz emaila.
 */
@Component
public class PasswordGenerator {

    static final int DUZINA = 12;

    private static final String MALA = "abcdefghijkmnpqrstuvwxyz";
    private static final String VELIKA = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String CIFRE = "23456789";
    private static final String SPECIJALNI = "#$%&*+?@";
    private static final String SVI = MALA + VELIKA + CIFRE + SPECIJALNI;

    private final SecureRandom random = new SecureRandom();

    public String generisi() {
        char[] sifra = new char[DUZINA];
        sifra[0] = nasumicno(MALA);
        sifra[1] = nasumicno(VELIKA);
        sifra[2] = nasumicno(CIFRE);
        sifra[3] = nasumicno(SPECIJALNI);
        for (int i = 4; i < DUZINA; i++) {
            sifra[i] = nasumicno(SVI);
        }
        // Fisher–Yates mešanje da garantovani karakteri ne budu uvek na početku
        for (int i = DUZINA - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char tmp = sifra[i];
            sifra[i] = sifra[j];
            sifra[j] = tmp;
        }
        return new String(sifra);
    }

    private char nasumicno(String skup) {
        return skup.charAt(random.nextInt(skup.length()));
    }
}
