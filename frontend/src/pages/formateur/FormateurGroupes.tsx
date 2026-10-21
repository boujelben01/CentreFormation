import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, IdCard, Mail, Search, Users } from 'lucide-react';
import { CategoryBadge, EmptyState, PageHeader, PageState, UserAvatar } from '@/components/shared';
import { useGroupesFormateur } from '@/hooks/use-formateur-data';
import { getCourseTheme } from '@/lib/courseTheme';
import { fullName, normalizeText } from '@/lib/text';
import type { GroupeFormateur } from '@/types/api';

const plural = (n: number, singulier: string, pluriel: string) => `${n} ${n > 1 ? pluriel : singulier}`;
const coursLabel = (g: GroupeFormateur) => [g.coursCode, g.coursTitre].filter(Boolean).join(' · ');

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <div className="group-head">
      <button type="button" className="btn btn--secondary" onClick={onBack}>
        <ArrowLeft className="icon icon--sm" aria-hidden="true" />
        Retour aux groupes
      </button>
    </div>
  );
}

function GroupeDetail({ groupe, onBack }: { groupe: GroupeFormateur; onBack: () => void }) {
  const [search, setSearch] = useState('');
  const titre = useRef<HTMLHeadingElement>(null);

  // Le focus passe au titre à l'ouverture : les lecteurs d'écran annoncent le groupe ouvert.
  useEffect(() => {
    titre.current?.focus();
  }, []);

  if (groupe.etudiants.length === 0) {
    return (
      <>
        <BackButton onBack={onBack} />
        <EmptyState icon={Users} title="Aucun étudiant dans ce groupe" description="Aucun étudiant n'est encore affecté à ce groupe." />
      </>
    );
  }

  const n = groupe.etudiants.length;
  const q = normalizeText(search.trim());
  const etudiants = groupe.etudiants.filter(
    (e) => !q || normalizeText(`${e.prenom} ${e.nom} ${e.matricule} ${e.email}`).includes(q),
  );
  const cours = coursLabel(groupe);

  return (
    <>
      <BackButton onBack={onBack} />
      <section className="card card--pad" aria-labelledby="g-title">
        <div className="group-head">
          <div>
            <h2 id="g-title" ref={titre} tabIndex={-1}>
              Groupe : {groupe.nom}
            </h2>
            {cours && <p className="muted text-small">{cours}</p>}
          </div>
          <span className="badge badge--secondary">{plural(n, 'étudiant', 'étudiants')}</span>
        </div>
        <form className="f-search" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="g-search">Rechercher un étudiant</label>
            <div className="input-icon">
              <Search className="icon" aria-hidden="true" />
              <input
                className="input"
                type="search"
                id="g-search"
                autoComplete="off"
                placeholder="Nom, matricule ou e-mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </form>
        <p className="f-count" aria-live="polite">
          {q ? `${plural(etudiants.length, 'résultat', 'résultats')} sur ${n}` : ''}
        </p>
        {etudiants.length === 0 ? (
          <p className="muted" role="status" style={{ padding: 'var(--space-4)' }}>
            Aucun étudiant ne correspond à « {search.trim()} ».
          </p>
        ) : (
          <ul className="student-list" aria-label="Étudiants du groupe">
            {etudiants.map((e) => {
              const name = fullName(e.prenom, e.nom) || 'Étudiant';
              return (
                <li key={e.id} className="student-row">
                  <UserAvatar name={name} size="md" />
                  <div>
                    <h3>{name}</h3>
                    <div className="student-row__meta">
                      {e.matricule && (
                        <span className="tnum">
                          <IdCard className="icon icon--sm" aria-hidden="true" /> Matricule&nbsp;: {e.matricule}
                        </span>
                      )}
                      {e.email && (
                        <a className="link-inline" href={`mailto:${e.email}`}>
                          <Mail className="icon icon--sm" aria-hidden="true" /> {e.email}
                          <span className="sr-only"> (écrire à {name})</span>
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

/** Groupes du formateur (maquette formateur/groupes.html) : cartes, puis vue détail avec recherche. */
export default function FormateurGroupes() {
  const groupes = useGroupesFormateur();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const openers = useRef(new Map<number, HTMLButtonElement>());
  const returnTo = useRef<number | null>(null);
  const liste = groupes.data ?? [];
  const selected = liste.find((g) => g.id === selectedId) ?? null;

  // Au retour à la liste, le focus revient sur le bouton du groupe qui était ouvert.
  useEffect(() => {
    if (selected === null && returnTo.current !== null) {
      openers.current.get(returnTo.current)?.focus();
      returnTo.current = null;
    }
  }, [selected]);

  const back = () => {
    returnTo.current = selectedId;
    setSelectedId(null);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Groupes" subtitle="Vos groupes et leurs étudiants." />

      <PageState
        isLoading={groupes.isLoading}
        isError={groupes.isError}
        onRetry={() => void groupes.refetch()}
        skeleton="cards"
        errorWhat="vos groupes"
        isEmpty={liste.length === 0}
        empty={
          <EmptyState icon={Users} title="Aucun groupe disponible" description="Aucun groupe ne vous est affecté pour le moment." />
        }
      >
        {selected ? (
          <GroupeDetail key={selected.id} groupe={selected} onBack={back} />
        ) : (
          <div className="trainer-grid">
            {liste.map((g) => {
              const theme = getCourseTheme({ code: g.coursCode, titre: g.coursTitre });
              const cours = coursLabel(g);
              return (
                <article key={g.id} className="card group-card">
                  <h2>
                    <button
                      type="button"
                      className="group-card__btn"
                      ref={(el) => {
                        if (el) openers.current.set(g.id, el);
                        else openers.current.delete(g.id);
                      }}
                      onClick={() => setSelectedId(g.id)}
                    >
                      {g.nom}
                      <span className="sr-only"> : voir les étudiants du groupe</span>
                    </button>
                  </h2>
                  {cours && <p>{cours}</p>}
                  <div className="badge-row">
                    <CategoryBadge category={theme.category} />
                  </div>
                  <div className="group-card__foot">
                    <span className="group-card__who">
                      {g.etudiants.length > 0 && (
                        <span className="group-card__people">
                          {g.etudiants.slice(0, 4).map((e) => (
                            <UserAvatar key={e.id} name={fullName(e.prenom, e.nom) || 'Étudiant'} />
                          ))}
                          {g.etudiants.length > 4 && <span className="avatar avatar--sm group-card__more" aria-hidden="true">+{g.etudiants.length - 4}</span>}
                        </span>
                      )}
                      <span className="tnum">{g.effectif > 0 ? plural(g.effectif, 'étudiant', 'étudiants') : 'Aucun étudiant pour le moment'}</span>
                    </span>
                    <ArrowRight className="icon icon--sm" aria-hidden="true" />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageState>
    </div>
  );
}
