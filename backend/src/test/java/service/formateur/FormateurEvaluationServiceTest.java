package service.formateur;

import dto.NoteFormateurResponse;
import dto.NoteRequest;
import dto.NoteUpdateRequest;
import entity.Cours;
import entity.Etudiant;
import entity.Inscription;
import entity.Note;
import exception.ForbiddenException;
import exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.CoursRepository;
import repository.EtudiantRepository;
import repository.GroupeRepository;
import repository.InscriptionRepository;
import repository.NoteRepository;
import service.admin.EmailService;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FormateurEvaluationServiceTest {

    private static final Long FORMATEUR = 7L;
    private static final Long AUTRE_FORMATEUR = 8L;

    @Mock private NoteRepository noteRepository;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private CoursRepository coursRepository;
    @Mock private GroupeRepository groupeRepository;
    @Mock private InscriptionRepository inscriptionRepository;
    @Mock private EmailService emailService;
    @InjectMocks private FormateurEvaluationService service;

    private Cours cours(Long id) {
        Cours c = new Cours();
        c.setId(id);
        c.setCode("INF101");
        c.setTitre("Analyse et Conception UML");
        return c;
    }

    private Etudiant etudiant(Long id) {
        Etudiant e = new Etudiant();
        e.setId(id);
        e.setNom("Ben Youssef");
        e.setPrenom("Amira");
        return e;
    }

    private NoteRequest request(Long etudiantId, Long coursId) {
        return new NoteRequest(etudiantId, coursId, 15.0, "Principale");
    }

    @Test
    void saisirNote_coursInconnu_404() {
        when(coursRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.saisirNote(FORMATEUR, request(1L, 10L)))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Cours introuvable.");
        verify(noteRepository, never()).save(any());
    }

    @Test
    void saisirNote_etudiantInconnu_404() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours(10L)));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.saisirNote(FORMATEUR, request(1L, 10L)))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Étudiant introuvable.");
    }

    @Test
    void saisirNote_coursDunAutreFormateur_403() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours(10L)));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant(1L)));
        when(coursRepository.existsByIdAndFormateurId(10L, FORMATEUR)).thenReturn(false);
        when(groupeRepository.existsByFormateurIdAndCoursId(FORMATEUR, 10L)).thenReturn(false);

        assertThatThrownBy(() -> service.saisirNote(FORMATEUR, request(1L, 10L)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("n'enseignez pas ce cours");
        verify(noteRepository, never()).save(any());
    }

    @Test
    void saisirNote_etudiantQuiNeSuitPasLeCours_403() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours(10L)));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant(1L)));
        when(coursRepository.existsByIdAndFormateurId(10L, FORMATEUR)).thenReturn(true);
        when(etudiantRepository.existsByIdAndGroupeCoursId(1L, 10L)).thenReturn(false);
        when(inscriptionRepository.existsByEtudiantIdAndCoursIdAndStatut(1L, 10L, Inscription.Statut.INSCRIT))
                .thenReturn(false);

        assertThatThrownBy(() -> service.saisirNote(FORMATEUR, request(1L, 10L)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("ne suit pas ce cours");
        verify(noteRepository, never()).save(any());
    }

    @Test
    void saisirNote_formateurDuCoursEtEtudiantInscrit_enregistreLaNoteAuNomDuFormateur() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours(10L)));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant(1L)));
        when(coursRepository.existsByIdAndFormateurId(10L, FORMATEUR)).thenReturn(true);
        when(etudiantRepository.existsByIdAndGroupeCoursId(1L, 10L)).thenReturn(false);
        when(inscriptionRepository.existsByEtudiantIdAndCoursIdAndStatut(1L, 10L, Inscription.Statut.INSCRIT))
                .thenReturn(true);
        when(noteRepository.save(any(Note.class))).thenAnswer(inv -> {
            Note n = inv.getArgument(0);
            n.setId(99L);
            return n;
        });

        NoteFormateurResponse response = service.saisirNote(FORMATEUR, request(1L, 10L));

        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getFormateurId()).isEqualTo(FORMATEUR);
        assertThat(response.getValeur()).isEqualTo(15.0);
        assertThat(response.getCoursCode()).isEqualTo("INF101");
        assertThat(response.getEtudiantId()).isEqualTo(1L);
    }

    @Test
    void saisirNote_animateurDunGroupeDuCoursEtEtudiantDuGroupe_accepte() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours(10L)));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant(1L)));
        when(coursRepository.existsByIdAndFormateurId(10L, FORMATEUR)).thenReturn(false);
        when(groupeRepository.existsByFormateurIdAndCoursId(FORMATEUR, 10L)).thenReturn(true);
        when(etudiantRepository.existsByIdAndGroupeCoursId(1L, 10L)).thenReturn(true);
        when(noteRepository.save(any(Note.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.saisirNote(FORMATEUR, request(1L, 10L)).getFormateurId()).isEqualTo(FORMATEUR);
    }

    @Test
    void modifierNote_noteInconnue_404() {
        when(noteRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.modifierNote(FORMATEUR, 5L, new NoteUpdateRequest(12.0, null)))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Note introuvable.");
    }

    @Test
    void modifierNote_noteDunAutreFormateur_403_etRienNEstEnregistre() {
        Note note = new Note();
        note.setId(5L);
        note.setFormateurId(AUTRE_FORMATEUR);
        note.setValeur(10.0);
        when(noteRepository.findById(5L)).thenReturn(Optional.of(note));

        assertThatThrownBy(() -> service.modifierNote(FORMATEUR, 5L, new NoteUpdateRequest(20.0, "Rattrapage")))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("notes que vous avez saisies");
        assertThat(note.getValeur()).isEqualTo(10.0);
        verify(noteRepository, never()).save(any());
    }

    @Test
    void modifierNote_saPropreNote_metAJourLaValeurEtLaSession() {
        Note note = new Note();
        note.setId(5L);
        note.setFormateurId(FORMATEUR);
        note.setValeur(10.0);
        note.setSession("Principale");
        when(noteRepository.findById(5L)).thenReturn(Optional.of(note));
        when(noteRepository.save(note)).thenReturn(note);

        NoteFormateurResponse response = service.modifierNote(FORMATEUR, 5L, new NoteUpdateRequest(13.5, "Rattrapage"));

        assertThat(response.getValeur()).isEqualTo(13.5);
        assertThat(response.getSession()).isEqualTo("Rattrapage");
        assertThat(response.getFormateurId()).isEqualTo(FORMATEUR);
    }
}
