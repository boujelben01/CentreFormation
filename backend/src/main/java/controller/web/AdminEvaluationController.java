package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminEvaluationService;
import service.admin.AdminPedagogieService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/notes")
public class AdminEvaluationController {
    private final AdminEvaluationService adminEvaluationService;
    private final AdminPedagogieService adminPedagogieService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("notes", adminEvaluationService.listNotes());
        return "admin/notes/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("note", new entity.Note());
        model.addAttribute("etudiants", adminPedagogieService.listEtudiants());
        model.addAttribute("coursList", adminPedagogieService.listCours());
        return "admin/notes/add";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute entity.Note note) {
        adminEvaluationService.addNote(note);
        return "redirect:/admin/notes";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        adminEvaluationService.deleteNote(id);
        return "redirect:/admin/notes";
    }
}
