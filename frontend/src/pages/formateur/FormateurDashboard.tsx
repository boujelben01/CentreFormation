import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Calendar, Clipboard, Users } from 'lucide-react';
import { CategoryBadge, PageHeader, PageState, StatsCard } from '@/components/shared';
import { useGroupesFormateur, useSeancesFormateur } from '@/hooks/use-formateur-data';
import { useIdentity } from '@/hooks/use-identity';
import { getCourseTheme } from '@/lib/courseTheme';
import type { SeanceFormateur } from '@/types/api';

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
const debut = (s: SeanceFormateur) => dayjs(`${s.date}T${s.heureDebut}`);
const hm = (value: string) => value.slice(0, 5);
const plural = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);

/** Tableau de bord formateur (maquette formateur/index.html). */
export default function FormateurDashboard() {
  const { prenom } = useIdentity();
  const groupes = useGroupesFormateur();
  const seances = useSeancesFormateur();

  const now = dayjs();
  const today = now.format('YYYY-MM-DD');
  const nowHm = now.format('HH:mm');
  const toutes = seances.data ?? [];
  const seancesDuJour = toutes.filter((s) => s.date === today).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  const prochaines = toutes
    .filter((s) => debut(s).isAfter(now))
    .sort((a, b) => debut(a).valueOf() - debut(b).valueOf())
    .slice(0, 3);
  const enCours = (s: SeanceFormateur) => s.date === today && nowHm >= hm(s.heureDebut) && nowHm < hm(s.heureFin);

  // Un seul appel : l'effectif de chaque groupe est calculé par le serveur.
  const listeGroupes = groupes.data ?? [];
  const totalEtudiants = listeGroupes.reduce((total, g) => total + g.effectif, 0);

  const retry = () => {
    void groupes.refetch();
    void seances.refetch();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tableau de bord"
        subtitle={prenom ? `Bienvenue ${prenom}, voici un aperçu de votre activité.` : 'Voici un aperçu de votre activité.'}
      />

      <PageState
        isLoading={groupes.isLoading || seances.isLoading}
        isError={groupes.isError || seances.isError}
        onRetry={retry}
        skeleton="list"
        errorWhat="votre tableau de bord"
      >
        <div className="kpis kpis--3">
          <StatsCard icon={Users} title="Total étudiants" value={totalEtudiants} tone="secondary" />
          <StatsCard icon={Clipboard} title="Groupes actifs" value={listeGroupes.length} tone="primary" />
          <StatsCard icon={Calendar} title="Séances aujourd'hui" value={seancesDuJour.length} tone="info" />
        </div>

        <div className="dash-grid">
          <div className="stack">
            <section className="card card--pad" aria-labelledby="d-next">
              <div className="panel-title">
                <h2 id="d-next">Prochaines séances</h2>
                <Link className="link-inline text-small" to="/formateur/seances">
                  Toutes les séances
                </Link>
              </div>
              {prochaines.length > 0 ? (
                <ul className="mini-list mini-list--agenda">
                  {prochaines.map((s) => (
                    <li key={s.id}>
                      <span className="time-pill tnum">
                        {dayMonth.format(new Date(`${s.date}T12:00:00`))}
                        <small>
                          {hm(s.heureDebut)} – {hm(s.heureFin)}
                        </small>
                      </span>
                      <div>
                        <p>{s.coursTitre ?? 'Séance'}</p>
                        <small>{[s.groupeNom && `Groupe ${s.groupeNom}`, s.salleNom].filter(Boolean).join(' · ')}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Aucune séance à venir.</p>
              )}
            </section>

            <section className="card card--pad" aria-labelledby="d-today">
              <div className="panel-title">
                <h2 id="d-today">Emploi du temps : aujourd'hui</h2>
                <Link className="link-inline text-small" to="/formateur/planning">
                  Voir la semaine
                </Link>
              </div>
              {seancesDuJour.length > 0 ? (
                <ul className="mini-list mini-list--agenda">
                  {seancesDuJour.map((s) => (
                    <li key={s.id} className={enCours(s) ? 'is-live' : undefined}>
                      <span className="time-pill tnum">
                        {hm(s.heureDebut)} – {hm(s.heureFin)}
                      </span>
                      <div>
                        <p>{s.coursTitre ?? 'Séance'}</p>
                        <small>{[s.groupeNom && `Groupe ${s.groupeNom}`, s.salleNom].filter(Boolean).join(' · ')}</small>
                      </div>
                      {enCours(s) && <span className="badge badge--primary">En cours</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Aucune séance aujourd'hui.</p>
              )}
            </section>
          </div>

          <section className="card card--pad" aria-labelledby="d-groups">
            <div className="panel-title">
              <h2 id="d-groups">Aperçu des groupes</h2>
              <Link className="link-inline text-small" to="/formateur/groupes">
                Tous les groupes
              </Link>
            </div>
            {listeGroupes.length > 0 ? (
              <ul className="progress-list">
                {listeGroupes.map((g) => {
                  const theme = getCourseTheme({ code: g.coursCode, titre: g.coursTitre });
                  return (
                    <li key={g.id}>
                      <div className="panel-title" style={{ marginBottom: 'var(--space-2)' }}>
                        <h3 className="text-h4">{g.nom}</h3>
                        <span className="badge-row">
                          <CategoryBadge category={theme.category} />
                        </span>
                      </div>
                      <p className="muted text-small tnum" style={{ marginTop: 'var(--space-1)' }}>
                        {g.effectif} {plural(g.effectif, 'étudiant', 'étudiants')}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted">Aucun groupe disponible.</p>
            )}
          </section>
        </div>
      </PageState>
    </div>
  );
}
