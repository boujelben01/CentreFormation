package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminEtudiantService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/etudiants")
public class AdminEtudiantController {
    private final AdminEtudiantService adminEtudiantService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("etudiants", adminEtudiantService.listEtudiants());
        return "admin/etudiants/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("etudiant", new entity.Etudiant());
        model.addAttribute("groupes", adminEtudiantService.listGroupes());
        return "admin/etudiants/add";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute("etudiant") entity.Etudiant etudiant) {
        adminEtudiantService.addEtudiant(etudiant);
        return "redirect:/admin/etudiants";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("etudiant", adminEtudiantService.getEtudiantById(id));
        model.addAttribute("groupes", adminEtudiantService.listGroupes());
        return "admin/etudiants/edit";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable Long id, @ModelAttribute("etudiant") entity.Etudiant etudiant) {
        adminEtudiantService.updateEtudiant(id, etudiant);
        return "redirect:/admin/etudiants";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        adminEtudiantService.deleteEtudiant(id);
        return "redirect:/admin/etudiants";
    }
}
