import { useMemo, useRef, useState, type CSSProperties } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCourseTheme } from '@/lib/courseTheme';
import { cn } from '@/lib/utils';
import type { PlanningSeance } from '@/types/api';
import { EmptyState } from './EmptyState';

dayjs.extend(isoWeek);

interface WeekPlanningProps {
  seances: PlanningSeance[];
  /** Détermine la 2e ligne d'une séance : formateur (étudiant) ou groupe (formateur). */
  audience: 'etudiant' | 'formateur';
}

const wdFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const dmFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });

const hhmm = (time: string) => time.slice(0, 5);
/** « 09:30:00 » devient 9,5 (heures décimales). */
const decimal = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h + (m || 0) / 60;
};
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

interface Item {
  seance: PlanningSeance;
  jour: number;
  date: dayjs.Dayjs;
  debut: number;
  fin: number;
  gradient: number;
  titre: string;
  salle: string;
  formateur: string;
}

/**
 * Emploi du temps hebdomadaire (composants « planning-grid » et « planning-list » de la maquette) :
 * grille sur ordinateur (≥ 900 px), liste par jour sur mobile. Lecture seule.
 */
export function WeekPlanning({ seances, audience }: WeekPlanningProps) {
  const [offset, setOffset] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const showGroup = audience === 'formateur';
  const today = dayjs();
  const monday = today.startOf('isoWeek').add(offset * 7, 'day');

  const { items, used } = useMemo(() => {
    const end = monday.add(7, 'day');
    const list: Item[] = seances
      .filter((s) => {
        const d = dayjs(s.date);
        return !d.isBefore(monday, 'day') && d.isBefore(end, 'day');
      })
      .map((s) => ({
        seance: s,
        jour: dayjs(s.date).isoWeekday() - 1,
        date: dayjs(s.date),
        debut: decimal(s.heureDebut),
        fin: decimal(s.heureFin),
        gradient: getCourseTheme({ code: s.coursCode, titre: s.coursTitre }).gradient,
        titre: s.coursTitre ?? 'Séance',
        salle: s.salleNom ?? 'Salle à définir',
        formateur: [s.formateurPrenom, s.formateurNom].filter(Boolean).join(' '),
      }))
      .sort((a, b) => a.jour - b.jour || a.debut - b.debut);

    const legend = new Map<string, { titre: string; gradient: number }>();
    for (const it of list) {
      const key = String(it.seance.coursId ?? it.titre);
      if (!legend.has(key)) legend.set(key, { titre: it.titre, gradient: it.gradient });
    }
    return { items: list, used: [...legend.entries()] };
  }, [seances, monday.valueOf()]); // eslint-disable-line react-hooks/exhaustive-deps

  const sunday = monday.add(6, 'day');
  const first = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: monday.month() === sunday.month() ? undefined : 'long',
  }).format(monday.toDate());
  const weekLabel = `${first} – ${dmFmt.format(sunday.toDate())} ${sunday.year()}`;

  const go = (delta: number) => {
    setOffset((o) => (delta === 0 ? 0 : o + delta));
    if (delta === 0) nextRef.current?.focus();
  };

  const nav = (
    <div className="week-nav" role="group" aria-label="Navigation par semaine">
      <button type="button" className="icon-btn icon-btn--bordered" aria-label="Semaine précédente" onClick={() => go(-1)}>
        <ChevronLeft className="icon" aria-hidden="true" />
      </button>
      <button
        type="button"
        ref={nextRef}
        className="icon-btn icon-btn--bordered"
        aria-label="Semaine suivante"
        onClick={() => go(1)}
      >
        <ChevronRight className="icon" aria-hidden="true" />
      </button>
      <button type="button" className="btn btn--secondary" disabled={offset === 0} onClick={() => go(0)}>
        Aujourd'hui
      </button>
      <span className="week-nav__label" aria-live="polite">
        Semaine du {weekLabel}
      </span>
    </div>
  );

  if (seances.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Aucune séance prévue"
        description="Aucune séance n'est planifiée pour le moment."
      />
    );
  }

  if (items.length === 0) {
    return (
      <>
        {nav}
        <EmptyState
          icon={CalendarDays}
          title="Aucune séance prévue"
          description={
            offset === 0
              ? "Aucune séance n'est planifiée pour le moment."
              : 'Aucune séance cette semaine. Utilisez les flèches pour revenir aux semaines de cours.'
          }
          action={
            offset === 0 ? undefined : (
              <button type="button" className="btn btn--primary" onClick={() => go(0)}>
                Revenir à cette semaine
              </button>
            )
          }
        />
      </>
    );
  }

  const maxDay = Math.max(4, ...items.map((s) => s.jour));
  const cols = maxDay + 1;
  const h0 = Math.min(8, Math.floor(Math.min(...items.map((s) => s.debut))));
  const h1 = Math.max(18, Math.ceil(Math.max(...items.map((s) => s.fin))));
  const rows = (h1 - h0) * 2;
  const days = Array.from({ length: 7 }, (_, d) => monday.add(d, 'day'));
  const isToday = (d: dayjs.Dayjs) => d.isSame(today, 'day');
  const courseVar = (gradient: number) => cssVars({ '--c': `var(--course-${gradient}-a)` });
  // Repère « maintenant » : heure locale, uniquement sur la semaine en cours et dans la plage affichée.
  const nowHour = today.hour() + today.minute() / 60;
  const nowCol = offset === 0 ? today.isoWeekday() - 1 : -1;
  const showNow = nowCol >= 0 && nowCol < cols && nowHour >= h0 && nowHour < h1;

  return (
    <>
      {nav}
      <ul className="legend" aria-label="Légende des cours">
        {used.map(([key, c]) => (
          <li key={key}>
            <i style={courseVar(c.gradient)} />
            {c.titre}
          </li>
        ))}
      </ul>

      <div className="card pg" style={cssVars({ '--pg-cols': cols })}>
        <div className="pg-head">
          <div />
          {days.slice(0, cols).map((d) => (
            <div key={d.format('YYYY-MM-DD')} className={isToday(d) ? 'today' : undefined}>
              {wdFmt.format(d.toDate())}
              <strong className="tnum">{d.date()}</strong>
            </div>
          ))}
        </div>
        <div className="pg-body" style={{ gridTemplateRows: `repeat(${rows},var(--client-row))` }}>
          {Array.from({ length: h1 - h0 }, (_, i) => (
            <div key={i} className="pg-time tnum" style={{ gridRow: `${i * 2 + 1} / span 2` }}>
              {String(h0 + i).padStart(2, '0')}:00
            </div>
          ))}
          {days.slice(0, cols).map((d, i) => (
            <div
              key={d.format('YYYY-MM-DD')}
              className={cn('pg-col', isToday(d) && 'today')}
              style={{ gridColumn: i + 2 }}
            />
          ))}
          {showNow && (
            <div
              className="pg-now"
              aria-hidden="true"
              style={{ gridColumn: nowCol + 2, gridRow: '1 / -1', ...cssVars({ '--now': (nowHour - h0) * 2 }) }}
            />
          )}
          {items.map((s) => (
            <article
              key={s.seance.id}
              className="session"
              style={{
                ...courseVar(s.gradient),
                gridColumn: s.jour + 2,
                gridRow: `${Math.round((s.debut - h0) * 2) + 1} / ${Math.round((s.fin - h0) * 2) + 1}`,
              }}
              aria-label={`${s.titre}, ${wdFmt.format(s.date.toDate())} de ${hhmm(s.seance.heureDebut)} à ${hhmm(s.seance.heureFin)}, ${s.salle}${
                showGroup && s.seance.groupeNom ? `, groupe ${s.seance.groupeNom}` : ''
              }`}
            >
              <span className="tnum">
                {hhmm(s.seance.heureDebut)} – {hhmm(s.seance.heureFin)}
              </span>
              <strong>{s.titre.split(' (')[0]}</strong>
              <span>
                {s.salle}
                {showGroup && s.seance.groupeNom ? ` · ${s.seance.groupeNom}` : ''}
              </span>
            </article>
          ))}
        </div>
      </div>

      <div className="pl">
        {days.map((d, i) => {
          const ss = items.filter((s) => s.jour === i);
          const headId = `pl-d${i}`;
          return (
            <section key={headId} className="pl-day" aria-labelledby={headId}>
              <h3 id={headId}>
                {wdFmt.format(d.toDate())} {dmFmt.format(d.toDate())}
                {isToday(d) && (
                  <>
                    {' '}
                    <span className="badge badge--primary">Aujourd'hui</span>
                  </>
                )}
                {ss.length > 0 && (
                  <>
                    {' '}
                    <span className="badge">
                      {ss.length} {ss.length > 1 ? 'séances' : 'séance'}
                    </span>
                  </>
                )}
              </h3>
              {ss.length > 0 ? (
                ss.map((s) => (
                  <div key={s.seance.id} className="card pl-item" style={courseVar(s.gradient)}>
                    <span className="bar-c" />
                    <span className="t tnum">
                      <strong>{hhmm(s.seance.heureDebut)}</strong>
                      {hhmm(s.seance.heureFin)}
                    </span>
                    <div>
                      <p>{s.titre}</p>
                      <small>
                        {[
                          s.salle,
                          showGroup ? (s.seance.groupeNom ? `Groupe ${s.seance.groupeNom}` : '') : s.formateur,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="pl-empty">Aucune séance ce jour.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
