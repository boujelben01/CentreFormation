package service.admin;

import entity.Formateur;
import entity.Role;
import entity.Specialite;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import repository.FormateurRepository;
import repository.RoleRepository;
import repository.SpecialiteRepository;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminFormateurService {
    private final FormateurRepository formateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final SpecialiteRepository specialiteRepository;

    public List<Formateur> listFormateurs() {
        return formateurRepository.findAll();
    }

    public void addFormateur(Formateur formateur) {
        formateur.setPassword(passwordEncoder.encode(formateur.getPassword()));
        formateur.setEnabled(true);
        formateur.setDateCreation(LocalDate.now());
        Role roleFormateur = roleRepository.findByName(Role.RoleName.FORMATEUR).orElse(null);
        if (roleFormateur != null) {
            Set<Role> roles = new HashSet<>();
            roles.add(roleFormateur);
            formateur.setRoles(roles);
        }
        formateurRepository.save(formateur);
    }

    public Formateur getFormateurById(Long id) {
        return formateurRepository.findById(id).orElse(null);
    }

    public void updateFormateur(Long id, Formateur formateur) {
        Formateur existing = formateurRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setNom(formateur.getNom());
            existing.setPrenom(formateur.getPrenom());
            existing.setEmail(formateur.getEmail());
            existing.setSpecialite(formateur.getSpecialite() != null && formateur.getSpecialite().getId() != null ? formateur.getSpecialite() : null);
            if (formateur.getPassword() != null && !formateur.getPassword().isEmpty()) {
                existing.setPassword(passwordEncoder.encode(formateur.getPassword()));
            }
            formateurRepository.save(existing);
        }
    }

    public void deleteFormateur(Long id) {
        formateurRepository.deleteById(id);
    }

    public List<Specialite> listSpecialites() {
        return specialiteRepository.findAll();
    }
}
