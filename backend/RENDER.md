# Déploiement du backend sur Render (Docker, offre gratuite)

Service web, dossier racine `backend/`, environnement Docker (le `Dockerfile` est détecté).

## Variables à saisir dans Render (noms uniquement)
| Variable | Obligatoire |
|---|---|
| `DB_URL` | oui (format JDBC, `?sslmode=require`) |
| `DB_USER` | oui |
| `DB_PASSWORD` | oui |
| `JWT_SECRET` | oui (32 caractères minimum ; sans lui le profil `prod` refuse de démarrer) |
| `CORS_ORIGINS` | oui (URL du front, séparées par des virgules, sans joker) |
| `ADMIN_PASSWORD` | si le compte `admin` doit être créé |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL` | pour l'envoi d'e-mails et le formulaire de contact |
| `APP_SEED_ENABLED` | non (voir ci-dessous) |
| `JWT_EXPIRATION_MINUTES` | non (480 par défaut) |

`SPRING_PROFILES_ACTIVE=prod` et `PORT` sont gérés par l'image / Render.

## Santé
Chemin de santé Render : `/api/public/health` (réponse `{"status":"UP"}`, sans accès à la base, donc Neon n'est pas réveillé par les sondes).

## Démarrage à froid
L'offre gratuite met le service en veille après 15 min sans requête. Le réveil prend environ 1 minute.

## APP_SEED_ENABLED
Contrôle le chargeur de données de démonstration (`DemoDataLoader`). `true` par défaut : il insère les données de démo au démarrage. Mettre `false` une fois la base en usage réel.
