package repository;

import entity.Cours;
import entity.Etudiant;
import entity.Formateur;
import entity.Groupe;
import entity.Inscription;
import entity.Note;
import entity.Notification;
import entity.Role;
import entity.Salle;
import entity.Seance;
import entity.SessionPedagogique;
import entity.Specialite;
import entity.User;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.parser.PartTree;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Valide, sans base de données, que les requêtes JPQL des repositories sont syntaxiquement et sémantiquement
 * correctes pour le modèle d'entités (dialecte PostgreSQL), et que les méthodes dérivées référencent des
 * propriétés existantes. Évite de découvrir une erreur de requête seulement au démarrage de l'application.
 */
class RepositoryQueriesTest {

    private static StandardServiceRegistry registry;
    private static SessionFactory sessionFactory;

    @BeforeAll
    static void bootHibernateWithoutConnection() {
        registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", "false")
                .build();
        MetadataSources sources = new MetadataSources(registry);
        for (Class<?> entity : List.of(User.class, Role.class, Etudiant.class, Formateur.class, Cours.class,
                Groupe.class, Inscription.class, Note.class, Notification.class, Salle.class, Seance.class,
                SessionPedagogique.class, Specialite.class)) {
            sources.addAnnotatedClass(entity);
        }
        sessionFactory = sources.buildMetadata().buildSessionFactory();
    }

    @AfterAll
    static void close() {
        if (sessionFactory != null) {
            sessionFactory.close();
        }
        if (registry != null) {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    @Test
    void toutesLesRequetesJpqlSontValides() {
        List<String> invalides = new ArrayList<>();
        int verifiees = 0;
        try (Session session = sessionFactory.openSession()) {
            for (Class<?> repository : List.of(NotificationRepository.class, GroupeRepository.class,
                    EtudiantRepository.class, CoursRepository.class, SeanceRepository.class, NoteRepository.class,
                    InscriptionRepository.class)) {
                for (Method method : repository.getDeclaredMethods()) {
                    Query query = method.getAnnotation(Query.class);
                    if (query == null) {
                        continue;
                    }
                    verifiees++;
                    try {
                        session.createQuery(query.value());
                    } catch (RuntimeException e) {
                        invalides.add(repository.getSimpleName() + "." + method.getName() + " : " + e.getMessage());
                    }
                }
            }
        }
        assertThat(verifiees).isGreaterThan(5);
        assertThat(invalides).as("requêtes JPQL invalides").isEmpty();
    }

    @Test
    void leValidateurRejetteUneRequeteIncorrecte() {
        try (Session session = sessionFactory.openSession()) {
            assertThatThrownBy(() -> session.createQuery("SELECT n FROM Notification n WHERE n.champInexistant = 1"))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    @Test
    void lesMethodesDeriveesReferencentDesProprietesExistantes() {
        assertThatCode(() -> {
            new PartTree("existsByFormateurIdAndCoursId", Groupe.class);
            new PartTree("existsByIdAndGroupeCoursId", Etudiant.class);
            new PartTree("existsByIdAndFormateurId", Cours.class);
            new PartTree("existsByEtudiantIdAndCoursIdAndStatut", Inscription.class);
            new PartTree("findByIdAndUserId", Notification.class);
            new PartTree("findByUserIdOrderByDateEnvoiDesc", Notification.class);
            new PartTree("findByEtudiantId", Inscription.class);
            new PartTree("findByGroupeIdOrderByDateAscHeureDebutAsc", Seance.class);
            new PartTree("findAvecDetailsByFormateurId", Seance.class);
            new PartTree("findAvecDetailsByGroupeIdOrderByDateAscHeureDebutAsc", Seance.class);
        }).doesNotThrowAnyException();
    }
}
