package dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class KorisnikCreateDTO {

    @NotBlank(message = "Ime je obavezno!")
    private String ime;

    @NotBlank(message = "Prezime je obavezno!")
    private String prezime;

    @NotBlank(message = "Email je obavezan!")
    @Email(message = "Format emaila nije ispravan!")
    private String email;

    @NotBlank(message = "Šifra je obavezna!")
    @Size(min = 6, message = "Šifra mora imati najmanje 6 karaktera!")
    private String sifra;

    public KorisnikCreateDTO() {}

    public KorisnikCreateDTO(String ime, String prezime, String email, String sifra) {
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
        this.sifra = sifra;
    }

    public String getIme() { return ime; }
    public void setIme(String ime) { this.ime = ime; }

    public String getPrezime() { return prezime; }
    public void setPrezime(String prezime) { this.prezime = prezime; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSifra() { return sifra; }
    public void setSifra(String sifra) { this.sifra = sifra; }
}