package config;

import entity.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import repository.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Chargeur de donnees de demonstration.
 * <ul>
 *   <li>Ne supprime jamais rien (aucun deleteAll).</li>
 *   <li>Ne charge le jeu de demo que si la table des utilisateurs est vide.</li>
 *   <li>Desactivable avec app.seed.enabled=false (variable APP_SEED_ENABLED=false).</li>
 *   <li>Le compte admin n'est cree que si ADMIN_PASSWORD est defini (jamais de mot de passe en dur).</li>
 * </ul>
 * Toutes les personnes sont fictives et utilisent des adresses @example.com.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataLoader implements CommandLineRunner {

    // Mots de passe des comptes de DEMO uniquement (personnes fictives).
    private static final String DEMO_FORMATEUR_PASSWORD = "formateur123";
    private static final String DEMO_ETUDIANT_PASSWORD = "etudiant123";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SpecialiteRepository specialiteRepository;
    private final GroupeRepository groupeRepository;
    private final SalleRepository salleRepository;
    private final SessionPedagogiqueRepository sessionPedagogiqueRepository;
    private final FormateurRepository formateurRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final SeanceRepository seanceRepository;
    private final InscriptionRepository inscriptionRepository;
    private final NoteRepository noteRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final PlatformTransactionManager transactionManager;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // Tout ou rien : en cas d'erreur, rien n'est conserve et le prochain demarrage reessaie.
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> seed());
    }

    private void seed() {
        boolean usersExist = userRepository.count() > 0;

        Role adminRole = findOrCreateRole(Role.RoleName.ADMIN);
        Role formateurRole = findOrCreateRole(Role.RoleName.FORMATEUR);
        Role etudiantRole = findOrCreateRole(Role.RoleName.ETUDIANT);

        createAdminIfMissing(adminRole);

        if (usersExist) {
            log.info("[DemoDataLoader] Des utilisateurs existent deja : jeu de demo non charge (aucune donnee modifiee).");
            return;
        }

        log.info("[DemoDataLoader] Base vide : chargement du jeu de demonstration...");

        // ========== SPECIALITES ==========
        Specialite specDSI = specialiteRepository.save(new Specialite(null, "Développement des Systèmes d'Information", new HashSet<>()));
        Specialite specRSI = specialiteRepository.save(new Specialite(null, "Réseaux et Systèmes Informatiques", new HashSet<>()));
        Specialite specMDW = specialiteRepository.save(new Specialite(null, "Multimédia et Développement Web", new HashSet<>()));
        Specialite specSEC = specialiteRepository.save(new Specialite(null, "Sécurité Informatique", new HashSet<>()));
        Specialite specIA = specialiteRepository.save(new Specialite(null, "Intelligence Artificielle", new HashSet<>()));
        Specialite[] specs = {specDSI, specRSI, specMDW, specSEC, specIA};

        // ========== SESSIONS PEDAGOGIQUES ==========
        sessionPedagogiqueRepository.save(new SessionPedagogique(null, "2024-2025", "Semestre 1", new HashSet<>()));
        sessionPedagogiqueRepository.save(new SessionPedagogique(null, "2024-2025", "Semestre 2", new HashSet<>()));
        SessionPedagogique session2025S1 = sessionPedagogiqueRepository.save(new SessionPedagogique(null, "2025-2026", "Semestre 1", new HashSet<>()));
        sessionPedagogiqueRepository.save(new SessionPedagogique(null, "2025-2026", "Semestre 2", new HashSet<>()));

        // ========== SALLES ==========
        salleRepository.save(new Salle(null, "A01 - Amphithéâtre", 120, new HashSet<>()));
        Salle salleB02 = salleRepository.save(new Salle(null, "B02 - Salle de cours", 40, new HashSet<>()));
        Salle salleC03 = salleRepository.save(new Salle(null, "C03 - Salle de cours", 35, new HashSet<>()));
        Salle salleD04 = salleRepository.save(new Salle(null, "D04 - Labo Informatique", 25, new HashSet<>()));
        Salle salleE05 = salleRepository.save(new Salle(null, "E05 - Labo Réseaux", 20, new HashSet<>()));
        Salle salleF06 = salleRepository.save(new Salle(null, "F06 - Salle Multimédia", 30, new HashSet<>()));
        Salle salleG07 = salleRepository.save(new Salle(null, "G07 - Salle de TP", 28, new HashSet<>()));

        // ========== FORMATEURS (fictifs) : {username, nom, prenom, index specialite} ==========
        String[][] formateursData = {
                {"amira.bensalah", "Ben Salah", "Amira", "0"},
                {"yassine.trabelsi", "Trabelsi", "Yassine", "0"},
                {"ons.mejri", "Mejri", "Ons", "0"},
                {"mehdi.jebali", "Jebali", "Mehdi", "1"},
                {"rim.gharbi", "Gharbi", "Rim", "1"},
                {"aymen.sassi", "Sassi", "Aymen", "2"},
                {"salma.hamdi", "Hamdi", "Salma", "2"},
                {"oussama.chaabane", "Chaabane", "Oussama", "3"},
                {"nour.khelifi", "Khelifi", "Nour", "3"},
                {"wissem.ayari", "Ayari", "Wissem", "4"},
                {"hela.bouzid", "Bouzid", "Hela", "4"},
                {"karim.dridi", "Dridi", "Karim", "4"}
        };
        List<Formateur> formateurs = new ArrayList<>();
        for (String[] d : formateursData) {
            formateurs.add(createFormateur(d[0], d[1], d[2], specs[Integer.parseInt(d[3])], formateurRole));
        }

        // ========== COURS : {code, titre, description, volume horaire, index formateur} ==========
        Object[][] coursData = {
                {"INF101", "Analyse et Conception UML", "Diagrammes UML, Design Patterns", 30, 0},
                {"INF102", "Algorithmique Avancée", "Complexité, Graphes, Programmation dynamique", 35, 1},
                {"INF201", "Programmation Java Avancée", "POO, Collections, Streams, Spring Boot", 45, 0},
                {"INF202", "Bases de Données Avancées", "SQL, PL/SQL, Optimisation, NoSQL", 40, 2},
                {"INF203", "Développement Web Full Stack", "HTML5, CSS3, JavaScript, Angular, Node.js", 50, 5},
                {"INF204", "Développement Mobile", "Android, Flutter, API REST, publication d'applications", 40, 1},
                {"WEB201", "Design d'Interfaces et UX", "Maquettage, ergonomie, accessibilité, Figma", 30, 6},
                {"WEB202", "Intégration Multimédia", "Image, vidéo, animation, optimisation des médias", 35, 6},
                {"RSI201", "Administration Réseaux", "TCP/IP, Routage, VLAN, Firewall", 40, 3},
                {"RSI202", "Administration Linux", "Shell, Services, Sécurité système", 35, 4},
                {"RSI203", "Virtualisation et Cloud", "Hyperviseurs, Docker, Kubernetes, services cloud", 30, 3},
                {"SEC301", "Sécurité des SI", "Cryptographie, PKI, Audit sécurité", 40, 7},
                {"SEC302", "Tests d'Intrusion", "Reconnaissance, exploitation, rapport de pentest", 35, 8},
                {"SEC303", "Cryptographie Appliquée", "Chiffrement symétrique et asymétrique, signatures, TLS", 30, 7},
                {"IA301", "Machine Learning", "Régression, Classification, Clustering", 45, 9},
                {"IA302", "Deep Learning", "CNN, RNN, Transformers, TensorFlow", 50, 10},
                {"IA303", "Big Data et Traitement de Données", "Hadoop, Spark, pipelines de données", 40, 11},
                {"GP101", "Gestion de Projet Agile", "Scrum, Kanban, planification, gestion des risques", 25, 2},
                {"ANG101", "Anglais Technique", "Vocabulaire IT, documentation, entretiens en anglais", 24, 8},
                {"COM101", "Communication Professionnelle", "Expression orale, rédaction, travail en équipe", 20, 11}
        };
        List<Cours> cours = new ArrayList<>();
        for (Object[] d : coursData) {
            cours.add(createCours((String) d[0], (String) d[1], (String) d[2], (Integer) d[3], formateurs.get((Integer) d[4])));
        }

        // ========== GROUPES : {nom, index specialite, index cours} (1 groupe = 1 cours) ==========
        Object[][] groupesData = {
                {"DSI-L2-G1", 0, 2},
                {"DSI-L2-G2", 0, 3},
                {"DSI-L3-G1", 0, 1},
                {"RSI-L2-G1", 1, 8},
                {"RSI-L2-G2", 1, 9},
                {"MDW-L3-G1", 2, 4},
                {"MDW-L3-G2", 2, 6},
                {"SEC-M1-G1", 3, 11},
                {"IA-M1-G1", 4, 14},
                {"IA-M1-G2", 4, 15}
        };
        List<Groupe> groupes = new ArrayList<>();
        for (Object[] d : groupesData) {
            groupes.add(createGroupe((String) d[0], session2025S1, specs[(Integer) d[1]], cours.get((Integer) d[2])));
        }

        // ========== ETUDIANTS (fictifs) : {username, nom, prenom}, 4 par groupe ==========
        String[][] etudiantsData = {
                {"sirine.belhadj", "Belhadj", "Sirine"},
                {"walid.mansouri", "Mansouri", "Walid"},
                {"ghada.ferchichi", "Ferchichi", "Ghada"},
                {"bilel.cherif", "Cherif", "Bilel"},
                {"nesrine.dhouib", "Dhouib", "Nesrine"},
                {"slim.karray", "Karray", "Slim"},
                {"eya.laabidi", "Laabidi", "Eya"},
                {"hamza.ouni", "Ouni", "Hamza"},
                {"maram.zargouni", "Zargouni", "Maram"},
                {"skander.baccouche", "Baccouche", "Skander"},
                {"fatma.souissi", "Souissi", "Fatma"},
                {"anis.rekik", "Rekik", "Anis"},
                {"yasmine.bouaziz", "Bouaziz", "Yasmine"},
                {"marwen.jlassi", "Jlassi", "Marwen"},
                {"lamia.tlili", "Tlili", "Lamia"},
                {"achref.msallem", "Msallem", "Achref"},
                {"amal.nasri", "Nasri", "Amal"},
                {"rami.hammami", "Hammami", "Rami"},
                {"dorra.kallel", "Kallel", "Dorra"},
                {"houssem.bahri", "Bahri", "Houssem"},
                {"cyrine.mabrouk", "Mabrouk", "Cyrine"},
                {"zied.krifa", "Krifa", "Zied"},
                {"ichraf.moalla", "Moalla", "Ichraf"},
                {"amine.ghanmi", "Ghanmi", "Amine"},
                {"chaima.benyoussef", "Ben Youssef", "Chaima"},
                {"khalil.benamor", "Ben Amor", "Khalil"},
                {"rahma.bennasr", "Ben Nasr", "Rahma"},
                {"firas.benhassen", "Ben Hassen", "Firas"},
                {"emna.tebourbi", "Tebourbi", "Emna"},
                {"haythem.lahmar", "Lahmar", "Haythem"},
                {"mariem.selmi", "Selmi", "Mariem"},
                {"nizar.benothman", "Ben Othman", "Nizar"},
                {"wafa.chebbi", "Chebbi", "Wafa"},
                {"seifeddine.gasmi", "Gasmi", "Seifeddine"},
                {"takwa.boukadida", "Boukadida", "Takwa"},
                {"ramzi.hajji", "Hajji", "Ramzi"},
                {"asma.brahmi", "Brahmi", "Asma"},
                {"mourad.zaied", "Zaied", "Mourad"},
                {"ikram.daoud", "Daoud", "Ikram"},
                {"chiheb.benrejeb", "Ben Rejeb", "Chiheb"}
        };
        List<Etudiant> etudiants = new ArrayList<>();
        for (int i = 0; i < etudiantsData.length; i++) {
            String[] d = etudiantsData[i];
            etudiants.add(createEtudiant(d[0], String.format("ETU2025%03d", i + 1), d[1], d[2],
                    groupes.get(i / 4), etudiantRole));
        }

        // ========== SEANCES (2 semaines relatives a aujourd'hui) ==========
        // 10 creneaux par semaine (5 jours x matin/apres-midi). Chaque groupe a 2 seances/semaine
        // aux creneaux g et (g+5)%10 : chaque creneau accueille exactement 2 groupes (g et g+5),
        // de formateurs differents et de salles differentes (voir sallesGroupes).
        Salle[] sallesGroupes = {salleD04, salleB02, salleC03, salleE05, salleG07,
                salleF06, salleC03, salleB02, salleD04, salleB02};
        LocalDate lundi = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalTime matinDebut = LocalTime.of(8, 30), matinFin = LocalTime.of(11, 30);
        LocalTime apremDebut = LocalTime.of(13, 0), apremFin = LocalTime.of(16, 0);
        for (int semaine = 0; semaine < 2; semaine++) {
            LocalDate l = lundi.plusWeeks(semaine);
            for (int g = 0; g < groupes.size(); g++) {
                for (int slot : new int[]{g, (g + 5) % 10}) {
                    boolean matin = slot % 2 == 0;
                    createSeance(l.plusDays(slot / 2), matin ? matinDebut : apremDebut, matin ? matinFin : apremFin,
                            groupes.get(g), sallesGroupes[g]);
                }
            }
        }

        // ========== INSCRIPTIONS (cours du groupe + 1 ou 2 autres cours) ==========
        int[] groupeCoursIdx = new int[groupes.size()];
        for (int g = 0; g < groupes.size(); g++) {
            groupeCoursIdx[g] = (Integer) groupesData[g][2];
        }
        List<List<Cours>> coursInscrits = new ArrayList<>();
        for (int i = 0; i < etudiants.size(); i++) {
            Map<Integer, Inscription.Statut> choix = new LinkedHashMap<>();
            choix.put(groupeCoursIdx[i / 4], Inscription.Statut.INSCRIT);
            int extra1 = (i * 3 + 1) % cours.size();
            if (!choix.containsKey(extra1)) {
                choix.put(extra1, i % 8 == 3 ? Inscription.Statut.ANNULE : Inscription.Statut.INSCRIT);
            }
            if (i % 2 == 0) {
                int extra2 = (i * 7 + 5) % cours.size();
                if (!choix.containsKey(extra2)) {
                    choix.put(extra2, Inscription.Statut.INSCRIT);
                }
            }
            List<Cours> actifs = new ArrayList<>();
            for (Map.Entry<Integer, Inscription.Statut> e : choix.entrySet()) {
                createInscription(etudiants.get(i), cours.get(e.getKey()), e.getValue());
                if (e.getValue() != Inscription.Statut.ANNULE) {
                    actifs.add(cours.get(e.getKey()));
                }
            }
            coursInscrits.add(actifs);
        }

        // ========== NOTES (2 a 3 par inscription active, valeurs deterministes entre 8 et 19) ==========
        String[] intitules = {"Contrôle Continu 1", "Examen TP", "Projet", "Contrôle Continu 2"};
        for (int i = 0; i < etudiants.size(); i++) {
            List<Cours> actifs = coursInscrits.get(i);
            for (int c = 0; c < actifs.size(); c++) {
                int nbNotes = 2 + (i + c) % 2;
                for (int n = 0; n < nbNotes; n++) {
                    double valeur = 8 + ((i * 7 + c * 5 + n * 3) % 23) / 2.0;
                    createNote(etudiants.get(i), actifs.get(c), valeur, intitules[(i + c + n) % intitules.length]);
                }
            }
        }

        // ========== NOTIFICATIONS DE DEMO ==========
        int[] notifFormateurs = {0, 3, 5, 7, 9};
        for (int idx : notifFormateurs) {
            Formateur f = formateurs.get(idx);
            String nomComplet = f.getPrenom() + " " + f.getNom();
            createNotification(f, nomComplet, f.getEmail(), "Bienvenue sur la plateforme",
                    "Votre espace formateur est prêt. Vous pouvez consulter votre planning et saisir les notes de vos groupes.", 3);
        }
        Formateur premier = formateurs.get(0);
        createNotification(premier, premier.getPrenom() + " " + premier.getNom(), premier.getEmail(),
                "Planning de la semaine",
                "Vos séances du groupe DSI-L2-G1 ont lieu lundi matin et mercredi après-midi en salle D04.", 1);
        // Notifications supplémentaires pour les formateurs (dont une déjà lue, pour illustrer lu / non lu)
        createNotification(premier, premier.getPrenom() + " " + premier.getNom(), premier.getEmail(),
                "Notes à vérifier",
                "Pensez à vérifier les notes saisies cette semaine avant la clôture de la session.", 0);
        Formateur formateurTrois = formateurs.get(3);
        createNotification(formateurTrois, formateurTrois.getPrenom() + " " + formateurTrois.getNom(), formateurTrois.getEmail(),
                "Séance modifiée",
                "Une de vos séances de la semaine a changé de salle. Consultez votre emploi du temps.", 1);
        Formateur formateurCinq = formateurs.get(5);
        createNotification(formateurCinq, formateurCinq.getPrenom() + " " + formateurCinq.getNom(), formateurCinq.getEmail(),
                "Nouveau groupe affecté",
                "Un nouveau groupe vous a été affecté. Retrouvez ses étudiants dans la rubrique Groupes.", 2);
        createNotification(formateurCinq, formateurCinq.getPrenom() + " " + formateurCinq.getNom(), formateurCinq.getEmail(),
                "Rappel : planning du mois",
                "Le planning du mois est publié. Il est consultable dans la rubrique Emploi du temps.", 6, true);
        int[] notifEtudiants = {0, 1, 8, 20};
        for (int idx : notifEtudiants) {
            Etudiant e = etudiants.get(idx);
            createNotification(e, e.getPrenom() + " " + e.getNom(), e.getEmail(), "Bienvenue sur la plateforme",
                    "Votre inscription au groupe " + e.getGroupe().getNom() + " est confirmée.", 2);
        }
        Etudiant premierEtu = etudiants.get(0);
        createNotification(premierEtu, premierEtu.getPrenom() + " " + premierEtu.getNom(), premierEtu.getEmail(),
                "Nouvelle note disponible",
                "Une note a été publiée pour le cours " + premierEtu.getGroupe().getCours().getTitre() + ".", 0);

        log.info("[DemoDataLoader] Jeu de demonstration charge : {} utilisateurs, {} cours, {} groupes, {} seances.",
                userRepository.count(), coursRepository.count(), groupeRepository.count(), seanceRepository.count());
    }

    // ========== METHODES UTILITAIRES ==========

    private Role findOrCreateRole(Role.RoleName name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            return roleRepository.save(role);
        });
    }

    private void createAdminIfMissing(Role adminRole) {
        if (userRepository.findByUsername("admin").isPresent()) {
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("[DemoDataLoader] ADMIN_PASSWORD n'est pas defini : le compte 'admin' n'est PAS cree. "
                    + "Definissez la variable d'environnement ADMIN_PASSWORD puis redemarrez pour le creer.");
            return;
        }
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setEnabled(true);
        admin.setDateCreation(LocalDate.now());
        admin.setRoles(new HashSet<>(Set.of(adminRole)));
        userRepository.save(admin);
        log.info("[DemoDataLoader] Compte 'admin' cree (mot de passe issu de ADMIN_PASSWORD).");
    }

    private Formateur createFormateur(String username, String nom, String prenom, Specialite specialite, Role role) {
        Formateur f = new Formateur();
        f.setUsername(username);
        f.setPassword(passwordEncoder.encode(DEMO_FORMATEUR_PASSWORD));
        f.setEnabled(true);
        f.setDateCreation(LocalDate.now());
        f.setRoles(new HashSet<>(Set.of(role)));
        f.setNom(nom);
        f.setPrenom(prenom);
        f.setEmail(username + "@example.com");
        f.setSpecialite(specialite);
        return formateurRepository.save(f);
    }

    private Cours createCours(String code, String titre, String description, int volumeHoraire, Formateur formateur) {
        Cours c = new Cours();
        c.setCode(code);
        c.setTitre(titre);
        c.setDescription(description);
        c.setVolumeHoraire(volumeHoraire);
        c.setFormateur(formateur);
        return coursRepository.save(c);
    }

    private Groupe createGroupe(String nom, SessionPedagogique session, Specialite specialite, Cours cours) {
        Groupe g = new Groupe();
        g.setNom(nom);
        g.setSessionPedagogique(session);
        g.setSpecialite(specialite);
        g.setCours(cours);
        g.setFormateur(cours.getFormateur());
        return groupeRepository.save(g);
    }

    private Etudiant createEtudiant(String username, String matricule, String nom, String prenom, Groupe groupe, Role role) {
        Etudiant e = new Etudiant();
        e.setUsername(username);
        e.setPassword(passwordEncoder.encode(DEMO_ETUDIANT_PASSWORD));
        e.setEnabled(true);
        e.setDateCreation(LocalDate.now());
        e.setRoles(new HashSet<>(Set.of(role)));
        e.setMatricule(matricule);
        e.setNom(nom);
        e.setPrenom(prenom);
        e.setEmail(username + "@example.com");
        e.setDateInscription(LocalDate.now().minusWeeks(6));
        e.setGroupe(groupe);
        return etudiantRepository.save(e);
    }

    private void createSeance(LocalDate date, LocalTime debut, LocalTime fin, Groupe groupe, Salle salle) {
        Seance s = new Seance();
        s.setDate(date);
        s.setHeureDebut(debut);
        s.setHeureFin(fin);
        s.setCours(groupe.getCours());
        s.setFormateur(groupe.getFormateur());
        s.setSalle(salle);
        s.setGroupe(groupe);
        seanceRepository.save(s);
    }

    private void createInscription(Etudiant etudiant, Cours cours, Inscription.Statut statut) {
        Inscription i = new Inscription();
        i.setDateInscription(LocalDate.now().minusWeeks(5));
        i.setStatut(statut);
        i.setEtudiant(etudiant);
        i.setCours(cours);
        inscriptionRepository.save(i);
    }

    private void createNote(Etudiant etudiant, Cours cours, double valeur, String session) {
        Note n = new Note();
        n.setValeur(valeur);
        n.setSession(session);
        n.setEtudiant(etudiant);
        n.setCours(cours);
        n.setFormateurId(cours.getFormateur().getId());
        noteRepository.save(n);
    }

    private void createNotification(User user, String nom, String email, String sujet, String message, int joursAvant) {
        createNotification(user, nom, email, sujet, message, joursAvant, false);
    }

    private void createNotification(User user, String nom, String email, String sujet, String message, int joursAvant, boolean lu) {
        Notification n = new Notification();
        n.setLu(lu);
        n.setUser(user);
        n.setDestinataireNom(nom);
        n.setDestinataireEmail(email);
        n.setSujet(sujet);
        n.setMessage(message);
        n.setType(Notification.Type.SYSTEM);
        n.setStatut(Notification.Statut.ENVOYE);
        n.setDateEnvoi(LocalDateTime.now().minusDays(joursAvant));
        notificationRepository.save(n);
    }
}
