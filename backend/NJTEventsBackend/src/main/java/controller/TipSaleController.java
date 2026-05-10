/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controller;

/**
 *
 * @author pite
 */
import dto.TipSaleDTO;
import entities.TipSale;
import mapper.TipSaleMapper;
import service.TipSaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tipovisale")
public class TipSaleController {

    private final TipSaleService tipSaleService;

    public TipSaleController(TipSaleService tipSaleService) {
        this.tipSaleService = tipSaleService;
    }

    @GetMapping
    public ResponseEntity<List<TipSaleDTO>> getSviTipoviSale() {
        List<TipSaleDTO> tipoviSale = tipSaleService.getSviTipoviSale()
                .stream()
                .map(TipSaleMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tipoviSale);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipSaleDTO> getTipSaleById(@PathVariable int id) {
        Optional<TipSale> tipSale = tipSaleService.getTipSaleById(id);
        return tipSale
                .map(t -> ResponseEntity.ok(TipSaleMapper.toDTO(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TipSaleDTO> kreirajTipSale(@Valid @RequestBody TipSaleDTO dto) {
        TipSale tipSale = TipSaleMapper.toEntity(dto);
        TipSale sacuvan = tipSaleService.sacuvajTipSale(tipSale);
        return ResponseEntity.ok(TipSaleMapper.toDTO(sacuvan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipSaleDTO> azurirajTipSale(@PathVariable int id,
            @Valid @RequestBody TipSaleDTO dto) {
        Optional<TipSale> postojeci = tipSaleService.getTipSaleById(id);
        if (postojeci.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TipSale tipSale = TipSaleMapper.toEntity(dto);
        tipSale.setIdTipSale(id);
        TipSale sacuvan = tipSaleService.sacuvajTipSale(tipSale);
        return ResponseEntity.ok(TipSaleMapper.toDTO(sacuvan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisiTipSale(@PathVariable int id) {
        tipSaleService.obrisiTipSale(id);
        return ResponseEntity.noContent().build();
    }
}
