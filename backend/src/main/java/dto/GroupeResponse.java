package dto;

import java.util.List;

public record GroupeResponse(
        Long id,
        String nom,
        Long coursId,
        String coursCode,
        String coursTitre,
        long effectif,
        List<EtudiantGroupeResponse> etudiants
) {
}
