# Plan d'implémentation — L'Empire du Sirop d'Érable

> Plan d'implémentation technique dérivé du game design document `plan.md`.
> Le projet est vide — cette feuille de route couvre la construction from scratch jusqu'à la v1 jouable.

---

## 1. Stack technique recommandée

**Vite + TypeScript + React + Zustand + break_infinity.js + Howler.js (+ PixiJS en phase polish)**

### Justifications

**Vite** — Build ultra-rapide, HMR excellent pour itérer sur l'équilibrage. Zéro config initiale, support TypeScript natif. Alternatives rejetées : Webpack (surconfig pour un projet front-only), Next.js (inutile, le jeu est 100 % client).

**TypeScript (strict)** — Les formules de coût/production, la sérialisation de sauvegarde et les migrations de schéma bénéficient énormément du typage. Les bugs d'équilibrage sur un jeu idle sont très coûteux à trouver sans types.

**React** — Le GDD liste beaucoup de composants UI réactifs (shop scrollable, menu achievements, arbre de talents, notifications, timers). Svelte/Solid seraient d'excellents choix alternatifs (plus performants pour les updates fréquents du compteur SPS) mais l'écosystème React est plus profond. **Tradeoff accepté :** on découplera le tick logique (20 Hz) du rendu React via `useSyncExternalStore` sur le store, avec throttling.

**Zustand** comme store réactif — Plus léger que Redux, permet un pattern "store hors React" qui facilite le découplage game-loop / UI. On peut écrire dans le store depuis la boucle de jeu sans re-render à chaque tick.

**break_infinity.js** plutôt que **decimal.js** — Décision importante :
- Le GDD va jusqu'à 1 Oc (10³⁰) en jeu normal, mais le prestige et la formule 1.15^n poussent facilement au-delà de 10³⁰⁸.
- `decimal.js` est arbitraire-précision mais **10-100x plus lent** ; inacceptable pour 20 ticks/s × 15 bâtiments.
- `break_infinity.js` est conçu spécifiquement pour les idle games, a une précision mantisse fixe (~15 chiffres significatifs) mais un exposant illimité. La perte de précision sur les chiffres de queue est **invisible pour le joueur** (on affiche `1.234e45`).
- **Choix : break_infinity.js.** Si un équilibre précis devient requis (ex : comparaisons d'égalité), on utilisera des epsilons relatifs.

**Howler.js** — Audio multi-channel fiable pour click sounds, événements, musique d'ambiance.

**PixiJS** (phase 8 uniquement) — Pour les particules (clicks, gouttes dorées, pleine lune). Canvas 2D brut reste une option si les performances suffisent ; PixiJS offre du batch-rendering WebGL. **Décision repoussée à la phase polish.**

**Persistance : localStorage** + couche d'abstraction pour migrer vers IndexedDB si la taille de sauvegarde dépasse 2-3 MB (improbable, mais abstraction prête).

### Outils secondaires

- **Vitest** pour tests unitaires (formules, sérialisation, migrations)
- **ESLint + Prettier** config standard
- **seedrandom** pour RNG déterministe (tests de replay, événements reproductibles)

---

## 2. Architecture du code

### Pattern global : store réactif + boucle de simulation déterministe

Pas d'ECS (surdimensionné pour 15 bâtiments). Pas de state machine globale (trop rigide pour les événements superposés). Un `GameState` central, modifié par des réducteurs purs, consommé par React.

### Séparation en 4 couches

1. **Core** (logique pure, sans DOM/React) — formules, types, réducteurs. Testable à 100 %.
2. **Engine** (boucle, événements, persistance) — orchestration temporelle. Dépend de Core.
3. **UI** (React) — affichage et interactions. Dépend de Core + Engine.
4. **Data** — tables statiques issues du GDD (bâtiments, upgrades, achievements, talents).

### Structure de dossiers

```
cookie_clicker/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                       # Point d'entrée React
│   ├── App.tsx                        # Layout principal
│   │
│   ├── core/                          # ── LOGIQUE PURE ──
│   │   ├── bignum.ts                  # Wrapper break_infinity + format
│   │   ├── types.ts                   # GameState, Building, Upgrade, Achievement
│   │   ├── constants.ts               # Tick rate, save interval, caps
│   │   ├── formulas.ts                # cost(n), sps(building), prestigeGain()
│   │   ├── state.ts                   # createInitialState(), invariants
│   │   ├── reducers/
│   │   │   ├── click.ts
│   │   │   ├── buy.ts                 # buyBuilding, buyUpgrade
│   │   │   ├── tick.ts                # applyTick(state, dtSeconds)
│   │   │   ├── event.ts               # spawnGolden, triggerCastor, ...
│   │   │   ├── achievement.ts
│   │   │   ├── level.ts
│   │   │   └── prestige.ts
│   │   └── selectors.ts               # getSPS, getClickValue, getLevel
│   │
│   ├── data/                          # ── DONNÉES STATIQUES ──
│   │   ├── buildings.ts               # 15 bâtiments
│   │   ├── clickUpgrades.ts           # 10 upgrades de click
│   │   ├── globalUpgrades.ts          # U1-U8
│   │   ├── levels.ts                  # 20 seuils + déblocages
│   │   ├── achievements.ts            # 35 achievements
│   │   ├── talents.ts                 # 10 talents post-prestige
│   │   └── events.ts                  # événements aléatoires
│   │
│   ├── engine/                        # ── ORCHESTRATION ──
│   │   ├── store.ts                   # Zustand store + wiring
│   │   ├── loop.ts                    # rAF + fixed-timestep
│   │   ├── scheduler.ts               # Timers (golden drop, castor, lune)
│   │   ├── rng.ts                     # seedrandom + state dans la save
│   │   ├── offline.ts                 # gains hors-ligne (forme fermée)
│   │   ├── persistence/
│   │   │   ├── storage.ts             # abstraction localStorage/IDB
│   │   │   ├── serialize.ts           # state → JSON compact
│   │   │   ├── deserialize.ts         # JSON → state validé
│   │   │   ├── migrations.ts          # v1 → v2 → v3 ...
│   │   │   └── autosave.ts            # timer 30s + visibilitychange
│   │   └── audio.ts                   # Howler wrapper
│   │
│   ├── ui/                            # ── REACT ──
│   │   ├── hooks/
│   │   │   ├── useGameState.ts        # sélecteur + throttle
│   │   │   └── useAnimatedNumber.ts   # interpolation smooth
│   │   ├── components/
│   │   │   ├── MapleTree.tsx          # gros érable cliquable
│   │   │   ├── TopBar.tsx             # gouttes / SPS / niveau
│   │   │   ├── Shop.tsx               # colonne droite
│   │   │   ├── UpgradePanel.tsx       # colonne gauche
│   │   │   ├── NotificationBar.tsx    # bas d'écran
│   │   │   ├── Modal/
│   │   │   │   ├── Achievements.tsx
│   │   │   │   ├── Prestige.tsx
│   │   │   │   ├── TalentTree.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   └── Stats.tsx
│   │   │   ├── Event/
│   │   │   │   ├── GoldenDrop.tsx
│   │   │   │   ├── Castor.tsx
│   │   │   │   └── FullMoon.tsx
│   │   │   └── Particles.tsx          # Canvas/PixiJS (phase 8)
│   │   └── styles/
│   │       └── *.css
│   │
│   └── assets/
│       ├── sounds/
│       └── images/
│
└── tests/
    ├── formulas.test.ts
    ├── reducers.test.ts
    ├── offline.test.ts
    └── migrations.test.ts
```

### Flux de données

```
[requestAnimationFrame] → [loop.ts accumule dt] → [tick reducer (20 Hz)]
                                                    ↓
                                              [store.setState]
                                                    ↓
                                    [React useSyncExternalStore throttled @ 10-20 Hz]
                                                    ↓
                                                [UI render]
```

Clicks et achats vont **directement** au store (actions). La boucle ne fait que la production passive et la progression des événements temporels.

---

## 3. Phases de développement

Chaque phase est **livrable et jouable** de bout en bout. La boucle de base vient avant le contenu.

### Phase 0 — Fondations (2-3 jours)

**Objectif :** squelette build + boucle de tick + rendu d'un nombre qui monte.

- `npm create vite@latest` avec template React-TS
- Installer `break_infinity.js`, `zustand`, `vitest`
- `core/bignum.ts` : format (1.23 K, 45.6 M, 7.89 G, notation scientifique passé 10³⁰)
- `engine/loop.ts` : fixed-timestep 20 Hz via `requestAnimationFrame`, accumulateur, clamp du dt à 1 s
- `engine/store.ts` : store minimal `{ drops: Decimal, sps: Decimal }`
- UI minimale : un nombre géant centré qui monte de 1/s

**Critère de sortie :** le nombre monte visiblement sans freeze, même en changeant d'onglet.

### Phase 1 — MVP cliquable (2-3 jours)

**Objectif :** boucle de jeu minimale complète.

- `core/types.ts` : `GameState` complet (même si beaucoup de champs sont vides)
- `core/reducers/click.ts` : +1 goutte par click
- Un seul bâtiment codé en dur (Chalumeau manuel)
- `core/reducers/buy.ts` avec formule `cost = 15 × 1.15^n`
- `persistence/autosave.ts` : toutes les 30 s + `beforeunload`
- UI : érable cliquable + 1 ligne dans le shop

**Critère de sortie :** clic → achat → retour le lendemain → save intacte.

### Phase 2 — Les 15 bâtiments + SPS complet (3-4 jours)

**Objectif :** tous les producteurs fonctionnels selon l'équilibrage du GDD.

- `data/buildings.ts` : table des 15 bâtiments (données seules)
- `core/formulas.ts` : `cost(building, owned)`, `sps(building, owned, multipliers)`, `totalSPS(state)`
- Achat par 1 / 10 / 100 / max
- Affichage du ROI (seconds to payback) pour chaque bâtiment
- Shop scrollable React

**Critère de sortie :** 15 bâtiments achetables, coûts et SPS matchent le GDD à 0.1 % près.

### Phase 3 — Upgrades (click + globaux) (2-3 jours)

**Objectif :** 10 upgrades de click + 8 upgrades globaux.

- `data/clickUpgrades.ts`, `data/globalUpgrades.ts`
- `core/reducers/buy.ts` étendu pour les upgrades
- **Multiplicateurs composés en couches** : base × clickUpgrades × globals × achievements × prestige × events
- Critical click (1 % → 25 %) avec RNG déterministe
- Combo multiplier (10 clicks/3 s → x1.5, stack x5)
- UI : panneau upgrades avec états lock/owned/available

**Critère de sortie :** click > 1, bâtiments profitent des upgrades globaux, multiplicateurs visibles.

### Phase 4 — Niveaux et déblocages (2 jours)

**Objectif :** progression verticale.

- `data/levels.ts` : 20 seuils avec hooks de déblocage
- `core/reducers/level.ts` : recalcul à chaque tick (cheap — comparaison sur `totalDropsEver`)
- Sirop d'érable (niv 5) et Sucre d'érable (niv 10) : conversions automatiques
- Barre de progression vers le prochain niveau
- Gating : certains upgrades/bâtiments/événements ne sont visibles qu'au bon niveau

**Critère de sortie :** progression 1→20, chaque palier débloque visiblement quelque chose.

### Phase 5 — Événements aléatoires (3 jours)

**Objectif :** gouttes dorées, vent du nord, castor, pleine lune.

- `engine/rng.ts` : seedrandom avec seed dans la save (événements reproductibles)
- `engine/scheduler.ts` : prochaine goutte dorée = `now + rand(5-15 min)`, stocké dans le state
- `core/reducers/event.ts` : application des effets, start/end de buffs temporels
- UI Event : overlay pour goutte dorée cliquable, mini-jeu castor (10 s)
- Pleine lune : 1 fois par jour réel, ancré sur UTC + `lastTriggeredAt`

**Critère de sortie :** événements qui apparaissent, buffs stackés correctement, ignorables sans bug.

### Phase 6 — Achievements (2 jours)

**Objectif :** 35 achievements avec bonus SPS.

- `data/achievements.ts` : 35 entrées avec `condition: (state) => boolean`
- `core/reducers/achievement.ts` : vérification batch toutes les secondes (pas à chaque tick)
- Stockage : `Set<string>` des ids débloqués
- UI modal avec grille + tooltip de récompense
- Toast à chaque déblocage
- Bonus des achievements branchés dans la chaîne de multiplicateurs (phase 3)

**Critère de sortie :** achievements débloqués naturellement, SPS qui monte avec.

### Phase 7 — Prestige + arbre de talents (3-4 jours)

**Objectif :** metagame complet.

- `core/reducers/prestige.ts` : reset sauf (achievements, prestigeCount, feuilles dorées, talents achetés, skins)
- Formule `feuilles = floor(sqrt(totalDrops / 1e12))`
- `data/talents.ts` : 10 talents
- Arbre de talents (UI grille, dépendances linéaires)
- Application des effets de talents à la création du state post-prestige
- Modale de confirmation avec preview du gain

**Critère de sortie :** prestige à niv 15 → run 2 est 3-5× plus rapide (objectif GDD).

### Phase 8 — Polish (4-6 jours)

**Objectif :** passage de prototype à produit.

- **Offline gains** (section 5) : popup au retour avec gains calculés
- Animations de clic (shake, scaling) + particules (Canvas ou PixiJS)
- Sons (click, achat, achievement, événements) via Howler
- Skins / cosmétiques (issus des talents et achievements)
- Options : volume, notation numérique, export/import save
- Responsive mobile (le jeu doit marcher au doigt)
- Perf : <1 ms CPU par tick avec 15 bâtiments × 1000 unités

**Critère de sortie :** le jeu est "jouable longtemps" et donne envie de revenir.

---

## 4. Fichiers critiques

Par ordre de complexité croissante :

- **`src/core/bignum.ts`** — Wrapper break_infinity. Toutes les maths du jeu passent ici. Formatage K/M/G/T/Qa/Qi/Sx/Sp/Oc puis scientifique. **Règle :** jamais laisser un `number` natif remplacer un Decimal, jamais `Math.pow` sur un coût.

- **`src/core/formulas.ts`** — Coût cumulé d'un achat de k bâtiments (formule fermée : `base × 1.15^n × (1.15^k − 1) / 0.15`), production d'un bâtiment, multiplicateur global composé, gain de prestige. Cœur de l'équilibrage.

- **`src/core/reducers/tick.ts`** — Fait avancer le temps. **Pur et déterministe.** Production = `totalSPS × dt`, déclenchement d'événements via RNG seedé, décrément des buffs, contrôle des milestones de totalDrops.

- **`src/engine/offline.ts`** — Complexité haute. Calcul en forme fermée (les multiplicateurs ne changent pas pendant l'absence : `gains = SPS × min(dt, cap24h)`). Les événements pendant l'absence **ne sont pas simulés** (coûteux et frustrant) ; bonus forfaitaire optionnel.

- **`src/engine/persistence/serialize.ts` + `migrations.ts`** — Sérialisation compacte (Decimals en string, Sets en array ; versionner le schéma dès le jour 1 avec `schemaVersion: 1`). Chaque version livrée ajoute une migration `vN → vN+1` pour garder les saves rétrocompatibles.

- **`src/engine/loop.ts`** — Fixed-timestep accumulator pattern. Clamp du dt max à 1 s pour éviter la spirale quand le navigateur est en arrière-plan (au retour, `offline.ts` prend le relais). Découple rendu (rAF 60 Hz) et logique (20 Hz).

---

## 5. Pièges et décisions architecturales

### 5.1 Grands nombres : break_infinity.js

- **Décision :** break_infinity partout, dès le jour 1. Pas de "on migrera plus tard" — rétrofit pénible.
- **Piège :** `d1.eq(d2)` peut échouer sur la précision mantisse ; pour les égalités floues utiliser `d1.div(d2).sub(1).abs().lt(1e-10)`.
- **Formatage :** table `[K, M, G, T, Qa, Qi, Sx, Sp, Oc, No, Dc]` puis scientifique passé 10³³ ou 10³⁶.

### 5.2 Offline gains

- **Formule fermée :** `gains = SPS_figé × min(elapsed, 24h)`. Pas de simulation N ticks.
- **Piège buffs :** on **gèle tous les buffs temporels** à la fermeture, ils reprennent au retour avec le temps restant intact.
- **Cap 24 h** (48 h avec talent T4) : strict. Au-delà, gains jetés.
- **Anti-abuse :** si `elapsed < 0` (horloge reculée) → ignorer et loguer. Pas de punition dure.

### 5.3 Sauvegarde

- **Fréquence :** 30 s + flush synchrone sur `visibilitychange → hidden` et `beforeunload`.
- **Taille :** ~10 KB au pic. Aucun souci pour localStorage.
- **Corruption :** try/catch sur le parse → backup dans `save_corrupt_<timestamp>` + démarrage clean avec notif joueur.
- **Migrations :** chaîne `[v1→v2, v2→v3, ...]` appliquée séquentiellement. Tester chaque migration avec une save réelle de la version précédente.
- **Export/Import :** base64 du JSON, utile pour support et debug.

### 5.4 Tick rate et découplage

- **20 Hz logique, 60 Hz rendu.** rAF accumule le dt réel ; à ≥ 50 ms accumulés → un tick logique.
- **Changement d'onglet :** rAF passe à 0-1 Hz. Au retour, l'accumulateur serait énorme → **clamp à 1 s** + délégation à `offline.ts`.
- **Pas de re-render React à 20 Hz** : throttle à 10 Hz pour l'affichage du compteur, avec interpolation CSS/JS pour une apparence smooth.

### 5.5 Floating-point

- **Jamais de `number` natif pour coûts, stocks, SPS.** Uniquement pour timers (ms), RNG (0-1), et petits entiers (owned count, number suffit jusqu'à 2⁵³).
- **Coût cumulé :** `Math.pow(1.15, n)` en float perd la précision dès n > 50. Utiliser `Decimal.pow(1.15, n)`.

### 5.6 Déterminisme et RNG

- RNG seedé (seedrandom) avec état sauvegardé. Permet replay pour tests, évite le reload-spam pour re-rouler un golden drop.
- Chaque type d'événement a son propre sous-RNG → ajouter un nouvel événement ne casse pas la séquence des autres (stabilité entre versions).

### 5.7 Équilibre React vs perf

- Compteur principal change à chaque tick → composant isolé avec son `useSyncExternalStore` pour être le seul à re-render à 10-20 Hz.
- Shop ne change que sur achat → re-render sur action.
- Tooltips de coût : update 2-5 Hz (assez pour "je peux acheter" mais pas fréquent).

---

## 6. Ordre de priorité et dépendances

```
Phase 0 (stack + loop + bignum)
    ↓
Phase 1 (MVP) ── dépend de 0
    ↓
Phase 2 (15 bâtiments) ── dépend de 1
    ↓
Phase 3 (upgrades) ── dépend de 2
    ↓
Phase 4 (niveaux) ── dépend de 2 (3 non strict mais ordre naturel)
    ↓
Phase 5 (événements) ── dépend de 4 (pleine lune gate niv 8) + RNG seedé
    ↓
Phase 6 (achievements) ── dépend de 2, 3, 4, 5 (conditions touchent à tout)
    ↓
Phase 7 (prestige) ── dépend de 4 (gate niv 15), 6 (3 achievements de prestige),
                     et du reste pour la formule de gain
    ↓
Phase 8 (polish) ── dépend de 7 (offline gains touchent au prestige)
```

### Jalons critiques bloquants

- **Bignum (Phase 0)** bloque tout.
- **Formule de coût (Phase 2)** doit être figée avant Phase 3 (les upgrades modifient la production, pas la formule de base).
- **Schéma de save + versioning (Phase 1)** doit prévoir tous les champs futurs ou savoir les migrer.
- **Séparation multiplicateurs en couches (Phase 3)** = gros refactor si décalée après les achievements.
- **RNG seedé (avant Phase 5)** bloque les événements reproductibles.

### Estimation totale

~**25-30 jours de dev solo**, hors équilibrage fin (qui peut prendre autant de temps que le code — normal sur un idle). Prévoir une phase de playtest parallèle dès que Phase 4 est livrée.

---

**🍁 Bon dev.**
