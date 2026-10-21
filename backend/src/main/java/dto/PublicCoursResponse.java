package dto;

/** Formation exposée sans authentification : aucune donnée de contact ni identifiant technique du formateur. */
public record PublicCoursResponse(
        Long id,
        String code,
        String titre,
        String description,
        int volumeHoraire,
        String formateurPrenom,
        String formateurNom,
        String specialite
) {
}
