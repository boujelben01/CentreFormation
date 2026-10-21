package dto;

/** Étudiant d'un groupe, vu par son formateur. */
public record EtudiantGroupeResponse(Long id, String nom, String prenom, String matricule, String email) {
}
