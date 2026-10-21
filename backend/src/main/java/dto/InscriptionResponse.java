package dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InscriptionResponse {
    private Long inscriptionId;
    private Long coursId;
    private String coursCode;
    private String coursTitre;
    private String dateInscription;
    private String statut;
    private String message;
}
