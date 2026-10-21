package service.admin;

import entity.Etudiant;
import entity.Groupe;
import entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import repository.EtudiantRepository;
import repository.GroupeRepository;
import repository.RoleRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminEtudiantService {
    private final EtudiantRepository etudiantRepository;
    private final GroupeRepository groupeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Etudiant> listEtudiants() {
        return etudiantRepository.findAll();
    }

    public void addEtudiant(Etudiant etudiant) {
        // Encoder le mot de passe
        etudiant.setPassword(passwordEncoder.encode(etudiant.getPassword()));
        // Activer le compte
        etudiant.setEnabled(true);
        // Date de création
        etudiant.setDateCreation(LocalDate.now());
        // Attribuer le rôle ETUDIANT
        Role etudiantRole = roleRepository.findByName(Role.RoleName.ETUDIANT)
                .orElseThrow(() -> new RuntimeException("Role ETUDIANT not found"));
        etudiant.setRoles(Set.of(etudiantRole));
        etudiantRepository.save(etudiant);
    }

    public Etudiant getEtudiantById(Long id) {
        return etudiantRepository.findById(id).orElse(null);
    }

    public void updateEtudiant(Long id, Etudiant etudiant) {
        Etudiant existing = etudiantRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setMatricule(etudiant.getMatricule());
            existing.setNom(etudiant.getNom());
            existing.setPrenom(etudiant.getPrenom());
            existing.setEmail(etudiant.getEmail());
            existing.setDateInscription(etudiant.getDateInscription());
            existing.setGroupe(etudiant.getGroupe() != null && etudiant.getGroupe().getId() != null ? etudiant.getGroupe() : null);
            // Ne pas modifier le mot de passe sauf si fourni
            if (etudiant.getPassword() != null && !etudiant.getPassword().isEmpty()) {
                existing.setPassword(passwordEncoder.encode(etudiant.getPassword()));
            }
            etudiantRepository.save(existing);
        }
    }

    public void deleteEtudiant(Long id) {
        etudiantRepository.deleteById(id);
    }

    public List<Groupe> listGroupes() {
        return groupeRepository.findAll();
    }
}
