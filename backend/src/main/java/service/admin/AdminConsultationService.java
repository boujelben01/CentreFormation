package service.admin;

import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminConsultationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EtudiantRepository etudiantRepository;
    private final FormateurRepository formateurRepository;
    private final CoursRepository coursRepository;
    private final GroupeRepository groupeRepository;
    private final NoteRepository noteRepository;
    private final SpecialiteRepository specialiteRepository;
    private final InscriptionRepository inscriptionRepository;
    private final SeanceRepository seanceRepository;
    private final SalleRepository salleRepository;

    public List<Notification> listNotifications() {
        return notificationRepository.findAll();
    }

    public long countUsers() {
        return userRepository.count();
    }

    public long countEtudiants() {
        return etudiantRepository.count();
    }

    public long countFormateurs() {
        return formateurRepository.count();
    }

    public long countCours() {
        return coursRepository.count();
    }

    public long countGroupes() {
        return groupeRepository.count();
    }

    public long countNotes() {
        return noteRepository.count();
    }

    public long countInscriptions() {
        return inscriptionRepository.count();
    }

    public long countSeances() {
        return seanceRepository.count();
    }

    public long countSalles() {
        return salleRepository.count();
    }

    public long countSpecialites() {
        return specialiteRepository.count();
    }

    // Statistiques par spécialité
    public Map<String, Long> getEtudiantsParSpecialite() {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        return etudiants.stream()
            .filter(e -> e.getGroupe() != null && e.getGroupe().getSpecialite() != null)
            .collect(Collectors.groupingBy(
                e -> e.getGroupe().getSpecialite().getNom(),
                Collectors.counting()
            ));
    }

    // Cours par spécialité (via le formateur)
    public Map<String, Long> getCoursParSpecialite() {
        List<Cours> coursList = coursRepository.findAll();
        return coursList.stream()
            .filter(c -> c.getFormateur() != null && c.getFormateur().getSpecialite() != null)
            .collect(Collectors.groupingBy(
                c -> c.getFormateur().getSpecialite().getNom(),
                Collectors.counting()
            ));
    }

    // Moyenne par spécialité
    public Map<String, Double> getMoyenneParSpecialite() {
        List<Note> notes = noteRepository.findAll();
        return notes.stream()
            .filter(n -> n.getEtudiant() != null && n.getEtudiant().getGroupe() != null 
                    && n.getEtudiant().getGroupe().getSpecialite() != null && n.getValeur() != null)
            .collect(Collectors.groupingBy(
                n -> n.getEtudiant().getGroupe().getSpecialite().getNom(),
                Collectors.averagingDouble(Note::getValeur)
            ));
    }

    // Étudiants par groupe
    public Map<String, Long> getEtudiantsParGroupe() {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        return etudiants.stream()
            .filter(e -> e.getGroupe() != null)
            .collect(Collectors.groupingBy(
                e -> e.getGroupe().getNom(),
                Collectors.counting()
            ));
    }

    // Inscriptions par cours
    public Map<String, Long> getInscriptionsParCours() {
        List<Inscription> inscriptions = inscriptionRepository.findAll();
        return inscriptions.stream()
            .filter(i -> i.getCours() != null)
            .collect(Collectors.groupingBy(
                i -> i.getCours().getTitre(),
                Collectors.counting()
            ));
    }

    // Séances par formateur
    public Map<String, Long> getSeancesParFormateur() {
        List<Seance> seances = seanceRepository.findAll();
        return seances.stream()
            .filter(s -> s.getFormateur() != null)
            .collect(Collectors.groupingBy(
                s -> s.getFormateur().getPrenom() + " " + s.getFormateur().getNom(),
                Collectors.counting()
            ));
    }

    // Séances par salle
    public Map<String, Long> getSeancesParSalle() {
        List<Seance> seances = seanceRepository.findAll();
        return seances.stream()
            .filter(s -> s.getSalle() != null)
            .collect(Collectors.groupingBy(
                s -> s.getSalle().getNom(),
                Collectors.counting()
            ));
    }

    // Moyenne des notes par cours
    public Map<String, Double> getMoyenneParCours() {
        List<Note> notes = noteRepository.findAll();
        return notes.stream()
            .filter(n -> n.getCours() != null && n.getValeur() != null)
            .collect(Collectors.groupingBy(
                n -> n.getCours().getTitre(),
                Collectors.averagingDouble(Note::getValeur)
            ));
    }

    // Distribution des notes
    public Map<String, Long> getDistributionNotes() {
        List<Note> notes = noteRepository.findAll();
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("0-8", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() < 8).count());
        distribution.put("8-10", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() >= 8 && n.getValeur() < 10).count());
        distribution.put("10-12", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() >= 10 && n.getValeur() < 12).count());
        distribution.put("12-14", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() >= 12 && n.getValeur() < 14).count());
        distribution.put("14-16", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() >= 14 && n.getValeur() < 16).count());
        distribution.put("16-18", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() >= 16 && n.getValeur() < 18).count());
        distribution.put("18-20", notes.stream().filter(n -> n.getValeur() != null && n.getValeur() >= 18).count());
        return distribution;
    }

    // Cours par formateur
    public Map<String, Long> getCoursParFormateur() {
        List<Cours> coursList = coursRepository.findAll();
        return coursList.stream()
            .filter(c -> c.getFormateur() != null)
            .collect(Collectors.groupingBy(
                c -> c.getFormateur().getPrenom() + " " + c.getFormateur().getNom(),
                Collectors.counting()
            ));
    }

    // Formateurs par spécialité
    public Map<String, Long> getFormateursParSpecialite() {
        List<Formateur> formateurs = formateurRepository.findAll();
        return formateurs.stream()
            .filter(f -> f.getSpecialite() != null)
            .collect(Collectors.groupingBy(
                f -> f.getSpecialite().getNom(),
                Collectors.counting()
            ));
    }

    // Charge horaire par formateur (heures de séances)
    public Map<String, Integer> getChargeHoraireFormateur() {
        List<Seance> seances = seanceRepository.findAll();
        Map<String, Integer> result = new LinkedHashMap<>();
        
        for (Seance s : seances) {
            if (s.getFormateur() != null && s.getHeureDebut() != null && s.getHeureFin() != null) {
                String formateur = s.getFormateur().getPrenom() + " " + s.getFormateur().getNom();
                int duree = s.getHeureFin().getHour() - s.getHeureDebut().getHour();
                result.put(formateur, result.getOrDefault(formateur, 0) + duree);
            }
        }
        return result;
    }

    // Moyenne par groupe
    public Map<String, Double> getMoyenneParGroupe() {
        List<Note> notes = noteRepository.findAll();
        return notes.stream()
            .filter(n -> n.getEtudiant() != null && n.getEtudiant().getGroupe() != null && n.getValeur() != null)
            .collect(Collectors.groupingBy(
                n -> n.getEtudiant().getGroupe().getNom(),
                Collectors.averagingDouble(Note::getValeur)
            ));
    }

    // Taux de réussite par cours (% notes >= 10)
    public Map<String, Double> getTauxReussiteParCours() {
        List<Note> notes = noteRepository.findAll();
        Map<String, List<Note>> notesParCours = notes.stream()
            .filter(n -> n.getCours() != null && n.getValeur() != null)
            .collect(Collectors.groupingBy(n -> n.getCours().getTitre()));
        
        Map<String, Double> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<Note>> entry : notesParCours.entrySet()) {
            List<Note> coursNotes = entry.getValue();
            long reussites = coursNotes.stream().filter(n -> n.getValeur() >= 10).count();
            double taux = (reussites * 100.0) / coursNotes.size();
            result.put(entry.getKey(), Math.round(taux * 10.0) / 10.0);
        }
        return result;
    }

    // Liste des formateurs
    public List<Formateur> getFormateurs() {
        return formateurRepository.findAll();
    }

    // Liste des étudiants
    public List<Etudiant> getEtudiants() {
        return etudiantRepository.findAll();
    }

    // Liste des cours
    public List<Cours> getCours() {
        return coursRepository.findAll();
    }

    // Liste des groupes
    public List<Groupe> getGroupes() {
        return groupeRepository.findAll();
    }
}
