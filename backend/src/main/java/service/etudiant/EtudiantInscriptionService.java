package service.etudiant;

import dto.InscriptionDetailResponse;
import dto.InscriptionResponse;
import dto.MessageResponse;
import entity.Cours;
import entity.Etudiant;
import entity.Formateur;
import entity.Inscription;
import exception.ConflictException;
import exception.ForbiddenException;
import exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.CoursRepository;
import repository.EtudiantRepository;
import repository.InscriptionRepository;
import service.common.CoursFormateurResolver;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EtudiantInscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final CoursRepository coursRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursFormateurResolver formateurResolver;

    @Transactional(readOnly = true)
    public List<InscriptionDetailResponse> lister(Long etudiantId) {
        List<Inscription> inscriptions = inscriptionRepository.findByEtudiantId(etudiantId);
        Map<Long, Formateur> formateurs = formateurResolver.resoudre(
                inscriptions.stream().map(Inscription::getCours).toList());

        return inscriptions.stream().map(inscription -> {
            Cours cours = inscription.getCours();
            InscriptionDetailResponse dto = new InscriptionDetailResponse();
            dto.setInscriptionId(inscription.getId());
            dto.setDateInscription(inscription.getDateInscription().toString());
            dto.setStatut(inscription.getStatut().toString());

            dto.setCoursId(cours.getId());
            dto.setCoursCode(cours.getCode());
            dto.setCoursTitre(cours.getTitre());
            dto.setCoursDescription(cours.getDescription());
            dto.setCoursVolumeHoraire(cours.getVolumeHoraire());

            Formateur formateur = formateurs.get(cours.getId());
            if (formateur != null) {
                dto.setFormateurNom(formateur.getNom());
                dto.setFormateurPrenom(formateur.getPrenom());
            }
            return dto;
        }).toList();
    }

    /**
     * Inscrit l'étudiant à un cours existant (statut EN_ATTENTE).
     * 404 si le cours n'existe pas ; 409 si l'étudiant a déjà une inscription à ce cours (même annulée).
     */
    @Transactional
    public InscriptionResponse inscrire(Long etudiantId, Long coursId) {
        Cours cours = coursRepository.findById(coursId)
                .orElseThrow(() -> new NotFoundException("Cours introuvable."));

        inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId).ifPresent(existante -> {
            if (existante.getStatut() == Inscription.Statut.ANNULE) {
                throw new ConflictException("Votre inscription à ce cours a été annulée : elle ne peut pas être renouvelée.");
            }
            throw new ConflictException("Vous êtes déjà inscrit à ce cours.");
        });

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new NotFoundException("Étudiant introuvable."));

        Inscription inscription = new Inscription();
        inscription.setEtudiant(etudiant);
        inscription.setCours(cours);
        inscription.setDateInscription(LocalDate.now());
        inscription.setStatut(Inscription.Statut.EN_ATTENTE);
        Inscription saved = inscriptionRepository.save(inscription);

        return new InscriptionResponse(
                saved.getId(),
                cours.getId(),
                cours.getCode(),
                cours.getTitre(),
                saved.getDateInscription().toString(),
                saved.getStatut().toString(),
                "Inscription réussie au cours " + cours.getTitre()
        );
    }

    /** Annule une inscription (suppression logique). 404 si elle n'existe pas, 403 si elle n'est pas à l'étudiant. */
    @Transactional
    public MessageResponse annuler(Long etudiantId, Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable."));
        if (!inscription.getEtudiant().getId().equals(etudiantId)) {
            throw new ForbiddenException("Vous ne pouvez annuler que vos propres inscriptions.");
        }

        inscription.setStatut(Inscription.Statut.ANNULE);
        inscriptionRepository.save(inscription);
        return new MessageResponse("Inscription annulée avec succès.");
    }
}
