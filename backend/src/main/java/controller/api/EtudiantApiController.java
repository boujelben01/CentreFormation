package controller.api;

import dto.CatalogueCoursResponse;
import dto.CoursDisponibleResponse;
import dto.CoursResponse;
import dto.FormateurResponse;
import dto.InscriptionDetailResponse;
import dto.InscriptionRequest;
import dto.InscriptionResponse;
import dto.MessageResponse;
import dto.NoteResponse;
import dto.NotificationCountResponse;
import dto.NotificationResponse;
import dto.NotificationsMarqueesResponse;
import dto.ProfilEtudiantResponse;
import dto.ProfileUpdateRequest;
import dto.SeanceResponse;
import exception.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import repository.EtudiantRepository;
import service.common.UserNotificationService;
import service.etudiant.EtudiantCatalogueService;
import service.etudiant.EtudiantConsultationService;
import service.etudiant.EtudiantInscriptionService;
import service.etudiant.EtudiantPlanningService;

import java.util.List;

@RestController
@RequestMapping("/api/etudiant")
@PreAuthorize("hasRole('ETUDIANT')")
@RequiredArgsConstructor
public class EtudiantApiController {

    private final EtudiantConsultationService consultationService;
    private final EtudiantPlanningService planningService;
    private final EtudiantInscriptionService inscriptionService;
    private final EtudiantCatalogueService catalogueService;
    private final UserNotificationService notificationService;
    private final EtudiantRepository etudiantRepository;

    /** Identifiant de l'étudiant connecté, déduit du JWT (l'e-mail est l'identifiant de connexion). */
    private Long getEtudiantId(Authentication authentication) {
        return etudiantRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("Étudiant introuvable."))
                .getId();
    }

    // ==================== PROFIL ====================

    @GetMapping("/profile")
    public ProfilEtudiantResponse getProfile(Authentication authentication) {
        return consultationService.getProfil(getEtudiantId(authentication));
    }

    @PutMapping("/profile")
    public ProfilEtudiantResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                                Authentication authentication) {
        return consultationService.updateProfil(getEtudiantId(authentication), request);
    }

    // ==================== PLANNING / NOTES ====================

    @GetMapping("/planning")
    public List<SeanceResponse> getPlanning(Authentication authentication) {
        return planningService.getEmploiDuTempsWithDetails(getEtudiantId(authentication));
    }

    @GetMapping("/notes")
    public List<NoteResponse> getNotes(Authentication authentication) {
        return consultationService.getNotesWithCoursInfo(getEtudiantId(authentication));
    }

    // ==================== NOTIFICATIONS (propres à l'étudiant connecté) ====================

    @GetMapping("/notifications")
    public List<NotificationResponse> getNotifications(Authentication authentication) {
        return notificationService.lister(getEtudiantId(authentication));
    }

    @GetMapping("/notifications/unread-count")
    public NotificationCountResponse getUnreadCount(Authentication authentication) {
        return new NotificationCountResponse(notificationService.compterNonLues(getEtudiantId(authentication)));
    }

    @PatchMapping("/notifications/{id}/lu")
    public NotificationResponse marquerLue(@PathVariable Long id, Authentication authentication) {
        return notificationService.marquerLue(getEtudiantId(authentication), id);
    }

    @PatchMapping("/notifications/lu-tout")
    public NotificationsMarqueesResponse marquerToutesLues(Authentication authentication) {
        return new NotificationsMarqueesResponse(notificationService.marquerToutesLues(getEtudiantId(authentication)));
    }

    // ==================== COURS / FORMATEURS ====================

    @GetMapping("/cours")
    public List<CoursResponse> getCours(Authentication authentication) {
        return consultationService.getCoursByEtudiant(getEtudiantId(authentication));
    }

    @GetMapping("/formateurs")
    public List<FormateurResponse> getFormateurs(Authentication authentication) {
        return consultationService.getFormateursByEtudiant(getEtudiantId(authentication));
    }

    /** Cours sans aucune inscription de l'étudiant (liste d'inscription). */
    @GetMapping("/cours/disponibles")
    public List<CoursDisponibleResponse> getCoursDisponibles(Authentication authentication) {
        return catalogueService.disponibles(getEtudiantId(authentication));
    }

    /** Tous les cours, avec l'état de l'inscription de l'étudiant. */
    @GetMapping("/catalogue")
    public List<CatalogueCoursResponse> getCatalogue(Authentication authentication) {
        return catalogueService.catalogue(getEtudiantId(authentication));
    }

    // ==================== INSCRIPTIONS ====================

    @GetMapping("/inscriptions")
    public List<InscriptionDetailResponse> getInscriptions(Authentication authentication) {
        return inscriptionService.lister(getEtudiantId(authentication));
    }

    @PostMapping("/inscriptions")
    public ResponseEntity<InscriptionResponse> inscrireACours(@Valid @RequestBody InscriptionRequest request,
                                                              Authentication authentication) {
        InscriptionResponse response = inscriptionService.inscrire(getEtudiantId(authentication), request.getCoursId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/inscriptions/{inscriptionId}")
    public MessageResponse annulerInscription(@PathVariable Long inscriptionId, Authentication authentication) {
        return inscriptionService.annuler(getEtudiantId(authentication), inscriptionId);
    }
}
