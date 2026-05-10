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
@Table(name = "sala")
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int salaID;

    private String nazivSale;
    private String napomena;

    @ManyToOne
    @JoinColumn(name = "idTipSale")
    private TipSale tipSale;

    @ManyToMany(mappedBy = "sale")
    private List<Rezervacija> rezervacije;

    public Sala() {
    }

    public Sala(int salaID, String nazivSale, String napomena, TipSale tipSale, List<Rezervacija> rezervacije) {
        this.salaID = salaID;
        this.nazivSale = nazivSale;
        this.napomena = napomena;
        this.tipSale = tipSale;
        this.rezervacije = rezervacije;
    }

    public int getSalaID() {
        return salaID;
    }

    public void setSalaID(int salaID) {
        this.salaID = salaID;
    }

    public String getNazivSale() {
        return nazivSale;
    }

    public void setNazivSale(String nazivSale) {
        this.nazivSale = nazivSale;
    }

    public String getNapomena() {
        return napomena;
    }

    public void setNapomena(String napomena) {
        this.napomena = napomena;
    }

    public TipSale getTipSale() {
        return tipSale;
    }

    public void setTipSale(TipSale tipSale) {
        this.tipSale = tipSale;
    }

    public List<Rezervacija> getRezervacije() {
        return rezervacije;
    }

    public void setRezervacije(List<Rezervacija> rezervacije) {
        this.rezervacije = rezervacije;
    }
}


