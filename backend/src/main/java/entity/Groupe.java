package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Groupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String nom;

    @OneToMany(mappedBy = "groupe", fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Etudiant> etudiants = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "cours_id")
    @JsonBackReference
    private Cours cours;

    @ManyToOne
    @JoinColumn(name = "session_pedagogique_id")
    @JsonBackReference
    private SessionPedagogique sessionPedagogique;

    @ManyToOne
    @JoinColumn(name = "formateur_id")
    private Formateur formateur;

    @ManyToOne
    @JoinColumn(name = "specialite_id", nullable = true)
    private Specialite specialite;

    public Formateur getFormateur() {
        return formateur;
    }
    public void setFormateur(Formateur formateur) {
        this.formateur = formateur;
    }
    public Specialite getSpecialite() {
        return specialite;
    }
    public void setSpecialite(Specialite specialite) {
        this.specialite = specialite;
    }
}
