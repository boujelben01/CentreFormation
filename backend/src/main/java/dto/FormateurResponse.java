package dto;

import entity.Formateur;

/** Formateur vu par un étudiant : aucune donnée de compte (ni identifiant ni mot de passe). */
public record FormateurResponse(Long id, String nom, String prenom, String email, String specialite) {

    public static FormateurResponse from(Formateur f) {
        return new FormateurResponse(f.getId(), f.getNom(), f.getPrenom(), f.getEmail(),
                f.getSpecialite() != null ? f.getSpecialite().getNom() : null);
    }
}
