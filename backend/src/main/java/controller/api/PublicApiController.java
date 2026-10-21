package controller.api;

import dto.ContactRequest;
import dto.MessageResponse;
import dto.PublicCoursResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import service.publique.ContactService;
import service.publique.PublicCoursService;

import java.util.List;
import java.util.Map;

/** Endpoints publics (sans authentification) du site vitrine. */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicApiController {

    private final PublicCoursService coursService;
    private final ContactService contactService;

    /** Sonde de santé (Render) : ne touche pas à la base pour ne pas réveiller Neon. */
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/cours")
    public List<PublicCoursResponse> cours() {
        return coursService.lister();
    }

    @GetMapping("/cours/{id}")
    public PublicCoursResponse cours(@PathVariable Long id) {
        return coursService.trouver(id);
    }

    @PostMapping("/contact")
    public MessageResponse contact(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
        contactService.envoyer(request, http.getRemoteAddr());
        return new MessageResponse("Votre message a bien été envoyé. Nous vous répondrons rapidement.");
    }
}
