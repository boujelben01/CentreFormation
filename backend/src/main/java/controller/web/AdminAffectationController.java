package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminAffectationService;
import service.admin.AdminPedagogieService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/affectations")
public class AdminAffectationController {
    private final AdminAffectationService adminAffectationService;
    private final AdminPedagogieService adminPedagogieService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("groupes", adminPedagogieService.listGroupes());
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        model.addAttribute("cours", adminPedagogieService.listCours());
        return "admin/affectations/list";
    }

    @PostMapping("/groupe")
    public String affecterFormateurGroupe(@RequestParam Long formateurId, @RequestParam Long groupeId) {
        adminAffectationService.affecterFormateurGroupe(formateurId, groupeId);
        return "redirect:/admin/affectations";
    }

    @PostMapping("/cours")
    public String affecterFormateurCours(@RequestParam Long formateurId, @RequestParam Long coursId) {
        adminAffectationService.affecterFormateurCours(formateurId, coursId);
        return "redirect:/admin/affectations";
    }
}
