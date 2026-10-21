package dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteUpdateRequest {
    @NotNull(message = "La note est obligatoire.")
    @DecimalMin(value = "0", message = "La note doit être comprise entre 0 et 20.")
    @DecimalMax(value = "20", message = "La note doit être comprise entre 0 et 20.")
    private Double valeur;

    @Size(max = 50, message = "La session ne doit pas dépasser 50 caractères.")
    private String session;
}
