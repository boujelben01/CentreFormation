import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Clock } from 'lucide-react';
import { CourseVisual, PageState, UserAvatar } from '@/components/shared';
import { ROLE_SHELL } from '@/components/layout/navConfig';
import { PublicBreadcrumb } from '@/components/public/PublicPageHead';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/use-page-title';
import { usePublicCoursById } from '@/hooks/use-public-data';
import { CATEGORY_LABELS, getCourseTheme } from '@/lib/courseTheme';
import { fullName } from '@/lib/text';

const NB = ' ';

function NotFoundBlock() {
  return (
    <div className="nf">
      <p className="code" aria-hidden="true">
        404
      </p>
      <h1 tabIndex={-1}>Cette formation est introuvable</h1>
      <p>L'identifiant demandé ne correspond à aucune formation du catalogue. Elle a peut-être été retirée.</p>
      <div className="state__actions">
        <Link className="btn btn--primary btn--lg" to="/formations">
          Voir le catalogue
        </Link>
        <Link className="btn btn--secondary btn--lg" to="/">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

/** Fiche d'une formation (maquette public/formation.html) : programme, formateur, carte d'inscription. */
export default function FormationDetail() {
  const { id } = useParams();
  const coursId = Number(id);
  const valide = /^\d+$/.test(id ?? '');
  const { data: c, isLoading, isError, error, refetch } = usePublicCoursById(valide ? coursId : NaN);
  const { isAuthenticated, user } = useAuth();
  const space = isAuthenticated && user ? ROLE_SHELL[user.role].home : null;

  const introuvable = !valide || (isError && isAxiosError(error) && error.response?.status === 404);
  usePageTitle(introuvable ? 'Formation introuvable' : c?.titre);

  // Barre d'inscription collante (mobile) : la maquette pose .has-cta-bar sur <body>.
  const hasCta = !!c && !introuvable;
  useEffect(() => {
    if (!hasCta) return;
    document.body.classList.add('has-cta-bar');
    return () => document.body.classList.remove('has-cta-bar');
  }, [hasCta]);

  if (introuvable) {
    return (
      <div className="container">
        <NotFoundBlock />
      </div>
    );
  }

  return (
    <div className="container">
      <PageState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        skeleton="list"
        errorWhat="cette formation"
      >
        {c && <Fiche cours={c} space={space} />}
      </PageState>
    </div>
  );
}

function Fiche({ cours: c, space }: { cours: NonNullable<ReturnType<typeof usePublicCoursById>['data']>; space: string | null }) {
  const theme = getCourseTheme(c);
  const formateur = fullName(c.formateurPrenom, c.formateurNom);
  const heures = (
    <>
      {c.volumeHoraire}
      {NB}heures
    </>
  );
  const cta = space ? (
    <Link className="btn btn--primary btn--lg" to={space}>
      Mon espace
    </Link>
  ) : (
    <Link className="btn btn--primary btn--lg" to="/register">
      S'inscrire
    </Link>
  );

  return (
    <>
      <div className="page-head" style={{ paddingBottom: 0 }}>
        <PublicBreadcrumb items={[{ label: 'Formations', to: '/formations' }, { label: c.titre }]} />
      </div>
      <div className="detail">
        <div>
          <div className="detail__banner">
            <CourseVisual theme={theme} />
          </div>
          <h1 className="detail__title" id="detail-title" tabIndex={-1}>
            {c.titre}
          </h1>
          <dl className="facts-grid">
            {theme.category && (
              <div>
                <dt>Domaine</dt>
                <dd>{CATEGORY_LABELS[theme.category]}</dd>
              </div>
            )}
            <div>
              <dt>Code</dt>
              <dd>{c.code}</dd>
            </div>
            <div>
              <dt>Durée</dt>
              <dd className="tnum">{heures}</dd>
            </div>
            {formateur && (
              <div>
                <dt>Formateur</dt>
                <dd>{formateur}</dd>
              </div>
            )}
          </dl>

          <section aria-labelledby="d-prog" style={{ marginTop: 'var(--space-10)' }}>
            <h2 id="d-prog">Programme</h2>
            {c.description ? (
              <p className="measure" style={{ whiteSpace: 'pre-line' }}>
                {c.description}
              </p>
            ) : (
              <p className="muted">Le programme détaillé de cette formation sera publié prochainement.</p>
            )}
          </section>

          {formateur && (
            <section aria-labelledby="d-trainer">
              <h2 id="d-trainer">Votre formateur</h2>
              <div className="card card--pad trainer">
                <UserAvatar name={formateur} size="lg" />
                <div>
                  <h3>{formateur}</h3>
                  {c.specialite && <p className="muted">{c.specialite}</p>}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="aside-wrap">
          <aside className="card card--pad aside-card" aria-label="Inscription à la formation">
            {space ? (
              <Link className="btn btn--primary btn--lg btn--block" to={space}>
                Mon espace
              </Link>
            ) : (
              <Link className="btn btn--primary btn--lg btn--block" to="/register">
                S'inscrire
              </Link>
            )}
            <Link className="btn btn--secondary btn--block" to="/contact">
              Poser une question
            </Link>
            <ul>
              <li>
                <Clock className="icon icon--sm" aria-hidden="true" />
                <span className="tnum">
                  {c.volumeHoraire}
                  {NB}heures de formation
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <div className="cta-bar" id="cta-bar">
        <div>
          <strong className="tnum">{heures}</strong>
        </div>
        {cta}
      </div>
    </>
  );
}
