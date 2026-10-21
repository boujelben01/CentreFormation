package service.etudiant;

import dto.CoursResponse;
import dto.FormateurResponse;
import dto.NoteResponse;
import dto.ProfileUpdateRequest;
import dto.ProfilEtudiantResponse;
import entity.Cours;
import entity.Etudiant;
import entity.Formateur;
import entity.Inscription;
import entity.Note;
import exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.EtudiantRepository;
import repository.InscriptionRepository;
import repository.NoteRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EtudiantConsultationService {
    private final NoteRepository noteRepository;
    private final EtudiantRepository etudiantRepository;
    private final InscriptionRepository inscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Note> getNotesByEtudiant(Long etudiantId) {
        return noteRepository.findByEtudiantId(etudiantId);
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotesWithCoursInfo(Long etudiantId) {
        return noteRepository.findByEtudiantId(etudiantId).stream()
                .map(note -> {
                    NoteResponse response = new NoteResponse();
                    response.setId(note.getId());
                    response.setValeur(note.getValeur());
                    response.setSession(note.getSession());
                    response.setFormateurId(note.getFormateurId());

                    if (note.getCours() != null) {
                        response.setCoursId(note.getCours().getId());
                        response.setCoursNom(note.getCours().getTitre());
                        response.setCoursCode(note.getCours().getCode());
                    }
                    return response;
                })
                .toList();
    }

    /** Cours du groupe de l'étudiant (un groupe n'a qu'un seul cours). */
    @Transactional(readOnly = true)
    public List<CoursResponse> getCoursByEtudiant(Long etudiantId) {
        return coursDuGroupe(etudiantId).stream().map(CoursResponse::from).toList();
    }

    /**
     * Formateurs des cours de l'étudiant : cours de son groupe et cours auxquels il est inscrit
     * (inscriptions non annulées), sans doublon.
     */
    @Transactional(readOnly = true)
    public List<FormateurResponse> getFormateursByEtudiant(Long etudiantId) {
        List<Cours> cours = new ArrayList<>(coursDuGroupe(etudiantId));
        inscriptionRepository.findByEtudiantId(etudiantId).stream()
                .filter(i -> i.getStatut() != Inscription.Statut.ANNULE)
                .map(Inscription::getCours)
                .forEach(cours::add);

        Map<Long, Formateur> formateurs = new LinkedHashMap<>();
        for (Cours c : cours) {
            if (c.getFormateur() != null) {
                formateurs.putIfAbsent(c.getFormateur().getId(), c.getFormateur());
            }
        }
        return formateurs.values().stream().map(FormateurResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProfilEtudiantResponse getProfil(Long etudiantId) {
        return ProfilEtudiantResponse.from(charger(etudiantId));
    }

    @Transactional
    public ProfilEtudiantResponse updateProfil(Long etudiantId, ProfileUpdateRequest request) {
        Etudiant etudiant = charger(etudiantId);
        if (request.getNom() != null && !request.getNom().isBlank()) {
            etudiant.setNom(request.getNom().trim());
        }
        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            etudiant.setPrenom(request.getPrenom().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            etudiant.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return ProfilEtudiantResponse.from(etudiantRepository.save(etudiant));
    }

    private List<Cours> coursDuGroupe(Long etudiantId) {
        return etudiantRepository.findById(etudiantId)
                .map(etudiant -> {
                    if (etudiant.getGroupe() != null && etudiant.getGroupe().getCours() != null) {
                        return Collections.singletonList(etudiant.getGroupe().getCours());
                    }
                    return Collections.<Cours>emptyList();
                })
                .orElse(Collections.emptyList());
    }

    private Etudiant charger(Long etudiantId) {
        return etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new NotFoundException("Étudiant introuvable."));
    }
}
