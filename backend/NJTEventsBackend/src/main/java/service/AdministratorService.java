package service;

import entities.Administrator;
import exceptions.ConflictException;
import exceptions.ResourceNotFoundException;
import repository.AdministratorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;

    public AdministratorService(AdministratorRepository administratorRepository,
                                 PasswordEncoder passwordEncoder) {
        this.administratorRepository = administratorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Administrator> getSviAdministratori() {
        return administratorRepository.findAll();
    }

    public Optional<Administrator> getAdministratorById(int id) {
        return administratorRepository.findById(id);
    }

    public Optional<Administrator> getAdministratorByEmail(String email) {
        return administratorRepository.findByEmail(email);
    }

    public Administrator sacuvajAdministratora(Administrator administrator) {
        Optional<Administrator> postojeci = administratorRepository.findByEmail(administrator.getEmail());
        if (postojeci.isPresent() && postojeci.get().getAdministratorID() != administrator.getAdministratorID()) {
            throw new ConflictException("Administrator sa ovim emailom već postoji!");
        }
        administrator.setSifra(passwordEncoder.encode(administrator.getSifra()));
        return administratorRepository.save(administrator);
    }

    public void obrisiAdministratora(int id) {
        administratorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator nije pronađen"));
        administratorRepository.deleteById(id);
    }
}