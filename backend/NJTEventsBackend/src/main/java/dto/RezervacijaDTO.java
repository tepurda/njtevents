package dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class RezervacijaDTO {

    private int rezervacijaID;

    @NotBlank(message = "Naziv rezervacije je obavezan!")
    private String naziv;

    private String opis;

    @NotNull(message = "Datum je obavezan!")
    private LocalDate datum;

    @NotNull(message = "Vreme početka je obavezno!")
    private LocalTime vremeOd;

    @NotNull(message = "Vreme završetka je obavezno!")
    private LocalTime vremeDo;

    @Min(value = 1, message = "Broj prisutnih mora biti najmanje 1!")
    private int brojPrisutnih;

    private KorisnikDTO korisnik;
    private AdministratorDTO administrator;
    private String statusZahteva;

    @NotEmpty(message = "Morate izabrati barem jednu salu!")
    private List<SalaDTO> sale;

    public RezervacijaDTO() {}

    public RezervacijaDTO(int rezervacijaID, String naziv, String opis, LocalDate datum,
                          LocalTime vremeOd, LocalTime vremeDo, int brojPrisutnih,
                          KorisnikDTO korisnik, List<SalaDTO> sale) {
        this.rezervacijaID = rezervacijaID;
        this.naziv = naziv;
        this.opis = opis;
        this.datum = datum;
        this.vremeOd = vremeOd;
        this.vremeDo = vremeDo;
        this.brojPrisutnih = brojPrisutnih;
        this.korisnik = korisnik;
        this.sale = sale;
    }

    public int getRezervacijaID() { return rezervacijaID; }
    public void setRezervacijaID(int rezervacijaID) { this.rezervacijaID = rezervacijaID; }

    public String getNaziv() { return naziv; }
    public void setNaziv(String naziv) { this.naziv = naziv; }

    public String getOpis() { return opis; }
    public void setOpis(String opis) { this.opis = opis; }

    public LocalDate getDatum() { return datum; }
    public void setDatum(LocalDate datum) { this.datum = datum; }

    public LocalTime getVremeOd() { return vremeOd; }
    public void setVremeOd(LocalTime vremeOd) { this.vremeOd = vremeOd; }

    public LocalTime getVremeDo() { return vremeDo; }
    public void setVremeDo(LocalTime vremeDo) { this.vremeDo = vremeDo; }

    public int getBrojPrisutnih() { return brojPrisutnih; }
    public void setBrojPrisutnih(int brojPrisutnih) { this.brojPrisutnih = brojPrisutnih; }

    public KorisnikDTO getKorisnik() { return korisnik; }
    public void setKorisnik(KorisnikDTO korisnik) { this.korisnik = korisnik; }

    public AdministratorDTO getAdministrator() { return administrator; }
    public void setAdministrator(AdministratorDTO administrator) { this.administrator = administrator; }

    public String getStatusZahteva() { return statusZahteva; }
    public void setStatusZahteva(String statusZahteva) { this.statusZahteva = statusZahteva; }

    public List<SalaDTO> getSale() { return sale; }
    public void setSale(List<SalaDTO> sale) { this.sale = sale; }
}