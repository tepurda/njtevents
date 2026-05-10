package service;

import entities.StatusZahteva;
import entities.ZahtevZaOdobrenje;
import repository.ZahtevZaOdobrenjeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class ZahtevScheduler {

    private final ZahtevZaOdobrenjeRepository zahtevRepository;

    public ZahtevScheduler(ZahtevZaOdobrenjeRepository zahtevRepository) {
        this.zahtevRepository = zahtevRepository;
    }

    // Pokreće se svakih 5 minuta
    @Scheduled(fixedRate = 300000)
    public void automatskiOdbijIstekleZahteve() {
        List<ZahtevZaOdobrenje> zahteviNaCekanju = zahtevRepository.findByStatus(StatusZahteva.NA_CEKANJU);

        LocalDate danas = LocalDate.now();
        LocalTime sada = LocalTime.now();

        for (ZahtevZaOdobrenje zahtev : zahteviNaCekanju) {
            if (zahtev.getRezervacija() == null) continue;

            LocalDate datumRezervacije = zahtev.getRezervacija().getDatum();
            LocalTime vremeOdRezervacije = zahtev.getRezervacija().getVremeOd();

            boolean istekao = datumRezervacije.isBefore(danas) ||
                    (datumRezervacije.isEqual(danas) && vremeOdRezervacije.isBefore(sada));

            if (istekao) {
                zahtev.setStatus(StatusZahteva.ODBIJENO);
                zahtev.setDatumObrade(LocalDateTime.now());
                zahtev.setNapomena("Automatski odbijen — isteklo vreme rezervacije.");
                zahtevRepository.save(zahtev);
                System.out.println("Automatski odbijen zahtev ID: " + zahtev.getZahtevID());
            }
        }
    }
}