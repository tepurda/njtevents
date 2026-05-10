package entities;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
import jakarta.persistence.*;
import java.time.*;
import java.util.List;

/**
 *
 * @author pite
 */
@Entity
@Table(name = "rezervacija")
public class Rezervacija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int rezervacijaID;

    private String naziv;
    private String opis;
    private LocalDate datum;
    private LocalTime vremeOd;
    private LocalTime vremeDo;
    private int brojPrisutnih;

    @ManyToOne
    @JoinColumn(name = "administratorID")
    private Administrator administrator;

    public Administrator getAdministrator() {
        return administrator;
    }

    public void setAdministrator(Administrator administrator) {
        this.administrator = administrator;
    }

    @ManyToOne
    @JoinColumn(name = "korisnikID")
    private Korisnik korisnik;

    @ManyToMany
    @JoinTable(
            name = "rezervacija_sala",
            joinColumns = @JoinColumn(name = "rezervacijaID"),
            inverseJoinColumns = @JoinColumn(name = "salaID")
    )
    private List<Sala> sale;

    @OneToOne(mappedBy = "rezervacija", cascade = CascadeType.ALL)
    private ZahtevZaOdobrenje zahtev;

    public Rezervacija() {
    }

    public Rezervacija(int rezervacijaID, String naziv, String opis, LocalDate datum,
            LocalTime vremeOd, LocalTime vremeDo, int brojPrisutnih,
            Korisnik korisnik, List<Sala> sale, ZahtevZaOdobrenje zahtev) {
        this.rezervacijaID = rezervacijaID;
        this.naziv = naziv;
        this.opis = opis;
        this.datum = datum;
        this.vremeOd = vremeOd;
        this.vremeDo = vremeDo;
        this.brojPrisutnih = brojPrisutnih;
        this.korisnik = korisnik;
        this.sale = sale;
        this.zahtev = zahtev;
    }

    public int getRezervacijaID() {
        return rezervacijaID;
    }

    public void setRezervacijaID(int rezervacijaID) {
        this.rezervacijaID = rezervacijaID;
    }

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    public String getOpis() {
        return opis;
    }

    public void setOpis(String opis) {
        this.opis = opis;
    }

    public LocalDate getDatum() {
        return datum;
    }

    public void setDatum(LocalDate datum) {
        this.datum = datum;
    }

    public LocalTime getVremeOd() {
        return vremeOd;
    }

    public void setVremeOd(LocalTime vremeOd) {
        this.vremeOd = vremeOd;
    }

    public LocalTime getVremeDo() {
        return vremeDo;
    }

    public void setVremeDo(LocalTime vremeDo) {
        this.vremeDo = vremeDo;
    }

    public int getBrojPrisutnih() {
        return brojPrisutnih;
    }

    public void setBrojPrisutnih(int brojPrisutnih) {
        this.brojPrisutnih = brojPrisutnih;
    }

    public Korisnik getKorisnik() {
        return korisnik;
    }

    public void setKorisnik(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    public List<Sala> getSale() {
        return sale;
    }

    public void setSale(List<Sala> sale) {
        this.sale = sale;
    }

    public ZahtevZaOdobrenje getZahtev() {
        return zahtev;
    }

    public void setZahtev(ZahtevZaOdobrenje zahtev) {
        this.zahtev = zahtev;
    }
}
