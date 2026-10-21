package repository;

import dto.GroupeEffectif;
import entity.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface GroupeRepository extends JpaRepository<Groupe, Long> {
    Optional<Groupe> findByNom(String nom);
    List<Groupe> findByFormateurId(Long formateurId);
    List<Groupe> findByCoursId(Long coursId);

    boolean existsByFormateurIdAndCoursId(Long formateurId, Long coursId);

    /** Groupes d'un formateur avec leur cours et leur effectif, en une seule requête (pas de N+1). */
    @Query("""
            SELECT new dto.GroupeEffectif(g.id, g.nom, c.id, c.code, c.titre, COUNT(e))
            FROM Groupe g
            LEFT JOIN g.cours c
            LEFT JOIN g.etudiants e
            WHERE g.formateur.id = :formateurId
            GROUP BY g.id, g.nom, c.id, c.code, c.titre
            ORDER BY g.nom
            """)
    List<GroupeEffectif> findGroupesAvecEffectif(@Param("formateurId") Long formateurId);

    /** Formateur de chaque groupe d'un lot de cours (repli quand Cours.formateur est vide). */
    @Query("SELECT g FROM Groupe g JOIN FETCH g.formateur WHERE g.cours.id IN :coursIds ORDER BY g.id")
    List<Groupe> findAvecFormateurByCoursIdIn(@Param("coursIds") Collection<Long> coursIds);
}
