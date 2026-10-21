package dto;

import entity.Notification;

import java.time.LocalDateTime;

/** Notification telle qu'exposée à son destinataire ; « lu » est toujours un booléen (null en base = non lue). */
public record NotificationResponse(
        Long id,
        String sujet,
        String message,
        LocalDateTime dateEnvoi,
        String type,
        String statut,
        boolean lu
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getSujet(),
                n.getMessage(),
                n.getDateEnvoi(),
                n.getType() != null ? n.getType().name() : null,
                n.getStatut() != null ? n.getStatut().name() : null,
                n.isLue()
        );
    }
}
