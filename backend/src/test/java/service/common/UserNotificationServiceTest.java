package service.common;

import dto.NotificationResponse;
import entity.Notification;
import exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserNotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @InjectMocks private UserNotificationService service;

    private Notification notification(Long id, Boolean lu) {
        Notification n = new Notification();
        n.setId(id);
        n.setSujet("Sujet " + id);
        n.setMessage("Message");
        n.setDateEnvoi(LocalDateTime.of(2026, 10, 15, 10, 30));
        n.setType(Notification.Type.SYSTEM);
        n.setStatut(Notification.Statut.ENVOYE);
        n.setLu(lu);
        return n;
    }

    @Test
    void lister_neDemandeQueLesNotificationsDeLUtilisateur() {
        when(notificationRepository.findByUserIdOrderByDateEnvoiDesc(1L))
                .thenReturn(List.of(notification(1L, true), notification(2L, false)));

        List<NotificationResponse> result = service.lister(1L);

        assertThat(result).extracting(NotificationResponse::id).containsExactly(1L, 2L);
        verify(notificationRepository).findByUserIdOrderByDateEnvoiDesc(1L);
    }

    @Test
    void lu_nullDansLaBaseExistante_estTraiteCommeNonLu() {
        when(notificationRepository.findByUserIdOrderByDateEnvoiDesc(1L))
                .thenReturn(List.of(notification(1L, null), notification(2L, true)));

        List<NotificationResponse> result = service.lister(1L);

        assertThat(result.get(0).lu()).isFalse();
        assertThat(result.get(1).lu()).isTrue();
    }

    @Test
    void compterNonLues_delegueAuComptageBorneAUtilisateur() {
        when(notificationRepository.countNonLues(1L)).thenReturn(3L);

        assertThat(service.compterNonLues(1L)).isEqualTo(3L);
    }

    @Test
    void marquerLue_notificationDunAutreUtilisateur_404_commeSiElleNExistaitPas() {
        when(notificationRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.marquerLue(1L, 9L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Notification introuvable.");
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void marquerLue_saNotification_laPasseALu() {
        Notification n = notification(4L, null);
        when(notificationRepository.findByIdAndUserId(4L, 1L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(n)).thenReturn(n);

        NotificationResponse response = service.marquerLue(1L, 4L);

        assertThat(response.lu()).isTrue();
        assertThat(n.getLu()).isTrue();
    }

    @Test
    void marquerLue_dejaLue_neReecritRien() {
        Notification n = notification(4L, true);
        when(notificationRepository.findByIdAndUserId(4L, 1L)).thenReturn(Optional.of(n));

        assertThat(service.marquerLue(1L, 4L).lu()).isTrue();
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void marquerToutesLues_neTouchePasLesNotificationsDesAutres() {
        when(notificationRepository.marquerToutesLues(1L)).thenReturn(2);

        assertThat(service.marquerToutesLues(1L)).isEqualTo(2);
        verify(notificationRepository).marquerToutesLues(1L);
    }
}
