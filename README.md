# Centre de Formation

Application web de gestion d'un centre de formation : catalogue public, espaces étudiant et formateur, et administration complète.

![Java 17](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot 4.0.1](https://img.shields.io/badge/Spring_Boot-4.0.1-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![React 18.3.1](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)
![TypeScript 5.8.3](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS 3.4.17](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Render-2496ED?logo=docker&logoColor=white)

## Démo en ligne

- Site : https://centreformation.onrender.com


La partie administration (Thymeleaf) est servie par l'adresse du backend et n'est pas publique : accès sur demande. Pour tester les espaces étudiant ou formateur, créez un compte depuis la page d'inscription du site (l'inscription en ligne est réservée aux étudiants ; les comptes formateur sont créés par l'administration).

## Présentation

L'application permet à un centre de formation de gérer son offre pédagogique, ses publics et leur suivi. Un site vitrine présente le catalogue ; trois rôles se partagent le reste.

**Public (sans compte)** : catalogue des formations et détail de chaque formation, FAQ, mentions légales, formulaire de contact.

**Administrateur** (interface web côté serveur) :
- gestion des utilisateurs, rôles, étudiants et formateurs ;
- gestion de la pédagogie : spécialités, sessions, salles, groupes, cours, séances (emploi du temps) ;
- gestion des inscriptions et des notes ;
- affectation des étudiants aux groupes et des cours aux formateurs ;
- notifications : composition, envoi, nouvel essai en cas d'échec, consultation ;
- tableau de bord avec graphiques.

**Formateur** : consultation de ses groupes (effectifs, étudiants), de ses séances, de son planning et de ses cours ; saisie et modification des notes ; notifications ; profil.

**Étudiant** : catalogue de cours avec état de son inscription, inscription et annulation, cours et formateurs, emploi du temps, notes, notifications, profil.

Au premier démarrage, un jeu de données de démonstration (personnes fictives) peut être chargé si la base est vide (voir `APP_SEED_ENABLED`).

## Architecture

```
  Navigateur
      |
      |  HTTPS
      +----------------------------+
      |                            |
      v                            v
 Site statique React         Administration Thymeleaf
 (Render, build Vite)        (même service que l'API)
      |                            |
      | API REST (JWT)             | session + CSRF
      v                            v
 +----------------------------------------+
 |  API Spring Boot (Render, Docker)      |
 +----------------------------------------+
      |                            |
      | JDBC (SSL)                 | HTTPS
      v                            v
 PostgreSQL (Neon)             E-mail (Resend)
```

Le backend expose deux interfaces : une administration rendue côté serveur (Thymeleaf, sessions, protection CSRF) et une API REST consommée par le site React (authentification par JWT, sans état).

## Technologies

| Couche | Technologies |
|---|---|
| Backend | Java 17 (image Docker : Temurin 25), Spring Boot 4.0.1, Spring MVC, Spring Security, Spring Data JPA / Hibernate, Bean Validation, Thymeleaf, JJWT 0.12.3, Lombok |
| Base de données | PostgreSQL (hébergé sur Neon) |
| Frontend | React 18.3.1, TypeScript 5.8.3, Vite 5.4.19, Tailwind CSS 3.4.17, React Router 6, TanStack Query 5, Axios, React Hook Form, Zod, composants Radix UI |
| Tests | JUnit / Spring Boot Test, Spring Security Test (backend) ; Vitest 3.2.4 avec Testing Library (frontend, configuré) |
| Déploiement | Docker, Render (backend en conteneur, site statique), Neon, Resend |

## Sécurité

- Administration : authentification par formulaire, sessions et contrôle d'accès par rôle (`ADMIN`, `FORMATEUR`, `ETUDIANT`) ; cookies de session `Secure`, `HttpOnly`.
- Protection CSRF active pour l'administration web.
- API REST : authentification par JWT (en-tête `Authorization`), routes `/api/etudiant/**` et `/api/formateur/**` réservées au rôle correspondant ; réponses 401 et 403 en JSON.
- Mots de passe hachés avec BCrypt.
- CORS configurable par `CORS_ORIGINS` : liste explicite d'origines, les jokers sont ignorés.
- Formulaire de contact : limitation par adresse IP (5 messages par heure par défaut) et champ anti-spam invisible.
- Messages d'erreur sans détails (message, trace et exception non exposés).
- Secrets uniquement en variables d'environnement ; en profil `prod`, l'application refuse de démarrer sans `JWT_SECRET` d'au moins 32 caractères.
- Conteneur Docker exécuté par un utilisateur non root.

## Qualité

- Plus de 100 tests automatisés côté backend : services, dépôts, contrôleurs web de l'API, sécurité (CSRF, routes publiques, pages d'erreur, JWT), limiteur du formulaire de contact.
- Thème clair par défaut, thème sombre au choix de l'utilisateur (mémorisé), sur le site et sur l'administration.
- Jetons de design partagés (couleurs, typographie, espacements)
- Frontend : un seul test Vitest (de démarrage) pour l'instant.

## Installation en local

**Prérequis** : JDK 17 ou plus, Node.js 18 ou plus avec npm, une base PostgreSQL accessible.

1. Configurer le backend : copier `backend/src/main/resources/application-example.properties` vers `backend/src/main/resources/application-local.properties` (fichier ignoré par Git) et renseigner vos propres valeurs (base de données, etc.). Les mêmes valeurs peuvent aussi être fournies en variables d'environnement.
2. Configurer le frontend : copier `frontend/.env.example` vers `frontend/.env`.
3. Lancer le backend :

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

4. Lancer le frontend (http://localhost:5173) :

```bash
cd frontend
npm ci
npm run dev
```

5. Lancer les tests du backend :

```bash
cd backend
./mvnw test
```

## Déploiement

- **Neon** : base PostgreSQL ; l'URL JDBC utilise `sslmode=require`.
- **Render, backend** : service web Docker, dossier racine `backend/`, profil `prod`, sonde de santé `/api/public/health`.
- **Render, site** : site statique construit avec npm (`npm run build`), avec une règle de réécriture `/*` vers `/index.html` pour le routage côté client.
- **Resend** : envoi des e-mails. Sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte Resend ; un domaine vérifié est nécessaire pour écrire à d'autres destinataires.

Le détail (variables à saisir, démarrage à froid, données de démonstration) est dans [backend/RENDER.md](backend/RENDER.md).



## Structure du dépôt

```
.
├── backend/                  API Spring Boot et administration Thymeleaf
│   ├── src/main/java/        controller (api, web), service, repository, entity, dto, security, config, exception
│   ├── src/main/resources/   propriétés, gabarits Thymeleaf, ressources statiques de l'administration
│   ├── src/test/java/        tests automatisés
│   ├── Dockerfile            image de production
│   └── RENDER.md             guide de déploiement
├── frontend/                 site React (Vite, TypeScript)
│   ├── src/                  pages, composants, contextes, hooks, services (API), styles
│   ├── public/               images des formations (et leurs crédits), icônes
│   └── .env.example          modèle de configuration

```

## Auteur

Yazid Boujelben, étudiant ingénieur. GitHub : https://github.com/boujelben01
