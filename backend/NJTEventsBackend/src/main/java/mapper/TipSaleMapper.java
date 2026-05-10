/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package mapper;

/**
 *
 * @author pite
 */

import dto.TipSaleDTO;
import entities.TipSale;

public class TipSaleMapper {

    public static TipSaleDTO toDTO(TipSale tipSale) {
        if (tipSale == null) return null;

        return new TipSaleDTO(
            tipSale.getIdTipSale(),
            tipSale.getNazivTipa(),
            tipSale.getKapacitet()
        );
    }

    public static TipSale toEntity(TipSaleDTO dto) {
        if (dto == null) return null;

        TipSale tipSale = new TipSale();
        tipSale.setIdTipSale(dto.getIdTipSale());
        tipSale.setNazivTipa(dto.getNazivTipa());
        tipSale.setKapacitet(dto.getKapacitet());
        return tipSale;
    }
}
