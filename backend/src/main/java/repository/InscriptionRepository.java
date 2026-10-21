package repository;

import entity.Inscription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InscriptionRepository extends JpaRepository<Inscription, Long> {
    @EntityGraph(attributePaths = {"cours", "cours.formateur"})
    List<Inscription> findByEtudiantId(Long etudiantId);

    Optional<Inscription> findByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
    List<Inscription> findByCoursId(Long coursId);

    boolean existsByEtudiantIdAndCoursIdAndStatut(Long etudiantId, Long coursId, Inscription.Statut statut);
}
