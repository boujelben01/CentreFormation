package service.publique;

import dto.ContactRequest;
import exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import service.admin.EmailService;

/** Transmet les messages du formulaire de contact à l'adresse CONTACT_TO_EMAIL. */
@Slf4j
@Service
public class ContactService {

    private final EmailService emailService;
    private final ContactRateLimiter rateLimiter;
    private final String destinataire;

    public ContactService(EmailService emailService, ContactRateLimiter rateLimiter,
                          @Value("${CONTACT_TO_EMAIL:}") String destinataire) {
        this.emailService = emailService;
        this.rateLimiter = rateLimiter;
        this.destinataire = destinataire == null ? "" : destinataire.trim();
    }

    public void envoyer(ContactRequest request, String ip) {
        if (request.website() != null && !request.website().isBlank()) {
            // Robot : réponse de succès identique, rien n'est envoyé.
            log.info("Message de contact ignoré (champ piège rempli) depuis {}", ip);
            return;
        }
        if (!rateLimiter.tenter(ip)) {
            log.warn("Contact : limite de débit atteinte pour {}", ip);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Trop de messages envoyés. Veuillez réessayer plus tard.");
        }
        if (destinataire.isEmpty()) {
            log.error("CONTACT_TO_EMAIL non défini : message de {} non transmis", request.email());
            throw indisponible();
        }

        String sujet = request.sujet().replaceAll("[\\r\\n]+", " ");
        String contenu = "Nom : " + request.nom() + "\n"
                + "E-mail : " + request.email() + "\n"
                + "Sujet : " + sujet + "\n\n"
                + request.message();

        if (!emailService.sendEmail(destinataire, null, "[Contact] " + sujet, contenu, false)) {
            log.error("Contact : échec de l'envoi du message de {} ({})", request.nom(), request.email());
            throw indisponible();
        }
    }

    private static ApiException indisponible() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "Votre message n'a pas pu être envoyé. Veuillez réessayer plus tard.");
    }
}
