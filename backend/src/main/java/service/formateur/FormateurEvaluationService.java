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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.CoursRepository;
import repository.EtudiantRepository;
import repository.GroupeRepository;
import repository.InscriptionRepository;
import repository.NoteRepository;
import service.admin.EmailService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormateurEvaluationService {
    private final NoteRepository noteRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final GroupeRepository groupeRepository;
    private final InscriptionRepository inscriptionRepository;
    private final EmailService emailService;

    /**
     * Saisit une note. Le formateur doit enseigner le cours (404 si le cours ou l'étudiant n'existe pas,
     * 403 si le cours n'est pas le sien ou si l'étudiant ne le suit pas).
     */
    @Transactional
    public NoteFormateurResponse saisirNote(Long formateurId, NoteRequest request) {
        Cours cours = coursRepository.findById(request.getCoursId())
                .orElseThrow(() -> new NotFoundException("Cours introuvable."));
        Etudiant etudiant = etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new NotFoundException("Étudiant introuvable."));

        if (!enseigne(formateurId, cours.getId())) {
            throw new ForbiddenException("Vous n'enseignez pas ce cours : vous ne pouvez pas y saisir de note.");
        }
        if (!suitLeCours(etudiant.getId(), cours.getId())) {
            throw new ForbiddenException("Cet étudiant ne suit pas ce cours : vous ne pouvez pas lui attribuer de note.");
        }

        Note note = new Note();
        note.setEtudiant(etudiant);
        note.setCours(cours);
        note.setValeur(request.getValeur());
        note.setSession(request.getSession());
        note.setFormateurId(formateurId);

        Note saved = noteRepository.save(note);
        notifierParEmail(saved);
        return toResponse(saved);
    }

    /** Modifie une note. 404 si elle n'existe pas, 403 si elle a été saisie par un autre formateur. */
    @Transactional
    public NoteFormateurResponse modifierNote(Long formateurId, Long noteId, NoteUpdateRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("Note introuvable."));
        if (!formateurId.equals(note.getFormateurId())) {
            throw new ForbiddenException("Vous ne pouvez modifier que les notes que vous avez saisies.");
        }

        note.setValeur(request.getValeur());
        if (request.getSession() != null) {
            note.setSession(request.getSession());
        }

        Note saved = noteRepository.save(note);
        notifierParEmail(saved);
        return toResponse(saved);
    }

    public List<Note> getNotesByFormateur(Long formateurId) {
        return noteRepository.findByFormateurId(formateurId);
    }

    /** Notes saisies par le formateur, avec étudiant, groupe et cours, en une seule requête. */
    @Transactional(readOnly = true)
    public List<NoteFormateurResponse> getNotesWithDetails(Long formateurId) {
        return noteRepository.findDetailsByFormateurId(formateurId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Le formateur enseigne-t-il ce cours (titulaire du cours ou animateur d'un de ses groupes) ? */
    private boolean enseigne(Long formateurId, Long coursId) {
        return coursRepository.existsByIdAndFormateurId(coursId, formateurId)
                || groupeRepository.existsByFormateurIdAndCoursId(formateurId, coursId);
    }

    /** L'étudiant suit-il ce cours (groupe rattaché au cours, ou inscription validée) ? */
    private boolean suitLeCours(Long etudiantId, Long coursId) {
        return etudiantRepository.existsByIdAndGroupeCoursId(etudiantId, coursId)
                || inscriptionRepository.existsByEtudiantIdAndCoursIdAndStatut(etudiantId, coursId, Inscription.Statut.INSCRIT);
    }

    private void notifierParEmail(Note note) {
        try {
            Etudiant etudiant = note.getEtudiant();
            Cours cours = note.getCours();
            if (etudiant != null && etudiant.getEmail() != null && cours != null) {
                emailService.sendNoteNotification(
                        etudiant.getEmail(),
                        etudiant.getPrenom() + " " + etudiant.getNom(),
                        cours.getTitre(),
                        note.getValeur()
                );
            }
        } catch (Exception e) {
            // Un échec d'envoi ne bloque pas l'enregistrement de la note
            System.err.println("Erreur lors de l'envoi de l'email de notification de note: " + e.getMessage());
        }
    }

    private NoteFormateurResponse toResponse(Note note) {
        NoteFormateurResponse response = new NoteFormateurResponse();
        response.setId(note.getId());
        response.setValeur(note.getValeur());
        response.setSession(note.getSession());
        response.setFormateurId(note.getFormateurId());

        Etudiant etudiant = note.getEtudiant();
        if (etudiant != null) {
            response.setEtudiantId(etudiant.getId());
            response.setEtudiantNom(etudiant.getNom());
            response.setEtudiantPrenom(etudiant.getPrenom());
            if (etudiant.getGroupe() != null) {
                response.setGroupeNom(etudiant.getGroupe().getNom());
            }
        }

        Cours cours = note.getCours();
        if (cours != null) {
            response.setCoursId(cours.getId());
            response.setCoursCode(cours.getCode());
            response.setCoursNom(cours.getTitre());
        }
        return response;
    }
}
