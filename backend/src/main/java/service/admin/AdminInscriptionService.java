package service.admin;

import entity.Inscription;
import entity.Etudiant;
import entity.Groupe;
import repository.InscriptionRepository;
import repository.EtudiantRepository;
import repository.GroupeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminInscriptionService {
    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final GroupeRepository groupeRepository;
    private final EmailService emailService;

    public Inscription addInscription(Inscription inscription) {
        return inscriptionRepository.save(inscription);
    }

    public void deleteInscription(Long id) {
        inscriptionRepository.findById(id).orElseThrow(() -> new RuntimeException("Inscription not found"));
        inscriptionRepository.deleteById(id);
    }

    public List<Inscription> listInscriptions() {
        return inscriptionRepository.findAll();
    }

    public Inscription getInscription(Long id) {
        return inscriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inscription not found with id: " + id));
    }

    public Inscription updateInscriptionStatut(Long id, Inscription.Statut statut) {
        Inscription inscription = getInscription(id);
        inscription.setStatut(statut);
        return inscriptionRepository.save(inscription);
    }

    public void affecterEtudiantAGroupe(Long inscriptionId, Long groupeId) {
        Inscription inscription = getInscription(inscriptionId);
        Groupe groupe = groupeRepository.findById(groupeId)
            .orElseThrow(() -> new RuntimeException("Groupe not found with id: " + groupeId));
        
        Etudiant etudiant = inscription.getEtudiant();
        etudiant.setGroupe(groupe);
        etudiantRepository.save(etudiant);
        
        // Envoyer l'email de confirmation d'inscription avec le groupe affecté
        try {
            String coursName = inscription.getCours() != null ? inscription.getCours().getTitre() : "Cours";
            String formateurName = groupe.getFormateur() != null ? 
                groupe.getFormateur().getPrenom() + " " + groupe.getFormateur().getNom() : "Formateur";
            String studentName = etudiant.getPrenom() + " " + etudiant.getNom();
            String groupeName = groupe.getNom();
            
            boolean emailSent = emailService.sendInscriptionNotification(
                etudiant.getEmail(),
                studentName,
                coursName,
                formateurName,
                groupeName
            );
            
            if (emailSent) {
                System.out.println("✅ Email d'inscription envoyé à: " + etudiant.getEmail());
            } else {
                System.err.println("❌ Échec de l'envoi de l'email d'inscription à: " + etudiant.getEmail());
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email d'inscription: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
