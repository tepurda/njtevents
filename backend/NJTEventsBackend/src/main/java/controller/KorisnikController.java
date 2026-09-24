/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controller;

/**
 *
 * @author pite
 */
import dto.AdministratorDTO;
import dto.KorisnikCreateDTO;
import dto.KorisnikDTO;
import dto.KorisnikUpdateDTO;
import dto.PromenaSifreDTO;
import entities.Korisnik;
import mapper.AdministratorMapper;
import mapper.KorisnikMapper;
import service.KorisnikService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/korisnici")
public class KorisnikController {

    private final KorisnikService korisnikService;

    public KorisnikController(KorisnikService korisnikService) {
        this.korisnikService = korisnikService;
    }

    // GET /api/korisnici — svi korisnici
    @GetMapping
    public ResponseEntity<List<KorisnikDTO>> getSviKorisnici() {
        List<KorisnikDTO> korisnici = korisnikService.getSviKorisnici()
                .stream()
                .map(KorisnikMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(korisnici);
    }

    // GET /api/korisnici/{id} — jedan korisnik po ID-u
    @GetMapping("/{id}")
    public ResponseEntity<KorisnikDTO> getKorisnikById(@PathVariable int id) {
        Optional<Korisnik> korisnik = korisnikService.getKorisnikById(id);
        return korisnik
                .map(k -> ResponseEntity.ok(KorisnikMapper.toDTO(k)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/korisnici — kreiranje novog korisnika (od strane admina)
    // Sistem generiše privremenu šifru i šalje je korisniku emailom.
    @PostMapping
    public ResponseEntity<KorisnikDTO> kreirajKorisnika(@Valid @RequestBody KorisnikCreateDTO dto) {
        Korisnik korisnik = KorisnikMapper.toEntityFromCreateDTO(dto);
        Korisnik sacuvan = korisnikService.kreirajKorisnika(korisnik);
        return ResponseEntity.ok(KorisnikMapper.toDTO(sacuvan));
    }

    // PUT /api/korisnici/me/sifra — ulogovani korisnik menja sopstvenu šifru
    @PutMapping("/me/sifra")
    public ResponseEntity<Void> promeniSifru(@Valid @RequestBody PromenaSifreDTO dto,
            Authentication authentication) {
        korisnikService.promeniSifru(authentication.getName(), dto);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/korisnici/{id} — azuriranje korisnika
    @PutMapping("/{id}")
    public ResponseEntity<KorisnikDTO> azurirajKorisnika(@PathVariable int id,
            @Valid @RequestBody KorisnikUpdateDTO dto) {
        Korisnik azuriran = korisnikService.azurirajKorisnika(id, dto);
        return ResponseEntity.ok(KorisnikMapper.toDTO(azuriran));
    }

    // POST /api/korisnici/{id}/unapredi — admin unapređuje korisnika u administratora
    @PostMapping("/{id}/unapredi")
    public ResponseEntity<AdministratorDTO> unaprediUAdministratora(@PathVariable int id) {
        return ResponseEntity.ok(AdministratorMapper.toDTO(korisnikService.unaprediUAdministratora(id)));
    }

    // DELETE /api/korisnici/{id} — brisanje korisnika
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisiKorisnika(@PathVariable int id) {
        korisnikService.obrisiKorisnika(id);
        return ResponseEntity.noContent().build();
    }
}
