package security;

import controller.api.PublicApiController;
import jakarta.servlet.DispatcherType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.autoconfigure.error.DefaultErrorViewResolver;
import org.springframework.boot.webmvc.autoconfigure.error.ErrorViewResolver;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import service.publique.ContactService;
import service.publique.PublicCoursService;
import testsupport.PassThroughJwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * /error est ouvert sans session (SecurityConfig) pour que les pages d'erreur du projet (templates/error/404.html, 500.html,
 * error.html) s'affichent aussi aux visiteurs non connectés ; le reste reste protégé et aucun détail technique n'est exposé.
 * Chaîne de sécurité réelle ; la résolution des vues d'erreur est celle de Spring Boot (DefaultErrorViewResolver).
 */
@WebMvcTest(controllers = PublicApiController.class)
@ContextConfiguration(classes = {PublicApiController.class, SecurityConfig.class, PassThroughJwt.class,
        ErrorPagesSecurityTest.ErrorViews.class})
@Import(SecurityConfig.class)
class ErrorPagesSecurityTest {

    /** Même résolveur que l'application réelle (error/404, error/500, puis repli sur error.html). */
    @TestConfiguration
    static class ErrorViews {
        @Bean
        ErrorViewResolver errorViewResolver(ApplicationContext context) {
            return new DefaultErrorViewResolver(context, new WebProperties.Resources());
        }
    }

    private static final String SECRET = "MESSAGE-TECHNIQUE-SECRET";

    @Autowired private MockMvc mvc;
    @MockitoBean private PublicCoursService coursService;
    @MockitoBean private ContactService contactService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private UserDetailsServiceImpl userDetailsService;

    private static MockHttpServletRequestBuilder erreur(MockHttpServletRequestBuilder rb, Integer code) {
        rb.with(r -> { r.setDispatcherType(DispatcherType.ERROR); return r; });
        if (code != null) {
            rb.requestAttr("jakarta.servlet.error.status_code", code);
            rb.requestAttr("jakarta.servlet.error.request_uri", "/admin/inconnu");
            rb.requestAttr("jakarta.servlet.error.message", SECRET);
            rb.requestAttr("jakarta.servlet.error.exception", new IllegalStateException(SECRET));
        }
        return rb;
    }

    private String html(MvcResult r) throws Exception { return r.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8); }

    private void assertSansDetailTechnique(String corps) {
        assertThat(corps).doesNotContain(SECRET).doesNotContainIgnoringCase("stacktrace").doesNotContain("IllegalStateException")
                .doesNotContain("at java.").doesNotContain("/admin/inconnu").doesNotContain("Whitelabel");
    }

    // ---------------------------------------------------------------- /error sans session
    @Test
    void error_404_sans_session_affiche_la_page_404_du_projet_sans_redirection() throws Exception {
        MvcResult r = mvc.perform(erreur(get("/error").accept(MediaType.TEXT_HTML), 404)).andExpect(status().isNotFound()).andReturn();
        assertThat(r.getResponse().getRedirectedUrl()).isNull();
        assertThat(html(r)).contains("Page introuvable").contains("Retour au tableau de bord").contains("Page de connexion");
        assertSansDetailTechnique(html(r));
    }

    @Test
    void error_500_sans_session_affiche_la_page_500_du_projet() throws Exception {
        MvcResult r = mvc.perform(erreur(get("/error").accept(MediaType.TEXT_HTML), 500)).andExpect(status().isInternalServerError()).andReturn();
        assertThat(html(r)).contains("Une erreur est survenue").contains("Retour au tableau de bord");
        assertSansDetailTechnique(html(r));
    }

    @Test
    void error_403_et_400_utilisent_le_repli_error_html() throws Exception {
        MvcResult r403 = mvc.perform(erreur(get("/error").accept(MediaType.TEXT_HTML), 403)).andExpect(status().isForbidden()).andReturn();
        assertThat(html(r403)).contains("Accès refusé");
        assertSansDetailTechnique(html(r403));
        MvcResult r400 = mvc.perform(erreur(get("/error").accept(MediaType.TEXT_HTML), 400)).andExpect(status().isBadRequest()).andReturn();
        assertThat(html(r400)).contains("Requête invalide");
        assertSansDetailTechnique(html(r400));
    }

    @Test
    void error_appele_directement_sans_session_n_est_pas_redirige_vers_la_connexion() throws Exception {
        MvcResult r = mvc.perform(get("/error").accept(MediaType.TEXT_HTML)).andReturn();
        assertThat(r.getResponse().getStatus()).isNotEqualTo(302);
        assertThat(r.getResponse().getRedirectedUrl()).isNull();
        assertThat(html(r)).contains("Une erreur est survenue");
        assertSansDetailTechnique(html(r));
    }

    @Test
    void error_en_post_apres_une_erreur_n_exige_ni_session_ni_csrf() throws Exception {
        // ERROR dispatch d'une requête POST d'origine (par ex. un POST de l'API publique en erreur)
        MvcResult r = mvc.perform(erreur(post("/error").accept(MediaType.TEXT_HTML), 500)).andExpect(status().isInternalServerError()).andReturn();
        assertThat(html(r)).contains("Une erreur est survenue");
    }

    // ---------------------------------------------------------------- JSON : l'API reste en JSON
    @Test
    void error_pour_un_client_api_reste_du_json_sans_detail_technique() throws Exception {
        for (MockHttpServletRequestBuilder rb : new MockHttpServletRequestBuilder[]{
                erreur(get("/error").accept(MediaType.APPLICATION_JSON), 500), erreur(get("/error"), 500)}) {
            MvcResult r = mvc.perform(rb).andExpect(status().isInternalServerError()).andReturn();
            assertThat(r.getResponse().getContentType()).startsWith("application/json");
            assertThat(r.getResponse().getRedirectedUrl()).isNull();
            String corps = html(r);
            assertThat(corps).doesNotContain("<html").doesNotContain(SECRET).doesNotContain("\"trace\"").doesNotContain("\"exception\"")
                    .doesNotContain("\"message\"").doesNotContain("IllegalStateException");
        }
    }

    // ---------------------------------------------------------------- les zones protégées le restent
    @Test
    void zones_web_protegees_redirigent_toujours_vers_la_connexion() throws Exception {
        for (String url : new String[]{"/admin/dashboard", "/admin/inconnu", "/admin/etudiants/edit/1"}) {
            mvc.perform(get(url).accept(MediaType.TEXT_HTML)).andExpect(status().isFound()).andExpect(redirectedUrl("/login"));
        }
    }

    @Test
    void url_web_inconnue_sans_session_reste_redirigee_vers_la_connexion() throws Exception {
        // La règle « anyRequest().authenticated() » s'applique à l'URL demandée AVANT toute page d'erreur : seule /error est ouverte.
        mvc.perform(get("/page-inconnue").accept(MediaType.TEXT_HTML)).andExpect(status().isFound()).andExpect(redirectedUrl("/login"));
    }

    @Test
    void zones_api_protegees_repondent_401_json() throws Exception {
        for (String url : new String[]{"/api/etudiant/cours", "/api/formateur/cours", "/api/admin/utilisateurs", "/api/autre"}) {
            MvcResult r = mvc.perform(get(url)).andExpect(status().isUnauthorized()).andReturn();
            assertThat(r.getResponse().getContentType()).startsWith("application/json");
            assertThat(r.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8)).doesNotContain("<html").doesNotContain("Exception");
        }
    }
}
