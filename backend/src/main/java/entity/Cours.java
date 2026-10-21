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
public class Cours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String titre;
    private String description;
    private int volumeHoraire;

    @ManyToOne
    @JoinColumn(name = "formateur_id")
    @JsonBackReference
    private Formateur formateur;

    @OneToMany(mappedBy = "cours", fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Groupe> groupes = new HashSet<>();

    @OneToMany(mappedBy = "cours", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Inscription> inscriptions = new HashSet<>();

    @OneToMany(mappedBy = "cours", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Note> notes = new HashSet<>();

    @OneToMany(mappedBy = "cours", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Seance> seances = new HashSet<>();
}
