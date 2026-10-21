// Contrats JSON de l'API Spring (voir le résumé de l'étape 5).

// ==================== ERREURS ====================

/** Corps de toutes les erreurs de /api/** : le message est en français et affichable tel quel. */
export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  timestamp?: string;
  /** Messages par champ pour un 400 de validation. */
  errors?: Record<string, string>;
}

// ==================== AUTH ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  type?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  userType: 'ETUDIANT' | 'FORMATEUR';
  matricule?: string;
  specialiteId?: number;
}

export interface RegisterResponse {
  message: string;
  username: string;
  userType: string;
  userId: number;
}

// ==================== PROFILS ====================

export interface ProfilEtudiant {
  id: number;
  username: string;
  matricule: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  dateInscription: string | null;
}

export interface ProfilFormateur {
  id: number;
  username: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  specialite: { id: number; nom: string } | null;
}

/** Corps de PUT /profile : seuls les champs renseignés sont modifiés. */
export interface UpdateProfileRequest {
  nom?: string;
  prenom?: string;
  password?: string;
}

// ==================== COURS ====================

/** GET /etudiant/cours et GET /formateur/cours */
export interface CoursResume {
  id: number;
  code: string;
  titre: string;
  description: string | null;
  volumeHoraire: number;
  formateurNom: string | null;
  formateurPrenom: string | null;
}

/** GET /etudiant/cours/disponibles : cours sans aucune inscription de l'étudiant. */
export interface CoursDisponible {
  coursId: number;
  code: string;
  titre: string;
  description: string | null;
  volumeHoraire: number;
  formateurNom: string | null;
  formateurPrenom: string | null;
  formateurEmail: string | null;
}

export type StatutInscription = 'INSCRIT' | 'EN_ATTENTE' | 'ANNULE';

/** GET /etudiant/catalogue : tous les cours, avec l'état de l'inscription de l'étudiant. */
export interface CatalogueCours extends CoursDisponible {
  inscriptionId: number | null;
  statutInscription: StatutInscription | null;
}

// ==================== INSCRIPTIONS ====================

export interface InscriptionRequest {
  coursId: number;
}

export interface InscriptionResponse {
  inscriptionId: number;
  coursId: number;
  coursCode: string;
  coursTitre: string;
  dateInscription: string;
  statut: StatutInscription;
  message: string;
}

/** GET /etudiant/inscriptions */
export interface InscriptionDetail {
  inscriptionId: number;
  dateInscription: string;
  statut: StatutInscription;
  coursId: number;
  coursCode: string;
  coursTitre: string;
  coursDescription: string | null;
  coursVolumeHoraire: number;
  formateurNom: string | null;
  formateurPrenom: string | null;
}

export interface MessageResponse {
  message: string;
}

// ==================== FORMATEURS (vus par un étudiant) ====================

export interface FormateurResume {
  id: number;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  specialite: string | null;
}

// ==================== PLANNING ====================

/** GET /etudiant/planning et GET /formateur/planning ; date « YYYY-MM-DD », heures « HH:mm:ss ». */
export interface PlanningSeance {
  id: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  coursId: number | null;
  coursCode: string | null;
  coursTitre: string | null;
  salleNom: string | null;
  groupeNom: string | null;
  formateurNom: string | null;
  formateurPrenom: string | null;
}

// ==================== NOTES ====================

/** GET /etudiant/notes (aucun coefficient ni date : moyenne simple uniquement). */
export interface NoteEtudiant {
  id: number;
  valeur: number;
  session: string | null;
  coursId: number | null;
  coursNom: string | null;
  coursCode: string | null;
  formateurId: number | null;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: number;
  sujet: string;
  message: string;
  dateEnvoi: string;
  type: 'EMAIL' | 'SYSTEM' | null;
  statut: 'EN_ATTENTE' | 'ENVOYE' | 'ECHEC' | null;
  lu: boolean;
}

export interface NotificationCount {
  count: number;
}

export interface NotificationsMarquees {
  marquees: number;
}

// ==================== ESPACE FORMATEUR ====================

/** Étudiant d'un groupe, vu par son formateur (aucune donnée de compte). */
export interface EtudiantGroupe {
  id: number;
  nom: string | null;
  prenom: string | null;
  matricule: string | null;
  email: string | null;
}

/** GET /formateur/groupes : l'effectif est calculé en base, les étudiants sont inclus. */
export interface GroupeFormateur {
  id: number;
  nom: string;
  coursId: number | null;
  coursCode: string | null;
  coursTitre: string | null;
  effectif: number;
  etudiants: EtudiantGroupe[];
}

/** GET /formateur/seances */
export interface SeanceFormateur {
  id: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  coursId: number | null;
  coursCode: string | null;
  coursTitre: string | null;
  groupeId: number | null;
  groupeNom: string | null;
  salleNom: string | null;
}

/** GET /formateur/notes, et réponse de POST / PUT /formateur/notes. */
export interface NoteFormateur {
  id: number;
  valeur: number;
  session: string | null;
  etudiantId: number | null;
  etudiantNom: string | null;
  etudiantPrenom: string | null;
  coursId: number | null;
  coursCode: string | null;
  coursNom: string | null;
  groupeNom: string | null;
  formateurId: number | null;
}

export interface NoteRequest {
  etudiantId: number;
  coursId: number;
  valeur: number;
  session?: string;
}

export interface NoteUpdateRequest {
  valeur: number;
  session?: string;
}

// ==================== SITE PUBLIC ====================

/** GET /public/cours et /public/cours/{id} : formation visible sans connexion (aucun contact du formateur). */
export interface PublicCours {
  id: number;
  code: string;
  titre: string;
  description: string | null;
  volumeHoraire: number;
  formateurPrenom: string | null;
  formateurNom: string | null;
  specialite: string | null;
}

/** POST /public/contact. `website` est le champ piège (laissé vide par les visiteurs). */
export interface ContactRequest {
  nom: string;
  email: string;
  sujet: string;
  message: string;
  website: string;
}
