package service.etudiant;

import dto.InscriptionResponse;
import dto.MessageResponse;
import entity.Cours;
import entity.Etudiant;
import entity.Inscription;
import exception.ConflictException;
import exception.ForbiddenException;
import exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.CoursRepository;
import repository.EtudiantRepository;
import repository.InscriptionRepository;
import service.common.CoursFormateurResolver;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EtudiantInscriptionServiceTest {

    @Mock private InscriptionRepository inscriptionRepository;
    @Mock private CoursRepository coursRepository;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private CoursFormateurResolver formateurResolver;
    @InjectMocks private EtudiantInscriptionService service;

    private Cours cours() {
        Cours c = new Cours();
        c.setId(10L);
        c.setCode("INF101");
        c.setTitre("Analyse et Conception UML");
        return c;
    }

    private Etudiant etudiant(Long id) {
        Etudiant e = new Etudiant();
        e.setId(id);
        return e;
    }

    private Inscription inscription(Long id, Long etudiantId, Inscription.Statut statut) {
        Inscription i = new Inscription();
        i.setId(id);
        i.setEtudiant(etudiant(etudiantId));
        i.setCours(cours());
        i.setStatut(statut);
        return i;
    }

    @Test
    void inscrire_coursInexistant_404() {
        when(coursRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.inscrire(1L, 10L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Cours introuvable.");
        verify(inscriptionRepository, never()).save(any());
    }

    @Test
    void inscrire_dejaInscrit_409() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours()));
        when(inscriptionRepository.findByEtudiantIdAndCoursId(1L, 10L))
                .thenReturn(Optional.of(inscription(5L, 1L, Inscription.Statut.INSCRIT)));

        assertThatThrownBy(() -> service.inscrire(1L, 10L))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Vous êtes déjà inscrit à ce cours.");
    }

    @Test
    void inscrire_inscriptionDejaAnnulee_409AvecMessageDedie() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours()));
        when(inscriptionRepository.findByEtudiantIdAndCoursId(1L, 10L))
                .thenReturn(Optional.of(inscription(5L, 1L, Inscription.Statut.ANNULE)));

        assertThatThrownBy(() -> service.inscrire(1L, 10L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("annulée");
    }

    @Test
    void inscrire_coursExistant_creeUneInscriptionEnAttente() {
        when(coursRepository.findById(10L)).thenReturn(Optional.of(cours()));
        when(inscriptionRepository.findByEtudiantIdAndCoursId(1L, 10L)).thenReturn(Optional.empty());
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant(1L)));
        when(inscriptionRepository.save(any(Inscription.class))).thenAnswer(inv -> {
            Inscription i = inv.getArgument(0);
            i.setId(77L);
            return i;
        });

        InscriptionResponse response = service.inscrire(1L, 10L);

        assertThat(response.getInscriptionId()).isEqualTo(77L);
        assertThat(response.getStatut()).isEqualTo("EN_ATTENTE");
        assertThat(response.getCoursCode()).isEqualTo("INF101");
    }

    @Test
    void annuler_inscriptionInconnue_404() {
        when(inscriptionRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.annuler(1L, 5L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Inscription introuvable.");
    }

    @Test
    void annuler_inscriptionDunAutreEtudiant_403_etStatutInchange() {
        Inscription autre = inscription(5L, 2L, Inscription.Statut.INSCRIT);
        when(inscriptionRepository.findById(5L)).thenReturn(Optional.of(autre));

        assertThatThrownBy(() -> service.annuler(1L, 5L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Vous ne pouvez annuler que vos propres inscriptions.");
        assertThat(autre.getStatut()).isEqualTo(Inscription.Statut.INSCRIT);
        verify(inscriptionRepository, never()).save(any());
    }

    @Test
    void annuler_saPropreInscription_passeAAnnule() {
        Inscription mienne = inscription(5L, 1L, Inscription.Statut.INSCRIT);
        when(inscriptionRepository.findById(5L)).thenReturn(Optional.of(mienne));

        MessageResponse response = service.annuler(1L, 5L);

        assertThat(mienne.getStatut()).isEqualTo(Inscription.Statut.ANNULE);
        assertThat(response.message()).isEqualTo("Inscription annulée avec succès.");
        verify(inscriptionRepository).save(mienne);
    }
}
