package dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères.")
    private String nom;

    @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères.")
    private String prenom;

    // Ignoré à la mise à jour : l'e-mail sert d'identifiant de connexion.
    private String email;

    // Optionnel : uniquement si l'utilisateur veut changer son mot de passe (vide = inchangé)
    @Pattern(regexp = "^$|.{6,100}", message = "Le mot de passe doit contenir entre 6 et 100 caractères.")
    private String password;
}
