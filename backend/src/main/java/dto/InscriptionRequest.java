package dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InscriptionRequest {
    @NotNull(message = "Le cours est obligatoire.")
    private Long coursId;
}
