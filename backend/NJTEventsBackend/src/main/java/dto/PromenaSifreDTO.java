package dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PromenaSifreDTO {

    @NotBlank(message = "Trenutna šifra je obavezna!")
    private String staraSifra;

    @NotBlank(message = "Nova šifra je obavezna!")
    @Size(min = 6, message = "Šifra mora imati najmanje 6 karaktera!")
    private String novaSifra;

    public PromenaSifreDTO() {}

    public PromenaSifreDTO(String staraSifra, String novaSifra) {
        this.staraSifra = staraSifra;
        this.novaSifra = novaSifra;
    }

    public String getStaraSifra() { return staraSifra; }
    public void setStaraSifra(String staraSifra) { this.staraSifra = staraSifra; }

    public String getNovaSifra() { return novaSifra; }
    public void setNovaSifra(String novaSifra) { this.novaSifra = novaSifra; }
}
