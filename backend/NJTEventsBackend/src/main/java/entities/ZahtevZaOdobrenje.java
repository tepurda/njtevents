package entities;
import jakarta.persistence.*;
import java.time.*;
import java.util.List;
/**
 *
 * @author pite
 */
@Entity
@Table(name = "zahtev_za_odobrenje")
public class ZahtevZaOdobrenje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int zahtevID;

    private LocalDateTime datumSlanja;
    private LocalDateTime datumObrade;

    @Enumerated(EnumType.STRING)
    private StatusZahteva status;

    private String napomena;

    @OneToOne
    @JoinColumn(name = "rezervacijaID")
    private Rezervacija rezervacija;

    @ManyToOne
    @JoinColumn(name = "administratorID")
    private Administrator administrator;

    public ZahtevZaOdobrenje() {
    }

    public ZahtevZaOdobrenje(int zahtevID, LocalDateTime datumSlanja, LocalDateTime datumObrade,
            StatusZahteva status, String napomena,
            Rezervacija rezervacija, Administrator administrator) {
        this.zahtevID = zahtevID;
        this.datumSlanja = datumSlanja;
        this.datumObrade = datumObrade;
        this.status = status;
        this.napomena = napomena;
        this.rezervacija = rezervacija;
        this.administrator = administrator;
    }

    public int getZahtevID() {
        return zahtevID;
    }

    public void setZahtevID(int zahtevID) {
        this.zahtevID = zahtevID;
    }

    public LocalDateTime getDatumSlanja() {
        return datumSlanja;
    }

    public void setDatumSlanja(LocalDateTime datumSlanja) {
        this.datumSlanja = datumSlanja;
    }

    public LocalDateTime getDatumObrade() {
        return datumObrade;
    }

    public void setDatumObrade(LocalDateTime datumObrade) {
        this.datumObrade = datumObrade;
    }

    public StatusZahteva getStatus() {
        return status;
    }

    public void setStatus(StatusZahteva status) {
        this.status = status;
    }

    public String getNapomena() {
        return napomena;
    }

    public void setNapomena(String napomena) {
        this.napomena = napomena;
    }

    public Rezervacija getRezervacija() {
        return rezervacija;
    }

    public void setRezervacija(Rezervacija rezervacija) {
        this.rezervacija = rezervacija;
    }

    public Administrator getAdministrator() {
        return administrator;
    }

    public void setAdministrator(Administrator administrator) {
        this.administrator = administrator;
    }
}
