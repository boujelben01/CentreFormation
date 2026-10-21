package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private Long id;
    private Double valeur;
    private String session;
    private String coursNom;
    private String coursCode;
    private Long coursId;
    private Long formateurId;
}
