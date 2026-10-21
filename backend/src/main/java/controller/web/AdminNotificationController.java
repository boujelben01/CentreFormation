package controller.web;

import entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import repository.*;
import service.admin.NotificationService;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/notifications")
public class AdminNotificationController {
    
    private final NotificationService notificationService;
    private final EtudiantRepository etudiantRepository;
    private final FormateurRepository formateurRepository;
    private final GroupeRepository groupeRepository;

    @GetMapping
    public String list(Model model) {
        List<Notification> notifications = notificationService.findAll();
        
        // Statistiques
        long total = notifications.size();
        long envoyes = notifications.stream()
                .filter(n -> n.getStatut() == Notification.Statut.ENVOYE).count();
        long echecs = notifications.stream()
                .filter(n -> n.getStatut() == Notification.Statut.ECHEC).count();
        long enAttente = notifications.stream()
                .filter(n -> n.getStatut() == Notification.Statut.EN_ATTENTE).count();
        
        model.addAttribute("notifications", notifications);
        model.addAttribute("totalCount", total);
        model.addAttribute("envoyesCount", envoyes);
        model.addAttribute("echecsCount", echecs);
        model.addAttribute("enAttenteCount", enAttente);
        
        return "admin/notifications/list";
    }

    @GetMapping("/compose")
    public String compose(Model model) {
        model.addAttribute("etudiants", etudiantRepository.findAll());
        model.addAttribute("formateurs", formateurRepository.findAll());
        model.addAttribute("groupes", groupeRepository.findAll());
        return "admin/notifications/compose";
    }

    @PostMapping("/send")
    public String send(
            @RequestParam String destinationType,
            @RequestParam(required = false) Long destinataireId,
            @RequestParam(required = false) Long groupeId,
            @RequestParam String sujet,
            @RequestParam String message,
            RedirectAttributes redirectAttributes) {
        
        try {
            int count = 0;
            
            switch (destinationType) {
                case "etudiant" -> {
                    if (destinataireId != null) {
                        notificationService.sendToEtudiant(destinataireId, sujet, message);
                        count = 1;
                    }
                }
                case "formateur" -> {
                    if (destinataireId != null) {
                        notificationService.sendToFormateur(destinataireId, sujet, message);
                        count = 1;
                    }
                }
                case "groupe" -> {
                    if (groupeId != null) {
                        count = notificationService.sendToGroupe(groupeId, sujet, message);
                    }
                }
                case "all_etudiants" -> {
                    count = notificationService.sendToAllEtudiants(sujet, message);
                }
                case "all_formateurs" -> {
                    count = notificationService.sendToAllFormateurs(sujet, message);
                }
            }
            
            redirectAttributes.addFlashAttribute("success", 
                    "Notification(s) envoyée(s) avec succès à " + count + " destinataire(s)");
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Erreur lors de l'envoi : " + e.getMessage());
        }
        
        return "redirect:/admin/notifications";
    }

    @PostMapping("/retry/{id}")
    public String retry(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Notification notification = notificationService.retry(id);
            
            if (notification.getStatut() == Notification.Statut.ENVOYE) {
                redirectAttributes.addFlashAttribute("success", "Notification renvoyée avec succès");
            } else {
                redirectAttributes.addFlashAttribute("error", "Échec du renvoi de la notification");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Erreur : " + e.getMessage());
        }
        
        return "redirect:/admin/notifications";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            notificationService.delete(id);
            redirectAttributes.addFlashAttribute("success", "Notification supprimée");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Erreur lors de la suppression : " + e.getMessage());
        }
        return "redirect:/admin/notifications";
    }

    @GetMapping("/view/{id}")
    public String view(@PathVariable Long id, Model model) {
        Notification notification = notificationService.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        model.addAttribute("notification", notification);
        return "admin/notifications/view";
    }
}
