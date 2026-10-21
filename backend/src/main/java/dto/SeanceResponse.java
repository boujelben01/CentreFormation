package dto;

import entity.Seance;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeanceResponse {
    private Long id;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Long coursId;
    private String coursCode;
    private String coursTitre;
    private String salleNom;
    private String groupeNom;
    private String formateurNom;
    private String formateurPrenom;

    /** Séance telle que vue dans un planning (étudiant ou formateur). */
    public static SeanceResponse from(Seance seance) {
        SeanceResponse response = new SeanceResponse();
        response.setId(seance.getId());
        response.setDate(seance.getDate());
        response.setHeureDebut(seance.getHeureDebut());
        response.setHeureFin(seance.getHeureFin());

        if (seance.getCours() != null) {
            response.setCoursId(seance.getCours().getId());
            response.setCoursCode(seance.getCours().getCode());
            response.setCoursTitre(seance.getCours().getTitre());
        }
        if (seance.getSalle() != null) {
            response.setSalleNom(seance.getSalle().getNom());
        }
        if (seance.getGroupe() != null) {
            response.setGroupeNom(seance.getGroupe().getNom());
        }
        if (seance.getFormateur() != null) {
            response.setFormateurNom(seance.getFormateur().getNom());
            response.setFormateurPrenom(seance.getFormateur().getPrenom());
        }
        return response;
    }
}
