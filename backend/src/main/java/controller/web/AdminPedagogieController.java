package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import service.admin.AdminPedagogieService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/pedagogie")
public class AdminPedagogieController {
        @GetMapping("/sessions")
        public String listSessions(Model model) {
            model.addAttribute("sessions", adminPedagogieService.listSessions());
            return "admin/sessions/list";
        }

        @GetMapping("/sessions/add")
        public String addSessionForm(Model model) {
            model.addAttribute("sessionPedagogique", new entity.SessionPedagogique());
            return "admin/sessions/add";
        }

        @PostMapping("/sessions/add")
        public String addSession(@ModelAttribute("sessionPedagogique") entity.SessionPedagogique session) {
            adminPedagogieService.addSession(session);
            return "redirect:/admin/pedagogie/sessions";
        }

        @GetMapping("/sessions/edit/{id}")
        public String editSessionForm(@PathVariable Long id, Model model) {
            entity.SessionPedagogique session = adminPedagogieService.getSessionById(id);
            model.addAttribute("sessionPedagogique", session);
            return "admin/sessions/edit";
        }

        @PostMapping("/sessions/edit/{id}")
        public String editSession(@PathVariable Long id, @ModelAttribute("sessionPedagogique") entity.SessionPedagogique session) {
            adminPedagogieService.updateSession(id, session);
            return "redirect:/admin/pedagogie/sessions";
        }

        @PostMapping("/sessions/delete/{id}")
        public String deleteSession(@PathVariable Long id) {
            adminPedagogieService.deleteSession(id);
            return "redirect:/admin/pedagogie/sessions";
        }
    private final AdminPedagogieService adminPedagogieService;

    private static final String MSG_VOLUME = "Le volume horaire est obligatoire et doit être un nombre entier supérieur ou égal à 1.";
    private static final String MSG_CAPACITE = "La capacité est obligatoire et doit être un nombre entier supérieur ou égal à 1.";

    /**
     * Contrôle minimal « entier ≥ 1 » : false si le champ est vide / non numérique (erreur de liaison sur ce champ)
     * ou inférieur à 1. Toute autre erreur de liaison reste une erreur 400, comme avant.
     */
    private static boolean champValide(BindingResult binding, String champ, int valeur) throws BindException {
        boolean champEnErreur = binding.hasFieldErrors(champ);
        if (binding.getErrorCount() > (champEnErreur ? binding.getFieldErrorCount(champ) : 0)) {
            throw new BindException(binding);
        }
        return !champEnErreur && valeur >= 1;
    }

    @GetMapping("/groupes")
    public String listGroupes(Model model) {
        model.addAttribute("groupes", adminPedagogieService.listGroupes());
        return "admin/groupes/list";
    }
        @PostMapping("/groupes/delete/{id}")
    public String deleteGroupe(@PathVariable Long id) {
        adminPedagogieService.deleteGroupe(id);
        return "redirect:/admin/pedagogie/groupes";
    }

    @GetMapping("/groupes/add")
    public String addGroupeForm(Model model) {
        model.addAttribute("groupe", new entity.Groupe());
        model.addAttribute("sessions", adminPedagogieService.listSessions());
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        model.addAttribute("specialites", adminPedagogieService.listSpecialites());
        return "admin/groupes/add";
    }

    @PostMapping("/groupes/add")
    public String addGroupe(@ModelAttribute entity.Groupe groupe) {
        adminPedagogieService.addGroupe(groupe);
        return "redirect:/admin/pedagogie/groupes";
    }

    @GetMapping("/groupes/edit/{id}")
    public String editGroupeForm(@PathVariable Long id, Model model) {
        model.addAttribute("groupe", adminPedagogieService.listGroupes().stream().filter(g -> g.getId().equals(id)).findFirst().orElse(null));
        model.addAttribute("sessions", adminPedagogieService.listSessions());
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        model.addAttribute("specialites", adminPedagogieService.listSpecialites());
        return "admin/groupes/edit";
    }

    @PostMapping("/groupes/edit/{id}")
    public String editGroupe(@PathVariable Long id, @ModelAttribute entity.Groupe groupe) {
        adminPedagogieService.updateGroupe(id, groupe);
        return "redirect:/admin/pedagogie/groupes";
    }


    @GetMapping("/specialites")
    public String listSpecialites(Model model) {
        model.addAttribute("specialites", adminPedagogieService.listSpecialites());
        return "admin/specialites/list";
    }

    @GetMapping("/specialites/add")
    public String addSpecialiteForm(Model model) {
        model.addAttribute("specialite", new entity.Specialite());
        return "admin/specialites/add";
    }

    @PostMapping("/specialites/add")
    public String addSpecialite(@ModelAttribute("specialite") entity.Specialite specialite) {
        adminPedagogieService.addSpecialite(specialite);
        return "redirect:/admin/pedagogie/specialites";
    }

    @GetMapping("/specialites/edit/{id}")
    public String editSpecialiteForm(@PathVariable Long id, Model model) {
        entity.Specialite specialite = adminPedagogieService.listSpecialites().stream().filter(s -> s.getId().equals(id)).findFirst().orElse(null);
        model.addAttribute("specialite", specialite);
        return "admin/specialites/edit";
    }

    @PostMapping("/specialites/edit/{id}")
    public String editSpecialite(@PathVariable Long id, @ModelAttribute("specialite") entity.Specialite specialite) {
        adminPedagogieService.updateSpecialite(id, specialite);
        return "redirect:/admin/pedagogie/specialites";
    }

    @GetMapping("/salles")
    public String listSalles(Model model) {
        model.addAttribute("salles", adminPedagogieService.listSalles());
        return "admin/salles/list";
    }

    @GetMapping("/salles/add")
    public String addSalleForm(Model model) {
        model.addAttribute("salle", new entity.Salle());
        return "admin/salles/add";
    }

    @PostMapping("/salles/add")
    public String addSalle(@ModelAttribute entity.Salle salle, BindingResult binding, RedirectAttributes redirectAttributes) throws BindException {
        if (!champValide(binding, "capacite", salle.getCapacite())) {
            redirectAttributes.addFlashAttribute("error", MSG_CAPACITE);
            return "redirect:/admin/pedagogie/salles/add";
        }
        adminPedagogieService.addSalle(salle);
        return "redirect:/admin/pedagogie/salles";
    }

    @GetMapping("/seances")
    public String listSeances(Model model) {
        model.addAttribute("seances", adminPedagogieService.listSeances());
        return "admin/seances/list";
    }

    @GetMapping("/seances/add")
    public String addSeanceForm(Model model) {
        model.addAttribute("seance", new entity.Seance());
        model.addAttribute("coursList", adminPedagogieService.listCours());
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        model.addAttribute("salles", adminPedagogieService.listSalles());
        model.addAttribute("groupes", adminPedagogieService.listGroupes());
        return "admin/seances/add";
    }

    @GetMapping("/groupes/formateur/{formateurId}")
    @ResponseBody
    public java.util.List<entity.Groupe> getGroupesByFormateur(@PathVariable Long formateurId) {
        return adminPedagogieService.getGroupesByFormateur(formateurId);
    }

    @PostMapping("/seances/add")
    public String addSeance(@ModelAttribute entity.Seance seance) {
        adminPedagogieService.addSeance(seance);
        return "redirect:/admin/pedagogie/seances";
    }

    @GetMapping("/cours")
    public String listCours(Model model) {
        model.addAttribute("cours", adminPedagogieService.listCours());
        return "admin/cours/list";
    }

    @GetMapping("/cours/add")
    public String addCoursForm(Model model) {
        model.addAttribute("cours", new entity.Cours());
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        model.addAttribute("groupes", adminPedagogieService.listGroupes());
        return "admin/cours/add";
    }

    @PostMapping("/cours/add")
    public String addCours(@ModelAttribute entity.Cours cours, BindingResult binding, @RequestParam(required = false) Long groupeId, RedirectAttributes redirectAttributes) throws BindException {
        if (!champValide(binding, "volumeHoraire", cours.getVolumeHoraire())) {
            redirectAttributes.addFlashAttribute("error", MSG_VOLUME);
            return "redirect:/admin/pedagogie/cours/add";
        }
        entity.Cours savedCours = adminPedagogieService.addCours(cours);
        
        // Si un groupe est sélectionné, affecter le cours au groupe
        if (groupeId != null) {
            adminPedagogieService.affecterCoursAGroupe(savedCours.getId(), groupeId);
        }
        
        return "redirect:/admin/pedagogie/cours";
    }

    @GetMapping("/cours/edit/{id}")
    public String editCoursForm(@PathVariable Long id, Model model) {
        model.addAttribute("cours", adminPedagogieService.getCoursById(id));
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        return "admin/cours/edit";
    }

    @PostMapping("/cours/edit/{id}")
    public String editCours(@PathVariable Long id, @ModelAttribute entity.Cours cours, BindingResult binding, RedirectAttributes redirectAttributes) throws BindException {
        if (!champValide(binding, "volumeHoraire", cours.getVolumeHoraire())) {
            redirectAttributes.addFlashAttribute("error", MSG_VOLUME);
            return "redirect:/admin/pedagogie/cours/edit/" + id;
        }
        adminPedagogieService.updateCours(id, cours);
        return "redirect:/admin/pedagogie/cours";
    }

    @PostMapping("/cours/delete/{id}")
    public String deleteCours(@PathVariable Long id) {
        adminPedagogieService.deleteCours(id);
        return "redirect:/admin/pedagogie/cours";
    }

    @PostMapping("/specialites/delete/{id}")
    public String deleteSpecialite(@PathVariable Long id) {
        adminPedagogieService.deleteSpecialite(id);
        return "redirect:/admin/pedagogie/specialites";
    }

    @GetMapping("/salles/edit/{id}")
    public String editSalleForm(@PathVariable Long id, Model model) {
        model.addAttribute("salle", adminPedagogieService.getSalleById(id));
        return "admin/salles/edit";
    }

    @PostMapping("/salles/edit/{id}")
    public String editSalle(@PathVariable Long id, @ModelAttribute entity.Salle salle, BindingResult binding, RedirectAttributes redirectAttributes) throws BindException {
        if (!champValide(binding, "capacite", salle.getCapacite())) {
            redirectAttributes.addFlashAttribute("error", MSG_CAPACITE);
            return "redirect:/admin/pedagogie/salles/edit/" + id;
        }
        adminPedagogieService.updateSalle(id, salle);
        return "redirect:/admin/pedagogie/salles";
    }

    @PostMapping("/salles/delete/{id}")
    public String deleteSalle(@PathVariable Long id) {
        adminPedagogieService.deleteSalle(id);
        return "redirect:/admin/pedagogie/salles";
    }

    @GetMapping("/seances/edit/{id}")
    public String editSeanceForm(@PathVariable Long id, Model model) {
        model.addAttribute("seance", adminPedagogieService.getSeanceById(id));
        model.addAttribute("coursList", adminPedagogieService.listCours());
        model.addAttribute("formateurs", adminPedagogieService.listFormateurs());
        model.addAttribute("salles", adminPedagogieService.listSalles());
        model.addAttribute("groupes", adminPedagogieService.listGroupes());
        return "admin/seances/edit";
    }

    @PostMapping("/seances/edit/{id}")
    public String editSeance(@PathVariable Long id, @ModelAttribute entity.Seance seance) {
        adminPedagogieService.updateSeance(id, seance);
        return "redirect:/admin/pedagogie/seances";
    }

    @PostMapping("/seances/delete/{id}")
    public String deleteSeance(@PathVariable Long id) {
        adminPedagogieService.deleteSeance(id);
        return "redirect:/admin/pedagogie/seances";
    }
}
