package controller.api;

import dto.CoursResponse;
import dto.EtudiantGroupeResponse;
import dto.GroupeResponse;
import dto.NoteFormateurResponse;
import dto.NoteRequest;
import dto.NoteUpdateRequest;
import dto.NotificationCountResponse;
import dto.NotificationResponse;
import dto.NotificationsMarqueesResponse;
import dto.ProfilFormateurResponse;
import dto.ProfileUpdateRequest;
import dto.SeanceFormateurResponse;
import dto.SeanceResponse;
import exception.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import repository.FormateurRepository;
import service.common.UserNotificationService;
import service.formateur.FormateurConsultationService;
import service.formateur.FormateurEvaluationService;
import service.formateur.FormateurPlanningService;

import java.util.List;

@RestController
@RequestMapping("/api/formateur")
@PreAuthorize("hasRole('FORMATEUR')")
@RequiredArgsConstructor
public class FormateurApiController {

    private final FormateurConsultationService consultationService;
    private final FormateurEvaluationService evaluationService;
    private final FormateurPlanningService planningService;
    private final UserNotificationService notificationService;
    private final FormateurRepository formateurRepository;

    /** Identifiant du formateur connecté, déduit du JWT (l'e-mail est l'identifiant de connexion). */
    private Long getFormateurId(Authentication authentication) {
        return formateurRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("Formateur introuvable."))
                .getId();
    }

    // ==================== PROFIL ====================

    @GetMapping("/profile")
    public ProfilFormateurResponse getProfile(Authentication authentication) {
        return consultationService.getProfil(getFormateurId(authentication));
    }

    @PutMapping("/profile")
    public ProfilFormateurResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                                 Authentication authentication) {
        return consultationService.updateProfil(getFormateurId(authentication), request);
    }

    // ==================== CONSULTATION ====================

    /** Groupes du formateur avec effectif et étudiants. */
    @GetMapping("/groupes")
    public List<GroupeResponse> getGroupes(Authentication authentication) {
        return consultationService.getGroupesByFormateur(getFormateurId(authentication));
    }

    @GetMapping("/seances")
    public List<SeanceFormateurResponse> getSeances(Authentication authentication) {
        return consultationService.getSeancesByFormateur(getFormateurId(authentication));
    }

    /** Étudiants d'un groupe du formateur (403 pour le groupe d'un autre formateur, 404 si inconnu). */
    @GetMapping("/groupes/{groupeId}/etudiants")
    public List<EtudiantGroupeResponse> getEtudiantsByGroupe(@PathVariable Long groupeId,
                                                             Authentication authentication) {
        return consultationService.getEtudiantsByGroupe(getFormateurId(authentication), groupeId);
    }

    @GetMapping("/cours")
    public List<CoursResponse> getCours(Authentication authentication) {
        return consultationService.getCoursByFormateur(getFormateurId(authentication));
    }

    // ==================== PLANNING ====================

    @GetMapping("/planning")
    public List<SeanceResponse> getPlanning(Authentication authentication) {
        return planningService.getPlanningWithDetails(getFormateurId(authentication));
    }

    // ==================== NOTES ====================

    /** Notes saisies par le formateur connecté (et seulement les siennes). */
    @GetMapping("/notes")
    public List<NoteFormateurResponse> getNotes(Authentication authentication) {
        return evaluationService.getNotesWithDetails(getFormateurId(authentication));
    }

    @PostMapping("/notes")
    public NoteFormateurResponse saisirNote(Authentication authentication, @Valid @RequestBody NoteRequest request) {
        return evaluationService.saisirNote(getFormateurId(authentication), request);
    }

    @PutMapping("/notes/{noteId}")
    public NoteFormateurResponse modifierNote(Authentication authentication,
                                              @PathVariable Long noteId,
                                              @Valid @RequestBody NoteUpdateRequest request) {
        return evaluationService.modifierNote(getFormateurId(authentication), noteId, request);
    }

    // ==================== NOTIFICATIONS (propres au formateur connecté) ====================

    @GetMapping("/notifications")
    public List<NotificationResponse> getNotifications(Authentication authentication) {
        return notificationService.lister(getFormateurId(authentication));
    }

    @GetMapping("/notifications/unread-count")
    public NotificationCountResponse getUnreadCount(Authentication authentication) {
        return new NotificationCountResponse(notificationService.compterNonLues(getFormateurId(authentication)));
    }

    @PatchMapping("/notifications/{id}/lu")
    public NotificationResponse marquerLue(@PathVariable Long id, Authentication authentication) {
        return notificationService.marquerLue(getFormateurId(authentication), id);
    }

    @PatchMapping("/notifications/lu-tout")
    public NotificationsMarqueesResponse marquerToutesLues(Authentication authentication) {
        return new NotificationsMarqueesResponse(notificationService.marquerToutesLues(getFormateurId(authentication)));
    }
}
