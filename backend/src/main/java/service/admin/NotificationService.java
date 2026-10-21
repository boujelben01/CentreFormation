package service.admin;

import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EtudiantRepository etudiantRepository;
    private final FormateurRepository formateurRepository;
    private final EmailService emailService;

    /**
     * Liste toutes les notifications
     */
    public List<Notification> findAll() {
        return notificationRepository.findAll();
    }

    /**
     * Trouve une notification par ID
     */
    public Optional<Notification> findById(Long id) {
        return notificationRepository.findById(id);
    }

    /**
     * Crée une notification système (sans envoi d'email)
     */
    @Transactional
    public Notification createSystemNotification(User user, String sujet, String message) {
        Notification notification = new Notification();
        notification.setSujet(sujet);
        notification.setMessage(message);
        notification.setUser(user);
        notification.setType(Notification.Type.SYSTEM);
        notification.setStatut(Notification.Statut.ENVOYE);
        notification.setDateEnvoi(LocalDateTime.now());
        
        if (user instanceof Etudiant etudiant) {
            notification.setDestinataireEmail(etudiant.getEmail());
            notification.setDestinataireNom(etudiant.getPrenom() + " " + etudiant.getNom());
        } else if (user instanceof Formateur formateur) {
            notification.setDestinataireEmail(formateur.getEmail());
            notification.setDestinataireNom(formateur.getPrenom() + " " + formateur.getNom());
        }
        
        return notificationRepository.save(notification);
    }

    /**
     * Envoie une notification par email
     */
    @Transactional
    public Notification sendEmailNotification(String email, String nom, String sujet, String message, User user) {
        Notification notification = new Notification();
        notification.setSujet(sujet);
        notification.setMessage(message);
        notification.setDestinataireEmail(email);
        notification.setDestinataireNom(nom);
        notification.setUser(user);
        notification.setType(Notification.Type.EMAIL);
        notification.setStatut(Notification.Statut.EN_ATTENTE);
        notification.setDateEnvoi(LocalDateTime.now());
        
        // Tentative d'envoi via Resend
        boolean sent = emailService.sendNotificationEmail(email, nom, sujet, message);
        
        if (sent) {
            notification.setStatut(Notification.Statut.ENVOYE);
            log.info("Email envoyé avec succès à {}", email);
        } else {
            notification.setStatut(Notification.Statut.ECHEC);
            log.warn("Échec de l'envoi de l'email à {}", email);
        }
        
        return notificationRepository.save(notification);
    }

    /**
     * Envoie une notification à un étudiant par ID
     */
    @Transactional
    public Notification sendToEtudiant(Long etudiantId, String sujet, String message) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        
        return sendEmailNotification(
                etudiant.getEmail(),
                etudiant.getPrenom() + " " + etudiant.getNom(),
                sujet,
                message,
                etudiant
        );
    }

    /**
     * Envoie une notification à un formateur par ID
     */
    @Transactional
    public Notification sendToFormateur(Long formateurId, String sujet, String message) {
        Formateur formateur = formateurRepository.findById(formateurId)
                .orElseThrow(() -> new RuntimeException("Formateur non trouvé"));
        
        return sendEmailNotification(
                formateur.getEmail(),
                formateur.getPrenom() + " " + formateur.getNom(),
                sujet,
                message,
                formateur
        );
    }

    /**
     * Envoie une notification à tous les étudiants
     */
    @Transactional
    public int sendToAllEtudiants(String sujet, String message) {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        int count = 0;
        
        for (Etudiant etudiant : etudiants) {
            if (etudiant.getEmail() != null && !etudiant.getEmail().isEmpty()) {
                Notification n = sendEmailNotification(
                        etudiant.getEmail(),
                        etudiant.getPrenom() + " " + etudiant.getNom(),
                        sujet,
                        message,
                        etudiant
                );
                if (n.getStatut() == Notification.Statut.ENVOYE) {
                    count++;
                }
            }
        }
        
        log.info("Notifications envoyées à {} étudiants sur {}", count, etudiants.size());
        return count;
    }

    /**
     * Envoie une notification à tous les formateurs
     */
    @Transactional
    public int sendToAllFormateurs(String sujet, String message) {
        List<Formateur> formateurs = formateurRepository.findAll();
        int count = 0;
        
        for (Formateur formateur : formateurs) {
            if (formateur.getEmail() != null && !formateur.getEmail().isEmpty()) {
                Notification n = sendEmailNotification(
                        formateur.getEmail(),
                        formateur.getPrenom() + " " + formateur.getNom(),
                        sujet,
                        message,
                        formateur
                );
                if (n.getStatut() == Notification.Statut.ENVOYE) {
                    count++;
                }
            }
        }
        
        log.info("Notifications envoyées à {} formateurs sur {}", count, formateurs.size());
        return count;
    }

    /**
     * Envoie une notification à tous les étudiants d'un groupe
     */
    @Transactional
    public int sendToGroupe(Long groupeId, String sujet, String message) {
        List<Etudiant> etudiants = etudiantRepository.findAll().stream()
                .filter(e -> e.getGroupe() != null && e.getGroupe().getId().equals(groupeId))
                .toList();
        
        int count = 0;
        for (Etudiant etudiant : etudiants) {
            if (etudiant.getEmail() != null && !etudiant.getEmail().isEmpty()) {
                Notification n = sendEmailNotification(
                        etudiant.getEmail(),
                        etudiant.getPrenom() + " " + etudiant.getNom(),
                        sujet,
                        message,
                        etudiant
                );
                if (n.getStatut() == Notification.Statut.ENVOYE) {
                    count++;
                }
            }
        }
        
        return count;
    }

    /**
     * Supprime une notification
     */
    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    /**
     * Renvoie une notification en échec
     */
    @Transactional
    public Notification retry(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        
        if (notification.getStatut() == Notification.Statut.ECHEC && 
            notification.getType() == Notification.Type.EMAIL) {
            
            boolean sent = emailService.sendNotificationEmail(
                    notification.getDestinataireEmail(),
                    notification.getDestinataireNom(),
                    notification.getSujet(),
                    notification.getMessage()
            );
            
            if (sent) {
                notification.setStatut(Notification.Statut.ENVOYE);
                notification.setDateEnvoi(LocalDateTime.now());
            }
            
            return notificationRepository.save(notification);
        }
        
        return notification;
    }

    /**
     * Compte les notifications par statut
     */
    public long countByStatut(Notification.Statut statut) {
        return notificationRepository.findAll().stream()
                .filter(n -> n.getStatut() == statut)
                .count();
    }
}
