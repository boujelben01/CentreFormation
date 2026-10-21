package service.publique;

import dto.PublicCoursResponse;
import entity.Cours;
import entity.Formateur;
import exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.CoursRepository;
import service.common.CoursFormateurResolver;

import java.util.List;
import java.util.Map;

/** Catalogue public : lecture seule, sans donnée sensible (pas d'e-mail, d'inscriptions ni de groupes). */
@Service
@RequiredArgsConstructor
public class PublicCoursService {

    private final CoursRepository coursRepository;
    private final CoursFormateurResolver formateurResolver;

    @Transactional(readOnly = true)
    public List<PublicCoursResponse> lister() {
        List<Cours> cours = coursRepository.findAllAvecFormateur();
        Map<Long, Formateur> formateurs = formateurResolver.resoudre(cours);
        return cours.stream().map(c -> versDto(c, formateurs.get(c.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public PublicCoursResponse trouver(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Formation introuvable."));
        Formateur formateur = formateurResolver.resoudre(List.of(cours)).get(cours.getId());
        return versDto(cours, formateur);
    }

    private static PublicCoursResponse versDto(Cours c, Formateur f) {
        return new PublicCoursResponse(
                c.getId(), c.getCode(), c.getTitre(), c.getDescription(), c.getVolumeHoraire(),
                f != null ? f.getPrenom() : null,
                f != null ? f.getNom() : null,
                f != null && f.getSpecialite() != null ? f.getSpecialite().getNom() : null);
    }
}
