package service;

import entities.TipSale;
import exceptions.ResourceNotFoundException;
import exceptions.ValidationException;
import repository.TipSaleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TipSaleService {

    private final TipSaleRepository tipSaleRepository;

    public TipSaleService(TipSaleRepository tipSaleRepository) {
        this.tipSaleRepository = tipSaleRepository;
    }

    public List<TipSale> getSviTipoviSale() {
        return tipSaleRepository.findAll();
    }

    public Optional<TipSale> getTipSaleById(int id) {
        return tipSaleRepository.findById(id);
    }

    public TipSale sacuvajTipSale(TipSale tipSale) {
        return tipSaleRepository.save(tipSale);
    }

    public void obrisiTipSale(int id) {
        TipSale tipSale = tipSaleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tip sale nije pronađen"));

        if (tipSale.getSale() != null && !tipSale.getSale().isEmpty()) {
            throw new ValidationException("Tip sale se ne može obrisati jer ima sale koje ga koriste!");
        }

        tipSaleRepository.deleteById(id);
    }
}