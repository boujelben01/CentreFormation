import { PageHeader, PageState, WeekPlanning } from '@/components/shared';
import { usePlanningEtudiant } from '@/hooks/use-etudiant-data';

export default function EtudiantPlanning() {
  const planning = usePlanningEtudiant();

  return (
    <div className="animate-fade-in">
      <PageHeader title="Emploi du temps" subtitle="Vos séances de la semaine, jour par jour." />
      <PageState
        isLoading={planning.isLoading}
        isError={planning.isError}
        onRetry={() => void planning.refetch()}
        errorWhat="votre emploi du temps"
        skeleton="planning"
      >
        <WeekPlanning seances={planning.data ?? []} audience="etudiant" />
      </PageState>
    </div>
  );
}
