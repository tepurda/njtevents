
package dto;

/**
 *
 * @author pite
 */


import entities.StatusZahteva;
import java.time.LocalDateTime;

public class ZahtevZaOdobrenjeDTO {

    private int zahtevID;
    private LocalDateTime datumSlanja;
    private LocalDateTime datumObrade;
    private StatusZahteva status;
    private String napomena;
    private RezervacijaDTO rezervacija;
    private AdministratorDTO administrator;

    public ZahtevZaOdobrenjeDTO() {}

    public ZahtevZaOdobrenjeDTO(int zahtevID, LocalDateTime datumSlanja, LocalDateTime datumObrade,
                                 StatusZahteva status, String napomena,
                                 RezervacijaDTO rezervacija, AdministratorDTO administrator) {
        this.zahtevID = zahtevID;
        this.datumSlanja = datumSlanja;
        this.datumObrade = datumObrade;
        this.status = status;
        this.napomena = napomena;
        this.rezervacija = rezervacija;
        this.administrator = administrator;
    }

    public int getZahtevID() { return zahtevID; }
    public void setZahtevID(int zahtevID) { this.zahtevID = zahtevID; }

    public LocalDateTime getDatumSlanja() { return datumSlanja; }
    public void setDatumSlanja(LocalDateTime datumSlanja) { this.datumSlanja = datumSlanja; }

    public LocalDateTime getDatumObrade() { return datumObrade; }
    public void setDatumObrade(LocalDateTime datumObrade) { this.datumObrade = datumObrade; }

    public StatusZahteva getStatus() { return status; }
    public void setStatus(StatusZahteva status) { this.status = status; }

    public String getNapomena() { return napomena; }
    public void setNapomena(String napomena) { this.napomena = napomena; }

    public RezervacijaDTO getRezervacija() { return rezervacija; }
    public void setRezervacija(RezervacijaDTO rezervacija) { this.rezervacija = rezervacija; }

    public AdministratorDTO getAdministrator() { return administrator; }
    public void setAdministrator(AdministratorDTO administrator) { this.administrator = administrator; }
}
