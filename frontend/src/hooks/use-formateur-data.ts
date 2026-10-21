import { useQuery } from '@tanstack/react-query';
import { formateurApi } from '@/services/api';

// Clés de cache de l'espace formateur (une seule source pour les lectures et les invalidations).
export const formateurKeys = {
  groupes: ['formateur', 'groupes'] as const,
  seances: ['formateur', 'seances'] as const,
  planning: ['formateur', 'planning'] as const,
  cours: ['formateur', 'cours'] as const,
  notes: ['formateur', 'notes'] as const,
  profil: ['formateur', 'profil'] as const,
};

export const useGroupesFormateur = () =>
  useQuery({ queryKey: formateurKeys.groupes, queryFn: async () => (await formateurApi.getGroupes()).data });

export const useSeancesFormateur = () =>
  useQuery({ queryKey: formateurKeys.seances, queryFn: async () => (await formateurApi.getSeances()).data });

export const usePlanningFormateur = () =>
  useQuery({ queryKey: formateurKeys.planning, queryFn: async () => (await formateurApi.getPlanning()).data });

export const useCoursFormateur = () =>
  useQuery({ queryKey: formateurKeys.cours, queryFn: async () => (await formateurApi.getCours()).data });

export const useNotesFormateur = () =>
  useQuery({ queryKey: formateurKeys.notes, queryFn: async () => (await formateurApi.getNotes()).data });

export const useProfilFormateur = () =>
  useQuery({ queryKey: formateurKeys.profil, queryFn: async () => (await formateurApi.getProfile()).data });
