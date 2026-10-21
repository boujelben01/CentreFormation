package dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String userType; // "ETUDIANT" or "FORMATEUR"
    
    // Common fields
    private String nom;
    private String prenom;
    private String email;
    
    // Etudiant specific
    private String matricule;
    
    // Formateur specific - optional specialite ID
    private Long specialiteId;
}
