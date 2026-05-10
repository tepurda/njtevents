/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controller;

/**
 *
 * @author pite
 */
import dto.RezervacijaDTO;
import entities.Rezervacija;
import mapper.RezervacijaMapper;
import service.RezervacijaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rezervacije")
public class RezervacijaController {

    private final RezervacijaService rezervacijaService;

    public RezervacijaController(RezervacijaService rezervacijaService) {
        this.rezervacijaService = rezervacijaService;
    }

    @GetMapping
    public ResponseEntity<List<RezervacijaDTO>> getSveRezervacije() {
        List<RezervacijaDTO> rezervacije = rezervacijaService.getSveRezervacije()
                .stream()
                .map(RezervacijaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rezervacije);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RezervacijaDTO> getRezervacijaById(@PathVariable int id) {
        Optional<Rezervacija> rezervacija = rezervacijaService.getRezervacijaById(id);
        return rezervacija
                .map(r -> ResponseEntity.ok(RezervacijaMapper.toDTO(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/datum")
    public ResponseEntity<List<RezervacijaDTO>> getRezervacijeByDatum(@RequestParam LocalDate datum) {
        List<RezervacijaDTO> rezervacije = rezervacijaService.getRezervacijeByDatum(datum)
                .stream()
                .map(RezervacijaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rezervacije);
    }

    @GetMapping("/korisnik/{id}")
    public ResponseEntity<List<RezervacijaDTO>> getRezervacijeByKorisnik(@PathVariable int id) {
        List<RezervacijaDTO> rezervacije = rezervacijaService.getRezervacijeByKorisnik(id)
                .stream()
                .map(RezervacijaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rezervacije);
    }

    @PostMapping
    public ResponseEntity<RezervacijaDTO> kreirajRezervaciju(@Valid @RequestBody RezervacijaDTO dto) {
        Rezervacija rezervacija = RezervacijaMapper.toEntity(dto);
        Rezervacija sacuvana = rezervacijaService.kreirajRezervaciju(rezervacija);
        return ResponseEntity.ok(RezervacijaMapper.toDTO(sacuvana));
    }

    // POST /api/rezervacije/admin — kreiranje rezervacije od strane administratora
    @PostMapping("/admin")
    public ResponseEntity<RezervacijaDTO> kreirajRezervacijuAdmin(@Valid @RequestBody RezervacijaDTO dto) {
        Rezervacija rezervacija = RezervacijaMapper.toEntity(dto);
        Rezervacija sacuvana = rezervacijaService.kreirajRezervacijuAdmin(rezervacija);
        return ResponseEntity.ok(RezervacijaMapper.toDTO(sacuvana));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisiRezervaciju(@PathVariable int id) {
        rezervacijaService.obrisiRezervaciju(id);
        return ResponseEntity.noContent().build();
    }
}
