package service.common;

import entity.Cours;
import entity.Formateur;
import entity.Groupe;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import repository.GroupeRepository;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Détermine le formateur d'un lot de cours : Cours.formateur en priorité, sinon le formateur
 * du premier groupe du cours (une seule requête pour tous les cours concernés).
 */
@Component
@RequiredArgsConstructor
public class CoursFormateurResolver {

    private final GroupeRepository groupeRepository;

    /** @return formateur par identifiant de cours (absent de la map si le cours n'a aucun formateur connu) */
    public Map<Long, Formateur> resoudre(Collection<Cours> cours) {
        Map<Long, Formateur> result = new HashMap<>();
        Set<Long> aResoudre = new HashSet<>();

        for (Cours c : cours) {
            if (c.getFormateur() != null) {
                result.put(c.getId(), c.getFormateur());
            } else {
                aResoudre.add(c.getId());
            }
        }

        if (!aResoudre.isEmpty()) {
            for (Groupe groupe : groupeRepository.findAvecFormateurByCoursIdIn(aResoudre)) {
                result.putIfAbsent(groupe.getCours().getId(), groupe.getFormateur());
            }
        }
        return result;
    }
}
