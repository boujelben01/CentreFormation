import { PageHeader, PageState, WeekPlanning } from '@/components/shared';
import { usePlanningFormateur } from '@/hooks/use-formateur-data';

export default function FormateurPlanning() {
  const planning = usePlanningFormateur();

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
        <WeekPlanning seances={planning.data ?? []} audience="formateur" />
      </PageState>
    </div>
  );
}
