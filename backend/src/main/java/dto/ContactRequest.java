package dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Message du formulaire de contact public. {@code website} est un champ piège (honeypot) :
 * invisible pour un visiteur, il n'est rempli que par des robots.
 */
public record ContactRequest(
        @NotBlank(message = "Le nom est obligatoire.")
        @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères.")
        String nom,

        @NotBlank(message = "L'adresse e-mail est obligatoire.")
        @Email(message = "L'adresse e-mail n'est pas valide.")
        @Size(max = 150, message = "L'adresse e-mail ne doit pas dépasser 150 caractères.")
        String email,

        @NotBlank(message = "Le sujet est obligatoire.")
        @Size(max = 150, message = "Le sujet ne doit pas dépasser 150 caractères.")
        String sujet,

        @NotBlank(message = "Le message est obligatoire.")
        @Size(min = 20, max = 5000, message = "Le message doit contenir entre 20 et 5000 caractères.")
        String message,

        String website
) {
    public ContactRequest {
        nom = trim(nom);
        email = trim(email);
        sujet = trim(sujet);
        message = trim(message);
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
