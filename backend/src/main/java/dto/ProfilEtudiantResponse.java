package dto;

import entity.Etudiant;

import java.time.LocalDate;

public record ProfilEtudiantResponse(
        Long id,
        String username,
        String matricule,
        String nom,
        String prenom,
        String email,
        LocalDate dateInscription
) {
    public static ProfilEtudiantResponse from(Etudiant e) {
        return new ProfilEtudiantResponse(e.getId(), e.getUsername(), e.getMatricule(), e.getNom(),
                e.getPrenom(), e.getEmail(), e.getDateInscription());
    }
}
