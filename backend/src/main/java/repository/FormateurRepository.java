package repository;

import entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FormateurRepository extends JpaRepository<Formateur, Long> {
    Optional<Formateur> findByUsername(String username);

    // PostgreSQL compare les chaines en tenant compte de la casse (MySQL non) :
    // on garde le comportement insensible a la casse pour la connexion par e-mail.
    @Query("SELECT f FROM Formateur f WHERE LOWER(f.email) = LOWER(:email)")
    Optional<Formateur> findByEmail(@Param("email") String email);
}
