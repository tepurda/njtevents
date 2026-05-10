package controller;

/**
 *
 * @author pite
 */
import dto.AdministratorCreateDTO;
import dto.AdministratorDTO;
import entities.Administrator;
import mapper.AdministratorMapper;
import service.AdministratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/administratori")
public class AdministratorController {

    private final AdministratorService administratorService;

    public AdministratorController(AdministratorService administratorService) {
        this.administratorService = administratorService;
    }

    @GetMapping
    public ResponseEntity<List<AdministratorDTO>> getSviAdministratori() {
        List<AdministratorDTO> administratori = administratorService.getSviAdministratori()
                .stream()
                .map(AdministratorMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(administratori);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministratorDTO> getAdministratorById(@PathVariable int id) {
        Optional<Administrator> administrator = administratorService.getAdministratorById(id);
        return administrator
                .map(a -> ResponseEntity.ok(AdministratorMapper.toDTO(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AdministratorDTO> kreirajAdministratora(@Valid @RequestBody AdministratorCreateDTO dto) {
        Administrator administrator = AdministratorMapper.toEntityFromCreateDTO(dto);
        Administrator sacuvan = administratorService.sacuvajAdministratora(administrator);
        return ResponseEntity.ok(AdministratorMapper.toDTO(sacuvan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministratorDTO> azurirajAdministratora(@PathVariable int id,
            @RequestBody AdministratorDTO dto) {
        Optional<Administrator> postojeci = administratorService.getAdministratorById(id);
        if (postojeci.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Administrator administrator = AdministratorMapper.toEntity(dto);
        administrator.setAdministratorID(id);
        Administrator sacuvan = administratorService.sacuvajAdministratora(administrator);
        return ResponseEntity.ok(AdministratorMapper.toDTO(sacuvan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> obrisiAdministratora(@PathVariable int id) {
        administratorService.obrisiAdministratora(id);
        return ResponseEntity.noContent().build();
    }
}
