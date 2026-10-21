package service.etudiant;

import dto.CatalogueCoursResponse;
import dto.CoursDisponibleResponse;
import entity.Cours;
import entity.Formateur;
import entity.Inscription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.CoursRepository;
import repository.InscriptionRepository;
import service.common.CoursFormateurResolver;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Catalogue des cours : 3 requêtes au total, quel que soit le nombre de cours. */
@Service
@RequiredArgsConstructor
public class EtudiantCatalogueService {

    private final CoursRepository coursRepository;
    private final InscriptionRepository inscriptionRepository;
    private final CoursFormateurResolver formateurResolver;

    /** Tous les cours, avec l'état de l'inscription de l'étudiant (null s'il n'en a jamais eu). */
    @Transactional(readOnly = true)
    public List<CatalogueCoursResponse> catalogue(Long etudiantId) {
        List<Cours> cours = coursRepository.findAllAvecFormateur();
        Map<Long, Formateur> formateurs = formateurResolver.resoudre(cours);
        Map<Long, Inscription> inscriptions = inscriptionsParCours(etudiantId);

        return cours.stream().map(c -> {
            Formateur f = formateurs.get(c.getId());
            Inscription i = inscriptions.get(c.getId());
            return new CatalogueCoursResponse(
                    c.getId(), c.getCode(), c.getTitre(), c.getDescription(), c.getVolumeHoraire(),
                    f != null ? f.getNom() : null,
                    f != null ? f.getPrenom() : null,
                    f != null ? f.getEmail() : null,
                    i != null ? i.getId() : null,
                    i != null ? i.getStatut().name() : null);
        }).toList();
    }

    /** Cours auxquels l'étudiant n'a aucune inscription (tout statut confondu : une annulation est définitive). */
    @Transactional(readOnly = true)
    public List<CoursDisponibleResponse> disponibles(Long etudiantId) {
        List<Cours> cours = coursRepository.findAllAvecFormateur();
        Map<Long, Formateur> formateurs = formateurResolver.resoudre(cours);
        Map<Long, Inscription> inscriptions = inscriptionsParCours(etudiantId);

        return cours.stream()
                .filter(c -> !inscriptions.containsKey(c.getId()))
                .map(c -> {
                    CoursDisponibleResponse dto = new CoursDisponibleResponse();
                    dto.setCoursId(c.getId());
                    dto.setCode(c.getCode());
                    dto.setTitre(c.getTitre());
                    dto.setDescription(c.getDescription());
                    dto.setVolumeHoraire(c.getVolumeHoraire());
                    Formateur f = formateurs.get(c.getId());
                    if (f != null) {
                        dto.setFormateurNom(f.getNom());
                        dto.setFormateurPrenom(f.getPrenom());
                        dto.setFormateurEmail(f.getEmail());
                    }
                    return dto;
                })
                .toList();
    }

    private Map<Long, Inscription> inscriptionsParCours(Long etudiantId) {
        Map<Long, Inscription> parCours = new HashMap<>();
        for (Inscription i : inscriptionRepository.findByEtudiantId(etudiantId)) {
            parCours.put(i.getCours().getId(), i);
        }
        return parCours;
    }
}
