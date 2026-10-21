package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteFormateurResponse {
    private Long id;
    private Double valeur;
    private String session;
    
    // Informations de l'étudiant
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantPrenom;
    
    // Informations du cours
    private Long coursId;
    private String coursCode;
    private String coursNom;
    
    // Informations du groupe
    private String groupeNom;

    private Long formateurId;
}
