package entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String sujet;
    
    @Column(length = 2000)
    private String message;
    
    private String destinataireEmail;
    private String destinataireNom;
    
    private LocalDateTime dateEnvoi;

    /**
     * État de lecture. Colonne ajoutée sur une base existante : les anciennes lignes valent null,
     * ce qui est traité comme « non lue » (voir isLue()).
     */
    private Boolean lu = Boolean.FALSE;

    @Enumerated(EnumType.STRING)
    private Type type;
    
    @Enumerated(EnumType.STRING)
    private Statut statut;

    public enum Type {
        EMAIL, SYSTEM
    }
    
    public enum Statut {
        EN_ATTENTE, ENVOYE, ECHEC
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    /** Vrai uniquement si la notification a été explicitement marquée comme lue (null = non lue). */
    public boolean isLue() {
        return Boolean.TRUE.equals(lu);
    }
}
