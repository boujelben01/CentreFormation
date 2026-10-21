package service.formateur;

import dto.CoursResponse;
import dto.EtudiantGroupeResponse;
import dto.GroupeEffectif;
import dto.GroupeResponse;
import dto.ProfileUpdateRequest;
import dto.ProfilFormateurResponse;
import dto.SeanceFormateurResponse;
import entity.Formateur;
import entity.Groupe;
import exception.ForbiddenException;
import exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.CoursRepository;
import repository.EtudiantRepository;
import repository.FormateurRepository;
import repository.GroupeRepository;
import repository.SeanceRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FormateurConsultationService {
    private final GroupeRepository groupeRepository;
    private final SeanceRepository seanceRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final FormateurRepository formateurRepository;
    private final PasswordEncoder passwordEncoder;

    /** Groupes du formateur avec effectif et étudiants : 2 requêtes quel que soit le nombre de groupes. */
    @Transactional(readOnly = true)
    public List<GroupeResponse> getGroupesByFormateur(Long formateurId) {
        List<GroupeEffectif> groupes = groupeRepository.findGroupesAvecEffectif(formateurId);
        if (groupes.isEmpty()) {
            return List.of();
        }

        List<Long> ids = groupes.stream().map(GroupeEffectif::id).toList();
        Map<Long, List<EtudiantGroupeResponse>> etudiantsParGroupe = new HashMap<>();
        for (Object[] row : etudiantRepository.findResumesByGroupeIdIn(ids)) {
            etudiantsParGroupe
                    .computeIfAbsent((Long) row[0], k -> new ArrayList<>())
                    .add(new EtudiantGroupeResponse((Long) row[1], (String) row[2], (String) row[3],
                            (String) row[4], (String) row[5]));
        }

        return groupes.stream()
                .map(g -> new GroupeResponse(g.id(), g.nom(), g.coursId(), g.coursCode(), g.coursTitre(),
                        g.effectif() == null ? 0 : g.effectif(),
                        etudiantsParGroupe.getOrDefault(g.id(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SeanceFormateurResponse> getSeancesByFormateur(Long formateurId) {
        return seanceRepository.findResumesByFormateurId(formateurId);
    }

    /**
     * Étudiants d'un groupe. 404 si le groupe n'existe pas, 403 s'il n'est pas animé par ce formateur.
     */
    @Transactional(readOnly = true)
    public List<EtudiantGroupeResponse> getEtudiantsByGroupe(Long formateurId, Long groupeId) {
        Groupe groupe = groupeRepository.findById(groupeId)
                .orElseThrow(() -> new NotFoundException("Groupe introuvable."));
        if (groupe.getFormateur() == null || !formateurId.equals(groupe.getFormateur().getId())) {
            throw new ForbiddenException("Ce groupe ne fait pas partie de vos groupes.");
        }
        return etudiantRepository.findResumesByGroupeId(groupeId);
    }

    @Transactional(readOnly = true)
    public List<CoursResponse> getCoursByFormateur(Long formateurId) {
        return coursRepository.findByFormateurId(formateurId).stream()
                .map(CoursResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfilFormateurResponse getProfil(Long formateurId) {
        return ProfilFormateurResponse.from(charger(formateurId));
    }

    @Transactional
    public ProfilFormateurResponse updateProfil(Long formateurId, ProfileUpdateRequest request) {
        Formateur formateur = charger(formateurId);
        if (request.getNom() != null && !request.getNom().isBlank()) {
            formateur.setNom(request.getNom().trim());
        }
        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            formateur.setPrenom(request.getPrenom().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            formateur.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return ProfilFormateurResponse.from(formateurRepository.save(formateur));
    }

    private Formateur charger(Long formateurId) {
        return formateurRepository.findById(formateurId)
                .orElseThrow(() -> new NotFoundException("Formateur introuvable."));
    }
}
