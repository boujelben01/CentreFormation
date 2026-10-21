package service.publique;

import dto.PublicCoursResponse;
import entity.Cours;
import entity.Formateur;
import entity.Specialite;
import exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.CoursRepository;
import service.common.CoursFormateurResolver;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicCoursServiceTest {

    @Mock private CoursRepository coursRepository;
    @Mock private CoursFormateurResolver resolver;

    private Cours cours(long id) {
        Cours c = new Cours();
        c.setId(id);
        c.setCode("JAVA-" + id);
        c.setTitre("Java avancé");
        c.setDescription("Programmation orientée objet");
        c.setVolumeHoraire(40);
        return c;
    }

    private Formateur formateur() {
        Specialite s = new Specialite();
        s.setNom("Informatique");
        Formateur f = new Formateur();
        f.setNom("Trabelsi");
        f.setPrenom("Karim");
        f.setEmail("karim@test.tn");
        f.setSpecialite(s);
        return f;
    }

    @Test
    void lister_expose_formateur_et_specialite_sans_email() {
        Cours c = cours(1);
        when(coursRepository.findAllAvecFormateur()).thenReturn(List.of(c));
        when(resolver.resoudre(any())).thenReturn(Map.of(1L, formateur()));

        List<PublicCoursResponse> result = new PublicCoursService(coursRepository, resolver).lister();

        assertThat(result).containsExactly(new PublicCoursResponse(
                1L, "JAVA-1", "Java avancé", "Programmation orientée objet", 40, "Karim", "Trabelsi", "Informatique"));
        assertThat(PublicCoursResponse.class.getRecordComponents())
                .extracting("name").doesNotContain("formateurEmail", "email");
    }

    @Test
    void cours_sans_formateur_a_des_champs_formateur_nuls() {
        when(coursRepository.findById(2L)).thenReturn(Optional.of(cours(2)));
        when(resolver.resoudre(any())).thenReturn(Map.of());

        PublicCoursResponse r = new PublicCoursService(coursRepository, resolver).trouver(2L);

        assertThat(r.formateurNom()).isNull();
        assertThat(r.specialite()).isNull();
    }

    @Test
    void trouver_inconnu_leve_404_en_francais() {
        when(coursRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new PublicCoursService(coursRepository, resolver).trouver(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Formation introuvable.");
    }
}
