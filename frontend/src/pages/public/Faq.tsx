import { Link } from 'react-router-dom';
import { Accordion } from '@/components/public/Accordion';
import { PublicPageHead } from '@/components/public/PublicPageHead';
import { usePageTitle } from '@/hooks/use-page-title';

// Chaque réponse décrit le fonctionnement réel de l'application (aucun prix, financement, certification ni délai).
const QUESTIONS = [
  {
    title: 'Faut-il un compte pour consulter les formations ?',
    body: (
      <p>
        Non. Le <Link className="link-inline" to="/formations">catalogue</Link> et les fiches de formation sont accessibles à tous. Un compte est nécessaire pour demander une inscription et
        accéder à votre espace personnel.
      </p>
    ),
  },
  {
    title: 'Comment créer un compte ?',
    body: (
      <p>
        Cliquez sur <Link className="link-inline" to="/register">Créer un compte</Link> et suivez les trois étapes : votre compte (nom d'utilisateur, adresse e-mail, mot de passe), votre profil (prénom,
        nom, matricule), puis la confirmation. Vous pouvez ensuite vous <Link className="link-inline" to="/login">connecter</Link>.
      </p>
    ),
  },
  {
    title: "Comment m'inscrire à une formation ?",
    body: (
      <p>
        Une fois connecté à votre espace étudiant, ouvrez « Catalogue » et utilisez le bouton « S'inscrire » de la formation choisie, puis confirmez. Votre demande est enregistrée avec le statut « En
        attente » ; son statut est ensuite mis à jour par l'équipe du centre. Vous la retrouvez dans « Cours ».
      </p>
    ),
  },
  {
    title: 'Puis-je annuler une inscription ?',
    body: (
      <p>
        Oui, depuis « Cours » dans votre espace étudiant, avec le bouton « Annuler l'inscription ». Attention : une inscription annulée ne peut pas être renouvelée pour la même formation.
      </p>
    ),
  },
  {
    title: "Que trouve-t-on dans l'espace étudiant ?",
    body: (
      <p>
        Un tableau de bord, vos cours et inscriptions, le catalogue des formations, vos notes, votre emploi du temps, la liste des formateurs, vos notifications et votre profil.
      </p>
    ),
  },
  {
    title: "Que trouve-t-on dans l'espace formateur ?",
    body: (
      <p>
        Un tableau de bord, vos groupes et leurs étudiants, vos séances, votre emploi du temps, les notes que vous saisissez et modifiez, vos notifications et votre profil.
      </p>
    ),
  },
  {
    title: 'Comment contacter le centre ?',
    body: (
      <p>
        Utilisez le <Link className="link-inline" to="/contact">formulaire de contact</Link> : votre message est transmis par e-mail à l'équipe du centre.
      </p>
    ),
  },
];

/** Questions fréquentes (maquette public/faq.html). */
const Faq = () => {
  usePageTitle('Questions fréquentes');
  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <PublicPageHead
        crumbs={[{ label: 'Questions fréquentes' }]}
        title="Questions fréquentes"
        text="Les réponses aux questions que l'on nous pose le plus souvent."
      />
      <Accordion items={QUESTIONS} defaultOpen={0} />
      <p className="muted" style={{ marginTop: 'var(--space-5)', paddingBottom: 'var(--space-16)' }}>
        Une autre question&nbsp;? <Link className="link-inline" to="/contact">Écrivez-nous</Link>.
      </p>
    </div>
  );
};

export default Faq;
