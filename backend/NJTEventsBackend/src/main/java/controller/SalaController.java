/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controller;

/**
 *
 * @author pite
 */
import dto.SalaDTO;
import entities.Sala;
import mapper.SalaMapper;
import service.SalaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sale")
public class SalaController {

    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @GetMapping
    public ResponseEntity<List<SalaDTO>> getSveSale() {
        List<SalaDTO> sale = salaService.getSveSale()
                .stream()
                .map(SalaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sale);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaDTO> getSalaById(@PathVariable int id) {
        Optional<Sala> sala = salaService.getSalaById(id);
        return sala
                .map(s -> ResponseEntity.ok(SalaMapper.toDTO(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SalaDTO> kreirajSalu(@Valid @RequestBody SalaDTO dto) {
        Sala sala = SalaMapper.toEntity(dto);
        Sala sacuvana = salaService.sacuvajSalu(sala);
        return ResponseEntity.ok(SalaMapper.toDTO(sacuvana));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaDTO> azurirajSalu(@PathVariable int id,
            @Valid @RequestBody SalaDTO dto) {
        Optional<Sala> postojeca = salaService.getSalaById(id);
        if (postojeca.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Sala sala = SalaMapper.toEntity(dto);
        sala.setSalaID(id);
        Sala sacuvana = salaService.sacuvajSalu(sala);
        return ResponseEntity.ok(SalaMapper.toDTO(sacuvana));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisiSalu(@PathVariable int id) {
        salaService.obrisiSalu(id);
        return ResponseEntity.noContent().build();
    }
}
