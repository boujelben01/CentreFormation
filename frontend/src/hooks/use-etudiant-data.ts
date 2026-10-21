import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { etudiantApi } from '@/services/api';
import { getApiErrorMessage } from '@/lib/errors';

// Clés de cache de l'espace étudiant (une seule source pour les lectures et les invalidations).
export const etudiantKeys = {
  planning: ['etudiant', 'planning'] as const,
  notes: ['etudiant', 'notes'] as const,
  inscriptions: ['etudiant', 'inscriptions'] as const,
  disponibles: ['etudiant', 'cours-disponibles'] as const,
  catalogue: ['etudiant', 'catalogue'] as const,
  formateurs: ['etudiant', 'formateurs'] as const,
  profil: ['etudiant', 'profil'] as const,
};

export const usePlanningEtudiant = () =>
  useQuery({ queryKey: etudiantKeys.planning, queryFn: async () => (await etudiantApi.getPlanning()).data });

export const useNotesEtudiant = () =>
  useQuery({ queryKey: etudiantKeys.notes, queryFn: async () => (await etudiantApi.getNotes()).data });

export const useInscriptions = () =>
  useQuery({ queryKey: etudiantKeys.inscriptions, queryFn: async () => (await etudiantApi.getInscriptions()).data });

export const useCoursDisponibles = () =>
  useQuery({ queryKey: etudiantKeys.disponibles, queryFn: async () => (await etudiantApi.getCoursDisponibles()).data });

export const useCatalogue = () =>
  useQuery({ queryKey: etudiantKeys.catalogue, queryFn: async () => (await etudiantApi.getCatalogue()).data });

export const useFormateursEtudiant = () =>
  useQuery({ queryKey: etudiantKeys.formateurs, queryFn: async () => (await etudiantApi.getFormateurs()).data });

export const useProfilEtudiant = () =>
  useQuery({ queryKey: etudiantKeys.profil, queryFn: async () => (await etudiantApi.getProfile()).data });

/** Inscription et annulation : les listes de cours, le catalogue et les formateurs sont rechargés ensuite. */
export function useInscriptionActions() {
  const queryClient = useQueryClient();

  const refreshCourses = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: etudiantKeys.inscriptions }),
      queryClient.invalidateQueries({ queryKey: etudiantKeys.disponibles }),
      queryClient.invalidateQueries({ queryKey: etudiantKeys.catalogue }),
      queryClient.invalidateQueries({ queryKey: etudiantKeys.formateurs }),
    ]);

  const inscrire = useMutation({
    mutationFn: async (coursId: number) => (await etudiantApi.inscrireCours({ coursId })).data,
    onSuccess: async (response) => {
      toast.success(`${response.message}. Votre inscription est en attente de validation.`);
      await refreshCourses();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Impossible de vous inscrire à ce cours.")),
  });

  const annuler = useMutation({
    mutationFn: async (inscriptionId: number) => (await etudiantApi.annulerInscription(inscriptionId)).data,
    onSuccess: async (response) => {
      toast.success(response.message);
      await refreshCourses();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Impossible d'annuler cette inscription.")),
  });

  return { inscrire, annuler };
}
