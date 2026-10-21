package repository;

import dto.EtudiantGroupeResponse;
import entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByMatricule(String matricule);
    Optional<Etudiant> findByUsername(String username);
    // PostgreSQL compare les chaines en tenant compte de la casse (MySQL non) :
    // on garde le comportement insensible a la casse pour la connexion par e-mail.
    @Query("SELECT e FROM Etudiant e WHERE LOWER(e.email) = LOWER(:email)")
    Optional<Etudiant> findByEmail(@Param("email") String email);
    List<Etudiant> findByGroupeId(Long groupeId);

    /** L'étudiant appartient-il à un groupe suivant ce cours ? */
    boolean existsByIdAndGroupeCoursId(Long id, Long coursId);

    @Query("""
            SELECT new dto.EtudiantGroupeResponse(e.id, e.nom, e.prenom, e.matricule, e.email)
            FROM Etudiant e
            WHERE e.groupe.id = :groupeId
            ORDER BY e.nom, e.prenom
            """)
    List<EtudiantGroupeResponse> findResumesByGroupeId(@Param("groupeId") Long groupeId);

    /** Étudiants de plusieurs groupes en une requête : lignes {groupeId, id, nom, prenom, matricule, email}. */
    @Query("""
            SELECT e.groupe.id, e.id, e.nom, e.prenom, e.matricule, e.email
            FROM Etudiant e
            WHERE e.groupe.id IN :groupeIds
            ORDER BY e.nom, e.prenom
            """)
    List<Object[]> findResumesByGroupeIdIn(@Param("groupeIds") Collection<Long> groupeIds);
}
