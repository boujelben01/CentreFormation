package controller.web;

import entity.Cours;
import entity.Salle;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import security.JwtUtil;
import security.SecurityConfig;
import security.UserDetailsServiceImpl;
import service.admin.AdminPedagogieService;
import testsupport.PassThroughJwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.flash;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;

/** Contrôle serveur minimal : volume horaire ≥ 1 (cours) et capacité ≥ 1 (salles) ; liaison des formulaires d'édition. */
@WebMvcTest(controllers = AdminPedagogieController.class)
@ContextConfiguration(classes = {AdminPedagogieController.class, SecurityConfig.class, PassThroughJwt.class})
@Import(SecurityConfig.class)
class AdminEditValidationTest {

    private static final String MSG_VOLUME = "Le volume horaire est obligatoire et doit être un nombre entier supérieur ou égal à 1.";
    private static final String MSG_CAPACITE = "La capacité est obligatoire et doit être un nombre entier supérieur ou égal à 1.";

    @Autowired private MockMvc mvc;
    @MockitoBean private AdminPedagogieService service;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private UserDetailsServiceImpl userDetailsService;

    // ---------------------------------------------------------------- Cours
    @Test
    @WithMockUser(roles = "ADMIN")
    void ajout_cours_volume_zero_est_refuse_avec_message_flash() throws Exception {
        mvc.perform(post("/admin/pedagogie/cours/add").with(csrf())
                        .param("code", "C1").param("titre", "T").param("description", "D").param("volumeHoraire", "0"))
                .andExpect(redirectedUrl("/admin/pedagogie/cours/add"))
                .andExpect(flash().attribute("error", MSG_VOLUME));
        verify(service, never()).addCours(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ajout_cours_volume_vide_ou_non_numerique_est_refuse() throws Exception {
        for (String valeur : new String[]{"", "abc", "-3"}) {
            mvc.perform(post("/admin/pedagogie/cours/add").with(csrf())
                            .param("code", "C1").param("titre", "T").param("description", "D").param("volumeHoraire", valeur))
                    .andExpect(redirectedUrl("/admin/pedagogie/cours/add"))
                    .andExpect(flash().attribute("error", MSG_VOLUME));
        }
        verify(service, never()).addCours(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ajout_cours_valide_est_enregistre_et_redirige_comme_avant() throws Exception {
        Cours saved = new Cours();
        saved.setId(12L);
        when(service.addCours(any())).thenReturn(saved);
        mvc.perform(post("/admin/pedagogie/cours/add").with(csrf())
                        .param("code", "C1").param("titre", "T").param("description", "D").param("volumeHoraire", "30").param("groupeId", "4"))
                .andExpect(redirectedUrl("/admin/pedagogie/cours"));
        ArgumentCaptor<Cours> cap = ArgumentCaptor.forClass(Cours.class);
        verify(service).addCours(cap.capture());
        assertThat(cap.getValue().getVolumeHoraire()).isEqualTo(30);
        verify(service).affecterCoursAGroupe(12L, 4L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void edition_cours_volume_zero_est_refusee_et_redirige_vers_l_edition() throws Exception {
        mvc.perform(post("/admin/pedagogie/cours/edit/7").with(csrf())
                        .param("code", "C1").param("titre", "T").param("description", "D").param("volumeHoraire", "0"))
                .andExpect(redirectedUrl("/admin/pedagogie/cours/edit/7"))
                .andExpect(flash().attribute("error", MSG_VOLUME));
        verify(service, never()).updateCours(any(), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void edition_cours_valide_appelle_la_mise_a_jour_sans_perte_et_formateur_vide_est_transmis_sans_id() throws Exception {
        mvc.perform(post("/admin/pedagogie/cours/edit/7").with(csrf())
                        .param("code", "C1").param("titre", "T").param("description", "D").param("volumeHoraire", "24").param("formateur.id", ""))
                .andExpect(redirectedUrl("/admin/pedagogie/cours"));
        ArgumentCaptor<Cours> cap = ArgumentCaptor.forClass(Cours.class);
        verify(service).updateCours(org.mockito.ArgumentMatchers.eq(7L), cap.capture());
        assertThat(cap.getValue().getVolumeHoraire()).isEqualTo(24);
        assertThat(cap.getValue().getFormateur() == null || cap.getValue().getFormateur().getId() == null).isTrue();
    }

    // ---------------------------------------------------------------- Salles
    @Test
    @WithMockUser(roles = "ADMIN")
    void ajout_salle_capacite_zero_ou_vide_est_refuse() throws Exception {
        for (String valeur : new String[]{"0", "", "x"}) {
            mvc.perform(post("/admin/pedagogie/salles/add").with(csrf()).param("nom", "A1").param("capacite", valeur))
                    .andExpect(redirectedUrl("/admin/pedagogie/salles/add"))
                    .andExpect(flash().attribute("error", MSG_CAPACITE));
        }
        verify(service, never()).addSalle(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ajout_salle_valide_est_enregistre() throws Exception {
        mvc.perform(post("/admin/pedagogie/salles/add").with(csrf()).param("nom", "A1").param("capacite", "25"))
                .andExpect(redirectedUrl("/admin/pedagogie/salles"));
        ArgumentCaptor<Salle> cap = ArgumentCaptor.forClass(Salle.class);
        verify(service).addSalle(cap.capture());
        assertThat(cap.getValue().getCapacite()).isEqualTo(25);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void edition_salle_capacite_zero_est_refusee_valide_est_mise_a_jour() throws Exception {
        mvc.perform(post("/admin/pedagogie/salles/edit/3").with(csrf()).param("nom", "A1").param("capacite", "0"))
                .andExpect(redirectedUrl("/admin/pedagogie/salles/edit/3"))
                .andExpect(flash().attribute("error", MSG_CAPACITE));
        verify(service, never()).updateSalle(any(), any());

        mvc.perform(post("/admin/pedagogie/salles/edit/3").with(csrf()).param("nom", "A1").param("capacite", "40"))
                .andExpect(redirectedUrl("/admin/pedagogie/salles"));
        verify(service).updateSalle(org.mockito.ArgumentMatchers.eq(3L), any());
    }

    // ---------------------------------------------------------------- Groupes : liaison du formulaire d'édition
    @Test
    @WithMockUser(roles = "ADMIN")
    void edition_groupe_transmet_uniquement_nom_session_et_formateur() throws Exception {
        mvc.perform(post("/admin/pedagogie/groupes/edit/5").with(csrf())
                        .param("nom", "G1").param("sessionPedagogique.id", "2").param("formateur.id", ""))
                .andExpect(redirectedUrl("/admin/pedagogie/groupes"));
        ArgumentCaptor<entity.Groupe> cap = ArgumentCaptor.forClass(entity.Groupe.class);
        verify(service).updateGroupe(org.mockito.ArgumentMatchers.eq(5L), cap.capture());
        entity.Groupe form = cap.getValue();
        assertThat(form.getNom()).isEqualTo("G1");
        assertThat(form.getSessionPedagogique().getId()).isEqualTo(2L);
        assertThat(form.getSpecialite()).isNull();
        assertThat(form.getCours()).isNull();
    }
}
