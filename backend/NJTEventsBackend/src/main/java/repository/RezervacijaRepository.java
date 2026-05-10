package repository;

import entities.Rezervacija;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RezervacijaRepository extends JpaRepository<Rezervacija, Integer> {

    List<Rezervacija> findByDatum(LocalDate datum);

    List<Rezervacija> findByKorisnikKorisnikID(int korisnikID);

    @Query("SELECT r FROM Rezervacija r " +
           "JOIN r.sale s " +
           "JOIN r.zahtev z " +
           "WHERE s.salaID = :salaID " +
           "AND r.datum = :datum " +
           "AND z.status = 'ODOBRENO' " +
           "AND r.vremeOd < :vremeDo " +
           "AND r.vremeDo > :vremeOd")
    List<Rezervacija> findPreklapajuceRezervacije(
        @Param("salaID") int salaID,
        @Param("datum") LocalDate datum,
        @Param("vremeOd") LocalTime vremeOd,
        @Param("vremeDo") LocalTime vremeDo
    );
}