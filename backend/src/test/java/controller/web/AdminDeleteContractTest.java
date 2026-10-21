package controller.web;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.io.IOException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Garde-fou : une suppression ne doit JAMAIS être déclenchée par un GET (liens, préchargement, CSRF).
 * Toute suppression de l'administration est un POST, appelé depuis un formulaire Thymeleaf (th:action : jeton CSRF).
 */
class AdminDeleteContractTest {

    private static final List<Class<?>> CONTROLLERS = List.of(
            AdminAffectationController.class, AdminDashboardController.class, AdminEtudiantController.class,
            AdminEvaluationController.class, AdminFormateurController.class, AdminInscriptionController.class,
            AdminNotificationController.class, AdminPedagogieController.class, AdminRoleController.class,
            AdminUserController.class, LoginController.class);

    @Test
    void aucuneSuppression_n_est_accessible_en_GET() {
        List<String> fautifs = new ArrayList<>();
        for (Class<?> controller : CONTROLLERS) {
            for (Method method : controller.getDeclaredMethods()) {
                GetMapping get = method.getAnnotation(GetMapping.class);
                if (get == null) continue;
                String[] paths = get.value().length > 0 ? get.value() : get.path();
                for (String path : paths) {
                    if (path.toLowerCase().contains("delete") || path.toLowerCase().contains("supprim")) {
                        fautifs.add(controller.getSimpleName() + "." + method.getName() + " -> GET " + path);
                    }
                }
            }
        }
        assertThat(fautifs).as("suppressions encore en GET").isEmpty();
    }

    @Test
    void les_treize_suppressions_de_l_administration_sont_en_POST() {
        long suppressions = CONTROLLERS.stream()
                .flatMap(c -> Arrays.stream(c.getDeclaredMethods()))
                .map(m -> m.getAnnotation(PostMapping.class))
                .filter(post -> post != null && Arrays.stream(post.value()).anyMatch(p -> p.contains("delete/{id}")))
                .count();
        assertThat(suppressions).isEqualTo(13);
    }

    @Test
    void les_controleurs_web_sont_bien_declares_dans_le_garde_fou() throws IOException {
        // Si un nouveau contrôleur Thymeleaf est ajouté, il doit être ajouté à CONTROLLERS ci-dessus.
        Path dir = Path.of("src/main/java/controller/web");
        try (Stream<Path> files = Files.list(dir)) {
            long declares = files.filter(f -> f.getFileName().toString().endsWith("Controller.java")).count();
            assertThat(declares).isEqualTo(CONTROLLERS.size());
        }
    }

    @Test
    void les_gabarits_n_ont_plus_aucun_lien_de_suppression_et_utilisent_des_formulaires_POST() throws IOException {
        Pattern lienGet = Pattern.compile("<a\\b[^>]*delete/", Pattern.CASE_INSENSITIVE);
        Pattern formulaire = Pattern.compile("<form\\b[^>]*delete/[^>]*>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        List<String> liensGet = new ArrayList<>();
        List<String> formulairesSansThAction = new ArrayList<>();
        int formulairesSuppression = 0;

        try (Stream<Path> files = Files.walk(Path.of("src/main/resources/templates"))) {
            for (Path file : (Iterable<Path>) files.filter(f -> f.toString().endsWith(".html"))::iterator) {
                String html = Files.readString(file);
                if (lienGet.matcher(html).find()) liensGet.add(file.toString());
                var m = formulaire.matcher(html);
                while (m.find()) {
                    formulairesSuppression++;
                    String tag = m.group();
                    // th:action ajoute automatiquement le jeton CSRF ; method="post" est obligatoire.
                    if (!tag.contains("th:action") || !tag.toLowerCase().contains("method=\"post\"")) {
                        formulairesSansThAction.add(file + " : " + tag);
                    }
                }
            }
        }

        assertThat(liensGet).as("liens <a> vers /delete/").isEmpty();
        assertThat(formulairesSansThAction).as("formulaires de suppression sans th:action ou sans POST").isEmpty();
        assertThat(formulairesSuppression).isGreaterThanOrEqualTo(13);
    }
}
