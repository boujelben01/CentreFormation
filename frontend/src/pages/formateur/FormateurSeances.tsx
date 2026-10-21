import { useMemo, useState, type CSSProperties } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { CategoryBadge, EmptyState, PageHeader, PageState } from '@/components/shared';
import { useSeancesFormateur } from '@/hooks/use-formateur-data';
import { getCourseTheme } from '@/lib/courseTheme';
import type { SeanceFormateur } from '@/types/api';

dayjs.extend(isoWeek);

const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const dateLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const at = (iso: string) => new Date(`${iso}T12:00:00`);

/** Regroupe des séances déjà triées par jour (la date « YYYY-MM-DD » sert de clé). */
function parJour(items: SeanceFormateur[]) {
  const jours = new Map<string, SeanceFormateur[]>();
  for (const s of items) jours.set(s.date, [...(jours.get(s.date) ?? []), s]);
  return Array.from(jours, ([date, liste]) => ({ date, liste }));
}

/** Séances du formateur (maquette formateur/seances.html), regroupées par semaine. */
export default function FormateurSeances() {
  const seances = useSeancesFormateur();
  const [afficherPassees, setAfficherPassees] = useState(false);

  const todayKey = dayjs().format('YYYY-MM-DD');
  const debutSemaine = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
  const toutes = seances.data;

  const { semaines, nbPassees } = useMemo(() => {
    const liste = toutes ?? [];
    // Comme la maquette, la semaine en cours est affichée en entier ; l'historique est à la demande.
    const passees = liste.filter((s) => s.date < debutSemaine).length;
    const retenues = liste
      .filter((s) => afficherPassees || s.date >= debutSemaine)
      .sort((a, b) => `${a.date}${a.heureDebut}`.localeCompare(`${b.date}${b.heureDebut}`));

    // Regroupement par semaine ISO ; les semaines sans séance n'apparaissent pas.
    const parSemaine = new Map<string, SeanceFormateur[]>();
    for (const s of retenues) {
      const lundi = dayjs(s.date).startOf('isoWeek').format('YYYY-MM-DD');
      parSemaine.set(lundi, [...(parSemaine.get(lundi) ?? []), s]);
    }
    return { semaines: Array.from(parSemaine, ([lundi, items]) => ({ lundi, items })), nbPassees: passees };
  }, [toutes, afficherPassees, debutSemaine]);

  const total = toutes?.length ?? 0;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Séances" subtitle="Vos séances programmées, semaine par semaine." />

      <PageState
        isLoading={seances.isLoading}
        isError={seances.isError}
        onRetry={() => void seances.refetch()}
        skeleton="list"
        errorWhat="vos séances"
        isEmpty={total === 0}
        empty={
          <EmptyState
            icon={CalendarDays}
            title="Aucune séance programmée"
            description="Aucune séance ne vous est affectée pour le moment."
          />
        }
      >
        {nbPassees > 0 && (
          <div className="field" style={{ marginBottom: 'var(--space-5)' }}>
            <label className="check">
              <input type="checkbox" checked={afficherPassees} onChange={(e) => setAfficherPassees(e.target.checked)} />
              <span>Afficher les séances passées ({nbPassees})</span>
            </label>
          </div>
        )}

        {semaines.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Aucune séance à venir"
            description="Cochez « Afficher les séances passées » pour consulter l'historique."
          />
        ) : (
          <>
            {semaines.map(({ lundi, items }) => (
              <section key={lundi} aria-labelledby={`sw-${lundi}`}>
                <h2 className="seance-week" id={`sw-${lundi}`}>
                  Semaine du {dateLong.format(at(lundi))}
                </h2>
                {parJour(items).map(({ date, liste }) => (
                  <div key={date} className="seance-day">
                    <h3 className="seance-day__head" id={`sd-${date}`}>
                      <span className="seance-day__wd">{weekday.format(at(date))}</span>
                      <span className="seance-day__date">{dateLong.format(at(date))}</span>
                      {date === todayKey && <span className="badge badge--primary">Aujourd'hui</span>}
                    </h3>
                <ul className="seance-grid" aria-labelledby={`sd-${date}`}>
                  {liste.map((s) => {
                    const theme = getCourseTheme({ code: s.coursCode, titre: s.coursTitre });
                    return (
                      <li key={s.id}>
                        <article className="card seance-card" style={{ '--c': `var(--course-${theme.gradient}-a)` } as CSSProperties}>
                          <h4>{s.coursTitre ?? 'Séance'}</h4>
                          <p className="seance-card__time tnum">
                            <Clock className="icon icon--sm" aria-hidden="true" />
                            {s.heureDebut.slice(0, 5)} – {s.heureFin.slice(0, 5)}
                          </p>
                          <div className="badge-row">
                            <CategoryBadge category={theme.category} />
                            {s.salleNom && (
                              <span className="badge">
                                <MapPin className="icon icon--sm" aria-hidden="true" />
                                {s.salleNom}
                              </span>
                            )}
                            {s.groupeNom && (
                              <span className="badge badge--secondary">
                                <Users className="icon icon--sm" aria-hidden="true" />
                                Groupe {s.groupeNom}
                              </span>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
                  </div>
                ))}
              </section>
            ))}
          </>
        )}
      </PageState>
    </div>
  );
}
