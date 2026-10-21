package service.admin;

import entity.Formateur;
import entity.Groupe;
import entity.Cours;
import repository.FormateurRepository;
import repository.GroupeRepository;
import repository.CoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAffectationService {
    private final FormateurRepository formateurRepository;
    private final GroupeRepository groupeRepository;
    private final CoursRepository coursRepository;

    public void affecterFormateurGroupe(Long formateurId, Long groupeId) {
        Formateur formateur = formateurRepository.findById(formateurId)
            .orElseThrow(() -> new RuntimeException("Formateur not found"));
        Groupe groupe = groupeRepository.findById(groupeId)
            .orElseThrow(() -> new RuntimeException("Groupe not found"));
        groupe.setFormateur(formateur);
        groupeRepository.save(groupe);
    }

    public void affecterFormateurCours(Long formateurId, Long coursId) {
        Formateur formateur = formateurRepository.findById(formateurId)
            .orElseThrow(() -> new RuntimeException("Formateur not found"));
        Cours cours = coursRepository.findById(coursId)
            .orElseThrow(() -> new RuntimeException("Cours not found"));
        cours.setFormateur(formateur);
        coursRepository.save(cours);
    }
}
