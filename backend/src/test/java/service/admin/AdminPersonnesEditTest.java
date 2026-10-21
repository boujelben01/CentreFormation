package service.admin;

import entity.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import repository.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Éditions sans perte : utilisateurs, étudiants, formateurs, rôles. */
@ExtendWith(MockitoExtension.class)
class AdminPersonnesEditTest {

    @Mock private UserRepository userRepo;
    @Mock private RoleRepository roleRepo;
    @Mock private PasswordEncoder encoder;
    @Mock private EtudiantRepository etudiantRepo;
    @Mock private GroupeRepository groupeRepo;
    @Mock private FormateurRepository formateurRepo;
    @Mock private SpecialiteRepository specialiteRepo;

    private static Role role(Long id, Role.RoleName n) { Role r = new Role(); r.setId(id); r.setName(n); return r; }

    // ---------------------------------------------------------------- Utilisateurs
    private User existingUser(Role... roles) {
        User u = new User();
        u.setId(5L);
        u.setUsername("ancien");
        u.setPassword("ANCIEN_HASH");
        u.setEnabled(true);
        u.setDateCreation(LocalDate.of(2025, 9, 1));
        u.setRoles(new HashSet<>(List.of(roles)));
        return u;
    }

    @Test
    void utilisateur_mot_de_passe_vide_conserve_l_ancien_et_la_date_de_creation() {
        AdminUserService service = new AdminUserService(userRepo, roleRepo, encoder);
        Role admin = role(1L, Role.RoleName.ADMIN);
        when(userRepo.findById(5L)).thenReturn(Optional.of(existingUser(admin)));
        when(userRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        User form = new User();
        form.setUsername("nouveau");
        form.setPassword("");          // champ laissé vide
        form.setEnabled(false);
        User saved = service.updateUser(5L, form, null);

        assertThat(saved.getUsername()).isEqualTo("nouveau");
        assertThat(saved.isEnabled()).isFalse();
        assertThat(saved.getPassword()).isEqualTo("ANCIEN_HASH");
        assertThat(saved.getDateCreation()).isEqualTo(LocalDate.of(2025, 9, 1));
        assertThat(saved.getRoles()).containsExactly(admin);
        verify(encoder, never()).encode(any());
    }

    @Test
    void utilisateur_mot_de_passe_null_conserve_aussi_l_ancien() {
        AdminUserService service = new AdminUserService(userRepo, roleRepo, encoder);
        when(userRepo.findById(5L)).thenReturn(Optional.of(existingUser()));
        when(userRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        User form = new User();
        form.setUsername("x");
        assertThat(service.updateUser(5L, form, List.of()).getPassword()).isEqualTo("ANCIEN_HASH");
    }

    @Test
    void utilisateur_nouveau_mot_de_passe_est_chiffre_et_les_roles_coches_remplacent_les_anciens() {
        AdminUserService service = new AdminUserService(userRepo, roleRepo, encoder);
        Role admin = role(1L, Role.RoleName.ADMIN), formateur = role(2L, Role.RoleName.FORMATEUR);
        when(userRepo.findById(5L)).thenReturn(Optional.of(existingUser(admin)));
        when(roleRepo.findAllById(List.of(2L))).thenReturn(List.of(formateur));
        when(encoder.encode("secret")).thenReturn("NOUVEAU_HASH");
        when(userRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        User form = new User();
        form.setUsername("ancien");
        form.setPassword("secret");
        form.setEnabled(true);
        User saved = service.updateUser(5L, form, List.of(2L));

        assertThat(saved.getPassword()).isEqualTo("NOUVEAU_HASH");
        assertThat(saved.getRoles()).containsExactly(formateur);
        assertThat(saved.getDateCreation()).isEqualTo(LocalDate.of(2025, 9, 1));
    }

    @Test
    void utilisateur_inexistant_leve_toujours_une_erreur() {
        AdminUserService service = new AdminUserService(userRepo, roleRepo, encoder);
        when(userRepo.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateUser(404L, new User(), null)).hasMessageContaining("User not found");
        verify(userRepo, never()).save(any());
    }

    // ---------------------------------------------------------------- Étudiants
    @Test
    void etudiant_edition_conserve_compte_roles_inscriptions_et_notes() {
        AdminEtudiantService service = new AdminEtudiantService(etudiantRepo, groupeRepo, roleRepo, encoder);
        Inscription inscription = new Inscription();
        Note note = new Note();
        Role etu = role(5L, Role.RoleName.ETUDIANT);
        Etudiant existing = new Etudiant();
        existing.setId(9L);
        existing.setUsername("login");
        existing.setPassword("HASH");
        existing.setEnabled(true);
        existing.setDateCreation(LocalDate.of(2025, 9, 1));
        existing.setRoles(Set.of(etu));
        existing.setInscriptions(Set.of(inscription));
        existing.setNotes(Set.of(note));
        existing.setMatricule("OLD");
        when(etudiantRepo.findById(9L)).thenReturn(Optional.of(existing));
        Groupe g = new Groupe();
        g.setId(3L);

        Etudiant form = new Etudiant();
        form.setMatricule("NEW");
        form.setNom("Nom");
        form.setPrenom("Prénom");
        form.setEmail("a@b.fr");
        form.setDateInscription(LocalDate.of(2026, 1, 2));
        form.setGroupe(g);
        service.updateEtudiant(9L, form);

        org.mockito.ArgumentCaptor<Etudiant> cap = org.mockito.ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepo).save(cap.capture());
        Etudiant saved = cap.getValue();
        assertThat(saved.getMatricule()).isEqualTo("NEW");
        assertThat(saved.getNom()).isEqualTo("Nom");
        assertThat(saved.getDateInscription()).isEqualTo(LocalDate.of(2026, 1, 2));
        assertThat(saved.getGroupe().getId()).isEqualTo(3L);
        assertThat(saved.getUsername()).isEqualTo("login");
        assertThat(saved.getPassword()).isEqualTo("HASH");
        assertThat(saved.getRoles()).containsExactly(etu);
        assertThat(saved.getInscriptions()).containsExactly(inscription);
        assertThat(saved.getNotes()).containsExactly(note);
        assertThat(saved.getDateCreation()).isEqualTo(LocalDate.of(2025, 9, 1));
    }

    @Test
    void etudiant_groupe_non_selectionne_devient_aucun_groupe() {
        AdminEtudiantService service = new AdminEtudiantService(etudiantRepo, groupeRepo, roleRepo, encoder);
        Etudiant existing = new Etudiant();
        existing.setId(9L);
        Groupe ancien = new Groupe();
        ancien.setId(1L);
        existing.setGroupe(ancien);
        when(etudiantRepo.findById(9L)).thenReturn(Optional.of(existing));
        Etudiant form = new Etudiant();
        form.setGroupe(new Groupe());       // « groupe.id » vide : objet sans id
        service.updateEtudiant(9L, form);
        org.mockito.ArgumentCaptor<Etudiant> cap = org.mockito.ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepo).save(cap.capture());
        assertThat(cap.getValue().getGroupe()).isNull();
    }

    // ---------------------------------------------------------------- Formateurs
    @Test
    void formateur_edition_conserve_cours_seances_compte_et_roles() {
        AdminFormateurService service = new AdminFormateurService(formateurRepo, encoder, roleRepo, specialiteRepo);
        Cours cours = new Cours();
        Seance seance = new Seance();
        Role r = role(2L, Role.RoleName.FORMATEUR);
        Formateur existing = new Formateur();
        existing.setId(4L);
        existing.setUsername("login");
        existing.setPassword("HASH");
        existing.setRoles(Set.of(r));
        existing.setCours(Set.of(cours));
        existing.setSeances(Set.of(seance));
        when(formateurRepo.findById(4L)).thenReturn(Optional.of(existing));
        Specialite spec = new Specialite();
        spec.setId(8L);

        Formateur form = new Formateur();
        form.setNom("Nom");
        form.setPrenom("Prénom");
        form.setEmail("f@b.fr");
        form.setSpecialite(spec);
        service.updateFormateur(4L, form);

        org.mockito.ArgumentCaptor<Formateur> cap = org.mockito.ArgumentCaptor.forClass(Formateur.class);
        verify(formateurRepo).save(cap.capture());
        Formateur saved = cap.getValue();
        assertThat(saved.getNom()).isEqualTo("Nom");
        assertThat(saved.getSpecialite().getId()).isEqualTo(8L);
        assertThat(saved.getUsername()).isEqualTo("login");
        assertThat(saved.getPassword()).isEqualTo("HASH");
        assertThat(saved.getRoles()).containsExactly(r);
        assertThat(saved.getCours()).containsExactly(cours);
        assertThat(saved.getSeances()).containsExactly(seance);
    }

    @Test
    void formateur_specialite_non_selectionnee_devient_aucune() {
        AdminFormateurService service = new AdminFormateurService(formateurRepo, encoder, roleRepo, specialiteRepo);
        Formateur existing = new Formateur();
        existing.setId(4L);
        Specialite ancienne = new Specialite();
        ancienne.setId(1L);
        existing.setSpecialite(ancienne);
        when(formateurRepo.findById(4L)).thenReturn(Optional.of(existing));
        Formateur form = new Formateur();
        form.setSpecialite(new Specialite());
        service.updateFormateur(4L, form);
        org.mockito.ArgumentCaptor<Formateur> cap = org.mockito.ArgumentCaptor.forClass(Formateur.class);
        verify(formateurRepo).save(cap.capture());
        assertThat(cap.getValue().getSpecialite()).isNull();
    }

    // ---------------------------------------------------------------- Rôles
    @Test
    void role_edition_ne_change_que_le_nom() {
        AdminRoleService service = new AdminRoleService(roleRepo);
        Role existing = role(2L, Role.RoleName.FORMATEUR);
        when(roleRepo.findById(2L)).thenReturn(Optional.of(existing));
        service.updateRole(2L, role(null, Role.RoleName.ETUDIANT));
        org.mockito.ArgumentCaptor<Role> cap = org.mockito.ArgumentCaptor.forClass(Role.class);
        verify(roleRepo).save(cap.capture());
        assertThat(cap.getValue()).isSameAs(existing);
        assertThat(cap.getValue().getId()).isEqualTo(2L);
        assertThat(cap.getValue().getName()).isEqualTo(Role.RoleName.ETUDIANT);
    }

    @Test
    void role_inexistant_ne_cree_rien() {
        AdminRoleService service = new AdminRoleService(roleRepo);
        when(roleRepo.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateRole(404L, role(null, Role.RoleName.ADMIN))).hasMessageContaining("Role not found");
        verify(roleRepo, never()).save(any());
    }
}
