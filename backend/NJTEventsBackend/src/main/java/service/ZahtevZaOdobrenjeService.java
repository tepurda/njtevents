package service;

import entities.ZahtevZaOdobrenje;
import entities.Administrator;
import entities.StatusZahteva;
import exceptions.ResourceNotFoundException;
import repository.ZahtevZaOdobrenjeRepository;
import repository.AdministratorRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ZahtevZaOdobrenjeService {

    private final ZahtevZaOdobrenjeRepository zahtevRepository;
    private final AdministratorRepository administratorRepository;

    public ZahtevZaOdobrenjeService(ZahtevZaOdobrenjeRepository zahtevRepository,
                                     AdministratorRepository administratorRepository) {
        this.zahtevRepository = zahtevRepository;
        this.administratorRepository = administratorRepository;
    }

    public List<ZahtevZaOdobrenje> getSviZahtevi() {
        return zahtevRepository.findAll();
    }

    public List<ZahtevZaOdobrenje> getZahteviByStatus(StatusZahteva status) {
        return zahtevRepository.findByStatus(status);
    }

    public Optional<ZahtevZaOdobrenje> getZahtevById(int id) {
        return zahtevRepository.findById(id);
    }

    public ZahtevZaOdobrenje obradiZahtev(int zahtevID, int administratorID,
                                           StatusZahteva status, String napomena) {
        ZahtevZaOdobrenje zahtev = zahtevRepository.findById(zahtevID)
                .orElseThrow(() -> new ResourceNotFoundException("Zahtev nije pronađen"));

        Administrator administrator = administratorRepository.findById(administratorID)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator nije pronađen"));

        zahtev.setStatus(status);
        zahtev.setAdministrator(administrator);
        zahtev.setDatumObrade(LocalDateTime.now());
        zahtev.setNapomena(napomena);

        return zahtevRepository.save(zahtev);
    }
}