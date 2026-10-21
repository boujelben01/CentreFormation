package dto;

import entity.Formateur;

public record ProfilFormateurResponse(
        Long id,
        String username,
        String nom,
        String prenom,
        String email,
        SpecialiteInfo specialite
) {
    public record SpecialiteInfo(Long id, String nom) {
    }

    public static ProfilFormateurResponse from(Formateur f) {
        SpecialiteInfo specialite = f.getSpecialite() == null ? null
                : new SpecialiteInfo(f.getSpecialite().getId(), f.getSpecialite().getNom());
        return new ProfilFormateurResponse(f.getId(), f.getUsername(), f.getNom(), f.getPrenom(), f.getEmail(), specialite);
    }
}
