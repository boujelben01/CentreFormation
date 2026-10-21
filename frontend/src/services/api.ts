import axios from 'axios';
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  InscriptionRequest,
  InscriptionResponse,
  InscriptionDetail,
  CatalogueCours,
  CoursDisponible,
  CoursResume,
  FormateurResume,
  MessageResponse,
  NoteEtudiant,
  Notification,
  NotificationCount,
  NotificationsMarquees,
  PlanningSeance,
  ProfilEtudiant,
  UpdateProfileRequest,
  GroupeFormateur,
  NoteFormateur,
  NoteRequest,
  NoteUpdateRequest,
  ProfilFormateur,
  SeanceFormateur,
  PublicCours,
  ContactRequest,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Évènement émis quand l'API répond 401 à une requête authentifiée (jeton expiré ou invalide). */
export const UNAUTHORIZED_EVENT = 'ep:unauthorized';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session expirée : on prévient l'application (hors tentative de connexion/inscription).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error?.config?.url ?? '';
    if (error?.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', credentials),
  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register', data),
};

// Notifications : même contrat pour les deux rôles
type NotificationsRole = 'etudiant' | 'formateur';

export const notificationsApi = {
  list: (role: NotificationsRole) => api.get<Notification[]>(`/${role}/notifications`),
  unreadCount: (role: NotificationsRole) => api.get<NotificationCount>(`/${role}/notifications/unread-count`),
  markRead: (role: NotificationsRole, id: number) => api.patch<Notification>(`/${role}/notifications/${id}/lu`),
  markAllRead: (role: NotificationsRole) => api.patch<NotificationsMarquees>(`/${role}/notifications/lu-tout`),
};

// Site public (sans authentification)
export const publicApi = {
  getCours: () => api.get<PublicCours[]>('/public/cours'),
  getCoursById: (id: number) => api.get<PublicCours>(`/public/cours/${id}`),
  sendContact: (data: ContactRequest) => api.post<MessageResponse>('/public/contact', data),
};

// Formateur API
export const formateurApi = {
  getGroupes: () => api.get<GroupeFormateur[]>('/formateur/groupes'),
  getSeances: () => api.get<SeanceFormateur[]>('/formateur/seances'),
  getPlanning: () => api.get<PlanningSeance[]>('/formateur/planning'),
  getCours: () => api.get<CoursResume[]>('/formateur/cours'),
  getNotes: () => api.get<NoteFormateur[]>('/formateur/notes'),
  createNote: (note: NoteRequest) => api.post<NoteFormateur>('/formateur/notes', note),
  updateNote: (noteId: number, data: NoteUpdateRequest) => api.put<NoteFormateur>(`/formateur/notes/${noteId}`, data),
  getProfile: () => api.get<ProfilFormateur>('/formateur/profile'),
  updateProfile: (data: UpdateProfileRequest) => api.put<ProfilFormateur>('/formateur/profile', data),
};

// Etudiant API
export const etudiantApi = {
  getPlanning: () => api.get<PlanningSeance[]>('/etudiant/planning'),
  getNotes: () => api.get<NoteEtudiant[]>('/etudiant/notes'),
  getCours: () => api.get<CoursResume[]>('/etudiant/cours'),
  getCoursDisponibles: () => api.get<CoursDisponible[]>('/etudiant/cours/disponibles'),
  getCatalogue: () => api.get<CatalogueCours[]>('/etudiant/catalogue'),
  getInscriptions: () => api.get<InscriptionDetail[]>('/etudiant/inscriptions'),
  inscrireCours: (request: InscriptionRequest) =>
    api.post<InscriptionResponse>('/etudiant/inscriptions', request),
  annulerInscription: (inscriptionId: number) =>
    api.delete<MessageResponse>(`/etudiant/inscriptions/${inscriptionId}`),
  getFormateurs: () => api.get<FormateurResume[]>('/etudiant/formateurs'),
  getProfile: () => api.get<ProfilEtudiant>('/etudiant/profile'),
  updateProfile: (data: UpdateProfileRequest) => api.put<ProfilEtudiant>('/etudiant/profile', data),
};

export default api;
