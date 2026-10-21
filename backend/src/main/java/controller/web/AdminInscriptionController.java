package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminInscriptionService;
import service.admin.AdminPedagogieService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/inscriptions")
public class AdminInscriptionController {
    private final AdminInscriptionService adminInscriptionService;
    private final AdminPedagogieService adminPedagogieService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("inscriptions", adminInscriptionService.listInscriptions());
        return "admin/inscriptions/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("inscription", new entity.Inscription());
        model.addAttribute("etudiants", adminPedagogieService.listEtudiants());
        model.addAttribute("coursList", adminPedagogieService.listCours());
        return "admin/inscriptions/add";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute entity.Inscription inscription) {
        adminInscriptionService.addInscription(inscription);
        return "redirect:/admin/inscriptions";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        entity.Inscription inscription = adminInscriptionService.getInscription(id);
        model.addAttribute("inscription", inscription);
        
        // Récupérer les groupes liés au cours de l'inscription
        if (inscription.getCours() != null) {
            model.addAttribute("groupes", adminPedagogieService.getGroupesByCours(inscription.getCours().getId()));
        }
        
        return "admin/inscriptions/edit";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable Long id, @ModelAttribute entity.Inscription inscription, @RequestParam(required = false) Long groupeId) {
        adminInscriptionService.updateInscriptionStatut(id, inscription.getStatut());
        
        // Si un groupe est sélectionné et le statut est INSCRIT, affecter l'étudiant au groupe
        if (groupeId != null && inscription.getStatut() == entity.Inscription.Statut.INSCRIT) {
            adminInscriptionService.affecterEtudiantAGroupe(id, groupeId);
        }
        
        return "redirect:/admin/inscriptions";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        adminInscriptionService.deleteInscription(id);
        return "redirect:/admin/inscriptions";
    }
}
