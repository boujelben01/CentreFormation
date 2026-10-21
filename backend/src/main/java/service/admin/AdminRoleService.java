package service.admin;

import entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import repository.RoleRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRoleService {
    private final RoleRepository roleRepository;

    public List<Role> listRoles() {
        return roleRepository.findAll();
    }

    public void addRole(Role role) {
        roleRepository.save(role);
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public void updateRole(Long id, Role role) {
        Role existing = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
        existing.setName(role.getName());
        roleRepository.save(existing);
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }
}
