import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, CalendarDays, Check, LayoutDashboard } from 'lucide-react';
import { CourseVisual, EmptyState, FormationCard, PageState } from '@/components/shared';
import { HeroArt } from '@/components/shared/HeroArt';
import { ROLE_SHELL } from '@/components/layout/navConfig';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/use-page-title';
import { usePublicCours } from '@/hooks/use-public-data';
import { CATEGORY_LABELS, getCategoryTheme, getCourseTheme, type CategoryId } from '@/lib/courseTheme';

const FEATURED_COUNT = 3;

/** Accueil du site public, orienté bénéfices : aucune statistique, note ni témoignage n'est affiché. */
const Home = () => {
  usePageTitle();
  const { isAuthenticated, user } = useAuth();
  const space = isAuthenticated && user ? ROLE_SHELL[user.role].home : null;
  const { data: cours = [], isLoading, isError, refetch } = usePublicCours();

  // Domaines présents dans le catalogue, avec leur nombre réel de formations.
  const domaines = useMemo(() => {
    const counts = new Map<CategoryId, number>();
    for (const c of cours) {
      const category = getCourseTheme(c).category;
      if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return (Object.keys(CATEGORY_LABELS) as CategoryId[])
      .filter((id) => counts.has(id))
      .map((id) => ({ id, n: counts.get(id) ?? 0 }));
  }, [cours]);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div>
            <p className="eyebrow">Centre de formation</p>
            <h1 id="hero-title" style={{ marginTop: 'var(--space-3)' }}>
              Montez en compétences, <span className="hl">à votre rythme</span>, avec un suivi clair de votre parcours.
            </h1>
            <p className="hero__lead">
              Choisissez une formation, inscrivez-vous en ligne, puis retrouvez vos séances, vos notes et vos notifications dans
              votre espace personnel.
            </p>
            <div className="hero__cta">
              <Link className="btn btn--primary btn--lg" to="/formations">
                Découvrir les formations <ArrowRight className="icon" aria-hidden="true" />
              </Link>
              <Link className="btn btn--secondary btn--lg" to="/contact">
                Nous écrire
              </Link>
            </div>
            <ul className="hero__assure plain-list">
              <li>
                <Check className="icon" aria-hidden="true" />
                Emploi du temps en ligne
              </li>
              <li>
                <Check className="icon" aria-hidden="true" />
                Notes et notifications
              </li>
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      {domaines.length > 0 && (
        <section className="section" aria-labelledby="cat-title">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">Domaines</p>
              <h2 id="cat-title">Explorez par domaine</h2>
              <p>Des filières pour acquérir un métier ou renforcer votre profil.</p>
            </div>
            <div className="cat-grid">
              {domaines.map(({ id, n }) => (
                <Link key={id} className="cat-tile" to={`/formations?cat=${id}`}>
                  <CourseVisual theme={getCategoryTheme(id)} />
                  <strong>{CATEGORY_LABELS[id]}</strong>
                  <span className="n">
                    <b className="n__num tnum">{n}</b> {n > 1 ? 'formations' : 'formation'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--alt" aria-labelledby="pop-title">
        <div className="container">
          <div className="section__row">
            <div className="section__head">
              <p className="eyebrow">Catalogue</p>
              <h2 id="pop-title">Nos formations</h2>
            </div>
            <Link className="btn btn--secondary" to="/formations">
              Tout le catalogue <ArrowRight className="icon" aria-hidden="true" />
            </Link>
          </div>
          <PageState
            isLoading={isLoading}
            isError={isError}
            isEmpty={cours.length === 0}
            empty={<EmptyState title="Aucune formation pour le moment" description="Le catalogue sera bientôt publié. Revenez nous voir très vite." />}
            onRetry={() => void refetch()}
            skeleton="cards"
            errorWhat="les formations"
          >
            <div className="course-grid">
              {cours.slice(0, FEATURED_COUNT).map((c) => (
                <FormationCard key={c.id} to={`/formations/${c.id}`} {...c} />
              ))}
            </div>
          </PageState>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Comment ça marche</p>
            <h2 id="how-title">Trois étapes, aucune complication</h2>
          </div>
          <ol className="steps">
            <li>
              <h3>Choisissez</h3>
              <p className="muted">Parcourez le catalogue, comparez les programmes et les volumes horaires. Une question&nbsp;? Écrivez-nous.</p>
            </li>
            <li>
              <h3>Inscrivez-vous</h3>
              <p className="muted">Créez votre compte, puis demandez votre inscription au cours de votre choix.</p>
            </li>
            <li>
              <h3>Progressez</h3>
              <p className="muted">Suivez vos séances, vos notes et vos notifications depuis votre espace étudiant.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="why-title">
        <div className="container why">
          <div className="section__head">
            <p className="eyebrow">Pourquoi EduPortal</p>
            <h2 id="why-title">Tout votre parcours au même endroit</h2>
          </div>
          <ul className="why__list">
            <li>
              <span className="feature__icon">
                <LayoutDashboard className="icon icon--lg" aria-hidden="true" />
              </span>
              <div>
                <h3>Un espace à vous</h3>
                <p className="muted">Vos cours, vos inscriptions et vos notifications réunis dans un tableau de bord.</p>
              </div>
            </li>
            <li>
              <span className="feature__icon">
                <CalendarDays className="icon icon--lg" aria-hidden="true" />
              </span>
              <div>
                <h3>Un emploi du temps clair</h3>
                <p className="muted">Vos séances de la semaine, jour par jour, avec la salle et l'horaire.</p>
              </div>
            </li>
            <li>
              <span className="feature__icon">
                <Award className="icon icon--lg" aria-hidden="true" />
              </span>
              <div>
                <h3>Vos notes en ligne</h3>
                <p className="muted">Consultez vos résultats dès qu'ils sont saisis par votre formateur.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2 id="cta-title">Prêt à démarrer votre prochaine formation&nbsp;?</h2>
              <p>
                {space
                  ? 'Retrouvez vos cours, vos séances et vos notes dans votre espace.'
                  : 'Créez votre compte pour demander votre inscription à la formation de votre choix.'}
              </p>
            </div>
            <div className="cta-band__actions">
              {space ? (
                <Link className="btn btn--on-primary btn--lg" to={space}>
                  Accéder à mon espace
                </Link>
              ) : (
                <Link className="btn btn--on-primary btn--lg" to="/register">
                  Créer mon compte
                </Link>
              )}
              <Link className="btn btn--outline-on-primary btn--lg" to="/formations">
                Voir les formations
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
