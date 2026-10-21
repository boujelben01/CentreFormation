package dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/** Corps JSON de toutes les erreurs de l'API. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        int status,
        String error,
        String message,
        LocalDateTime timestamp,
        Map<String, String> errors
) {
}
