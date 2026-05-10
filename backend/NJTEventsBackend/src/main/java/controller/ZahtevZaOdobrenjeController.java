/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package controller;

/**
 *
 * @author pite
 */
import dto.ZahtevZaOdobrenjeDTO;
import entities.StatusZahteva;
import entities.ZahtevZaOdobrenje;
import mapper.ZahtevZaOdobrenjeMapper;
import service.ZahtevZaOdobrenjeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/zahtevi")
public class ZahtevZaOdobrenjeController {

    private final ZahtevZaOdobrenjeService zahtevService;

    public ZahtevZaOdobrenjeController(ZahtevZaOdobrenjeService zahtevService) {
        this.zahtevService = zahtevService;
    }

    @GetMapping
    public ResponseEntity<List<ZahtevZaOdobrenjeDTO>> getSviZahtevi() {
        List<ZahtevZaOdobrenjeDTO> zahtevi = zahtevService.getSviZahtevi()
                .stream()
                .map(ZahtevZaOdobrenjeMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(zahtevi);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZahtevZaOdobrenjeDTO> getZahtevById(@PathVariable int id) {
        Optional<ZahtevZaOdobrenje> zahtev = zahtevService.getZahtevById(id);
        return zahtev
                .map(z -> ResponseEntity.ok(ZahtevZaOdobrenjeMapper.toDTO(z)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status")
    public ResponseEntity<List<ZahtevZaOdobrenjeDTO>> getZahteviByStatus(@RequestParam StatusZahteva status) {
        List<ZahtevZaOdobrenjeDTO> zahtevi = zahtevService.getZahteviByStatus(status)
                .stream()
                .map(ZahtevZaOdobrenjeMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(zahtevi);
    }

    // GET /api/zahtevi/moji/{korisnikID} — korisnik vidi samo svoje zahteve
    @GetMapping("/moji/{korisnikID}")
    public ResponseEntity<List<ZahtevZaOdobrenjeDTO>> getMojiZahtevi(@PathVariable int korisnikID) {
        List<ZahtevZaOdobrenjeDTO> zahtevi = zahtevService.getSviZahtevi()
                .stream()
                .filter(z -> z.getRezervacija() != null
                && z.getRezervacija().getKorisnik() != null
                && z.getRezervacija().getKorisnik().getKorisnikID() == korisnikID)
                .map(ZahtevZaOdobrenjeMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(zahtevi);
    }

    @PutMapping("/{id}/obradi")
    public ResponseEntity<ZahtevZaOdobrenjeDTO> obradiZahtev(
            @PathVariable int id,
            @RequestParam int administratorID,
            @RequestParam StatusZahteva status,
            @RequestParam(required = false) String napomena) {

        ZahtevZaOdobrenje zahtev = zahtevService.obradiZahtev(id, administratorID, status, napomena);
        return ResponseEntity.ok(ZahtevZaOdobrenjeMapper.toDTO(zahtev));
    }
}
