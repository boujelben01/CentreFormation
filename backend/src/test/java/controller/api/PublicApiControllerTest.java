package controller.api;

import dto.PublicCoursResponse;
import exception.ApiException;
import exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import service.publique.ContactService;
import service.publique.PublicCoursService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PublicApiControllerTest {

    private static final String MESSAGE = "Bonjour, je souhaite en savoir plus sur vos formations.";

    @Mock private PublicCoursService coursService;
    @Mock private ContactService contactService;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new PublicApiController(coursService, contactService))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    private static String contactJson(String nom, String email, String sujet, String message) {
        return "{\"nom\":\"" + nom + "\",\"email\":\"" + email + "\",\"sujet\":\"" + sujet
                + "\",\"message\":\"" + message + "\",\"website\":\"\"}";
    }

    @Test
    void liste_des_cours_ne_contient_aucun_email() throws Exception {
        when(coursService.lister()).thenReturn(List.of(new PublicCoursResponse(
                1L, "JAVA-1", "Java", "Description", 40, "Karim", "Trabelsi", "Informatique")));

        mvc.perform(get("/api/public/cours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].formateurPrenom").value("Karim"))
                .andExpect(jsonPath("$[0].specialite").value("Informatique"))
                .andExpect(jsonPath("$[0].formateurEmail").doesNotExist())
                .andExpect(jsonPath("$[0].email").doesNotExist());
    }

    @Test
    void cours_inconnu_donne_404_json_en_francais() throws Exception {
        when(coursService.trouver(99L)).thenThrow(new NotFoundException("Formation introuvable."));

        mvc.perform(get("/api/public/cours/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Formation introuvable."));
    }

    @Test
    void contact_valide_donne_200() throws Exception {
        mvc.perform(post("/api/public/contact").contentType(MediaType.APPLICATION_JSON)
                        .content(contactJson("Amira", "amira@test.tn", "Info", MESSAGE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        verify(contactService).envoyer(any(), any());
    }

    @Test
    void contact_message_trop_court_donne_400_sans_envoi() throws Exception {
        mvc.perform(post("/api/public/contact").contentType(MediaType.APPLICATION_JSON)
                        .content(contactJson("Amira", "amira@test.tn", "Info", "Trop court")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.message").value("Le message doit contenir entre 20 et 5000 caractères."));
        verify(contactService, never()).envoyer(any(), any());
    }

    @Test
    void contact_email_invalide_et_nom_vide_donnent_400() throws Exception {
        mvc.perform(post("/api/public/contact").contentType(MediaType.APPLICATION_JSON)
                        .content(contactJson("  ", "pas-un-email", "Info", MESSAGE)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nom").value("Le nom est obligatoire."))
                .andExpect(jsonPath("$.errors.email").value("L'adresse e-mail n'est pas valide."));
    }

    @Test
    void contact_limite_atteinte_donne_429_json() throws Exception {
        doThrow(new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Trop de messages envoyés. Veuillez réessayer plus tard."))
                .when(contactService).envoyer(any(), eq("127.0.0.1"));

        mvc.perform(post("/api/public/contact").contentType(MediaType.APPLICATION_JSON)
                        .content(contactJson("Amira", "amira@test.tn", "Info", MESSAGE)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").value("Trop de messages envoyés. Veuillez réessayer plus tard."));
    }

    @Test
    void contact_echec_d_envoi_donne_503_json() throws Exception {
        doThrow(new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "Votre message n'a pas pu être envoyé. Veuillez réessayer plus tard."))
                .when(contactService).envoyer(any(), any());

        mvc.perform(post("/api/public/contact").contentType(MediaType.APPLICATION_JSON)
                        .content(contactJson("Amira", "amira@test.tn", "Info", MESSAGE)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503));
    }
}
