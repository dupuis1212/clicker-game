# 🍁 Empire du Sirop d'Érable

Un jeu clicker idle québécois — récolte de la sève, construis un empire sucré, et transforme ton érablière en dynastie cosmique.

Inspiré de *Cookie Clicker*, thématisé autour de la coulée printanière, avec suffisamment de mécaniques pour te garder occupé(e) : prestige, talents, achievements, événements aléatoires, saisons, quêtes quotidiennes, et plus encore.

---

## 🎮 Jouer

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173 dans ton navigateur.

### Autres commandes

```bash
npm run build      # build de production (tsc + vite build)
npm run preview    # preview du build local
npm test           # lance les tests (vitest)
```

---

## 🌳 Mécaniques principales

### Le clic
Clique sur l'érable géant pour récolter des **gouttes de sève**. Chaque clic vaut au minimum 1 goutte — plus avec les améliorations de clic.

### Bâtiments
Achète des bâtiments pour produire automatiquement des gouttes (SPS = sève par seconde). Le prix augmente à chaque achat.

### Améliorations & talents
Débloque des upgrades globales, des upgrades de bâtiment, et dépense tes points de talent gagnés au prestige.

### Prestige (feuilles dorées 🍂)
À partir du niveau 15, tu peux prestiger pour repartir de zéro et gagner des **feuilles dorées**. Chaque feuille donne **+2 % SPS permanent**.
Formule : `√(gouttes totales / 10¹²)`

### Achievements
~30+ achievements répartis en catégories : production, clicks, événements, prestige, collection. Chacun donne un petit boost (SPS, clic, effet doré, etc.).

### Événements aléatoires
- ✨ **Goutte dorée** — clique-la : +13 % du stock **OU** frénésie ×15 SPS pendant 77 s
- ❄️ **Vent du nord** — SPS ×1.5 pendant 60 s
- 🌾 **Récolte miraculeuse** — SPS ×5 pendant 30 s
- 🦫 **Castor gourmand** — chasse-le pour un gros bonus (niv 13+)
- 🌕 **Pleine lune** — double tout pendant 5 minutes (niv 8+, une fois par jour)

### Saisons
La saison change selon la date réelle :
- 🌱 **Printemps** : bonus production
- ☀️ **Été** : clics renforcés
- 🍂 **Automne** : prestige plus rentable
- ❄️ **Hiver** : gouttes dorées plus fréquentes

### 🍁 La Coulée du printemps
Pendant mars/avril IRL (la vraie saison des sucres), **+50 % production** et gouttes dorées beaucoup plus fréquentes. Un vrai temps des sucres numérique.

### Quêtes quotidiennes
Objectifs renouvelés chaque jour : clics, bâtiments, gouttes dorées attrapées, upgrades achetées, coups critiques.

---

## 🛠️ Stack technique

- **React 18** + TypeScript
- **Zustand** — state management
- **break_infinity.js** — gros nombres (jusqu'à l'infini du sucre)
- **Vite** — bundler & dev server
- **Vitest** — tests
- **seedrandom** — RNG déterministe

### Architecture

```
src/
├── core/          # logique de jeu pure (reducers, formules, types)
│   ├── reducers/  # click, buy, tick, event, prestige, achievement
│   ├── formulas.ts
│   ├── rewards.ts
│   ├── seasons.ts
│   └── coulee.ts
├── data/          # définitions statiques (buildings, talents, achievements, skins, lore)
├── engine/        # boucle de jeu, persistence, audio, store Zustand
└── ui/            # composants React + styles
```

La logique du jeu est découplée de l'UI — les reducers sont des fonctions pures `(state, action) => state`, ce qui facilite les tests et les rollbacks.

---

## 💾 Sauvegarde

Le jeu s'autosauvegarde dans `localStorage` toutes les quelques secondes. Tu peux réinitialiser depuis le menu *Options*.

---

## 📖 Documentation additionnelle

- [`plan.md`](./plan.md) — vision initiale et roadmap
- [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) — notes d'implémentation
- [`CHANGELOG-ADDICTIF.md`](./CHANGELOG-ADDICTIF.md) — journal des changements côté game design
- [`audit-game-design.md`](./audit-game-design.md) — audit game design
- [`audit-direction-artistique.md`](./audit-direction-artistique.md) — audit direction artistique
