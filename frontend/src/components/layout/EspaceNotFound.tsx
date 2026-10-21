import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_SHELL } from './navConfig';

const HINTS = {
  ETUDIANT: 'Utilisez le menu pour retrouver vos notes, votre emploi du temps ou vos notifications.',
  FORMATEUR: 'Utilisez le menu pour retrouver vos groupes, vos séances, votre emploi du temps ou vos notes.',
} as const;

/** Page introuvable dans un espace connecté (maquettes etudiant/404.html et formateur/404.html). */
export function EspaceNotFound() {
  const { user } = useAuth();
  const role = user?.role ?? 'ETUDIANT';

  return (
    <>
      <PageHeader title="Page introuvable" />
      <div className="nf">
        <p className="code" aria-hidden="true">
          404
        </p>
        <h2 tabIndex={-1}>Cette page n'existe pas dans votre espace</h2>
        <p>{HINTS[role]}</p>
        <Link className="btn btn--primary btn--lg" to={ROLE_SHELL[role].home}>
          Retour au tableau de bord
        </Link>
      </div>
    </>
  );
}
