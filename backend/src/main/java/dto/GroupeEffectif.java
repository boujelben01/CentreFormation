package dto;

/** Résultat de la requête agrégée des groupes d'un formateur (effectif calculé en base). */
public record GroupeEffectif(Long id, String nom, Long coursId, String coursCode, String coursTitre, Long effectif) {
}
