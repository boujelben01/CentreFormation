import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Library, Search } from 'lucide-react';
import { EmptyState, FormationCard, PageState } from '@/components/shared';
import { SelectField } from '@/components/shared/SelectField';
import { PublicPageHead } from '@/components/public/PublicPageHead';
import { usePageTitle } from '@/hooks/use-page-title';
import { usePublicCours } from '@/hooks/use-public-data';
import { CATEGORY_LABELS, getCourseTheme, type CategoryId } from '@/lib/courseTheme';
import { fullName, normalizeText } from '@/lib/text';

const ALL = 'all';
type Sort = 'titre' | 'heures-asc' | 'heures-desc';

const plural = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);
const isCategory = (value: string | null): value is CategoryId => value !== null && value in CATEGORY_LABELS;

/** Catalogue public (maquette public/formations.html) : recherche, domaine (dans l'URL : ?cat=), tri par titre ou volume horaire. */
export default function Formations() {
  const { data, isLoading, isError, refetch } = usePublicCours();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('titre');

  const catParam = params.get('cat');
  const category: CategoryId | typeof ALL = isCategory(catParam) ? catParam : ALL;
  const setCategory = (value: CategoryId | typeof ALL) => {
    setParams(value === ALL ? {} : { cat: value }, { replace: true });
  };

  usePageTitle(category === ALL ? 'Catalogue des formations' : `Formations : ${CATEGORY_LABELS[category]}`);

  const cours = useMemo(
    () => (data ?? []).map((c) => ({ cours: c, category: getCourseTheme(c).category })),
    [data],
  );

  // Domaines présents dans le catalogue, plus le domaine choisi par l'URL même s'il est vide.
  const categories = useMemo(() => {
    const present = new Set(cours.map((c) => c.category).filter((c): c is CategoryId => c !== null));
    if (category !== ALL) present.add(category);
    return (Object.keys(CATEGORY_LABELS) as CategoryId[]).filter((id) => present.has(id));
  }, [cours, category]);

  const query = normalizeText(q.trim());
  const visibles = cours
    .filter(
      ({ cours: c, category: cat }) =>
        (category === ALL || cat === category) &&
        (query === '' ||
          normalizeText(
            [c.titre, fullName(c.formateurPrenom, c.formateurNom), cat ? CATEGORY_LABELS[cat] : '', c.specialite, c.description, c.code].join(' '),
          ).includes(query)),
    )
    .sort((a, b) => {
      if (sort === 'heures-asc') return a.cours.volumeHoraire - b.cours.volumeHoraire;
      if (sort === 'heures-desc') return b.cours.volumeHoraire - a.cours.volumeHoraire;
      return a.cours.titre.localeCompare(b.cours.titre, 'fr', { sensitivity: 'base' });
    });

  const hasFilters = q !== '' || category !== ALL || sort !== 'titre';
  const resetFilters = () => {
    setQ('');
    setSort('titre');
    setCategory(ALL);
  };

  return (
    <div className="container">
      <PublicPageHead
        crumbs={[{ label: 'Formations' }]}
        title="Catalogue des formations"
        text="Filtrez par domaine, ou recherchez un titre, un formateur, un mot-clé."
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
                placeholder="Rechercher : Java, réseaux, Scrum, anglais…"
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
              <option value="titre">Trier : titre (A à Z)</option>
              <option value="heures-asc">Durée la plus courte</option>
              <option value="heures-desc">Durée la plus longue</option>
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
          {isLoading
            ? 'Chargement des formations…'
            : isError
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
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          skeleton="cards"
          errorWhat="les formations"
          isEmpty={cours.length === 0}
          empty={
            <EmptyState
              icon={Library}
              title="Le catalogue est vide pour le moment"
              description="Les nouvelles formations seront publiées très bientôt. Laissez-nous un message pour être prévenu."
              action={
                <Link className="btn btn--primary" to="/contact">
                  Nous contacter
                </Link>
              }
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
                <FormationCard key={c.id} to={`/formations/${c.id}`} {...c} />
              ))}
            </div>
          )}
        </PageState>
      </div>
    </div>
  );
}
