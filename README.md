# 🎯 Chasse au Logo ! — v2

> Défi 3 — Coordonnées et Aléatoire  
> Un mini-jeu interactif multimodes avec classement en ligne, musique adaptative et icônes personnalisées.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss)
![NeonDB](https://img.shields.io/badge/NeonDB-PostgreSQL-00e5bf?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Howler.js](https://img.shields.io/badge/Howler.js-Audio-ff6b35?style=for-the-badge)

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Modes de jeu](#-modes-de-jeu)
- [Technologies](#-technologies)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Fichiers médias requis](#-fichiers-médias-requis)
- [Configuration NeonDB](#-configuration-neondb)
- [Migration v2](#-migration-v2)
- [Lancer le projet](#-lancer-le-projet)
- [API Routes](#-api-routes)
- [Paramètres d'URL](#-paramètres-durl)
- [Concepts appris](#-concepts-appris)

---

## 🎮 Présentation

**Chasse au Logo** est un mini-jeu web développé dans le cadre d'un défi pédagogique sur les **coordonnées et l'aléatoire** en JavaScript.

Le joueur configure sa partie en 4 étapes sur la page d'accueil, puis affronte le jeu avec des objets qui se déplacent aléatoirement à l'écran.

### Pages disponibles

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Sélection mode · logo · difficulté · musique |
| Jeu | `/game` | La partie en cours |
| Classement | `/leaderboard` | Top joueurs par difficulté |

---

## 🕹️ Modes de jeu

Le joueur choisit parmi **3 modes** avant de jouer :

### 🎯 SOLO — 1 objet
- Attrape le logo **5 fois** le plus vite possible
- **Objectif** : temps le plus court
- Le chronomètre **monte** (+1s par seconde)
- Sauvegardé dans le leaderboard par temps

### 🎯🎯 DUO — 2 objets simultanés
- **2 logos bougent en même temps**
- **Compte à rebours** de 30 secondes
- **Objectif** : maximum de clics avant la fin du temps
- Sauvegardé dans le leaderboard par score

### 🎯🎯🎯 TRIO — 3 objets simultanés
- **3 logos bougent en même temps**
- **Compte à rebours** de 30 secondes
- **Objectif** : maximum de clics — mode chaos !
- Alerte visuelle rouge quand il reste ≤ 5 secondes

---

## ⚙️ Niveaux de difficulté

| Niveau | Vitesse | Taille logo | Effet |
|--------|---------|-------------|-------|
| 🟢 FACILE | 1.8s | 90px | Lent et grand |
| 🟡 MOYEN | 1.2s | 80px | Standard |
| 🔴 DIFFICILE | 0.7s | 60px | Rapide et petit |

---

## 🎵 Musiques disponibles

| Musique | Ambiance | Fichier requis |
|---------|----------|----------------|
| 🎮 ARCADE | Rétro & fun | `public/sounds/arcade.mp3` |
| 🎵 LO-FI | Chill & focus | `public/sounds/lofi.mp3` |
| ⚔️ EPIC | Intense & rapide | `public/sounds/epic.mp3` |

Sons additionnels :
- `public/sounds/click.mp3` — joué à chaque objet attrapé (pitch légèrement aléatoire)
- `public/sounds/victory.mp3` — joué à la fin de la partie

Bouton 🔇/🔊 dans le header pour couper tous les sons instantanément.

---

## 🛠 Technologies

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 14 | Framework React fullstack — pages + API Routes |
| **Tailwind CSS** | 3 | Style et animations — classes utilitaires |
| **NeonDB** | — | PostgreSQL serverless — scores et joueurs |
| **TypeScript** | 5 | Typage statique — fiabilité du code |
| **Howler.js** | 2 | Gestion audio — musique de fond + effets sonores |
| **Windsurf IDE** | — | Environnement de développement avec IA |

---

## 📁 Structure du projet

```
chasse-au-logo/
│
├── app/                          # App Router Next.js
│   ├── page.tsx                  # 🏠 Page d'accueil (4 sélecteurs)
│   ├── game/
│   │   └── page.tsx              # 🎮 Page du jeu (SOLO / DUO / TRIO)
│   ├── leaderboard/
│   │   └── page.tsx              # 🏆 Classement par difficulté
│   └── api/
│       ├── users/
│       │   └── route.ts          # POST créer/récupérer joueur
│       ├── scores/
│       │   └── route.ts          # POST sauvegarder partie
│       └── leaderboard/
│           └── route.ts          # GET classement (filtrable)
│
├── hooks/
│   └── use-sound.ts              # 🎵 Hook custom Howler.js
│
├── lib/
│   ├── db.ts                     # Connexion NeonDB
│   ├── queries.ts                # Requêtes SQL typées (v2)
│   ├── schema.sql                # Schéma initial des tables
│   └── migration_v2.sql          # Migration vers la v2
│
├── public/
│   ├── icons/                    # 🖼️ Images PNG des logos
│   │   ├── target.png
│   │   ├── rocket.png
│   │   ├── star.png
│   │   ├── fire.png
│   │   └── diamond.png
│   └── sounds/                   # 🎵 Fichiers audio
│       ├── arcade.mp3
│       ├── lofi.mp3
│       ├── epic.mp3
│       ├── click.mp3
│       └── victory.mp3
│
├── .env.local                    # Variables secrètes (non commité)
├── .env.local.example            # Modèle de configuration
└── README.md                     # Ce fichier
```

---

## ⚙️ Installation

### Prérequis
- **Node.js** v18 ou supérieur
- **npm** ou **yarn**
- Un compte [NeonDB](https://neon.tech) (gratuit)

### Étapes

**1. Cloner le projet**
```bash
git clone https://github.com/ton-username/chasse-au-logo.git
cd chasse-au-logo
```

**2. Installer les dépendances**
```bash
npm install
```

**3. Installer les packages spécifiques**
```bash
# Driver NeonDB
npm install @neondatabase/serverless

# Audio Howler.js
npm install howler
npm install --save-dev @types/howler
```

**4. Copier le fichier d'environnement**
```bash
cp .env.local.example .env.local
```

**5. Remplir `.env.local`**
```env
DATABASE_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🖼️ Fichiers médias requis

> ⚠️ Ces fichiers ne sont **pas inclus** dans le projet pour des raisons de droits d'auteur.
> Tu dois les fournir toi-même.

### Icônes (`public/icons/`)

Fichiers PNG recommandés : **512×512px**, fond transparent.

| Fichier | Icône | Source suggérée |
|---------|-------|-----------------|
| `target.png` | 🎯 Cible | [flaticon.com](https://flaticon.com) |
| `rocket.png` | 🚀 Fusée | [flaticon.com](https://flaticon.com) |
| `star.png` | ⭐ Étoile | [icons8.com](https://icons8.com) |
| `fire.png` | 🔥 Flamme | [flaticon.com](https://flaticon.com) |
| `diamond.png` | 💎 Diamant | [icons8.com](https://icons8.com) |

> 💡 Si une image est absente, le fallback emoji s'affiche automatiquement.

### Sons (`public/sounds/`)

| Fichier | Durée | Source suggérée |
|---------|-------|-----------------|
| `arcade.mp3` | ~2-3 min | [pixabay.com/music](https://pixabay.com/music) |
| `lofi.mp3` | ~2-3 min | [freemusicarchive.org](https://freemusicarchive.org) |
| `epic.mp3` | ~2-3 min | [pixabay.com/music](https://pixabay.com/music) |
| `click.mp3` | ~0.1s | [freesound.org](https://freesound.org) — "click pop" |
| `victory.mp3` | ~2s | [freesound.org](https://freesound.org) — "victory jingle" |

---

## 🗄️ Configuration NeonDB

### Créer la base de données

1. Va sur [console.neon.tech](https://console.neon.tech)
2. Crée un **nouveau projet**
3. Copie la **Connection string** depuis le Dashboard
4. Colle-la dans ton fichier `.env.local`

### Créer les tables (première installation)

Dans le **SQL Editor** de NeonDB, exécute `lib/schema.sql`.

---

## 🔄 Migration v2

> Si tu avais déjà une base de données en v1, exécute ce fichier pour mettre à jour les tables **sans perdre les données existantes**.

Dans le **SQL Editor** de NeonDB, exécute `lib/migration_v2.sql`.

Ce fichier ajoute :

**Table `users`** — 3 nouvelles colonnes :
```sql
theme          VARCHAR(20)  DEFAULT 'dark'      -- Thème visuel
selected_icon  VARCHAR(100) DEFAULT 'target.png' -- Icône choisie
selected_music VARCHAR(20)  DEFAULT 'arcade'     -- Musique préférée
```

**Table `games`** — 2 nouvelles colonnes :
```sql
difficulty    VARCHAR(10) DEFAULT 'easy' -- 'easy' | 'medium' | 'hard'
objects_count INTEGER     DEFAULT 1      -- Nb d'objets simultanés (1-5)
```

**Vues SQL** mises à jour :
- `leaderboard` — inclut icône, difficulté, nombre d'objets
- `leaderboard_by_difficulty` — classement avec `RANK()` par niveau

---

## 🚀 Lancer le projet

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

---

## 🔌 API Routes

### Joueurs

| Méthode | Endpoint | Description | Body / Params |
|---------|----------|-------------|---------------|
| `POST` | `/api/users` | Créer ou récupérer un joueur | `{ username }` |
| `GET` | `/api/users` | Chercher un joueur | `?username=xxx` |

```js
// Exemple POST /api/users
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "SpeedRunner42" }),
});
// Retourne : { user: { id, username, theme, selected_icon, ... } }
```

---

### Scores

| Méthode | Endpoint | Description | Body / Params |
|---------|----------|-------------|---------------|
| `POST` | `/api/scores` | Sauvegarder une partie | voir ci-dessous |
| `GET` | `/api/scores` | Historique d'un joueur | `?userId=1&difficulty=hard` |

```js
// Exemple POST /api/scores
const res = await fetch("/api/scores", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: 1,
    score: 5,
    timeSeconds: 12,
    clicksTotal: 7,
    difficulty: "hard",   // 'easy' | 'medium' | 'hard'
    objectsCount: 2,      // 1 | 2 | 3
  }),
});
```

---

### Leaderboard

| Méthode | Endpoint | Description | Params |
|---------|----------|-------------|--------|
| `GET` | `/api/leaderboard` | Classement global | `?limit=10` |
| `GET` | `/api/leaderboard` | Classement par niveau | `?difficulty=hard&limit=10` |

---

## 🔗 Paramètres d'URL

La page d'accueil passe tous les choix du joueur via l'URL vers `/game` :

```
/game?logo=🚀
     &image=/icons/rocket.png
     &color=%2322d3ee
     &shadow=rgba(34,211,238,0.5)
     &difficulty=hard
     &moveInterval=700
     &logoSize=60
     &mode=duo
     &objects=2
     &timeLimit=30
     &music=arcade
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `logo` | string | Emoji fallback si image absente |
| `image` | string | Chemin vers l'icône PNG |
| `color` | string | Couleur hex de l'icône |
| `shadow` | string | Couleur rgba de l'ombre |
| `difficulty` | `easy\|medium\|hard` | Niveau de difficulté |
| `moveInterval` | number | Délai entre déplacements (ms) |
| `logoSize` | number | Taille des objets (px) |
| `mode` | `solo\|duo\|trio` | Mode de jeu |
| `objects` | number | Nombre d'objets simultanés |
| `timeLimit` | number | Durée en secondes (0 = pas de limite) |
| `music` | `arcade\|lofi\|epic` | Musique de fond |

---

## 🧠 Concepts appris

### JavaScript / TypeScript
- `Math.random()` — génération de positions aléatoires `(x, y)`
- `setInterval` / `clearInterval` — déplacement automatique + chronomètre
- Gestion des événements (`onClick`, `e.stopPropagation()`)
- Logique conditionnelle Si/Alors (clic → score → victoire)
- Tableaux d'objets — `positions[]` pour gérer plusieurs objets simultanés
- `fetch()` asynchrone — appels API en séquence (`async/await`)

### React / Next.js
- `useState` — states multiples (score, timer, positions, mode)
- `useEffect` — effets de bord avec cleanup (`clearInterval`)
- `useRef` — accès aux dimensions DOM + `nextId` sans re-render
- `useCallback` — mémorisation des fonctions pour éviter les boucles
- **Hook custom** `useSound` — encapsulation de la logique Howler.js
- `useSearchParams` — lecture des paramètres d'URL
- API Routes — backend intégré Next.js avec validation
- `<Image>` Next.js — optimisation automatique des images avec fallback

### Base de données
- PostgreSQL serverless avec NeonDB
- `ALTER TABLE` — migration sans perte de données
- `CHECK` constraints — validation côté DB
- Vues SQL avec `RANK() OVER (PARTITION BY ...)` — classement par groupe
- `COALESCE` — mise à jour partielle des colonnes

### Audio
- **Howler.js** — gestion de la musique de fond (`loop`) et des effets sonores
- `Howler.mute()` — mute global instantané
- `rate()` — variation du pitch pour éviter la répétition
- Cleanup des instances audio (`unload()`) pour éviter les fuites mémoire

### CSS / Tailwind
- Animations `@keyframes` (floatUp, glitch, pulse, scanline, blink)
- Positionnement absolu — mouvement fluide avec `transition`
- Design responsive — classes `sm:` `md:` pour mobile/desktop
- Variables CSS dynamiques via `style={{}}` en React

---

## 🗺️ Roadmap

- [x] Jeu de base — 1 objet, chrono
- [x] Leaderboard avec NeonDB
- [x] Sauvegarde du score après victoire
- [x] Sélection de l'icône (5 logos)
- [x] 3 niveaux de difficulté (vitesse + taille)
- [x] 3 modes de jeu (SOLO / DUO / TRIO)
- [x] Musique de fond + sons (Howler.js)
- [x] Images PNG comme icônes
- [ ] Adaptation mobile complète
- [ ] Publication en ligne (Vercel)

---

## 👤 Auteur

Projet réalisé dans le cadre d'une formation en développement web.

---

## 📄 Licence

MIT — libre d'utilisation à des fins éducatives.
