package testsupport;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import security.JwtAuthenticationFilter;

import java.io.IOException;

/**
 * Filtre JWT neutre pour les tests @WebMvcTest : seules la chaîne de sécurité et ses règles sont testées.
 * Placé dans un package que le @ComponentScan de l'application ne parcourt pas : l'application
 * déclare ses packages un par un, ce qui remplace le TypeExcludeFilter de @SpringBootApplication
 * (lui seul écarte les @TestConfiguration du scan). Dans un package scanné, ce bean doublerait
 * le vrai jwtAuthenticationFilter dans le contexte complet.
 */
@TestConfiguration
public class PassThroughJwt {

    @Bean
    JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                    throws ServletException, IOException {
                chain.doFilter(request, response);
            }
        };
    }
}
