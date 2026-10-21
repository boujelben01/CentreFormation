import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicPageHead } from '@/components/public/PublicPageHead';
import { usePageTitle } from '@/hooks/use-page-title';

/** Mention à renseigner par l'éditeur du site avant toute mise en ligne réelle. */
const ACompleter = () => <span className="badge badge--accent">À compléter</span>;

/** Mentions légales (maquette public/mentions.html) : aucune information légale n'est inventée. */
const MentionsLegales = () => {
  usePageTitle('Mentions légales');
  const { hash } = useLocation();

  // Les liens du pied de page ciblent #confidentialite et #cgu : le routeur ne fait pas défiler seul.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="container legal" style={{ paddingBottom: 'var(--space-16)' }}>
      <PublicPageHead crumbs={[{ label: 'Mentions légales' }]} title="Mentions légales et confidentialité" />

      <h2 id="mentions">Mentions légales</h2>
      <p>
        <strong>Ce site est un projet de démonstration.</strong> Il ne constitue pas le site officiel d'un organisme de formation. Les informations ci-dessous doivent être renseignées par l'éditeur avant toute
        mise en ligne réelle.
      </p>
      <ul className="plain-list" style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
        <li>
          Éditeur du site : <ACompleter />
        </li>
        <li>
          Directeur de la publication : <ACompleter />
        </li>
        <li>
          Adresse du siège : <ACompleter />
        </li>
        <li>
          Hébergeur (nom, adresse, contact) : <ACompleter />
        </li>
      </ul>
      <p>
        Pour toute demande, utilisez le <Link className="link-inline" to="/contact">formulaire de contact</Link>.
      </p>

      <h2 id="confidentialite">Politique de confidentialité</h2>
      <p>
        Les informations saisies dans le formulaire de contact sont transmises par e-mail à l'équipe pour traiter votre demande. Celles saisies à la création d'un compte servent à créer et à gérer ce compte.
      </p>
      <ul className="plain-list" style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
        <li>
          Responsable du traitement : <ACompleter />
        </li>
        <li>
          Durée de conservation des données : <ACompleter />
        </li>
        <li>
          Exercice des droits d'accès, de rectification et de suppression : <ACompleter />
        </li>
      </ul>

      <h2 id="cgu">Conditions générales d'utilisation</h2>
      <p>L'accès à un espace (étudiant ou formateur) est personnel : ne communiquez pas vos identifiants.</p>
      <ul className="plain-list" style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
        <li>
          Autres conditions d'utilisation (propriété des contenus, responsabilité) : <ACompleter />
        </li>
      </ul>
    </div>
  );
};

export default MentionsLegales;
