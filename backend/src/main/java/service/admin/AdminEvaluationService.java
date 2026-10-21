package service.admin;

import entity.Note;
import entity.Etudiant;
import entity.Cours;
import repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminEvaluationService {
    private final NoteRepository noteRepository;
    private final EmailService emailService;

    public Note addNote(Note note) {
        Note savedNote = noteRepository.save(note);
        
        // Envoyer l'email de notification à l'étudiant
        try {
            Etudiant etudiant = savedNote.getEtudiant();
            Cours cours = savedNote.getCours();
            
            if (etudiant != null && etudiant.getEmail() != null && cours != null) {
                emailService.sendNoteNotification(
                    etudiant.getEmail(),
                    etudiant.getPrenom() + " " + etudiant.getNom(),
                    cours.getTitre(),
                    savedNote.getValeur()
                );
            }
        } catch (Exception e) {
            // Log l'erreur mais ne bloque pas l'ajout de la note
            System.err.println("Erreur lors de l'envoi de l'email de notification de note: " + e.getMessage());
        }
        
        return savedNote;
    }

    public void deleteNote(Long id) {
        noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        noteRepository.deleteById(id);
    }

    public List<Note> listNotes() {
        return noteRepository.findAll();
    }
}
