package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoursDisponibleResponse {
    private Long coursId;
    private String code;
    private String titre;
    private String description;
    private Integer volumeHoraire;
    
    // Informations du formateur
    private String formateurNom;
    private String formateurPrenom;
    private String formateurEmail;
}
