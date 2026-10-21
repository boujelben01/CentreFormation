import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Award, TrendingUp } from 'lucide-react';
import { EmptyState, NoteLevelBadge, PageHeader, PageState, StatsCard } from '@/components/shared';
import { SelectField } from '@/components/shared/SelectField';
import { useNotesEtudiant } from '@/hooks/use-etudiant-data';
import { formatAverage, formatNote, simpleAverage } from '@/lib/notes';

const NB = ' ';
const ALL = 'all';

/** Notes de l'étudiant (maquette etudiant/notes.html) : moyenne simple, meilleure et plus basse note, tableau. */
export default function EtudiantNotes() {
  const notes = useNotesEtudiant();
  const [course, setCourse] = useState<string>(ALL);
  const [session, setSession] = useState<string>(ALL);

  const everything = useMemo(() => notes.data ?? [], [notes.data]);

  const courseOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const n of everything) {
      if (n.coursId !== null) byId.set(String(n.coursId), n.coursNom ?? n.coursCode ?? 'Cours');
    }
    return Array.from(byId, ([value, label]) => ({ value, label }));
  }, [everything]);

  const sessionOptions = useMemo(
    () => Array.from(new Set(everything.map((n) => n.session).filter((s): s is string => !!s))),
    [everything],
  );

  const list = everything
    .filter((n) => (course === ALL || String(n.coursId) === course) && (session === ALL || n.session === session))
    .sort((a, b) => b.id - a.id);

  const values = list.map((n) => n.valeur);
  const average = simpleAverage(values);
  const best = values.length ? Math.max(...values) : null;
  const worst = values.length ? Math.min(...values) : null;
  const reset = () => {
    setCourse(ALL);
    setSession(ALL);
  };

  return (
    <div className="view">
      <PageHeader title="Mes notes" subtitle="Vos résultats par cours et par session." />

      <PageState
        isLoading={notes.isLoading}
        isError={notes.isError}
        onRetry={() => void notes.refetch()}
        skeleton="table"
        errorWhat="vos notes"
        isEmpty={everything.length === 0}
        empty={
          <EmptyState
            icon={Award}
            title="Aucune note disponible"
            description="Vos notes apparaîtront ici dès que vos formateurs les auront saisies."
            action={
              <Link className="btn btn--secondary" to="/etudiant/planning">
                Voir mon emploi du temps
              </Link>
            }
          />
        }
      >
        <form className="select-inline" style={{ marginBottom: 'var(--space-4)' }} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="f-course" className="text-small" style={{ fontWeight: 'var(--weight-semibold)' }}>
            Cours
          </label>
          <SelectField id="f-course" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value={ALL}>Tous mes cours</option>
            {courseOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
          <label htmlFor="f-session" className="text-small" style={{ fontWeight: 'var(--weight-semibold)' }}>
            Session
          </label>
          <SelectField id="f-session" value={session} onChange={(e) => setSession(e.target.value)}>
            <option value={ALL}>Toutes les sessions</option>
            {sessionOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        </form>

        {list.length > 0 ? (
          <>
            <div className="kpis kpis--3">
              <StatsCard
                icon={TrendingUp}
                title="Moyenne (simple)"
                value={average === null ? '—' : formatAverage(average)}
                description={`/${NB}20`}
                tone="primary"
              />
              <StatsCard icon={Award} title="Meilleure note" value={best === null ? '—' : formatNote(best)} description={`/${NB}20`} tone="success" />
              <StatsCard
                icon={AlertTriangle}
                title="Note la plus basse"
                value={worst === null ? '—' : formatNote(worst)}
                description={`/${NB}20`}
                tone="tertiary"
              />
            </div>

            <div className="table-wrap">
              <table className="grades">
                <caption>Notes publiées ({list.length})</caption>
                <thead>
                  <tr>
                    <th scope="col">Cours</th>
                    <th scope="col">Code</th>
                    <th scope="col">Session</th>
                    <th scope="col" className="num">
                      Note / 20
                    </th>
                    <th scope="col">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((n) => (
                    <tr key={n.id}>
                      <th scope="row">{n.coursNom ?? '—'}</th>
                      <td data-label="Code">{n.coursCode ?? '—'}</td>
                      <td data-label="Session">{n.session ? <span className="badge">{n.session}</span> : '—'}</td>
                      <td data-label="Note" className="num tnum">
                        <span className="note">{formatNote(n.valeur)}</span>
                        {NB}/{NB}20
                      </td>
                      <td data-label="Résultat">
                        <NoteLevelBadge value={n.valeur} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="footnote">
              La moyenne affichée est une moyenne simple des notes sélectionnées. Les notes ne portent pas de coefficient dans
              l'application actuelle : une pondération n'est pas calculée.
            </p>
          </>
        ) : (
          <EmptyState
            icon={Award}
            title="Aucune note pour ce filtre"
            description="Aucune note ne correspond à ce cours et à cette session."
            action={
              <button type="button" className="btn btn--primary" onClick={reset}>
                Afficher toutes les notes
              </button>
            }
          />
        )}
      </PageState>
    </div>
  );
}
