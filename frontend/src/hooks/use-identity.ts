import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { etudiantApi, formateurApi } from '@/services/api';

/**
 * Identité affichable de l'utilisateur connecté : « Prénom Nom » lu depuis le profil.
 * Le login ne renvoie que l'identifiant : on n'affiche jamais celui-ci (ni l'e-mail).
 */
export function useIdentity() {
  const { user, isFormateur } = useAuth();

  const query = useQuery({
    queryKey: ['identity', user?.role],
    queryFn: async () => {
      const response = isFormateur ? await formateurApi.getProfile() : await etudiantApi.getProfile();
      return { prenom: response.data.prenom, nom: response.data.nom };
    },
    enabled: !!user,
    staleTime: Infinity,
    retry: 1,
  });

  const fullName = [query.data?.prenom, query.data?.nom].filter(Boolean).join(' ');

  return {
    prenom: query.data?.prenom ?? '',
    fullName,
    roleLabel: isFormateur ? 'Formateur' : 'Étudiant',
    isLoading: query.isLoading,
  };
}
