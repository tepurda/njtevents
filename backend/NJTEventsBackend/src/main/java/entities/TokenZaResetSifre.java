package entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Jednokratni token za resetovanje šifre.
 * U bazi se čuva samo SHA-256 heš tokena — sirovi token postoji samo u linku poslatom emailom,
 * pa ni neko ko vidi bazu ne može da ga iskoristi.
 * Vezan je za email (ne FK), jer važi i za Korisnika i za Administratora i ne sme da blokira
 * brisanje/unapređivanje korisnika.
 */
@Entity
@Table(name = "token_za_reset_sifre")
public class TokenZaResetSifre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int tokenID;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDateTime kreiran;

    @Column(nullable = false)
    private LocalDateTime istice;

    public TokenZaResetSifre() {
    }

    public TokenZaResetSifre(String tokenHash, String email, LocalDateTime kreiran, LocalDateTime istice) {
        this.tokenHash = tokenHash;
        this.email = email;
        this.kreiran = kreiran;
        this.istice = istice;
    }

    public int getTokenID() { return tokenID; }

    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getKreiran() { return kreiran; }
    public void setKreiran(LocalDateTime kreiran) { this.kreiran = kreiran; }

    public LocalDateTime getIstice() { return istice; }
    public void setIstice(LocalDateTime istice) { this.istice = istice; }
}
