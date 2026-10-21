package service.formateur;

import dto.EtudiantGroupeResponse;
import dto.GroupeEffectif;
import dto.GroupeResponse;
import entity.Formateur;
import entity.Groupe;
import exception.ForbiddenException;
import exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import repository.CoursRepository;
import repository.EtudiantRepository;
import repository.FormateurRepository;
import repository.GroupeRepository;
import repository.SeanceRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FormateurConsultationServiceTest {

    @Mock private GroupeRepository groupeRepository;
    @Mock private SeanceRepository seanceRepository;
    @Mock private EtudiantRepository etudiantRepository;
    @Mock private CoursRepository coursRepository;
    @Mock private FormateurRepository formateurRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private FormateurConsultationService service;

    private Groupe groupeDe(Long groupeId, Long formateurId) {
        Formateur f = new Formateur();
        f.setId(formateurId);
        Groupe g = new Groupe();
        g.setId(groupeId);
        g.setFormateur(f);
        return g;
    }

    @Test
    void etudiantsDuGroupe_groupeInconnu_404() {
        when(groupeRepository.findById(3L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getEtudiantsByGroupe(7L, 3L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Groupe introuvable.");
    }

    @Test
    void etudiantsDuGroupe_groupeDunAutreFormateur_403() {
        when(groupeRepository.findById(3L)).thenReturn(Optional.of(groupeDe(3L, 8L)));

        assertThatThrownBy(() -> service.getEtudiantsByGroupe(7L, 3L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Ce groupe ne fait pas partie de vos groupes.");
        verify(etudiantRepository, never()).findResumesByGroupeId(any());
    }

    @Test
    void etudiantsDuGroupe_groupeSansFormateur_403() {
        Groupe g = new Groupe();
        g.setId(3L);
        when(groupeRepository.findById(3L)).thenReturn(Optional.of(g));

        assertThatThrownBy(() -> service.getEtudiantsByGroupe(7L, 3L)).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void etudiantsDuGroupe_sonGroupe_retourneLesEtudiantsSansDonneeDeCompte() {
        EtudiantGroupeResponse amira = new EtudiantGroupeResponse(1L, "Ben Youssef", "Amira", "20240001", "amira@test.tn");
        when(groupeRepository.findById(3L)).thenReturn(Optional.of(groupeDe(3L, 7L)));
        when(etudiantRepository.findResumesByGroupeId(3L)).thenReturn(List.of(amira));

        assertThat(service.getEtudiantsByGroupe(7L, 3L)).containsExactly(amira);
    }

    @Test
    void groupes_assembleEffectifEtEtudiantsEnDeuxRequetes() {
        when(groupeRepository.findGroupesAvecEffectif(7L)).thenReturn(List.of(
                new GroupeEffectif(3L, "DSI-L2-G1", 10L, "INF101", "UML", 2L),
                new GroupeEffectif(4L, "DSI-L2-G2", 10L, "INF101", "UML", 0L)));
        when(etudiantRepository.findResumesByGroupeIdIn(any(Collection.class))).thenReturn(List.of(
                new Object[]{3L, 1L, "Ben Youssef", "Amira", "20240001", "amira@test.tn"},
                new Object[]{3L, 2L, "Trabelsi", "Sami", "20240002", "sami@test.tn"}));

        List<GroupeResponse> groupes = service.getGroupesByFormateur(7L);

        assertThat(groupes).hasSize(2);
        assertThat(groupes.get(0).effectif()).isEqualTo(2);
        assertThat(groupes.get(0).etudiants()).extracting(EtudiantGroupeResponse::prenom).containsExactly("Amira", "Sami");
        assertThat(groupes.get(1).effectif()).isZero();
        assertThat(groupes.get(1).etudiants()).isEmpty();
        verify(etudiantRepository).findResumesByGroupeIdIn(List.of(3L, 4L));
    }

    @Test
    void groupes_aucunGroupe_neFaitPasDeSecondeRequete() {
        when(groupeRepository.findGroupesAvecEffectif(7L)).thenReturn(List.of());

        assertThat(service.getGroupesByFormateur(7L)).isEmpty();
        verify(etudiantRepository, never()).findResumesByGroupeIdIn(any());
    }
}
