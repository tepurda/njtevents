/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package config;

/**
 *
 * @author pite
 */

import config.JwtUtil;
import entities.Administrator;
import entities.Korisnik;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import service.AdministratorService;
import service.KorisnikService;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final KorisnikService korisnikService;
    private final AdministratorService administratorService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(KorisnikService korisnikService,
                          AdministratorService administratorService,
                          PasswordEncoder passwordEncoder) {
        this.korisnikService = korisnikService;
        this.administratorService = administratorService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String sifra = request.get("sifra");

        Optional<Administrator> administrator = administratorService.getAdministratorByEmail(email);
        if (administrator.isPresent() &&
            passwordEncoder.matches(sifra, administrator.get().getSifra())) {

            String token = JwtUtil.generateToken(email, "ROLE_ADMINISTRATOR");

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("rola", "ROLE_ADMINISTRATOR");
            response.put("ime", administrator.get().getIme());
            response.put("id", String.valueOf(administrator.get().getAdministratorID()));
            return ResponseEntity.ok(response);
        }

        Optional<Korisnik> korisnik = korisnikService.getKorisnikByEmail(email);
        if (korisnik.isPresent() &&
            passwordEncoder.matches(sifra, korisnik.get().getSifra())) {

            String token = JwtUtil.generateToken(email, "ROLE_KORISNIK");

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("rola", "ROLE_KORISNIK");
            response.put("ime", korisnik.get().getIme());
            response.put("id", String.valueOf(korisnik.get().getKorisnikID()));
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Pogrešan email ili šifra!");
    }
}