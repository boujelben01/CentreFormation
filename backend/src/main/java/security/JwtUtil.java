package security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Génération et validation des jetons JWT.
 *
 * <p>Le secret de signature vient de la variable d'environnement {@code JWT_SECRET} (propriété
 * {@code app.jwt.secret}) : il n'est plus écrit dans le code. Au moins 32 caractères sont exigés
 * (64 recommandés). Sans secret :
 * <ul>
 *   <li>profil {@code prod} : l'application refuse de démarrer ;</li>
 *   <li>autres profils (développement) : une clé aléatoire éphémère est générée, avec un avertissement ;
 *       les jetons deviennent invalides à chaque redémarrage.</li>
 * </ul>
 * La durée de validité se règle avec {@code JWT_EXPIRATION_MINUTES} (480 minutes = 8 heures par défaut).
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    static final int MIN_SECRET_LENGTH = 32;
    private static final int EPHEMERAL_SECRET_BYTES = 64;

    private final SecretKey secretKey;
    private final long validityMillis;

    @Autowired
    public JwtUtil(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-minutes:480}") long expirationMinutes,
            Environment environment) {
        this(secret, expirationMinutes, environment.acceptsProfiles(Profiles.of("prod")));
    }

    /** @param production vrai : l'absence de secret est une erreur de démarrage. */
    JwtUtil(String secret, long expirationMinutes, boolean production) {
        if (expirationMinutes < 1 || expirationMinutes > 7 * 24 * 60) {
            throw new IllegalStateException("app.jwt.expiration-minutes doit être compris entre 1 et 10080 (7 jours).");
        }
        this.validityMillis = expirationMinutes * 60 * 1000;

        byte[] keyBytes;
        if (secret == null || secret.isBlank()) {
            if (production) {
                throw new IllegalStateException(
                        "JWT_SECRET n'est pas défini : il est obligatoire en production (au moins " + MIN_SECRET_LENGTH + " caractères).");
            }
            keyBytes = new byte[EPHEMERAL_SECRET_BYTES];
            new SecureRandom().nextBytes(keyBytes);
            log.warn("JWT_SECRET n'est pas défini : une clé éphémère est utilisée (développement uniquement). "
                    + "Les sessions seront invalidées à chaque redémarrage.");
        } else {
            if (secret.length() < MIN_SECRET_LENGTH) {
                throw new IllegalStateException("JWT_SECRET est trop court : au moins " + MIN_SECRET_LENGTH + " caractères sont exigés.");
            }
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // Add roles to claims
        String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        claims.put("roles", roles);

        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + validityMillis);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(secretKey)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
