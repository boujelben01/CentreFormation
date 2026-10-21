package service.common;

import dto.NotificationResponse;
import entity.Notification;
import exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.NotificationRepository;

import java.util.List;

/**
 * Notifications d'un utilisateur connecté (étudiant ou formateur).
 * Chaque méthode est bornée à l'identifiant de l'appelant : on ne voit, ne lit et ne modifie que les siennes.
 */
@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> lister(Long userId) {
        return notificationRepository.findByUserIdOrderByDateEnvoiDesc(userId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long compterNonLues(Long userId) {
        return notificationRepository.countNonLues(userId);
    }

    /**
     * Marque une notification comme lue. Une notification d'un autre utilisateur est traitée
     * comme inexistante (404), pour ne pas révéler son existence.
     */
    @Transactional
    public NotificationResponse marquerLue(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new NotFoundException("Notification introuvable."));
        if (!notification.isLue()) {
            notification.setLu(Boolean.TRUE);
            notification = notificationRepository.save(notification);
        }
        return NotificationResponse.from(notification);
    }

    /** Marque toutes les notifications non lues de l'utilisateur ; retourne le nombre de notifications modifiées. */
    @Transactional
    public int marquerToutesLues(Long userId) {
        return notificationRepository.marquerToutesLues(userId);
    }
}
