package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminFormateurService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/formateurs")
public class AdminFormateurController {
    private final AdminFormateurService adminFormateurService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("formateurs", adminFormateurService.listFormateurs());
        return "admin/formateurs/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("formateur", new entity.Formateur());
        model.addAttribute("specialites", adminFormateurService.listSpecialites());
        return "admin/formateurs/add";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute("formateur") entity.Formateur formateur) {
        adminFormateurService.addFormateur(formateur);
        return "redirect:/admin/formateurs";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("formateur", adminFormateurService.getFormateurById(id));
        model.addAttribute("specialites", adminFormateurService.listSpecialites());
        return "admin/formateurs/edit";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable Long id, @ModelAttribute("formateur") entity.Formateur formateur) {
        adminFormateurService.updateFormateur(id, formateur);
        return "redirect:/admin/formateurs";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        adminFormateurService.deleteFormateur(id);
        return "redirect:/admin/formateurs";
    }
}
