package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import service.admin.AdminConsultationService;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminConsultationService adminConsultationService;

    @GetMapping("/admin/dashboard")
    public String dashboard(Model model) {
        try {
            // Compteurs simples
            model.addAttribute("userCount", adminConsultationService.countUsers());
            model.addAttribute("etudiantCount", adminConsultationService.countEtudiants());
            model.addAttribute("formateurCount", adminConsultationService.countFormateurs());
            model.addAttribute("coursCount", adminConsultationService.countCours());
            model.addAttribute("groupeCount", adminConsultationService.countGroupes());
            model.addAttribute("noteCount", adminConsultationService.countNotes());
            model.addAttribute("inscriptionCount", adminConsultationService.countInscriptions());
            model.addAttribute("seanceCount", adminConsultationService.countSeances());
            model.addAttribute("salleCount", adminConsultationService.countSalles());
            model.addAttribute("specialiteCount", adminConsultationService.countSpecialites());

            // 8 Graphiques pour le dashboard
            // 1. Étudiants par Spécialité (Doughnut)
            model.addAttribute("etudiantsParSpecialite", adminConsultationService.getEtudiantsParSpecialite());
            
            // 2. Étudiants par Groupe (Bar horizontal)
            model.addAttribute("etudiantsParGroupe", adminConsultationService.getEtudiantsParGroupe());
            
            // 3. Formateurs par Spécialité (Pie)
            model.addAttribute("formateursParSpecialite", adminConsultationService.getFormateursParSpecialite());
            
            // 4. Inscriptions par Cours (Bar)
            model.addAttribute("inscriptionsParCours", adminConsultationService.getInscriptionsParCours());
            
            // 5. Charge Horaire Formateur (Bar horizontal)
            model.addAttribute("chargeHoraireFormateur", adminConsultationService.getChargeHoraireFormateur());
            
            // 6. Distribution des Notes (Bar coloré)
            model.addAttribute("distributionNotes", adminConsultationService.getDistributionNotes());
            
            // 7. Moyenne par Groupe (Bar)
            model.addAttribute("moyenneParGroupe", adminConsultationService.getMoyenneParGroupe());
            
            // 8. Taux de Réussite par Cours (Bar horizontal)
            model.addAttribute("tauxReussiteParCours", adminConsultationService.getTauxReussiteParCours());

        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return "admin/dashboard";
    }
}
