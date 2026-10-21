package service.admin;

import entity.Role;
import entity.User;
import repository.RoleRepository;
import repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public User addUser(User user, List<Long> roleIds) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(true);
        user.setDateCreation(LocalDate.now());
        if (roleIds != null && !roleIds.isEmpty()) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
            user.setRoles(roles);
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User user, List<Long> roleIds) {
        User existing = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        existing.setUsername(user.getUsername());
        existing.setEnabled(user.isEnabled());
        // Ne mettre à jour le mot de passe que s'il est fourni
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (roleIds != null && !roleIds.isEmpty()) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
            existing.setRoles(roles);
        }
        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.deleteById(id);
    }

    public List<User> listUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Role> listRoles() {
        return roleRepository.findAll();
    }
}
