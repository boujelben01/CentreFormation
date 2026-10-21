package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InscriptionDetailResponse {
    private Long inscriptionId;
    private String dateInscription;
    private String statut;
    
    // Détails du cours
    private Long coursId;
    private String coursCode;
    private String coursTitre;
    private String coursDescription;
    private Integer coursVolumeHoraire;
    
    // Informations supplémentaires
    private String formateurNom;
    private String formateurPrenom;
}
