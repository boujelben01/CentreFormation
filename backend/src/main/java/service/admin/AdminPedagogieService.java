package service.admin;

import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPedagogieService {
        private final SessionPedagogiqueRepository sessionPedagogiqueRepository;
        public List<SessionPedagogique> listSessions() {
            return sessionPedagogiqueRepository.findAll();
        }

        public SessionPedagogique addSession(SessionPedagogique session) {
            return sessionPedagogiqueRepository.save(session);
        }

        public SessionPedagogique getSessionById(Long id) {
            return sessionPedagogiqueRepository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        }

        public void deleteSession(Long id) {
            sessionPedagogiqueRepository.deleteById(id);
        }
    private final GroupeRepository groupeRepository;
    private final SpecialiteRepository specialiteRepository;
    private final SalleRepository salleRepository;
    private final SeanceRepository seanceRepository;
    private final CoursRepository coursRepository;
    private final FormateurRepository formateurRepository;
    private final EtudiantRepository etudiantRepository;

    public Groupe addGroupe(Groupe groupe) {
        if (groupe.getSpecialite() != null) {
            specialiteRepository.findById(groupe.getSpecialite().getId())
                .orElseThrow(() -> new RuntimeException("Specialite not found"));
        }
        return groupeRepository.save(groupe);
    }

    public Specialite addSpecialite(Specialite specialite) {
        return specialiteRepository.save(specialite);
    }

    public Salle addSalle(Salle salle) {
        return salleRepository.save(salle);
    }

    public Seance addSeance(Seance seance) {
        if (seance.getSalle() != null) {
            salleRepository.findById(seance.getSalle().getId())
                .orElseThrow(() -> new RuntimeException("Salle not found"));
        }
        if (seance.getGroupe() != null) {
            groupeRepository.findById(seance.getGroupe().getId())
                .orElseThrow(() -> new RuntimeException("Groupe not found"));
        }
        return seanceRepository.save(seance);
    }

    public Cours addCours(Cours cours) {
        if (cours.getFormateur() != null) {
            formateurRepository.findById(cours.getFormateur().getId())
                .orElseThrow(() -> new RuntimeException("Formateur not found"));
        }
        return coursRepository.save(cours);
    }

    public Formateur addFormateur(Formateur formateur) {
        return formateurRepository.save(formateur);
    }

    public Etudiant addEtudiant(Etudiant etudiant) {
        if (etudiant.getGroupe() != null) {
            groupeRepository.findById(etudiant.getGroupe().getId())
                .orElseThrow(() -> new RuntimeException("Groupe not found"));
        }
        return etudiantRepository.save(etudiant);
    }

    public List<Groupe> listGroupes() {
        return groupeRepository.findAll();
    }

    public List<Groupe> getGroupesByFormateur(Long formateurId) {
        return groupeRepository.findByFormateurId(formateurId);
    }

    public List<Specialite> listSpecialites() {
        return specialiteRepository.findAll();
    }

    public List<Salle> listSalles() {
        return salleRepository.findAll();
    }

    public List<Seance> listSeances() {
        return seanceRepository.findAll();
    }

    public List<Cours> listCours() {
        return coursRepository.findAll();
    }

    public List<Formateur> listFormateurs() {
        return formateurRepository.findAll();
    }

    public List<Etudiant> listEtudiants() {
        return etudiantRepository.findAll();
    }

    public void deleteGroupe(Long id) {
        groupeRepository.deleteById(id);
    }

    public void deleteSpecialite(Long id) {
        specialiteRepository.deleteById(id);
    }

    public void deleteSalle(Long id) {
        salleRepository.deleteById(id);
    }

    public void deleteSeance(Long id) {
        seanceRepository.deleteById(id);
    }

    public void deleteCours(Long id) {
        coursRepository.deleteById(id);
    }

    public Salle getSalleById(Long id) {
        return salleRepository.findById(id).orElseThrow(() -> new RuntimeException("Salle not found"));
    }

    public Seance getSeanceById(Long id) {
        return seanceRepository.findById(id).orElseThrow(() -> new RuntimeException("Seance not found"));
    }

    public Cours getCoursById(Long id) {
        return coursRepository.findById(id).orElseThrow(() -> new RuntimeException("Cours not found"));
    }

    public List<Groupe> getGroupesByCours(Long coursId) {
        return groupeRepository.findByCoursId(coursId);
    }

    public void affecterCoursAGroupe(Long coursId, Long groupeId) {
        Cours cours = coursRepository.findById(coursId)
            .orElseThrow(() -> new RuntimeException("Cours not found with id: " + coursId));
        Groupe groupe = groupeRepository.findById(groupeId)
            .orElseThrow(() -> new RuntimeException("Groupe not found with id: " + groupeId));
        
        groupe.setCours(cours);
        groupeRepository.save(groupe);
    }

    // ---------------------------------------------------------------------------------------------
    // Éditions sans perte : l'entité existante est chargée par id et SEULS les champs du formulaire
    // sont recopiés (spécialité et cours d'un groupe, etc. sont conservés). Une relation dont l'id
    // est absent (liste déroulante laissée sur « Sélectionner ») devient « aucune relation ».
    // ---------------------------------------------------------------------------------------------

    private static SessionPedagogique ref(SessionPedagogique s) { return s != null && s.getId() != null ? s : null; }
    private static Formateur ref(Formateur f) { return f != null && f.getId() != null ? f : null; }
    private static Cours ref(Cours c) { return c != null && c.getId() != null ? c : null; }
    private static Salle ref(Salle s) { return s != null && s.getId() != null ? s : null; }
    private static Groupe ref(Groupe g) { return g != null && g.getId() != null ? g : null; }

    public Groupe updateGroupe(Long id, Groupe form) {
        Groupe existing = groupeRepository.findById(id).orElseThrow(() -> new RuntimeException("Groupe not found with id: " + id));
        existing.setNom(form.getNom());
        existing.setSessionPedagogique(ref(form.getSessionPedagogique()));
        existing.setFormateur(ref(form.getFormateur()));
        return groupeRepository.save(existing);
    }

    public Cours updateCours(Long id, Cours form) {
        Cours existing = coursRepository.findById(id).orElseThrow(() -> new RuntimeException("Cours not found with id: " + id));
        Formateur formateur = ref(form.getFormateur());
        if (formateur != null) {
            formateurRepository.findById(formateur.getId()).orElseThrow(() -> new RuntimeException("Formateur not found"));
        }
        existing.setCode(form.getCode());
        existing.setTitre(form.getTitre());
        existing.setDescription(form.getDescription());
        existing.setVolumeHoraire(form.getVolumeHoraire());
        existing.setFormateur(formateur);
        return coursRepository.save(existing);
    }

    public SessionPedagogique updateSession(Long id, SessionPedagogique form) {
        SessionPedagogique existing = getSessionById(id);
        existing.setAnneeScolaire(form.getAnneeScolaire());
        existing.setSemestre(form.getSemestre());
        return sessionPedagogiqueRepository.save(existing);
    }

    public Specialite updateSpecialite(Long id, Specialite form) {
        Specialite existing = specialiteRepository.findById(id).orElseThrow(() -> new RuntimeException("Specialite not found with id: " + id));
        existing.setNom(form.getNom());
        return specialiteRepository.save(existing);
    }

    public Salle updateSalle(Long id, Salle form) {
        Salle existing = getSalleById(id);
        existing.setNom(form.getNom());
        existing.setCapacite(form.getCapacite());
        return salleRepository.save(existing);
    }

    public Seance updateSeance(Long id, Seance form) {
        Seance existing = getSeanceById(id);
        Salle salle = ref(form.getSalle());
        if (salle != null) {
            salleRepository.findById(salle.getId()).orElseThrow(() -> new RuntimeException("Salle not found"));
        }
        Groupe groupe = ref(form.getGroupe());
        if (groupe != null) {
            groupeRepository.findById(groupe.getId()).orElseThrow(() -> new RuntimeException("Groupe not found"));
        }
        existing.setDate(form.getDate());
        existing.setHeureDebut(form.getHeureDebut());
        existing.setHeureFin(form.getHeureFin());
        existing.setCours(ref(form.getCours()));
        existing.setFormateur(ref(form.getFormateur()));
        existing.setSalle(salle);
        existing.setGroupe(groupe);
        return seanceRepository.save(existing);
    }
}
