package service.etudiant;

import dto.SeanceResponse;
import entity.Seance;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.EtudiantRepository;
import repository.SeanceRepository;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EtudiantPlanningService {
    private final SeanceRepository seanceRepository;
    private final EtudiantRepository etudiantRepository;

    public List<Seance> getEmploiDuTemps(Long etudiantId) {
        return etudiantRepository.findById(etudiantId)
            .map(etudiant -> {
                if (etudiant.getGroupe() != null) {
                    return seanceRepository.findByGroupeIdOrderByDateAscHeureDebutAsc(etudiant.getGroupe().getId());
                }
                return Collections.<Seance>emptyList();
            })
            .orElse(Collections.emptyList());
    }

    @Transactional(readOnly = true)
    public List<SeanceResponse> getEmploiDuTempsWithDetails(Long etudiantId) {
        return etudiantRepository.findById(etudiantId)
            .map(etudiant -> {
                if (etudiant.getGroupe() != null) {
                    return seanceRepository
                            .findAvecDetailsByGroupeIdOrderByDateAscHeureDebutAsc(etudiant.getGroupe().getId())
                            .stream()
                            .map(SeanceResponse::from)
                            .toList();
                }
                return Collections.<SeanceResponse>emptyList();
            })
            .orElse(Collections.emptyList());
    }
}
