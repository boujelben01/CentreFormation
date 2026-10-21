package service.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Slf4j
@Service
public class EmailService {

    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${resend.from-name}")
    private String fromName;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Envoie un email simple via Resend
     * @param toEmail Adresse email du destinataire
     * @param toName Nom du destinataire
     * @param subject Sujet de l'email
     * @param content Contenu du message (texte ou HTML)
     * @param isHtml true si le contenu est en HTML
     * @return true si l'envoi est réussi
     */
    public boolean sendEmail(String toEmail, String toName, String subject, String content, boolean isHtml) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.error("RESEND_API_KEY non défini : email à {} non envoyé", toEmail);
            return false;
        }

        String to = toName == null || toName.isBlank() ? toEmail : toName + " <" + toEmail + ">";
        String body = "{\"from\":" + jsonString(fromName + " <" + fromEmail + ">")
                + ",\"to\":[" + jsonString(to) + "]"
                + ",\"subject\":" + jsonString(subject)
                + ",\"" + (isHtml ? "html" : "text") + "\":" + jsonString(content) + "}";

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(RESEND_ENDPOINT))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();

            if (statusCode >= 200 && statusCode < 300) {
                log.info("Email envoyé à {} - Status: {}", toEmail, statusCode);
                return true;
            }
            log.error("Échec envoi email - Status: {}, Body: {}", statusCode, response.body());
            return false;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Envoi de l'email à {} interrompu", toEmail, e);
            return false;
        } catch (IOException e) {
            log.error("Erreur lors de l'envoi de l'email à {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    private static String jsonString(String value) {
        StringBuilder sb = new StringBuilder("\"");
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"', 92 -> sb.append((char) 92).append(c);
                case 10 -> sb.append((char) 92).append('n');
                case 13 -> sb.append((char) 92).append('r');
                case 9 -> sb.append((char) 92).append('t');
                default -> {
                    if (c < 0x20) sb.append((char) 92).append(String.format("u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.append('"').toString();
    }

    /**
     * Envoie un email simple (texte)
     */
    public boolean sendSimpleEmail(String toEmail, String toName, String subject, String message) {
        return sendEmail(toEmail, toName, subject, message, false);
    }

    /**
     * Envoie un email HTML
     */
    public boolean sendHtmlEmail(String toEmail, String toName, String subject, String htmlContent) {
        return sendEmail(toEmail, toName, subject, htmlContent, true);
    }

    /**
     * Envoie un email de notification stylisé
     */
    public boolean sendNotificationEmail(String toEmail, String toName, String subject, String message) {
        String htmlTemplate = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; }
                    .content p { color: #333; line-height: 1.6; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .highlight { background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 YIG Formation </h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <div class="highlight">
                            %s
                        </div>
                        <p>Cordialement,<br>L'équipe du Centre de Formation</p>
                    </div>
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
                        <p>© 2026 YIG Formation - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(toName, message);
        
        return sendHtmlEmail(toEmail, toName, subject, htmlTemplate);
    }

    /**
     * Envoie un email de bienvenue à un nouvel étudiant
     */
    public boolean sendWelcomeEmailToStudent(String toEmail, String studentName, String matricule, String groupe) {
        String subject = "🎉 Bienvenue au YIG Formation !";
        String message = """
            <p>Nous sommes ravis de vous accueillir au sein de notre centre de formation !</p>
            <p><strong>Vos informations :</strong></p>
            <ul>
                <li>Matricule : <strong>%s</strong></li>
                <li>Groupe : <strong>%s</strong></li>
            </ul>
            <p>Vous pouvez désormais accéder à votre espace étudiant pour consulter vos cours, notes et inscriptions.</p>
            """.formatted(matricule, groupe);
        
        return sendNotificationEmail(toEmail, studentName, subject, message);
    }

    /**
     * Envoie un email de notification de nouvelle note
     */
    public boolean sendNoteNotification(String toEmail, String studentName, String coursName, double note) {
        String subject = "📝 Nouvelle note disponible";
        String message = """
            <p>Une nouvelle note a été attribuée pour le cours <strong>%s</strong>.</p>
            <p style="font-size: 24px; text-align: center; color: %s;"><strong>%.2f / 20</strong></p>
            <p>Connectez-vous à votre espace pour plus de détails.</p>
            """.formatted(coursName, note >= 10 ? "#28a745" : "#dc3545", note);
        
        return sendNotificationEmail(toEmail, studentName, subject, message);
    }

    /**
     * Envoie un email de notification d'inscription à un cours
     */
    public boolean sendInscriptionNotification(String toEmail, String studentName, String coursName, String formateurName, String groupeName) {
        String subject = "✅ Inscription confirmée";
        String message = """
            <p>Votre inscription au cours <strong>%s</strong> a été confirmée.</p>
            <p><strong>Formateur :</strong> %s</p>
            <p><strong>Groupe affecté :</strong> %s</p>
            <p>Nous vous souhaitons un excellent apprentissage !</p>
            """.formatted(coursName, formateurName, groupeName);
        
        return sendNotificationEmail(toEmail, studentName, subject, message);
    }
}
