/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package mapper;

/**
 *
 * @author pite
 */
import dto.AdministratorCreateDTO;
import dto.AdministratorDTO;
import entities.Administrator;

public class AdministratorMapper {

    // Entitet → DTO
    public static AdministratorDTO toDTO(Administrator administrator) {
        if (administrator == null) {
            return null;
        }

        return new AdministratorDTO(
                administrator.getAdministratorID(),
                administrator.getIme(),
                administrator.getPrezime(),
                administrator.getEmail()
        );
    }

    public static Administrator toEntity(AdministratorDTO dto) {
        if (dto == null) {
            return null;
        }

        Administrator administrator = new Administrator();
        administrator.setAdministratorID(dto.getAdministratorID());
        administrator.setIme(dto.getIme());
        administrator.setPrezime(dto.getPrezime());
        administrator.setEmail(dto.getEmail());
        return administrator;
    }
    
    
    public static Administrator toEntityFromCreateDTO(AdministratorCreateDTO dto) {
    if (dto == null) return null;

    Administrator administrator = new Administrator();
    administrator.setIme(dto.getIme());
    administrator.setPrezime(dto.getPrezime());
    administrator.setEmail(dto.getEmail());
    administrator.setSifra(dto.getSifra());
    return administrator;
}
    
    
    
    
    
    
}
