package security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /** Origines autorisées pour CORS, séparées par des virgules (variable d'environnement CORS_ORIGINS). */
    @Value("${CORS_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}")
    private String corsOrigins;

    private static final RequestMatcher API_REQUESTS = request -> request.getRequestURI().startsWith("/api/");
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                // CSRF actif pour l'administration web (session + formulaires Thymeleaf, jeton ajouté par th:action).
                // L'API REST /api/** est sans état et authentifiée par l'en-tête Authorization : pas de cookie à protéger.
                .ignoringRequestMatchers("/api/**")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/error", "/public/**", "/api/auth/**", "/api/public/**").permitAll()
                // Endpoints API REST
                .requestMatchers("/api/formateur/**").hasRole("FORMATEUR")
                .requestMatchers("/api/etudiant/**").hasRole("ETUDIANT")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Endpoints Web MVC
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/formateur/**").hasRole("FORMATEUR")
                .requestMatchers("/etudiant/**").hasRole("ETUDIANT")
                .anyRequest().authenticated()
            )
            // Session management: permettre les sessions pour le web, mais pas pour l'API
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            // /api/** : 401 / 403 en JSON français (le web garde la redirection vers /login)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint())
                .accessDeniedHandler(accessDeniedHandler())
            )
            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            // Authentification HTTP Basic pour les API REST (Thunder Client, Postman, etc.)
            .httpBasic(basic -> basic.realmName("Formation API"))
            .formLogin(form -> form
                .loginPage("/login")
                .successHandler(authenticationSuccessHandler())
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Liste explicite : un joker est incompatible avec l'envoi de credentials et n'est jamais accepté ici.
        List<String> origins = Arrays.stream(corsOrigins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .filter(o -> {
                    boolean joker = o.contains("*");
                    if (joker) {
                        log.warn("CORS_ORIGINS : l'origine '{}' est ignorée (les jokers ne sont pas autorisés).", o);
                    }
                    return !joker;
                })
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        // Durée de cache pour les requêtes preflight
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /** 401 JSON pour une requête /api/** sans jeton valide ; redirection vers /login pour les pages web. */
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        AuthenticationEntryPoint webEntryPoint = new LoginUrlAuthenticationEntryPoint("/login");
        return (request, response, authException) -> {
            if (API_REQUESTS.matches(request)) {
                writeJsonError(response, HttpStatus.UNAUTHORIZED, "Authentification requise : veuillez vous connecter.");
            } else {
                webEntryPoint.commence(request, response, authException);
            }
        };
    }

    /** 403 JSON pour /api/** ; comportement habituel (page 403) pour le reste. */
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        AccessDeniedHandlerImpl webHandler = new AccessDeniedHandlerImpl();
        return (request, response, accessDeniedException) -> {
            if (API_REQUESTS.matches(request)) {
                writeJsonError(response, HttpStatus.FORBIDDEN, "Accès refusé : vous n'avez pas les droits nécessaires.");
            } else {
                webHandler.handle(request, response, accessDeniedException);
            }
        };
    }

    private static void writeJsonError(jakarta.servlet.http.HttpServletResponse response, HttpStatus status, String message)
            throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String escaped = message.replace("\\", "\\\\").replace("\"", "\\\"");
        response.getWriter().write("{\"status\":" + status.value()
                + ",\"error\":\"" + status.getReasonPhrase()
                + "\",\"message\":\"" + escaped + "\"}");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return (request, response, authentication) -> {
            for (var authority : authentication.getAuthorities()) {
                try {
                    if (authority.getAuthority().equals("ROLE_ADMIN")) {
                        response.sendRedirect("/admin/dashboard");
                        return;
                    } else if (authority.getAuthority().equals("ROLE_FORMATEUR")) {
                        response.sendRedirect("/formateur/dashboard");
                        return;
                    } else if (authority.getAuthority().equals("ROLE_ETUDIANT")) {
                        response.sendRedirect("/etudiant/dashboard");
                        return;
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        };
    }
}
