import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/services/api';

export const publicKeys = {
  cours: ['public', 'cours'] as const,
  coursById: (id: number) => ['public', 'cours', id] as const,
};

export const usePublicCours = () =>
  useQuery({ queryKey: publicKeys.cours, queryFn: async () => (await publicApi.getCours()).data });

export const usePublicCoursById = (id: number) =>
  useQuery({
    queryKey: publicKeys.coursById(id),
    queryFn: async () => (await publicApi.getCoursById(id)).data,
    enabled: Number.isFinite(id),
  });
