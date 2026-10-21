package security;

import controller.web.AdminRoleController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import service.admin.AdminRoleService;
import testsupport.PassThroughJwt;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Chaîne de sécurité réelle (SecurityConfig) : CSRF actif pour l'administration web, ignoré pour /api/**,
 * suppressions refusées en GET.
 */
@WebMvcTest(controllers = AdminRoleController.class)
@ContextConfiguration(classes = {AdminRoleController.class, SecurityConfig.class, PassThroughJwt.class})
@Import(SecurityConfig.class)
class AdminCsrfSecurityTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private AdminRoleService roleService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void suppression_en_POST_sans_jeton_csrf_est_refusee() throws Exception {
        mvc.perform(post("/admin/roles/delete/7")).andExpect(status().isForbidden());
        verify(roleService, never()).deleteRole(7L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void suppression_en_POST_avec_jeton_csrf_est_acceptee() throws Exception {
        mvc.perform(post("/admin/roles/delete/7").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/roles"));
        verify(roleService).deleteRole(7L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void suppression_en_GET_n_existe_plus() throws Exception {
        mvc.perform(get("/admin/roles/delete/7")).andExpect(status().isMethodNotAllowed());
        verify(roleService, never()).deleteRole(7L);
    }

    @Test
    @WithMockUser(roles = "ETUDIANT")
    void un_etudiant_ne_peut_pas_supprimer_meme_avec_un_jeton_csrf_valide() throws Exception {
        mvc.perform(post("/admin/roles/delete/7").with(csrf())).andExpect(status().isForbidden());
        verify(roleService, never()).deleteRole(7L);
    }

    @Test
    void sans_authentification_la_suppression_redirige_vers_la_connexion_ou_est_refusee() throws Exception {
        mvc.perform(post("/admin/roles/delete/7").with(csrf())).andExpect(status().is3xxRedirection());
        verify(roleService, never()).deleteRole(7L);
    }

    @Test
    void l_API_reste_exemptee_de_csrf_et_repond_en_json_401_sans_jeton() throws Exception {
        // Aucun contrôleur /api dans cette tranche : un POST authentification-requise renvoie 401 JSON, pas 403 CSRF.
        mvc.perform(post("/api/etudiant/inscriptions").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
