package dto;

/**
 *
 * @author pite
 */
public class AdministratorDTO {

    private int administratorID;
    private String ime;
    private String prezime;
    private String email;

    public AdministratorDTO() {
    }

    public AdministratorDTO(int administratorID, String ime, String prezime, String email) {
        this.administratorID = administratorID;
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
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
}
