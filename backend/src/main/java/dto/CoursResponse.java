package dto;

import entity.Cours;

public record CoursResponse(
        Long id,
        String code,
        String titre,
        String description,
        int volumeHoraire,
        String formateurNom,
        String formateurPrenom
) {
    public static CoursResponse from(Cours c) {
        return new CoursResponse(c.getId(), c.getCode(), c.getTitre(), c.getDescription(), c.getVolumeHoraire(),
                c.getFormateur() != null ? c.getFormateur().getNom() : null,
                c.getFormateur() != null ? c.getFormateur().getPrenom() : null);
    }
}
