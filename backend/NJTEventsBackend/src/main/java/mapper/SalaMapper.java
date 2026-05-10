/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package mapper;

/**
 *
 * @author pite
 */

import dto.SalaDTO;
import entities.Sala;

public class SalaMapper {

    public static SalaDTO toDTO(Sala sala) {
        if (sala == null) return null;

        return new SalaDTO(
            sala.getSalaID(),
            sala.getNazivSale(),
            sala.getNapomena(),
            TipSaleMapper.toDTO(sala.getTipSale())
        );
    }

    public static Sala toEntity(SalaDTO dto) {
        if (dto == null) return null;

        Sala sala = new Sala();
        sala.setSalaID(dto.getSalaID());
        sala.setNazivSale(dto.getNazivSale());
        sala.setNapomena(dto.getNapomena());
        sala.setTipSale(TipSaleMapper.toEntity(dto.getTipSale()));
        return sala;
    }
}
