package exception;

import org.springframework.http.HttpStatus;

/**
 * Erreur métier renvoyée au client en JSON ({status, error, message, timestamp}).
 * Les messages sont destinés à l'utilisateur final : ils sont en français.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
