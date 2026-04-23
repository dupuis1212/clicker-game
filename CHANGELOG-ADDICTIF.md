# Passe "addictif" — ce qui a changé

Audit relu, promesses cassées réparées, 4 grosses mécaniques d'engagement ajoutées.
Build TS strict propre, Vite bundle 268 kB (83 kB gzip).

## 🔧 Bugs / promesses cassées fermées

- **Récompenses d'achievement câblées** (`rewards.ts`) : plus de "+1% générique" — chaque badge a maintenant son vrai bonus (feuille mult, SPS mult, durée goldens, etc.).
- **u5 / u6 branchés** : la Bénédiction lunaire double vraiment la fréquence des pleines lunes et divise par 2 le délai des goutes dorées. Le Pot anti-castor donne 10% au lieu de 3%.
- **Auto-click rendu visible** : débloqué au niveau 7 avec 5 clics/s via `autoClickAccumulator`, et `<SapDrips>` affiche des gouttes de sève qui tombent de l'arbre en continu.
- **Talents exclusifs** (`talents.ts`, `prestige.ts`) : t11/t12/t13 s'excluent mutuellement et se reset à chaque prestige.

## 🎇 Juice / feedback

- **Hitstop 80–120 ms** sur crit / mega-crit (pause brève des anims = poids d'impact).
- **Mega-crit visuel** : floater plus gros, double 💥, glow orangé.
- **Screen shake** conservé mais cadencé sur mega (380 ms) vs crit normal (220 ms).

## 🗓️ Nouvelles mécaniques d'engagement

- **Quêtes quotidiennes** (`dailyQuests.ts`, `DailyQuestsModal.tsx`) : 3 quêtes/jour tirées via hash déterministe, progression par snapshot de compteur. Streak jusqu'à 7 jours (+70% sur les récompenses en essence).
- **Coulée du printemps** (`coulee.ts`, `CouleeBanner.tsx`) : +50% production et gouttes dorées 67% plus fréquentes en mars/avril IRL. Bonus de bienvenue = 10 min de SPS la 1ère fois de l'année.
- **Choix de faveur lunaire** (`event.ts::chooseLunarBoon`, `LunarChoiceModal.tsx`) : pleine lune = le joueur choisit entre Sève d'argent (SPS ×5), Main lunaire (clics ×5) ou Rosée dorée (gouttes ×3). Les events passifs ne s'appliquent qu'après le choix.
- **Leaderboard local** : les 20 dernières runs (`runsHistory`) sont archivées à chaque prestige, top 10 affiché dans Stats.

## 🌱 Endgame rouvert

- **Upgrades globaux sirop / sucre** (u9–u14) débloqués aux niveaux 15–20 avec coûts qui scaling en 10e12+.
- **Branches de talents** t11 Voie de la patience (+30% SPS), t12 Voie de la frénésie (+30% clic), t13 Voie du sage (+50% feuilles).
- **Essence comme sink cosmétique** : 2 skins d'arbre + 2 skins de cabane à la boutique Skins.
- **Courbe de niveau resserrée** : palier 15 → 17 maintenant atteignable dans la même session que le 1er prestige.

## 📁 Fichiers ajoutés

- `src/core/coulee.ts`
- `src/core/dailyQuests.ts`
- `src/ui/components/CouleeBanner.tsx`
- `src/ui/components/DailyQuestsModal.tsx`
- `src/ui/components/LunarChoiceModal.tsx`

## 📁 Fichiers modifiés

- `src/core/types.ts` — + DailyQuest, DailyQuestsState, RunRecord, LunarChoice
- `src/core/state.ts` — init des 5 nouveaux champs
- `src/core/constants.ts` — SCHEMA_VERSION 1→2, constantes daily quest
- `src/core/formulas.ts` — gestion pending fullMoon, choix lunaire, coulée
- `src/core/reducers/event.ts` — chooseLunarBoon, rosée dorée dans scheduleNextGolden
- `src/core/reducers/buy.ts` — compteurs buildingsBoughtThisRun / upgradesBoughtThisRun
- `src/core/reducers/prestige.ts` — RunRecord, reset des compteurs, préservation dailyQuests
- `src/engine/store.ts` — actions chooseLunarBoon, claimDailyQuest, refreshDailyQuests, grantCouleeWelcome ; tick déclenche ensureTodayQuests + welcome coulée
- `src/App.tsx` — wire CouleeBanner, LunarChoiceModal, DailyQuestsModal
- `src/ui/components/BottomBar.tsx` — bouton Quêtes avec badge
- `src/ui/components/MapleTree.tsx` — hitstop + mega floater
- `src/ui/components/StatsModal.tsx` — table Top runs
- `src/ui/styles/index.css` — styles pour coulée, lunar modal, quêtes, runs table, hitstop, mega floater
