package service;

import entities.Rezervacija;
import entities.Sala;
import entities.ZahtevZaOdobrenje;
import entities.StatusZahteva;
import exceptions.ValidationException;
import repository.RezervacijaRepository;
import repository.ZahtevZaOdobrenjeRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import repository.SalaRepository;
import entities.Sala;

@Service
public class RezervacijaService {

    private final RezervacijaRepository rezervacijaRepository;
    private final ZahtevZaOdobrenjeRepository zahtevRepository;
    private final SalaRepository salaRepository;

    public RezervacijaService(RezervacijaRepository rezervacijaRepository,
            ZahtevZaOdobrenjeRepository zahtevRepository,
            SalaRepository salaRepository) {
        this.rezervacijaRepository = rezervacijaRepository;
        this.zahtevRepository = zahtevRepository;
        this.salaRepository = salaRepository;
    }

    public List<Rezervacija> getSveRezervacije() {
        return rezervacijaRepository.findAll();
    }

    public Optional<Rezervacija> getRezervacijaById(int id) {
        return rezervacijaRepository.findById(id);
    }

    public List<Rezervacija> getRezervacijeByDatum(LocalDate datum) {
        return rezervacijaRepository.findByDatum(datum);
    }

    public List<Rezervacija> getRezervacijeByKorisnik(int korisnikID) {
        return rezervacijaRepository.findByKorisnikKorisnikID(korisnikID);
    }

    private void proveriDatumIVreme(Rezervacija rezervacija) {
        if (rezervacija.getDatum().isBefore(LocalDate.now())) {
            throw new ValidationException("Datum rezervacije ne može biti u prošlosti!");
        }
        if (!rezervacija.getVremeOd().isBefore(rezervacija.getVremeDo())) {
            throw new ValidationException("Vreme početka mora biti pre vremena završetka!");
        }
    }

    private void proveriKapacitet(Rezervacija rezervacija) {
        for (Sala sala : rezervacija.getSale()) {
            if (sala.getTipSale() != null
                    && rezervacija.getBrojPrisutnih() > sala.getTipSale().getKapacitet()) {
                throw new ValidationException(
                        "Broj prisutnih (" + rezervacija.getBrojPrisutnih()
                        + ") premašuje kapacitet sale '" + sala.getNazivSale()
                        + "' (" + sala.getTipSale().getKapacitet() + " mesta)!"
                );
            }
        }
    }

    private void proveriPreklapanja(Rezervacija rezervacija) {
        for (Sala sala : rezervacija.getSale()) {
            List<Rezervacija> preklapanja = rezervacijaRepository.findPreklapajuceRezervacije(
                    sala.getSalaID(),
                    rezervacija.getDatum(),
                    rezervacija.getVremeOd(),
                    rezervacija.getVremeDo()
            );
            if (!preklapanja.isEmpty()) {
                String nazivSale = salaRepository.findById(sala.getSalaID())
                        .map(Sala::getNazivSale)
                        .orElse("Izabrana sala");

                throw new ValidationException(
                        "Sala '" + nazivSale + "' je već zauzeta u izabranom terminu!"
                );
            }
        }
    }

    public Rezervacija kreirajRezervaciju(Rezervacija rezervacija) {
        proveriDatumIVreme(rezervacija);
        proveriKapacitet(rezervacija);
        proveriPreklapanja(rezervacija);

        Rezervacija sacuvanaRezervacija = rezervacijaRepository.save(rezervacija);

        ZahtevZaOdobrenje zahtev = new ZahtevZaOdobrenje();
        zahtev.setRezervacija(sacuvanaRezervacija);
        zahtev.setDatumSlanja(LocalDateTime.now());
        zahtev.setStatus(StatusZahteva.NA_CEKANJU);
        zahtevRepository.save(zahtev);

        return sacuvanaRezervacija;
    }

    public Rezervacija kreirajRezervacijuAdmin(Rezervacija rezervacija) {
        proveriDatumIVreme(rezervacija);
        proveriKapacitet(rezervacija);
        proveriPreklapanja(rezervacija);

        Rezervacija sacuvanaRezervacija = rezervacijaRepository.save(rezervacija);

        ZahtevZaOdobrenje zahtev = new ZahtevZaOdobrenje();
        zahtev.setRezervacija(sacuvanaRezervacija);
        zahtev.setDatumSlanja(LocalDateTime.now());
        zahtev.setDatumObrade(LocalDateTime.now());
        zahtev.setStatus(StatusZahteva.ODOBRENO);
        zahtevRepository.save(zahtev);

        return sacuvanaRezervacija;
    }

    public void obrisiRezervaciju(int id) {
        rezervacijaRepository.deleteById(id);
    }
}
