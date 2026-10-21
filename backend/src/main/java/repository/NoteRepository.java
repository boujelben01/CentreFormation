package repository;

import entity.Note;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByFormateurId(Long formateurId);

    @EntityGraph(attributePaths = {"cours"})
    List<Note> findByEtudiantId(Long etudiantId);

    /** Notes d'un formateur avec étudiant, groupe et cours chargés ensemble (pas de N+1). */
    @Query("""
            SELECT n FROM Note n
            JOIN FETCH n.etudiant e
            LEFT JOIN FETCH e.groupe
            LEFT JOIN FETCH n.cours
            WHERE n.formateurId = :formateurId
            ORDER BY n.id DESC
            """)
    List<Note> findDetailsByFormateurId(@Param("formateurId") Long formateurId);
}
