package service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PasswordGeneratorTest {

    private final PasswordGenerator generator = new PasswordGenerator();

    @Test
    void generisanaSifraImaSveKlaseKaraktera() {
        for (int i = 0; i < 1_000; i++) {
            String s = generator.generisi();
            assertEquals(PasswordGenerator.DUZINA, s.length());
            assertTrue(s.chars().anyMatch(Character::isLowerCase), s);
            assertTrue(s.chars().anyMatch(Character::isUpperCase), s);
            assertTrue(s.chars().anyMatch(Character::isDigit), s);
            assertTrue(s.chars().anyMatch(c -> "#$%&*+?@".indexOf(c) >= 0), s);
            assertTrue(s.chars().noneMatch(c -> "0O1lI".indexOf(c) >= 0), s);
        }
    }

    @Test
    void sifreSuJedinstvene() {
        Set<String> sifre = new HashSet<>();
        for (int i = 0; i < 10_000; i++) {
            assertTrue(sifre.add(generator.generisi()));
        }
    }
}
