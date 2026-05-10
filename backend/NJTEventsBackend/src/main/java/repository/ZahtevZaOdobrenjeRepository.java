/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */

/**
 *
 * @author pite
 */
package repository;

import entities.ZahtevZaOdobrenje;
import entities.StatusZahteva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ZahtevZaOdobrenjeRepository extends JpaRepository<ZahtevZaOdobrenje, Integer> {
    List<ZahtevZaOdobrenje> findByStatus(StatusZahteva status);
    List<ZahtevZaOdobrenje> findByAdministratorAdministratorID(int administratorID);
}