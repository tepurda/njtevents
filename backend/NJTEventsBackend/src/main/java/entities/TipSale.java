package entities;
import jakarta.persistence.*;
import java.time.*;
import java.util.List;
/**
 *
 * @author pite
 */
@Entity
@Table(name = "tip_sale")
public class TipSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idTipSale;

    private String nazivTipa;
    private int kapacitet;

    @OneToMany(mappedBy = "tipSale")
    private List<Sala> sale;

    public TipSale() {
    }

    public TipSale(int idTipSale, String nazivTipa, int kapacitet, List<Sala> sale) {
        this.idTipSale = idTipSale;
        this.nazivTipa = nazivTipa;
        this.kapacitet = kapacitet;
        this.sale = sale;
    }

    public int getIdTipSale() {
        return idTipSale;
    }

    public void setIdTipSale(int idTipSale) {
        this.idTipSale = idTipSale;
    }

    public String getNazivTipa() {
        return nazivTipa;
    }

    public void setNazivTipa(String nazivTipa) {
        this.nazivTipa = nazivTipa;
    }

    public int getKapacitet() {
        return kapacitet;
    }

    public void setKapacitet(int kapacitet) {
        this.kapacitet = kapacitet;
    }

    public List<Sala> getSale() {
        return sale;
    }

    public void setSale(List<Sala> sale) {
        this.sale = sale;
    }
}


