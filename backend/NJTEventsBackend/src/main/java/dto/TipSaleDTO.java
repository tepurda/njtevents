package dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TipSaleDTO {

    private int idTipSale;

    @NotBlank(message = "Naziv tipa sale je obavezan!")
    private String nazivTipa;

    @NotNull(message = "Kapacitet je obavezan!")
    @Min(value = 1, message = "Kapacitet mora biti najmanje 1!")
    private int kapacitet;

    public TipSaleDTO() {}

    public TipSaleDTO(int idTipSale, String nazivTipa, int kapacitet) {
        this.idTipSale = idTipSale;
        this.nazivTipa = nazivTipa;
        this.kapacitet = kapacitet;
    }

    public int getIdTipSale() { return idTipSale; }
    public void setIdTipSale(int idTipSale) { this.idTipSale = idTipSale; }

    public String getNazivTipa() { return nazivTipa; }
    public void setNazivTipa(String nazivTipa) { this.nazivTipa = nazivTipa; }

    public int getKapacitet() { return kapacitet; }
    public void setKapacitet(int kapacitet) { this.kapacitet = kapacitet; }
}