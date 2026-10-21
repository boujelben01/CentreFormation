import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Bell, BookOpen, Calendar } from 'lucide-react';
import { NoteBadge, NoteLevelBadge, PageHeader, PageState, StatsCard } from '@/components/shared';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useIdentity } from '@/hooks/use-identity';
import { useInscriptions, useNotesEtudiant, usePlanningEtudiant } from '@/hooks/use-etudiant-data';
import { formatDateTime } from '@/lib/text';

const plural = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);

/** Tableau de bord étudiant (maquette etudiant/index.html). */
export default function EtudiantDashboard() {
  const { prenom } = useIdentity();
  const planning = usePlanningEtudiant();
  const notes = useNotesEtudiant();
  const inscriptions = useInscriptions();
  const notifications = useNotifications();

  const isLoading = planning.isLoading || notes.isLoading || inscriptions.isLoading || notifications.isLoading;
  const isError = planning.isError || notes.isError || inscriptions.isError || notifications.isError;
  const retry = () => {
    void planning.refetch();
    void notes.refetch();
    void inscriptions.refetch();
    notifications.refetch();
  };

  const now = dayjs();
  const today = now.format('YYYY-MM-DD');
  const hm = now.format('HH:mm');
  const seancesDuJour = (planning.data ?? [])
    .filter((s) => s.date === today)
    .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));

  const cours = (inscriptions.data ?? []).filter((i) => i.statut !== 'ANNULE');
  const enAttente = cours.filter((i) => i.statut === 'EN_ATTENTE').length;
  const dernieresNotes = [...(notes.data ?? [])].sort((a, b) => b.id - a.id).slice(0, 4);
  const notificationsRecentes = notifications.items.slice(0, 3);
  const nonLues = notifications.unreadCount;

  return (
    <div className="view">
      <PageHeader
        title="Tableau de bord"
        subtitle={prenom ? `Bienvenue ${prenom}, voici un aperçu de votre parcours.` : 'Voici un aperçu de votre parcours.'}
        actions={
          <Link className="btn btn--secondary" to="/etudiant/cours?tab=inscrire">
            S'inscrire à un cours
          </Link>
        }
      />

      <PageState isLoading={isLoading} isError={isError} onRetry={retry} skeleton="list" errorWhat="votre tableau de bord">
        <div className="kpis kpis--3">
          <StatsCard
            icon={BookOpen}
            title="Cours inscrits"
            value={cours.length}
            description={enAttente ? `dont ${enAttente} en attente` : undefined}
            tone="secondary"
          />
          <StatsCard icon={Calendar} title="Séances aujourd'hui" value={seancesDuJour.length} tone="info" />
          <StatsCard
            icon={Bell}
            title="Notifications"
            value={nonLues}
            description={plural(nonLues, 'non lue', 'non lues')}
            tone="tertiary"
          />
        </div>

        <div className="dash-grid">
          <div className="stack">
            <section className="card card--pad" aria-labelledby="d-today">
              <div className="panel-title">
                <h2 id="d-today">Emploi du temps aujourd'hui</h2>
                <Link className="link-inline text-small" to="/etudiant/planning">
                  Voir la semaine
                </Link>
              </div>
              {seancesDuJour.length > 0 ? (
                <ul className="mini-list mini-list--agenda">
                  {seancesDuJour.map((s) => {
                    const enCours = s.heureDebut.slice(0, 5) <= hm && hm < s.heureFin.slice(0, 5);
                    const formateur = [s.formateurPrenom, s.formateurNom].filter(Boolean).join(' ');
                    return (
                      <li key={s.id} className={enCours ? 'is-live' : undefined}>
                        <span className="time-pill tnum">
                          {s.heureDebut.slice(0, 5)} – {s.heureFin.slice(0, 5)}
                        </span>
                        <div>
                          <p>{s.coursTitre ?? 'Séance'}</p>
                          <small>{[s.salleNom, formateur].filter(Boolean).join(' · ')}</small>
                        </div>
                        {enCours && <span className="badge badge--primary">En cours</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted">Aucun cours aujourd'hui.</p>
              )}
            </section>

            <section className="card card--pad" aria-labelledby="d-notes">
              <div className="panel-title">
                <h2 id="d-notes">Dernières notes</h2>
                <Link className="link-inline text-small" to="/etudiant/notes">
                  Tout voir
                </Link>
              </div>
              {dernieresNotes.length > 0 ? (
                <ul className="mini-list">
                  {dernieresNotes.map((n) => (
                    <li key={n.id}>
                      <div>
                        <p>{n.coursNom ?? 'Cours'}</p>
                        {n.session && <small>Session {n.session}</small>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <NoteBadge value={n.valeur} />
                        <br />
                        <NoteLevelBadge value={n.valeur} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Aucune note disponible.</p>
              )}
            </section>
          </div>

          <div className="stack">
            <section className="card card--pad" aria-labelledby="d-notif">
              <div className="panel-title">
                <h2 id="d-notif">Notifications récentes</h2>
                <Link className="link-inline text-small" to={notifications.pagePath}>
                  Tout voir
                </Link>
              </div>
              {notificationsRecentes.length > 0 ? (
                <ul className="mini-list">
                  {notificationsRecentes.map((n) => (
                    <li key={n.id}>
                      <div>
                        <p>{n.sujet}</p>
                        <small>{formatDateTime(n.dateEnvoi)}</small>
                      </div>
                      {n.unread && <span className="badge badge--primary">Non lue</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Aucune notification.</p>
              )}
            </section>
          </div>
        </div>
      </PageState>
    </div>
  );
}
