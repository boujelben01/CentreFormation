import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User } from 'lucide-react';
import { getCourseTheme } from '@/lib/courseTheme';
import { fullName } from '@/lib/text';
import { CategoryBadge } from './CategoryBadge';
import { CourseVisual } from './CourseVisual';
import { StatusBadge } from './StatusBadge';
import { UserAvatar } from './UserAvatar';

const NB = ' ';

interface CourseData {
  code: string;
  titre: string;
  description: string | null;
  volumeHoraire: number;
  formateurNom: string | null;
  formateurPrenom: string | null;
}

interface CoursCardProps extends CourseData {
  /** Statut d'inscription (INSCRIT, EN_ATTENTE…) affiché en badge à droite de l'en-tête. */
  statut?: string | null;
  /** Pied de carte : mention d'état et/ou boutons. */
  footer: ReactNode;
}

/** Carte de cours de l'espace étudiant (composant « cours-card » de la maquette). */
export function CoursCard({ code, titre, description, volumeHoraire, formateurNom, formateurPrenom, statut, footer }: CoursCardProps) {
  const theme = getCourseTheme({ code, titre, description });
  const formateur = fullName(formateurPrenom, formateurNom);

  return (
    <article className="card cours-card">
      <CourseVisual theme={theme} className="cours-card__visual" seed={code} />
      <div className="cours-card__main">
      <div className="cours-card__head">
        <span className="badge-row">
          <span className="badge">{code}</span>
          <CategoryBadge category={theme.category} />
        </span>
        {statut && <StatusBadge status={statut} />}
      </div>
      <h3>{titre}</h3>
      {description && <p className="desc">{description}</p>}
      <ul className="cours-card__meta plain-list">
        <li>
          <Clock className="icon icon--sm" aria-hidden="true" />
          <span className="tnum">
            {volumeHoraire}
            {NB}h
          </span>
        </li>
        {formateur && (
          <li>
            <User className="icon icon--sm" aria-hidden="true" />
            {formateur}
          </li>
        )}
      </ul>
      <div className="cours-card__foot">{footer}</div>
      </div>
    </article>
  );
}

interface FormationCardProps extends CourseData {
  /** Cible du lien étendu sur toute la carte (fiche de la formation). */
  to: string;
  /** Statut d'inscription éventuel, superposé au visuel. */
  statut?: string | null;
  /** Action facultative à droite du pied (ex. « S'inscrire »), placée au-dessus du lien étendu. */
  action?: ReactNode;
}

/** Carte de formation du catalogue (composant « course-card » de la maquette publique). */
export function FormationCard({ to, code, titre, description, volumeHoraire, formateurNom, formateurPrenom, statut, action }: FormationCardProps) {
  const theme = getCourseTheme({ code, titre, description });
  const formateur = fullName(formateurPrenom, formateurNom);

  return (
    <article className="course-card">
      <CourseVisual theme={theme} seed={code}>
        <div className="badge-row course-card__badges">
          <CategoryBadge category={theme.category} />
          {statut && <StatusBadge status={statut} />}
        </div>
      </CourseVisual>
      <div className="course-card__body">
        <h3 className="course-card__title">
          <Link className="stretch" to={to}>
            {titre}
          </Link>
        </h3>
        <ul className="course-card__meta plain-list">
          <li>
            <Clock className="icon icon--sm" aria-hidden="true" />
            <span className="tnum">
              {volumeHoraire}
              {NB}h
            </span>
          </li>
          <li>{code}</li>
        </ul>
        <div className="course-card__foot">
          {formateur ? (
            <span className="course-card__trainer">
              <UserAvatar name={formateur} />
              <span>{formateur}</span>
            </span>
          ) : (
            <span />
          )}
          {action ? (
            <span style={{ position: 'relative', zIndex: 2 }}>{action}</span>
          ) : (
            <span className="course-card__more" aria-hidden="true">
              Voir la formation
              <ArrowRight className="icon icon--sm" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
