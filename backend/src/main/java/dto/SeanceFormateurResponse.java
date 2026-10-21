package dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SeanceFormateurResponse(
        Long id,
        LocalDate date,
        LocalTime heureDebut,
        LocalTime heureFin,
        Long coursId,
        String coursCode,
        String coursTitre,
        Long groupeId,
        String groupeNom,
        String salleNom
) {
}
