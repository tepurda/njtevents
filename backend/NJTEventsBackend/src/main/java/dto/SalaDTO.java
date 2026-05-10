package dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SalaDTO {

    private int salaID;

    @NotBlank(message = "Naziv sale je obavezan!")
    private String nazivSale;

    private String napomena;

    @NotNull(message = "Tip sale je obavezan!")
    private TipSaleDTO tipSale;

    public SalaDTO() {}

    public SalaDTO(int salaID, String nazivSale, String napomena, TipSaleDTO tipSale) {
        this.salaID = salaID;
        this.nazivSale = nazivSale;
        this.napomena = napomena;
        this.tipSale = tipSale;
    }

    public int getSalaID() { return salaID; }
    public void setSalaID(int salaID) { this.salaID = salaID; }

    public String getNazivSale() { return nazivSale; }
    public void setNazivSale(String nazivSale) { this.nazivSale = nazivSale; }

    public String getNapomena() { return napomena; }
    public void setNapomena(String napomena) { this.napomena = napomena; }

    public TipSaleDTO getTipSale() { return tipSale; }
    public void setTipSale(TipSaleDTO tipSale) { this.tipSale = tipSale; }
}