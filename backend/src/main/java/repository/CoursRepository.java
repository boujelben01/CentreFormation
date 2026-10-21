package repository;

import entity.Cours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CoursRepository extends JpaRepository<Cours, Long> {
    Optional<Cours> findByCode(String code);

    @Query("SELECT g.cours FROM Groupe g WHERE g.id = :groupeId")
    List<Cours> findByGroupeId(@Param("groupeId") Long groupeId);

    List<Cours> findByFormateurId(Long formateurId);

    boolean existsByIdAndFormateurId(Long id, Long formateurId);

    /** Tous les cours avec leur formateur, en une requête (catalogue). */
    @Query("SELECT c FROM Cours c LEFT JOIN FETCH c.formateur f LEFT JOIN FETCH f.specialite ORDER BY c.titre")
    List<Cours> findAllAvecFormateur();
}
