import { useMemo, useState } from 'react';
import { Check, Library, Search } from 'lucide-react';
import { ConfirmDialog, EmptyState, FormationCard, PageHeader, PageState } from '@/components/shared';
import { SelectField } from '@/components/shared/SelectField';
import { useCatalogue, useInscriptionActions } from '@/hooks/use-etudiant-data';
import { CATEGORY_LABELS, getCourseTheme, type CategoryId } from '@/lib/courseTheme';
import { fullName, normalizeText } from '@/lib/text';
import type { CatalogueCours } from '@/types/api';

const NB = ' ';
const ALL = 'all';
type Sort = 'relevance' | 'hours';

const plural = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);

/** Catalogue des cours (maquette public/formations.html, dans l'espace étudiant). */
export default function EtudiantCatalogue() {
  const catalogue = useCatalogue();
  const { inscrire } = useInscriptionActions();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<CategoryId | typeof ALL>(ALL);
  const [sort, setSort] = useState<Sort>('relevance');
  const [cible, setCible] = useState<CatalogueCours | null>(null);

  const cours = useMemo(
    () =>
      (catalogue.data ?? []).map((c) => ({
        cours: c,
        category: getCourseTheme({ code: c.code, titre: c.titre, description: c.description }).category,
      })),
    [catalogue.data],
  );

  // Seules les catégories réellement présentes dans le catalogue sont proposées.
  const categories = useMemo(
    () => Array.from(new Set(cours.map((c) => c.category).filter((c): c is CategoryId => c !== null))),
    [cours],
  );

  const query = normalizeText(q.trim());
  const visibles = cours
    .filter(
      ({ cours: c, category: cat }) =>
        (category === ALL || cat === category) &&
        (query === '' ||
          normalizeText(
            [c.titre, fullName(c.formateurPrenom, c.formateurNom), cat ? CATEGORY_LABELS[cat] : '', c.description, c.code].join(' '),
          ).includes(query)),
    )
    .sort((a, b) => (sort === 'hours' ? a.cours.volumeHoraire - b.cours.volumeHoraire : 0));

  const hasFilters = q !== '' || category !== ALL || sort !== 'relevance';
  const resetFilters = () => {
    setQ('');
    setCategory(ALL);
    setSort('relevance');
  };

  return (
    <div className="view">
      <PageHeader
        title="Catalogue des formations"
        subtitle="Filtrez par domaine, ou recherchez un titre, un formateur, un mot-clé."
      />

      <form className="toolbar" role="search" aria-label="Rechercher une formation" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="toolbar__top">
          <div className="field">
            <label htmlFor="cat-q" className="sr-only">
              Rechercher une formation
            </label>
            <div className="input-icon">
              <Search className="icon" aria-hidden="true" />
              <input
                className="input"
                id="cat-q"
                type="search"
                placeholder="Rechercher : Python, UX, Scrum, anglais…"
                autoComplete="off"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="cat-sort" className="sr-only">
              Trier les formations
            </label>
            <SelectField id="cat-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="relevance">Trier : pertinence</option>
              <option value="hours">Durée la plus courte</option>
            </SelectField>
          </div>
        </div>
        {categories.length > 0 && (
          <div className="chip-group" role="group" aria-labelledby="g-cat">
            <span className="chip-group__label" id="g-cat">
              Domaine
            </span>
            {[ALL, ...categories].map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                aria-pressed={category === value}
                onClick={() => setCategory(value as CategoryId | typeof ALL)}
              >
                <Check className="icon icon--sm" aria-hidden="true" />
                {value === ALL ? 'Tous' : CATEGORY_LABELS[value as CategoryId]}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="result-bar">
        <p role="status" aria-live="polite" aria-atomic="true">
          {catalogue.isLoading
            ? 'Chargement des formations…'
            : catalogue.isError
              ? 'Erreur de chargement'
              : cours.length === 0
                ? 'Aucune formation disponible'
                : `${visibles.length} ${plural(visibles.length, 'formation trouvée', 'formations trouvées')}`}
        </p>
        <button type="button" className="btn btn--ghost" hidden={!hasFilters} onClick={resetFilters}>
          Réinitialiser les filtres
        </button>
      </div>

      <div style={{ paddingBottom: 'var(--space-16)' }}>
        <PageState
          isLoading={catalogue.isLoading}
          isError={catalogue.isError}
          onRetry={() => void catalogue.refetch()}
          skeleton="cards"
          errorWhat="les formations"
          isEmpty={cours.length === 0}
          empty={
            <EmptyState
              icon={Library}
              title="Le catalogue est vide pour le moment"
              description="Les nouvelles formations seront publiées très bientôt."
            />
          }
        >
          {visibles.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucune formation ne correspond"
              description="Essayez un autre mot-clé ou retirez un filtre pour élargir les résultats."
              action={
                <button type="button" className="btn btn--primary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              }
            />
          ) : (
            <div className="course-grid">
              {visibles.map(({ cours: c }) => (
                <FormationCard
                  key={c.coursId}
                  to={`/formations/${c.coursId}`}
                  code={c.code}
                  titre={c.titre}
                  description={c.description}
                  volumeHoraire={c.volumeHoraire}
                  formateurNom={c.formateurNom}
                  formateurPrenom={c.formateurPrenom}
                  statut={c.statutInscription}
                  action={
                    c.statutInscription === null ? (
                      <button type="button" className="btn btn--primary btn--sm" onClick={() => setCible(c)}>
                        S'inscrire
                      </button>
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </PageState>
      </div>

      <ConfirmDialog
        open={cible !== null}
        onOpenChange={(open) => {
          if (!open) setCible(null);
        }}
        title="Confirmer l'inscription"
        confirmLabel="Confirmer l'inscription"
        busyLabel="Inscription…"
        onConfirm={async () => {
          if (cible) await inscrire.mutateAsync(cible.coursId);
        }}
      >
        {cible && (
          <>
            <p>
              <strong>{cible.titre}</strong>
            </p>
            {cible.description && <p>{cible.description}</p>}
            <dl className="dialog__facts">
              <div>
                <dt>Code</dt>
                <dd>{cible.code}</dd>
              </div>
              <div>
                <dt>Volume horaire</dt>
                <dd className="tnum">
                  {cible.volumeHoraire}
                  {NB}h
                </dd>
              </div>
            </dl>
            <p className="text-small">
              Votre demande sera enregistrée avec le statut « En attente » jusqu'à sa validation par l'administration.
            </p>
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
