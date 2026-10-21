package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@Entity
public class Etudiant extends User {
    @Column(unique = true, nullable = false)
    private String matricule;

    private String nom;
    private String prenom;
    private String email;
    private LocalDate dateInscription;

    @ManyToOne
    @JoinColumn(name = "groupe_id")
    @JsonBackReference
    private Groupe groupe;

    @OneToMany(mappedBy = "etudiant", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Inscription> inscriptions = new HashSet<>();

    @OneToMany(mappedBy = "etudiant", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Note> notes = new HashSet<>();

    public Groupe getGroupe() {
        return groupe;
    }
}
