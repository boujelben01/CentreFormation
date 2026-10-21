package security;

import controller.api.PublicApiController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import service.publique.ContactService;
import service.publique.PublicCoursService;
import testsupport.PassThroughJwt;

import java.util.List;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Chaîne de sécurité réelle (filtre JWT neutre de AdminCsrfSecurityTest) : /api/public/** est ouvert sans jeton ni CSRF, le reste de /api/** reste protégé. */
@WebMvcTest(controllers = PublicApiController.class)
@ContextConfiguration(classes = {PublicApiController.class, SecurityConfig.class, PassThroughJwt.class})
@Import(SecurityConfig.class)
class PublicApiSecurityTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private PublicCoursService coursService;
    @MockitoBean private ContactService contactService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private UserDetailsServiceImpl userDetailsService;

    @Test
    void catalogue_public_accessible_sans_authentification() throws Exception {
        when(coursService.lister()).thenReturn(List.of());
        mvc.perform(get("/api/public/cours")).andExpect(status().isOk());
    }

    @Test
    void contact_public_accessible_sans_authentification_ni_csrf() throws Exception {
        mvc.perform(post("/api/public/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\":\"Amira\",\"email\":\"amira@test.tn\",\"sujet\":\"Info\","
                                + "\"message\":\"Bonjour, je souhaite en savoir plus sur vos formations.\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void health_repond_UP_sans_authentification_et_sans_toucher_aux_services() throws Exception {
        mvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        verifyNoInteractions(coursService, contactService);
    }

    @Test
    void le_reste_de_l_api_exige_toujours_un_jeton() throws Exception {
        mvc.perform(get("/api/etudiant/cours")).andExpect(status().isUnauthorized());
    }
}
