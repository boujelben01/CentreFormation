

## Lot 5 — étape 4 : `/login` et `/register` dans le layout public

Sources lues : `public/connexion.html`, `public/inscription.html`, `client/shared.css` (auth, auth__grid, auth__aside, auth-card, auth-card__foot, stepper, summary, success-panel), `client/shared.js` (`EPC.form`, `EPC.stepper`).
Captures comparées (Edge headless, 1280 px et 375 px, clair et sombre ; maquette `file://` contre React sur un serveur Vite temporaire, port 5174, arrêté ensuite). États vérifiés avec des réponses d'API simulées au niveau du navigateur (aucun appel réel de connexion, aucun identifiant réel) : erreurs de validation (connexion et inscription), identifiants invalides (401, message de l'API), chargement, connexion réussie (redirection vers `/etudiant`), compte créé, nom d'utilisateur déjà pris (409), étape 2 et récapitulatif de l'inscription, utilisateur déjà connecté (redirection vers son espace). La logique n'a pas changé : `AuthContext`, `authApi`, validation, stepper en trois étapes, `userType: 'ETUDIANT'` uniquement, `AuthRoute`, redirection selon le rôle. Aucun CSS de maquette modifié.

| Page | Élément | Maquette | React avant | Correction |
|---|---|---|---|---|
| Connexion / Inscription | Mise en page | `.container.auth` > `.auth__grid` : panneau `.auth__aside` (masqué sous 960 px) + carte `.auth-card`, dans l'en-tête et le pied de page du site | Page isolée plein écran, logo centré au-dessus de la carte | Routes `/login` et `/register` dans `PublicLayout` ; nouveau composant `AuthShell` (`.auth`, `.auth__grid`, `.auth__aside`) ; le logo est celui de l'en-tête |
| Connexion / Inscription | `<main>` | Fourni par la coquille du site | `<main>` propre à chaque page | Un seul `<main id="main">` (celui du layout) |
| Connexion / Inscription | Titre d'onglet | « … — EduPortal » | Titre générique | « Connexion — EduPortal », « Créer un compte — EduPortal » |
| Connexion | Panneau latéral | « Espace étudiant » : emploi du temps, notes avec moyenne générale, inscription aux cours | — | « Connexion — Retrouvez votre espace. » : deux points décrivant les deux espaces réels (étudiant, formateur), sans moyenne |
| Connexion | Carte | Titre, texte, `form-alert`, champs, lien « Mot de passe oublié ? », bouton `btn--block`, encadré « Démonstration », pied « Créer un compte » + « Retour à l'accueil » | Idem sans lien ni encadré | Inchangée : mêmes champs, mêmes messages, bouton avec spinner « Connexion… » |
| Inscription | Panneau latéral | « Votre compte en moins de trois minutes » ; trois arguments dont l'e-mail de bienvenue | — | « Votre compte en trois étapes. » ; demande d'inscription ensuite, nom / prénom / mot de passe modifiables depuis le profil, catalogue consultable sans compte |
| Inscription | Écran « Compte créé » | Boutons « Se connecter » et « Parcourir le catalogue » | Un seul bouton (le catalogue n'existait pas) | « Parcourir le catalogue » ajouté (route `/formations` désormais disponible) |
| Connexion | Redirection depuis une route protégée | — | `ProtectedRoute` renvoie vers `/login` sans mémoriser la page demandée | Comportement conservé tel quel (pas de retour à la page demandée ajouté) |

## Exceptions volontaires du lot 5 (étape 4)
| Élément maquette | Raison |
|---|---|
| Lien « Mot de passe oublié ? » et page `mot-de-passe-oublie.html` | Aucun backend de réinitialisation : lien et page non portés |
| Encadré « Démonstration » (identifiants fictifs) | Texte propre à la maquette |
| Bandeau « Vous avez été déconnecté » (`?logout=1`) | La déconnexion affiche déjà le toast « Vous êtes déconnecté » |
| « E-mail ou nom d'utilisateur » | L'API de connexion attend une adresse e-mail : libellé « Adresse e-mail » conservé |
| « CIN » | Le champ réel est le matricule : libellé « Matricule » conservé |
| « Un e-mail de bienvenue vous est envoyé » (panneau et écran de succès) | Envoi d'e-mail non garanti par l'API |
| « moyenne générale calculée pour vous », « en moins de trois minutes » | Affirmations de la maquette non vérifiables : remplacées |
| Prénom et nom facultatifs, sans règle de longueur | Le contrat actuel n'impose que les champs déjà validés (comportement existant conservé) |
| Retour à la page demandée après connexion | Non présent aujourd'hui : non ajouté (consigne) |
