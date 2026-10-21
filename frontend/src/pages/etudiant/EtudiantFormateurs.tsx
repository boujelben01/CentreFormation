import { Mail, Users } from 'lucide-react';
import { EmptyState, PageHeader, PageState, UserAvatar } from '@/components/shared';
import { useFormateursEtudiant } from '@/hooks/use-etudiant-data';
import { getCourseTheme } from '@/lib/courseTheme';
import { fullName } from '@/lib/text';

export default function EtudiantFormateurs() {
  const formateurs = useFormateursEtudiant();
  const list = formateurs.data ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Formateurs" subtitle="Les formateurs de vos cours et leur spécialité." />
      <PageState
        isLoading={formateurs.isLoading}
        isError={formateurs.isError}
        onRetry={() => void formateurs.refetch()}
        errorWhat="les formateurs"
        skeleton="cards"
        isEmpty={list.length === 0}
        empty={
          <EmptyState
            icon={Users}
            title="Aucun formateur disponible"
            description="Les formateurs de vos cours apparaîtront ici dès que vous serez inscrit à un cours."
          />
        }
      >
        <div className="trainer-grid">
          {list.map((f) => {
            const name = fullName(f.prenom, f.nom) || 'Formateur';
            const category = f.specialite ? getCourseTheme({ titre: f.specialite }).category : null;
            return (
              <article key={f.id} className="card trainer-card">
                <UserAvatar name={name} size="lg" />
                <div>
                  <h2>{name}</h2>
                </div>
                {f.specialite &&
                  (category ? (
                    <span className={`badge badge--wrap badge--cat-${category}`}>{f.specialite}</span>
                  ) : (
                    <span className="badge badge--wrap">{f.specialite}</span>
                  ))}
                {f.email && (
                  <a className="mail link-inline" href={`mailto:${f.email}`}>
                    <Mail className="icon icon--sm" aria-hidden="true" />
                    {f.email}
                    <span className="sr-only"> (écrire à {name})</span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </PageState>
    </div>
  );
}
