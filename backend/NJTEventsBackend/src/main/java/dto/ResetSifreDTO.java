package dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetSifreDTO {

    @NotBlank(message = "Link za promenu šifre nije ispravan!")
    private String token;

    @NotBlank(message = "Nova šifra je obavezna!")
    @Size(min = 6, message = "Šifra mora imati najmanje 6 karaktera!")
    private String novaSifra;

    public ResetSifreDTO() {}

    public ResetSifreDTO(String token, String novaSifra) {
        this.token = token;
        this.novaSifra = novaSifra;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getNovaSifra() { return novaSifra; }
    public void setNovaSifra(String novaSifra) { this.novaSifra = novaSifra; }
}
