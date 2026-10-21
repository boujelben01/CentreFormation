package service.admin;

import entity.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Éditions sans perte : seuls les champs du formulaire sont recopiés, les relations absentes du formulaire sont conservées. */
@ExtendWith(MockitoExtension.class)
class AdminPedagogieServiceEditTest {

    @Mock private SessionPedagogiqueRepository sessionRepo;
    @Mock private GroupeRepository groupeRepo;
    @Mock private SpecialiteRepository specialiteRepo;
    @Mock private SalleRepository salleRepo;
    @Mock private SeanceRepository seanceRepo;
    @Mock private CoursRepository coursRepo;
    @Mock private FormateurRepository formateurRepo;
    @Mock private EtudiantRepository etudiantRepo;
    @InjectMocks private AdminPedagogieService service;

    private static <T> T withId(T e, Long id) {
        try { e.getClass().getMethod("setId", Long.class).invoke(e, id); } catch (Exception ex) { throw new RuntimeException(ex); }
        return e;
    }

    private static Formateur formateur(Long id) { return withId(new Formateur(), id); }
    private static SessionPedagogique session(Long id) { return withId(new SessionPedagogique(), id); }

    // ---------------------------------------------------------------- Groupes
    @Test
    void groupe_edition_conserve_specialite_cours_et_etudiants() {
        Specialite specialite = withId(new Specialite(), 3L);
        Cours cours = withId(new Cours(), 9L);
        Etudiant etudiant = new Etudiant();
        Groupe existing = withId(new Groupe(), 5L);
        existing.setNom("ancien");
        existing.setSpecialite(specialite);
        existing.setCours(cours);
        existing.setEtudiants(Set.of(etudiant));
        when(groupeRepo.findById(5L)).thenReturn(Optional.of(existing));
        when(groupeRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Groupe form = new Groupe();           // ce que le formulaire envoie : nom, session, formateur
        form.setNom("nouveau");
        form.setSessionPedagogique(session(2L));
        form.setFormateur(formateur(4L));
        Groupe saved = service.updateGroupe(5L, form);

        assertThat(saved.getNom()).isEqualTo("nouveau");
        assertThat(saved.getSessionPedagogique().getId()).isEqualTo(2L);
        assertThat(saved.getFormateur().getId()).isEqualTo(4L);
        assertThat(saved.getSpecialite()).isSameAs(specialite);
        assertThat(saved.getCours()).isSameAs(cours);
        assertThat(saved.getEtudiants()).containsExactly(etudiant);
        assertThat(saved.getId()).isEqualTo(5L);
    }

    @Test
    void groupe_edition_liste_deroulante_vide_signifie_aucune_relation() {
        Groupe existing = withId(new Groupe(), 5L);
        existing.setSessionPedagogique(session(1L));
        existing.setFormateur(formateur(1L));
        when(groupeRepo.findById(5L)).thenReturn(Optional.of(existing));
        when(groupeRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Groupe form = new Groupe();
        form.setNom("g");
        form.setSessionPedagogique(new SessionPedagogique());   // liaison de « sessionPedagogique.id= » vide : objet sans id
        form.setFormateur(new Formateur());
        Groupe saved = service.updateGroupe(5L, form);

        assertThat(saved.getSessionPedagogique()).isNull();
        assertThat(saved.getFormateur()).isNull();
    }

    @Test
    void groupe_inexistant_leve_une_erreur_sans_rien_creer() {
        when(groupeRepo.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateGroupe(404L, new Groupe())).isInstanceOf(RuntimeException.class).hasMessageContaining("Groupe not found");
        verify(groupeRepo, never()).save(any());
    }

    // ---------------------------------------------------------------- Cours
    @Test
    void cours_edition_met_a_jour_les_champs_et_conserve_groupes_inscriptions_notes_seances() {
        Groupe groupe = new Groupe();
        Inscription inscription = new Inscription();
        Cours existing = withId(new Cours(), 7L);
        existing.setCode("OLD");
        existing.setTitre("Ancien titre");
        existing.setVolumeHoraire(10);
        existing.setGroupes(Set.of(groupe));
        existing.setInscriptions(Set.of(inscription));
        when(coursRepo.findById(7L)).thenReturn(Optional.of(existing));
        when(formateurRepo.findById(4L)).thenReturn(Optional.of(formateur(4L)));
        when(coursRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Cours form = new Cours();
        form.setCode("NEW");
        form.setTitre("Nouveau");
        form.setDescription("Desc");
        form.setVolumeHoraire(24);
        form.setFormateur(formateur(4L));
        Cours saved = service.updateCours(7L, form);

        assertThat(saved.getCode()).isEqualTo("NEW");
        assertThat(saved.getTitre()).isEqualTo("Nouveau");
        assertThat(saved.getDescription()).isEqualTo("Desc");
        assertThat(saved.getVolumeHoraire()).isEqualTo(24);
        assertThat(saved.getFormateur().getId()).isEqualTo(4L);
        assertThat(saved.getGroupes()).containsExactly(groupe);
        assertThat(saved.getInscriptions()).containsExactly(inscription);
    }

    @Test
    void cours_edition_sans_formateur_et_formateur_inconnu() {
        Cours existing = withId(new Cours(), 7L);
        existing.setFormateur(formateur(1L));
        when(coursRepo.findById(7L)).thenReturn(Optional.of(existing));
        when(coursRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        Cours form = new Cours();
        form.setFormateur(new Formateur());                     // « Sélectionner un formateur »
        assertThat(service.updateCours(7L, form).getFormateur()).isNull();

        Cours inconnu = new Cours();
        inconnu.setFormateur(formateur(99L));
        when(formateurRepo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateCours(7L, inconnu)).hasMessageContaining("Formateur not found");
    }

    // ---------------------------------------------------------------- Sessions, spécialités, salles
    @Test
    void session_edition_conserve_les_groupes() {
        Groupe groupe = new Groupe();
        SessionPedagogique existing = session(3L);
        existing.setAnneeScolaire("2024-2025");
        existing.setSemestre("Semestre 1");
        existing.setGroupes(Set.of(groupe));
        when(sessionRepo.findById(3L)).thenReturn(Optional.of(existing));
        when(sessionRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        SessionPedagogique form = new SessionPedagogique();
        form.setAnneeScolaire("2025-2026");
        form.setSemestre("Semestre 2");
        SessionPedagogique saved = service.updateSession(3L, form);

        assertThat(saved.getAnneeScolaire()).isEqualTo("2025-2026");
        assertThat(saved.getSemestre()).isEqualTo("Semestre 2");
        assertThat(saved.getGroupes()).containsExactly(groupe);
    }

    @Test
    void specialite_edition_conserve_les_formateurs() {
        Formateur f = new Formateur();
        Specialite existing = withId(new Specialite(), 2L);
        existing.setNom("Ancien");
        existing.setFormateurs(Set.of(f));
        when(specialiteRepo.findById(2L)).thenReturn(Optional.of(existing));
        when(specialiteRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Specialite form = new Specialite();
        form.setNom("Nouveau");
        Specialite saved = service.updateSpecialite(2L, form);

        assertThat(saved.getNom()).isEqualTo("Nouveau");
        assertThat(saved.getFormateurs()).containsExactly(f);
    }

    @Test
    void salle_edition_conserve_les_seances() {
        Seance seance = new Seance();
        Salle existing = withId(new Salle(), 6L);
        existing.setNom("A");
        existing.setCapacite(10);
        existing.setSeances(Set.of(seance));
        when(salleRepo.findById(6L)).thenReturn(Optional.of(existing));
        when(salleRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Salle form = new Salle();
        form.setNom("B");
        form.setCapacite(40);
        Salle saved = service.updateSalle(6L, form);

        assertThat(saved.getNom()).isEqualTo("B");
        assertThat(saved.getCapacite()).isEqualTo(40);
        assertThat(saved.getSeances()).containsExactly(seance);
    }

    // ---------------------------------------------------------------- Séances
    @Test
    void seance_edition_recopie_les_champs_du_formulaire() {
        Seance existing = withId(new Seance(), 8L);
        existing.setDate(LocalDate.of(2026, 1, 1));
        when(seanceRepo.findById(8L)).thenReturn(Optional.of(existing));
        Salle salle = withId(new Salle(), 2L);
        Groupe groupe = withId(new Groupe(), 3L);
        when(salleRepo.findById(2L)).thenReturn(Optional.of(salle));
        when(groupeRepo.findById(3L)).thenReturn(Optional.of(groupe));
        when(seanceRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Seance form = new Seance();
        form.setDate(LocalDate.of(2026, 10, 20));
        form.setHeureDebut(LocalTime.of(9, 0));
        form.setHeureFin(LocalTime.of(11, 0));
        form.setCours(withId(new Cours(), 1L));
        form.setFormateur(formateur(4L));
        form.setSalle(salle);
        form.setGroupe(groupe);
        Seance saved = service.updateSeance(8L, form);

        assertThat(saved.getId()).isEqualTo(8L);
        assertThat(saved.getDate()).isEqualTo(LocalDate.of(2026, 10, 20));
        assertThat(saved.getHeureDebut()).isEqualTo(LocalTime.of(9, 0));
        assertThat(saved.getCours().getId()).isEqualTo(1L);
        assertThat(saved.getFormateur().getId()).isEqualTo(4L);
        assertThat(saved.getSalle()).isSameAs(salle);
        assertThat(saved.getGroupe()).isSameAs(groupe);
    }
}
