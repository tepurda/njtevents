package dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class KorisnikCreateDTO {

    @NotBlank(message = "Ime je obavezno!")
    private String ime;

    @NotBlank(message = "Prezime je obavezno!")
    private String prezime;

    @NotBlank(message = "Email je obavezan!")
    @Email(message = "Format emaila nije ispravan!")
    private String email;

    public KorisnikCreateDTO() {}

    public KorisnikCreateDTO(String ime, String prezime, String email) {
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
    }

    public String getIme() { return ime; }
    public void setIme(String ime) { this.ime = ime; }

    public String getPrezime() { return prezime; }
    public void setPrezime(String prezime) { this.prezime = prezime; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}