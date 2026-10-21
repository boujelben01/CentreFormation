package service.formateur;

import dto.SeanceResponse;
import entity.Seance;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.SeanceRepository;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormateurPlanningService {
    private final SeanceRepository seanceRepository;

    public List<Seance> getPlanningByFormateur(Long formateurId) {
        return seanceRepository.findByFormateurId(formateurId);
    }

    @Transactional(readOnly = true)
    public List<SeanceResponse> getPlanningWithDetails(Long formateurId) {
        return seanceRepository.findAvecDetailsByFormateurId(formateurId).stream()
                .sorted(Comparator.comparing(Seance::getDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Seance::getHeureDebut, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(SeanceResponse::from)
                .toList();
    }
}
