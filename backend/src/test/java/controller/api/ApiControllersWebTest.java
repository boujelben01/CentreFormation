package controller.api;

import dto.NotificationResponse;
import entity.Etudiant;
import entity.Formateur;
import exception.ConflictException;
import exception.ForbiddenException;
import exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import repository.EtudiantRepository;
import repository.FormateurRepository;
import service.common.UserNotificationService;
import service.etudiant.EtudiantCatalogueService;
import service.etudiant.EtudiantConsultationService;
import service.etudiant.EtudiantInscriptionService;
import service.etudiant.EtudiantPlanningService;
import service.formateur.FormateurConsultationService;
import service.formateur.FormateurEvaluationService;
import service.formateur.FormateurPlanningService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Contrat HTTP des erreurs (403 / 404 / 409 / 400 en JSON français) et des endpoints de notifications.
 * Les services sont simulés : ces tests ne nécessitent ni base de données ni contexte Spring complet.
 */
@ExtendWith(MockitoExtension.class)
class ApiControllersWebTest {

    private static final String FORMATEUR_EMAIL = "karim@test.tn";
    private static final String ETUDIANT_EMAIL = "amira@test.tn";

    @Mock private FormateurConsultationService formateurConsultation;
    @Mock private FormateurEvaluationService formateurEvaluation;
    @Mock private FormateurPlanningService formateurPlanning;
    @Mock private FormateurRepository formateurRepository;
    @Mock private EtudiantConsultationService etudiantConsultation;
    @Mock private EtudiantPlanningService etudiantPlanning;
    @Mock private EtudiantInscriptionService etudiantInscription;
    @Mock private EtudiantCatalogueService etudiantCatalogue;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private UserNotificationService notifications;

    private MockMvc formateurMvc;
    private MockMvc etudiantMvc;
    private final UsernamePasswordAuthenticationToken formateurAuth =
            new UsernamePasswordAuthenticationToken(FORMATEUR_EMAIL, null);
    private final UsernamePasswordAuthenticationToken etudiantAuth =
            new UsernamePasswordAuthenticationToken(ETUDIANT_EMAIL, null);

    @BeforeEach
    void setUp() {
        Formateur formateur = new Formateur();
        formateur.setId(7L);
        lenient().when(formateurRepository.findByEmail(FORMATEUR_EMAIL)).thenReturn(Optional.of(formateur));
        Etudiant etudiant = new Etudiant();
        etudiant.setId(1L);
        lenient().when(etudiantRepository.findByEmail(ETUDIANT_EMAIL)).thenReturn(Optional.of(etudiant));

        formateurMvc = MockMvcBuilders
                .standaloneSetup(new FormateurApiController(formateurConsultation, formateurEvaluation,
                        formateurPlanning, notifications, formateurRepository))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
        etudiantMvc = MockMvcBuilders
                .standaloneSetup(new EtudiantApiController(etudiantConsultation, etudiantPlanning,
                        etudiantInscription, etudiantCatalogue, notifications, etudiantRepository))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    // ---------- erreurs de propriété : JSON {status, error, message} ----------

    @Test
    void groupeDunAutreFormateur_403_json_francais() throws Exception {
        when(formateurConsultation.getEtudiantsByGroupe(7L, 3L))
                .thenThrow(new ForbiddenException("Ce groupe ne fait pas partie de vos groupes."));

        formateurMvc.perform(get("/api/formateur/groupes/3/etudiants").principal(formateurAuth))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Ce groupe ne fait pas partie de vos groupes."));
    }

    @Test
    void groupeInconnu_404_json() throws Exception {
        when(formateurConsultation.getEtudiantsByGroupe(7L, 99L)).thenThrow(new NotFoundException("Groupe introuvable."));

        formateurMvc.perform(get("/api/formateur/groupes/99/etudiants").principal(formateurAuth))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Groupe introuvable."));
    }

    @Test
    void modificationDeLaNoteDunAutreFormateur_403() throws Exception {
        when(formateurEvaluation.modifierNote(any(), any(), any()))
                .thenThrow(new ForbiddenException("Vous ne pouvez modifier que les notes que vous avez saisies."));

        formateurMvc.perform(put("/api/formateur/notes/5").principal(formateurAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"valeur\": 14, \"session\": \"Principale\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Vous ne pouvez modifier que les notes que vous avez saisies."));
    }

    @Test
    void noteHorsBornes_400_avecMessageDeChampEnFrancais() throws Exception {
        formateurMvc.perform(post("/api/formateur/notes").principal(formateurAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"etudiantId\": 1, \"coursId\": 10, \"valeur\": 25, \"session\": \"Principale\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La note doit être comprise entre 0 et 20."))
                .andExpect(jsonPath("$.errors.valeur").value("La note doit être comprise entre 0 et 20."));
    }

    @Test
    void corpsIllisible_400() throws Exception {
        formateurMvc.perform(post("/api/formateur/notes").principal(formateurAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("pas du json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void annulationDeLInscriptionDunAutreEtudiant_403() throws Exception {
        when(etudiantInscription.annuler(1L, 5L))
                .thenThrow(new ForbiddenException("Vous ne pouvez annuler que vos propres inscriptions."));

        etudiantMvc.perform(delete("/api/etudiant/inscriptions/5").principal(etudiantAuth))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Vous ne pouvez annuler que vos propres inscriptions."));
    }

    @Test
    void inscriptionAUnCoursInexistant_404() throws Exception {
        when(etudiantInscription.inscrire(1L, 999L)).thenThrow(new NotFoundException("Cours introuvable."));

        etudiantMvc.perform(post("/api/etudiant/inscriptions").principal(etudiantAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"coursId\": 999}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Cours introuvable."));
    }

    @Test
    void inscriptionSansCours_400_francais() throws Exception {
        etudiantMvc.perform(post("/api/etudiant/inscriptions").principal(etudiantAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Le cours est obligatoire."));
    }

    @Test
    void doubleInscription_409() throws Exception {
        when(etudiantInscription.inscrire(1L, 10L)).thenThrow(new ConflictException("Vous êtes déjà inscrit à ce cours."));

        etudiantMvc.perform(post("/api/etudiant/inscriptions").principal(etudiantAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"coursId\": 10}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Vous êtes déjà inscrit à ce cours."));
    }

    @Test
    void motDePasseProfilTropCourt_400() throws Exception {
        etudiantMvc.perform(put("/api/etudiant/profile").principal(etudiantAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Ben Youssef\", \"password\": \"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").value("Le mot de passe doit contenir entre 6 et 100 caractères."));
    }

    // ---------- notifications : formateur ----------

    @Test
    void formateur_listeSesNotifications_contratJson() throws Exception {
        when(notifications.lister(7L)).thenReturn(List.of(new NotificationResponse(
                4L, "Séance modifiée", "Changement de salle", LocalDateTime.of(2026, 10, 15, 10, 30), "SYSTEM", "ENVOYE", false)));

        formateurMvc.perform(get("/api/formateur/notifications").principal(formateurAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(4))
                .andExpect(jsonPath("$[0].sujet").value("Séance modifiée"))
                .andExpect(jsonPath("$[0].message").value("Changement de salle"))
                .andExpect(jsonPath("$[0].type").value("SYSTEM"))
                .andExpect(jsonPath("$[0].statut").value("ENVOYE"))
                .andExpect(jsonPath("$[0].lu").value(false))
                .andExpect(jsonPath("$[0].dateEnvoi").exists())
                .andExpect(jsonPath("$[0].user").doesNotExist());
        verify(notifications).lister(7L);
    }

    @Test
    void formateur_compteurDeNonLues() throws Exception {
        when(notifications.compterNonLues(7L)).thenReturn(2L);

        formateurMvc.perform(get("/api/formateur/notifications/unread-count").principal(formateurAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void formateur_marquerLue_utiliseLIdentifiantDuJeton() throws Exception {
        when(notifications.marquerLue(7L, 4L)).thenReturn(new NotificationResponse(
                4L, "Séance modifiée", "Changement de salle", LocalDateTime.of(2026, 10, 15, 10, 30), "SYSTEM", "ENVOYE", true));

        formateurMvc.perform(patch("/api/formateur/notifications/4/lu").principal(formateurAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(4))
                .andExpect(jsonPath("$.lu").value(true));
        verify(notifications).marquerLue(7L, 4L);
    }

    @Test
    void formateur_marquerLueLaNotificationDUnAutre_404() throws Exception {
        when(notifications.marquerLue(7L, 50L)).thenThrow(new NotFoundException("Notification introuvable."));

        formateurMvc.perform(patch("/api/formateur/notifications/50/lu").principal(formateurAuth))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Notification introuvable."));
    }

    @Test
    void formateur_toutMarquerCommeLu() throws Exception {
        when(notifications.marquerToutesLues(7L)).thenReturn(3);

        formateurMvc.perform(patch("/api/formateur/notifications/lu-tout").principal(formateurAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marquees").value(3));
        verify(notifications).marquerToutesLues(7L);
    }

    // ---------- notifications : étudiant ----------

    @Test
    void etudiant_notifications_memeContrat() throws Exception {
        when(notifications.lister(1L)).thenReturn(List.of(new NotificationResponse(
                9L, "Nouvelle note disponible", "Une note a été publiée.", LocalDateTime.of(2026, 10, 14, 9, 0), "SYSTEM", "ENVOYE", false)));
        when(notifications.compterNonLues(1L)).thenReturn(1L);
        when(notifications.marquerToutesLues(1L)).thenReturn(1);

        etudiantMvc.perform(get("/api/etudiant/notifications").principal(etudiantAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sujet").value("Nouvelle note disponible"))
                .andExpect(jsonPath("$[0].lu").value(false));
        etudiantMvc.perform(get("/api/etudiant/notifications/unread-count").principal(etudiantAuth))
                .andExpect(jsonPath("$.count").value(1));
        etudiantMvc.perform(patch("/api/etudiant/notifications/lu-tout").principal(etudiantAuth))
                .andExpect(jsonPath("$.marquees").value(1));
        verify(notifications).lister(1L);
    }
}
