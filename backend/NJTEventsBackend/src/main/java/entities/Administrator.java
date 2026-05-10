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
@Table(name = "administrator")
public class Administrator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int administratorID;

    private String ime;
    
    private String prezime;
    
    @Column(unique = true)
    private String email;
    
    private String sifra;
    

    @OneToMany(mappedBy = "administrator")
    private List<ZahtevZaOdobrenje> zahtevi;

    public Administrator() {
    }

    public Administrator(int administratorID, String ime, String prezime, String email, String sifra, List<ZahtevZaOdobrenje> zahtevi) {
        this.administratorID = administratorID;
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
        this.sifra = sifra;
        this.zahtevi = zahtevi;
    }

    public int getAdministratorID() {
        return administratorID;
    }

    public void setAdministratorID(int administratorID) {
        this.administratorID = administratorID;
    }

    public String getIme() {
        return ime;
    }

    public void setIme(String ime) {
        this.ime = ime;
    }

    public String getPrezime() {
        return prezime;
    }

    public void setPrezime(String prezime) {
        this.prezime = prezime;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSifra() {
        return sifra;
    }

    public void setSifra(String sifra) {
        this.sifra = sifra;
    }

    public List<ZahtevZaOdobrenje> getZahtevi() {
        return zahtevi;
    }

    public void setZahtevi(List<ZahtevZaOdobrenje> zahtevi) {
        this.zahtevi = zahtevi;
    }
}

