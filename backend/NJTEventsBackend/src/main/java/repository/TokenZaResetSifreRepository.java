package repository;

import entities.TokenZaResetSifre;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenZaResetSifreRepository extends JpaRepository<TokenZaResetSifre, Integer> {

    Optional<TokenZaResetSifre> findByTokenHash(String tokenHash);

    boolean existsByEmailAndKreiranAfter(String email, LocalDateTime granica);

    @Modifying
    @Query("DELETE FROM TokenZaResetSifre t WHERE t.email = :email")
    int obrisiZaEmail(@Param("email") String email);

    @Modifying
    @Query("DELETE FROM TokenZaResetSifre t WHERE t.istice < :sada")
    int obrisiIstekle(@Param("sada") LocalDateTime sada);
}
