package mapper;

/**
 *
 * @author pite
 */
import dto.KorisnikCreateDTO;
import dto.KorisnikDTO;
import entities.Korisnik;

public class KorisnikMapper {

    public static KorisnikDTO toDTO(Korisnik korisnik) {
        if (korisnik == null) {
            return null;
        }

        return new KorisnikDTO(
                korisnik.getKorisnikID(),
                korisnik.getIme(),
                korisnik.getPrezime(),
                korisnik.getEmail()
        );
    }

    public static Korisnik toEntity(KorisnikDTO dto) {
        if (dto == null) {
            return null;
        }

        Korisnik korisnik = new Korisnik();
        korisnik.setKorisnikID(dto.getKorisnikID());
        korisnik.setIme(dto.getIme());
        korisnik.setPrezime(dto.getPrezime());
        korisnik.setEmail(dto.getEmail());

        return korisnik;
    }

    public static Korisnik toEntityFromCreateDTO(KorisnikCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        Korisnik korisnik = new Korisnik();
        korisnik.setIme(dto.getIme());
        korisnik.setPrezime(dto.getPrezime());
        korisnik.setEmail(dto.getEmail());
        korisnik.setSifra(dto.getSifra());
        return korisnik;
    }

}
