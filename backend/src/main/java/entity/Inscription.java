package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate dateInscription;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Statut statut;

    public enum Statut {
        INSCRIT, ANNULE, EN_ATTENTE
    }

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    @JsonBackReference
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "cours_id")
    @JsonBackReference
    private Cours cours;
}
