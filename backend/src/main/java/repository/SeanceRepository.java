package repository;

import dto.SeanceFormateurResponse;
import entity.Seance;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeanceRepository extends JpaRepository<Seance, Long> {
    List<Seance> findByFormateurId(Long formateurId);
    List<Seance> findByGroupeId(Long groupeId);
    List<Seance> findByFormateurIdOrderByDateAscHeureDebutAsc(Long formateurId);
    List<Seance> findByGroupeIdOrderByDateAscHeureDebutAsc(Long groupeId);

    // Plannings : les relations affichées sont chargées avec la séance (pas de requête par séance).
    @EntityGraph(attributePaths = {"cours", "salle", "groupe", "formateur"})
    List<Seance> findAvecDetailsByFormateurId(Long formateurId);

    @EntityGraph(attributePaths = {"cours", "salle", "groupe", "formateur"})
    List<Seance> findAvecDetailsByGroupeIdOrderByDateAscHeureDebutAsc(Long groupeId);

    /** Séances d'un formateur avec cours, groupe et salle, en une requête. */
    @Query("""
            SELECT new dto.SeanceFormateurResponse(s.id, s.date, s.heureDebut, s.heureFin,
                   c.id, c.code, c.titre, g.id, g.nom, sa.nom)
            FROM Seance s
            LEFT JOIN s.cours c
            LEFT JOIN s.groupe g
            LEFT JOIN s.salle sa
            WHERE s.formateur.id = :formateurId
            ORDER BY s.date, s.heureDebut
            """)
    List<SeanceFormateurResponse> findResumesByFormateurId(@Param("formateurId") Long formateurId);
}
