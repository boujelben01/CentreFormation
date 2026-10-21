package dto;

/** Cours du catalogue ; inscriptionId / statutInscription sont null si l'étudiant n'a jamais été inscrit. */
public record CatalogueCoursResponse(
        Long coursId,
        String code,
        String titre,
        String description,
        Integer volumeHoraire,
        String formateurNom,
        String formateurPrenom,
        String formateurEmail,
        Long inscriptionId,
        String statutInscription
) {
}
