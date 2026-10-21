package service.publique;

import dto.ContactRequest;
import exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import service.admin.EmailService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    private static final String DESTINATAIRE = "contact@centre.tn";
    private static final String MESSAGE = "Bonjour, je souhaite en savoir plus sur vos formations.";

    @Mock private EmailService emailService;
    @Mock private ContactRateLimiter rateLimiter;

    private ContactRequest requete(String website) {
        return new ContactRequest("Amira Ben Ali", "amira@test.tn", "Renseignements", MESSAGE, website);
    }

    @Test
    void envoie_le_message_au_destinataire_configure() {
        when(rateLimiter.tenter("9.9.9.9")).thenReturn(true);
        when(emailService.sendEmail(eq(DESTINATAIRE), isNull(), eq("[Contact] Renseignements"), any(), eq(false)))
                .thenReturn(true);

        new ContactService(emailService, rateLimiter, DESTINATAIRE).envoyer(requete(null), "9.9.9.9");

        verify(emailService).sendEmail(eq(DESTINATAIRE), isNull(), eq("[Contact] Renseignements"),
                contains("amira@test.tn"), eq(false));
    }

    @Test
    void le_champ_piege_rempli_ne_declenche_aucun_envoi_ni_erreur() {
        new ContactService(emailService, rateLimiter, DESTINATAIRE).envoyer(requete("http://spam.example"), "9.9.9.9");

        verifyNoInteractions(emailService, rateLimiter);
    }

    @Test
    void limite_atteinte_donne_429_sans_envoi() {
        when(rateLimiter.tenter("9.9.9.9")).thenReturn(false);

        assertThatThrownBy(() -> new ContactService(emailService, rateLimiter, DESTINATAIRE)
                .envoyer(requete(null), "9.9.9.9"))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
        verify(emailService, never()).sendEmail(any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void echec_d_envoi_donne_503() {
        when(rateLimiter.tenter("9.9.9.9")).thenReturn(true);
        when(emailService.sendEmail(any(), any(), any(), any(), anyBoolean())).thenReturn(false);

        assertThatThrownBy(() -> new ContactService(emailService, rateLimiter, DESTINATAIRE)
                .envoyer(requete(null), "9.9.9.9"))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }

    @Test
    void destinataire_non_configure_donne_503_sans_appeler_le_fournisseur() {
        when(rateLimiter.tenter("9.9.9.9")).thenReturn(true);

        assertThatThrownBy(() -> new ContactService(emailService, rateLimiter, " ")
                .envoyer(requete(null), "9.9.9.9"))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
        verifyNoInteractions(emailService);
    }
}
