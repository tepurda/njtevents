package dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ZaboravljenaSifraDTO {

    @NotBlank(message = "Email je obavezan!")
    @Email(message = "Format emaila nije ispravan!")
    private String email;

    public ZaboravljenaSifraDTO() {}

    public ZaboravljenaSifraDTO(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
