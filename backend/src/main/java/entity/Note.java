package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private Double valeur;
    private String session;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    @JsonBackReference
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "cours_id")
    @JsonBackReference
    private Cours cours;

    private Long formateurId;

    public Long getFormateurId() {
        return formateurId;
    }

    public void setFormateurId(Long formateurId) {
        this.formateurId = formateurId;
    }
}
