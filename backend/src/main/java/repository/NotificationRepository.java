package repository;

import entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId);
    List<Notification> findByUserIdOrderByDateEnvoiDesc(Long userId);

    /** Une notification n'est retournée que si elle appartient à l'utilisateur donné. */
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    /** Non lues = lu faux OU null (lignes antérieures à l'ajout de la colonne). */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND (n.lu IS NULL OR n.lu = false)")
    long countNonLues(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notification n SET n.lu = true WHERE n.user.id = :userId AND (n.lu IS NULL OR n.lu = false)")
    int marquerToutesLues(@Param("userId") Long userId);
}
