package security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Le secret JWT n'est plus dans le code : il vient de la configuration, avec contrôles de robustesse. */
class JwtUtilTest {

    private static final String SECRET = "un-secret-de-test-assez-long-pour-hs512-0123456789-abcdefghij";

    private UserDetails user(String name) {
        return User.withUsername(name).password("x").authorities(List.of(new SimpleGrantedAuthority("ROLE_ETUDIANT"))).build();
    }

    @Test
    void jetonSigneAvecLeSecretConfigure_estValide_et_porteLeSujet() {
        JwtUtil jwt = new JwtUtil(SECRET, 60, true);
        String token = jwt.generateToken(user("amira@example.com"));

        assertThat(jwt.extractUsername(token)).isEqualTo("amira@example.com");
        assertThat(jwt.validateToken(token, user("amira@example.com"))).isTrue();
        assertThat(jwt.validateToken(token, user("autre@example.com"))).isFalse();
    }

    @Test
    void jetonSigneAvecUnAutreSecret_estRefuse() {
        String token = new JwtUtil(SECRET, 60, true).generateToken(user("amira@example.com"));
        JwtUtil autre = new JwtUtil(SECRET.replace("test", "TEST"), 60, true);

        assertThatThrownBy(() -> autre.extractUsername(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void l_ancien_secret_ecrit_en_dur_ne_permet_plus_de_forger_un_jeton() {
        String ancien = "MySecretKeyForJWTTokenGenerationThatIsLongEnoughForHS512Algorithm";
        String jetonForge = new JwtUtil(ancien, 60, true).generateToken(user("admin"));

        assertThatThrownBy(() -> new JwtUtil(SECRET, 60, true).extractUsername(jetonForge)).isInstanceOf(JwtException.class);
    }

    @Test
    void secretAbsentEnProduction_empecheLeDemarrage() {
        assertThatThrownBy(() -> new JwtUtil("", 60, true))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
        assertThatThrownBy(() -> new JwtUtil(null, 60, true)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void secretAbsentEnDeveloppement_genereUneCleEphemere_differenteDeuxFois() {
        JwtUtil a = new JwtUtil("", 60, false);
        JwtUtil b = new JwtUtil("   ", 60, false);
        String token = a.generateToken(user("amira@example.com"));

        assertThat(a.extractUsername(token)).isEqualTo("amira@example.com");
        assertThatThrownBy(() -> b.extractUsername(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void secretTropCourt_estRefuse_quelQueSoitLeProfil() {
        assertThatThrownBy(() -> new JwtUtil("trop-court", 60, false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("trop court");
        assertThatThrownBy(() -> new JwtUtil("trop-court", 60, true)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void dureeDeValidite_respecteLaConfiguration() {
        JwtUtil jwt = new JwtUtil(SECRET, 30, true);
        String token = jwt.generateToken(user("amira@example.com"));
        long restant = jwt.extractExpiration(token).getTime() - new Date().getTime();

        assertThat(restant).isBetween(29 * 60_000L, 30 * 60_000L + 5_000L);
    }

    @Test
    void dureeDeValidite_hors_bornes_est_refusee() {
        assertThatThrownBy(() -> new JwtUtil(SECRET, 0, true)).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new JwtUtil(SECRET, 10_081, true)).isInstanceOf(IllegalStateException.class);
    }
}
