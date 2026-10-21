package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminRoleService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/roles")
public class AdminRoleController {
    private final AdminRoleService adminRoleService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("roles", adminRoleService.listRoles());
        return "admin/roles/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("role", new entity.Role());
        return "admin/roles/add";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute("role") entity.Role role) {
        adminRoleService.addRole(role);
        return "redirect:/admin/roles";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("role", adminRoleService.getRoleById(id));
        return "admin/roles/edit";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable Long id, @ModelAttribute("role") entity.Role role) {
        adminRoleService.updateRole(id, role);
        return "redirect:/admin/roles";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        adminRoleService.deleteRole(id);
        return "redirect:/admin/roles";
    }
}
