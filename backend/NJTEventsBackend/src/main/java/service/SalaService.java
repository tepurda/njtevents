package service;

import entities.Sala;
import exceptions.ResourceNotFoundException;
import exceptions.ValidationException;
import repository.SalaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SalaService {

    private final SalaRepository salaRepository;

    public SalaService(SalaRepository salaRepository) {
        this.salaRepository = salaRepository;
    }

    public List<Sala> getSveSale() {
        return salaRepository.findAll();
    }

    public Optional<Sala> getSalaById(int id) {
        return salaRepository.findById(id);
    }

    public Sala sacuvajSalu(Sala sala) {
        return salaRepository.save(sala);
    }

    public void obrisiSalu(int id) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala nije pronađena"));

        if (sala.getRezervacije() != null && !sala.getRezervacije().isEmpty()) {
            throw new ValidationException("Sala se ne može obrisati jer ima aktivne rezervacije!");
        }

        salaRepository.deleteById(id);
    }
}