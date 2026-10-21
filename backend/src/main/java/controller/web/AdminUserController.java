package controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.admin.AdminUserService;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/utilisateurs")
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("utilisateurs", adminUserService.listUsers());
        return "admin/utilisateurs/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("user", new entity.User());
        model.addAttribute("roles", adminUserService.listRoles());
        return "admin/utilisateurs/add";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute("user") entity.User user, @RequestParam(value = "roleIds", required = false) List<Long> roleIds) {
        adminUserService.addUser(user, roleIds);
        return "redirect:/admin/utilisateurs";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("user", adminUserService.getUserById(id));
        model.addAttribute("roles", adminUserService.listRoles());
        return "admin/utilisateurs/edit";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable Long id, @ModelAttribute("user") entity.User user, @RequestParam(value = "roleIds", required = false) List<Long> roleIds) {
        adminUserService.updateUser(id, user, roleIds);
        return "redirect:/admin/utilisateurs";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return "redirect:/admin/utilisateurs";
    }
}
