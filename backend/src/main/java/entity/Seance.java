package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Seance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;

    @ManyToOne
    @JoinColumn(name = "cours_id")
    @JsonBackReference
    private Cours cours;

    @ManyToOne
    @JoinColumn(name = "formateur_id")
    @JsonBackReference
    private Formateur formateur;

    @ManyToOne
    @JoinColumn(name = "salle_id")
    @JsonBackReference
    private Salle salle;

    @ManyToOne
    @JoinColumn(name = "groupe_id")
    private Groupe groupe;

    public Groupe getGroupe() {
        return groupe;
    }
    public void setGroupe(Groupe groupe) {
        this.groupe = groupe;
    }
}
