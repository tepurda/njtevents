/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */


/**
 *
 * @author pite
 */
package dto;

import jakarta.validation.constraints.Email;

public class KorisnikUpdateDTO {

    private String ime;
    private String prezime;

    @Email(message = "Format emaila nije ispravan!")
    private String email;

    private String sifra;

    public KorisnikUpdateDTO() {}

    public String getIme() { return ime; }
    public void setIme(String ime) { this.ime = ime; }

    public String getPrezime() { return prezime; }
    public void setPrezime(String prezime) { this.prezime = prezime; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSifra() { return sifra; }
    public void setSifra(String sifra) { this.sifra = sifra; }
}