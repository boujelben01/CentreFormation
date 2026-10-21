package com.iit.centreFormation;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ScannedGenericBeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.context.annotation.ComponentScan;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * L'application déclare ses packages scannés un par un (@ComponentScan). Un bean créé dans un nouveau
 * sous-package (ex. service.publique) serait alors introuvable au démarrage alors que les tests avec
 * services simulés passent. Ce test échoue dès qu'un @Component / @Service / @RestController / @Configuration
 * du code de production se trouve hors des packages scannés.
 */
class ComponentScanCoverageTest {

    private static final List<String> RACINES = List.of(
            "controller", "service", "security", "config", "repository", "exception", "dto");

    @Test
    void tous_les_beans_de_production_sont_dans_le_perimetre_du_scan() {
        List<String> scannes = Arrays.asList(
                CentreFormationApplication.class.getAnnotation(ComponentScan.class).value());

        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(true);
        List<String> horsPerimetre = new ArrayList<>();
        for (String racine : RACINES) {
            for (BeanDefinition bd : scanner.findCandidateComponents(racine)) {
                String classe = bd.getBeanClassName();
                if (estClasseDeTest(bd)) {
                    continue;
                }
                String pkg = classe.substring(0, classe.lastIndexOf('.'));
                boolean couvert = scannes.stream().anyMatch(s -> pkg.equals(s) || pkg.startsWith(s + "."));
                if (!couvert) {
                    horsPerimetre.add(classe);
                }
            }
        }

        assertThat(horsPerimetre)
                .as("Beans hors des packages de @ComponentScan (à ajouter dans CentreFormationApplication)")
                .isEmpty();
    }

    private static boolean estClasseDeTest(BeanDefinition bd) {
        return bd instanceof ScannedGenericBeanDefinition scanned
                && String.valueOf(scanned.getResource()).contains("test-classes");
    }
}
