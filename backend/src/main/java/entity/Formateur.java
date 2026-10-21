package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@Entity
public class Formateur extends User {
    private String nom;
    private String prenom;
    private String email;

    @ManyToOne
    @JoinColumn(name = "specialite_id")
    @JsonBackReference
    private Specialite specialite;

    @OneToMany(mappedBy = "formateur", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Cours> cours = new HashSet<>();

    @OneToMany(mappedBy = "formateur", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Seance> seances = new HashSet<>();
}
