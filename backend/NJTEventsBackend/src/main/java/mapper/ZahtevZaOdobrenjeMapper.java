/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package mapper;

/**
 *
 * @author pite
*
* 
*/


import dto.ZahtevZaOdobrenjeDTO;
import entities.ZahtevZaOdobrenje;

public class ZahtevZaOdobrenjeMapper {

    public static ZahtevZaOdobrenjeDTO toDTO(ZahtevZaOdobrenje zahtev) {
        if (zahtev == null) return null;

        return new ZahtevZaOdobrenjeDTO(
            zahtev.getZahtevID(),
            zahtev.getDatumSlanja(),
            zahtev.getDatumObrade(),
            zahtev.getStatus(),
            zahtev.getNapomena(),
            RezervacijaMapper.toDTO(zahtev.getRezervacija()),
            AdministratorMapper.toDTO(zahtev.getAdministrator())
        );
    }

    public static ZahtevZaOdobrenje toEntity(ZahtevZaOdobrenjeDTO dto) {
        if (dto == null) return null;

        ZahtevZaOdobrenje zahtev = new ZahtevZaOdobrenje();
        zahtev.setZahtevID(dto.getZahtevID());
        zahtev.setDatumSlanja(dto.getDatumSlanja());
        zahtev.setDatumObrade(dto.getDatumObrade());
        zahtev.setStatus(dto.getStatus());
        zahtev.setNapomena(dto.getNapomena());
        zahtev.setRezervacija(RezervacijaMapper.toEntity(dto.getRezervacija()));
        zahtev.setAdministrator(AdministratorMapper.toEntity(dto.getAdministrator()));
        return zahtev;
    }
}