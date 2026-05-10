/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package mapper;

/**
 *
 * @author pite
 */
import dto.RezervacijaDTO;
import dto.SalaDTO;
import entities.Rezervacija;
import entities.Sala;
import java.util.List;
import java.util.stream.Collectors;

public class RezervacijaMapper {

    // Entitet → DTO
    public static RezervacijaDTO toDTO(Rezervacija rezervacija) {
        RezervacijaDTO dto = new RezervacijaDTO();
        dto.setRezervacijaID(rezervacija.getRezervacijaID());
        dto.setNaziv(rezervacija.getNaziv());
        dto.setOpis(rezervacija.getOpis());
        dto.setDatum(rezervacija.getDatum());
        dto.setVremeOd(rezervacija.getVremeOd());
        dto.setVremeDo(rezervacija.getVremeDo());
        dto.setBrojPrisutnih(rezervacija.getBrojPrisutnih());

        if (rezervacija.getKorisnik() != null) {
            dto.setKorisnik(KorisnikMapper.toDTO(rezervacija.getKorisnik()));
        }

        if (rezervacija.getAdministrator() != null) {
            dto.setAdministrator(AdministratorMapper.toDTO(rezervacija.getAdministrator()));
        }

        if (rezervacija.getZahtev() != null) {
            dto.setStatusZahteva(rezervacija.getZahtev().getStatus().name());
        }

        dto.setSale(rezervacija.getSale().stream()
                .map(SalaMapper::toDTO)
                .collect(java.util.stream.Collectors.toList()));

        return dto;
    }

    // DTO → Entitet
    public static Rezervacija toEntity(RezervacijaDTO dto) {
        if (dto == null) {
            return null;
        }

        List<Sala> sale = dto.getSale()
                .stream()
                .map(SalaMapper::toEntity)
                .collect(Collectors.toList());

        Rezervacija rezervacija = new Rezervacija();
        if (dto.getAdministrator() != null) {
            rezervacija.setAdministrator(AdministratorMapper.toEntity(dto.getAdministrator()));
        }
        rezervacija.setRezervacijaID(dto.getRezervacijaID());
        rezervacija.setNaziv(dto.getNaziv());
        rezervacija.setOpis(dto.getOpis());
        rezervacija.setDatum(dto.getDatum());
        rezervacija.setVremeOd(dto.getVremeOd());
        rezervacija.setVremeDo(dto.getVremeDo());
        rezervacija.setBrojPrisutnih(dto.getBrojPrisutnih());
        rezervacija.setKorisnik(KorisnikMapper.toEntity(dto.getKorisnik()));
        rezervacija.setSale(sale);
        return rezervacija;
    }
}
