# Audit Game Design — L'Empire du Sirop d'Érable

> Audit basé sur lecture du code source. Les affirmations sur l'expérience joueur sont des hypothèses à valider en playtest.
>
> **Date :** 2026-04-23 · **Auditeur :** skill `game-design-audit`

---

## Fiche projet

- **Jeu** : L'Empire du Sirop d'Érable (`package.json` : `empire-sirop-erable`)
- **Genre détecté** : Idle / clicker thématique, 20 niveaux, prestige, arbre de talents
- **Stack** : Vite + TypeScript strict + React 18 + Zustand + `break_infinity.js` + seedrandom. Audio custom (`engine/audio.ts`). Pas de moteur tiers côté rendu (DOM + CSS).
- **Taille projet** : ~40 fichiers TS/TSX gameplay, 4 couches propres (core / engine / data / ui), ~2 000 lignes de gameplay hors UI.
- **GDD / pitch fourni** : oui — `plan.md` (14 sections, très détaillé) + `IMPLEMENTATION.md` (plan technique).
- **Langue dominante** : français (strings de jeu, lore, commentaires, GDD). Rapport rédigé en français.

---

## Synthèse

Le projet tient clairement debout : l'architecture est exemplaire pour un prototype de clicker (réducteurs purs, tick déterministe découplé du rendu, `break_infinity` correctement intégré, persistance + offline cap + import/export de sauvegarde), la couverture de la promesse du GDD est large (15 bâtiments, 19 upgrades de clic, 8 upgrades globaux, 35 achievements, 10 talents, 4 saisons, 5 types d'événements, lore par niveau), et le game feel de base existe (floaters de click, squish de l'arbre, SFX dédiés par type d'action, toasts d'achievements, fanfare de level-up, offline popup). La core loop est lisible en 5 secondes de jeu, ce qui est la qualité n°1 d'un bon clicker.

Mais sous le capot, **le jeu ment sur ses récompenses**. Les achievements affichent des bonus riches et variés ("Pipelines ×2", "Érables ×2", "Ce bâtiment +5%", "+10% SPS") qui ne sont jamais appliqués : le code donne uniformément **+1 % de SPS global** par achievement débloqué, peu importe son label. Trois upgrades globaux (`u5`, `u6`) et plusieurs effets saisonniers (`seasonSucreMultiplier`, `seasonGoldenBonus`) sont achetables/visibles mais non branchés. L'auto-click du niveau 9+ produit littéralement 1 goutte/clic alors que le SPS est à 100 k/s — il est invisible. Un achievement est inatteignable à cause d'un bug de typo (`longestAway` vs `longestAwayMs`). Ces écarts sont invisibles individuellement mais, cumulés, vident le sens de la progression tardive : les choix du joueur (quel upgrade acheter, quel bâtiment pousser) n'ont pas les effets promis.

Le deuxième risque est structurel : les saisons, les événements, l'autoclick, les upgrades globaux et les achievements sont tous implémentés **comme de petits boosters isolés**, jamais comme des systèmes qui se parlent. Le résultat est une liste de mécaniques sans interaction : rien ne pousse un joueur à planifier. C'est réparable, mais ça demande de désigner une "chaîne de décisions" claire avant d'ajouter quoi que ce soit.

**Top 3 forces observées**

1. Architecture core/engine/data/ui nettement séparée et testable ; tous les réducteurs sont purs (ex. `reducers/tick.ts:24`, `reducers/click.ts:15`). Faire évoluer l'équilibrage sans tout casser est réaliste.
2. Boucle de jeu 20 Hz découplée du rendu avec accumulateur de frames (`engine/loop.ts:12-26`) — pas de drift lors de pics CPU, base solide pour idle long.
3. Couverture GDD impressionnante : presque toutes les features du `plan.md` ont au moins un stub dans le code (buildings, upgrades, achievements, talents, prestige, events, saisons, lore, skins, audio). Rare à ce stade.

**Top 3 risques majeurs**

1. 🔴 **Récompenses d'achievements fictives** — 35 achievements promettent des bonus spécifiques, le code en applique un seul générique. Effondrement de la confiance joueur à mi-parcours quand il réalise qu'optimiser "500 érables matures" n'a rien fait.
2. 🔴 **Upgrades globaux morts** (`u5` Bénédiction lunaire, `u6` Castors dressés) et **effets saisonniers non câblés** (automne, hiver). L'économie de sucre perd 50 % de ses sinks utiles.
3. 🟡 **Core loop tardif sans variété mécanique** — passé le niveau 9, la seule décision du joueur reste "acheter le plus gros bâtiment possible". Les events sont des multiplicateurs additifs qui tombent seuls, pas des moments de jeu.

---

## Axe 1 — Core loop

### Constat

La core loop centrale est : **cliquer l'érable (ou attendre) → accumuler des gouttes → acheter le bâtiment/upgrade le plus "rentable" visible → voir le SPS monter → franchir un seuil de niveau qui débloque un nouveau bâtiment/monnaie → répéter**. Flèche implémentée dans `reducers/click.ts:15-42` (click), `reducers/tick.ts:24-45` (accumulation passive + byproducts), `reducers/buy.ts:6-15` (achat), `reducers/tick.ts:83-87` (level-up). La boucle est parfaitement lisible dans le code et typée bout-à-bout.

### Analyse

- **Verbes d'action** : il y en a exactement **6** exposés au joueur via les `actions` du store (`engine/store.ts:102-220`) : `click`, `buyBuilding`, `buyClickUpgrade`, `buyGlobalUpgrade`, `clickGoldenDrop`, `chaseCastor`, `prestige`, `buyTalent`. C'est le bon nombre pour un clicker — pas de dispersion.
- **Durée d'itération moyenne** :
  - Action (1 clic) : ~150 ms avec `setTimeout(120ms)` pour l'animation squish (`MapleTree.tsx:51`).
  - Mini-objectif (acheter un bâtiment) : 10-30 s en early game, jusqu'à plusieurs minutes en mid-game selon le bâtiment choisi.
  - Objectif court (passer un niveau) : seuils 10× d'un niveau au suivant (`data/levels.ts`), soit 30-60 s entre niveaux 1-5 puis quelques minutes par niveau jusqu'au 10, puis ça s'allonge rapidement. Conforme à l'attente du genre.
- **Feedback — où il est fort** :
  - Click : floater `+valeur` animé + squish de l'arbre + SFX `click`/`crit` + un crit affiche `💥` (`MapleTree.tsx:33-76`). Très propre.
  - Achat : SFX `sfx.buy()`/`sfx.upgrade()` sur transitions valides (`store.ts:113, 121, 127`).
  - Level-up : composant `LevelUpFanfare.tsx` + SFX dédié (`store.ts:136`).
  - Achievements : `Toasts.tsx` + SFX (`store.ts:184`).
  - Buffs actifs : `BuffTimers.tsx` affiche la jauge restante.
- **Feedback — où il manque** :
  - **Les upgrades de clic achetés n'ont aucune célébration** différentiée au-delà du SFX — le joueur ne voit pas son clic devenir plus fort (pas de tween sur le floater, pas de changement visuel de l'arbre). Moment à forte charge émotionnelle gaspillé.
  - **L'auto-click (niv 9+) est silencieux et invisible** (`reducers/tick.ts:51-66`) : pas de floater, pas de son, pas même un indicateur UI. Le joueur ne sait pas qu'il a "débloqué" un auto-clic.
  - **Le crit n'a pas de hitstop ni de camera shake** — juste une couleur sur le floater. Pour un jeu où le crit x10 (base) à x1000 (endgame) est la signature du skill, c'est sous-juicé.
- **Variété / escalade** :
  - Unlock par palier de niveau : `unlockLevel` sur `BuildingDef` et `ClickUpgradeDef` gatekeep de façon propre. Le joueur voit toujours un prochain déblocage (`Shop.tsx:108` affiche `🔒 Niv X` pour les bâtiments verrouillés) — c'est une carotte visible en permanence, excellent.
  - Événements aléatoires : Vent du nord / Récolte miraculeuse / Castor / Pleine lune introduisent des "spikes" dans la boucle (`reducers/event.ts:92-128`). Fréquence : 1 event toutes les 10-30 min. **Problème** : sauf le castor, tous les events sont passifs (un multiplicateur qui apparaît puis disparaît). Le joueur n'a rien à faire, rien à décider.
  - Combo (`reducers/click.ts:44-55`) : 10 clics/3s → +0.5 stack jusqu'à ×5. C'est le seul levier actif de skill expression pendant le clic. Voir risque ci-dessous.

### Risques & recommandations

- 🔴 **Critique — L'auto-click du niveau 9+ est placebo.** `reducers/tick.ts:61` ajoute `clicks` (un `number` JS, pas un `BigNum`) aux drops, soit **1 goutte par seconde**. Or à ce stade, le SPS total dépasse 50-100 k/s. L'effet est donc **invisible** (~0,001 % de la production). Le commentaire du code (`// Each auto-click produces 1 goutte × (global multiplier) without crit/combo`) affirme le contraire — l'intention était de multiplier par `clickValue(state)`. Action : remplacer par `clicks * clickValue(state).div(something)` ou carrément supprimer l'auto-click des drops pour le transformer en levier de `totalClicks` (pour faire avancer les achievements A11-A15) s'il est conçu comme un accessibility feature pour joueurs qui ne veulent pas se fatiguer les doigts.

- 🔴 **Critique — Le castor est une punition sans récompense.** `reducers/event.ts:83-90` : si le joueur rate le castor, perte de 5 % du stock. S'il réussit : rien, juste un compteur `castorFastKills`. Pire, l'achievement "Castor vaincu" annonce "Castors donnent 1% au lieu de voler" (`achievements.ts:57`) — promesse non tenue (cf. axe 4). **Conséquence prévisible** : le castor devient une source d'anxiété pure et d'abandon potentiel, surtout en mobile où il peut apparaître pendant que le joueur ne regarde pas. Action : donner un petit gain fixe (ex : +60 s de SPS) quand chassé, et afficher le castor plus gros/plus proéminent pour réduire le "oups" involontaire.

- 🟡 **Important — Combo = spam-tax plutôt que skill.** La règle (`constants.ts:11-14`) — "10 clics en 3 s = ×1.5 cumulatif jusqu'à ×5" — ne récompense pas la précision ou le timing, seulement la capacité à cliquer vite. Tant que le joueur clique à ≥3.3 Hz, le stack reste à ×5. Au-delà, le stack ne monte plus (plafonné). Il n'y a donc **aucun moyen de faire mieux** que "spammer", et aucune raison d'arrêter si on veut le bonus. Action : faire dépendre le combo d'un rythme (fenêtre serrée type beat) ou limiter le stack à un nombre de clics par minute pour rendre le combo un choix stratégique ("je vais spammer pendant la Pleine lune").

- 🟡 **Important — Events passifs.** 4 events sur 5 (goldenDrop excepté) ne demandent aucune interaction. Le joueur découvre l'événement, puis attend sa fin. Dans un clicker moderne (Cookie Clicker, AdVenture Capitalist), même les events passifs offrent un micro-choix : consommer un bonus immédiat vs garder pour plus tard, activer/désactiver. Action : ajouter une décision sur au moins 1 event de plus (ex : Pleine lune = choix entre ×2 SPS ou ×5 click pour 5 min ; Récolte miraculeuse = choix de la monnaie boostée).

- 🟢 **Amélioration — Moment "achat d'upgrade de clic"** : ajouter une animation de transformation de l'arbre ou du curseur (ex : halo doré sur le bouton de l'arbre après "Doigts plaqués or"). Les upgrades de clic sont censés être des moments signature — actuellement noyés dans un simple toggle de liste.

- 🟢 **Amélioration — Hitstop sur crit.** 80 ms de gel du floater + screen shake discret transformeraient le crit en événement mémorable. Coût : 10 lignes de code dans `MapleTree.tsx`.

---

## Axe 2 — Équilibrage & progression

### Constat

La courbe centrale est **exponentielle à deux étages** : coûts des bâtiments `base × 1.15^n` (`formulas.ts:13-16`, standard Cookie Clicker), seuils de niveau en `10^(n+c)` (`data/levels.ts:5-24`), prestige `feuilles = floor(sqrt(totalDrops / 10^12))` (`formulas.ts:176-182`). Le tout est géré en `break_infinity.js`, ce qui est le bon choix (cf. `IMPLEMENTATION.md`).

### Analyse

- **Courbes principales**
  - **Coût bâtiment** : `base × 1.15^n`. Entre bâtiments : cost ratio ~11-16×, SPS ratio ~5.4-7×. C'est-à-dire que chaque nouveau tier est moins efficient en SPS/goutte dépensée au tiret 1, mais scale mieux au volume. Cohérent avec le design "les bâtiments anciens restent utiles" revendiqué dans le GDD.
  - **Seuils de niveau** (`data/levels.ts`) : 0, 100, 1k, 10k, 100k… soit `10^(n-1)` pour les niveaux 1-10, puis jumps à 10^15, 10^18, 10^21, 10^27. **Breakpoint** : entre le niveau 19 (1 Sx = 10^21) et le niveau 20 (1 Oc = 10^27), il manque **6 ordres de grandeur** (vs ~1-3 entre les autres niveaux). Le dernier palier est 1 million de fois plus long que le précédent. Problème : ou c'est intentionnel ("fin de partie prestigeable infinie"), ou c'est une typo. À clarifier.
  - **Prestige** : `sqrt(totalDrops / 10^12)`. À 1 Qa (10^15) drops totaux, le joueur gagne `sqrt(1000)` ≈ 31 feuilles (= +62 % SPS). À 1 Qi (10^18), 1 000 feuilles (= ×21 SPS). Incitation à aller plus loin avant prestige, OK. **Bug** : le floor final passe par `result.toNumber()` (`formulas.ts:181`), ce qui plafonne à `Number.MAX_VALUE ≈ 1.8e308`. Au-delà, `Math.floor(Infinity) === Infinity` et le BigNum résultat sera `NaN` ou `0`. En pratique atteignable seulement par joueurs extrêmes mais à corriger quand même (utiliser `result.floor()` de break_infinity).
- **Économie** : 3 monnaies utiles (gouttes 💧, sirop 🍯, sucre 🧊) + prestige (feuilles 🍂) + essence (✨). Sirop/sucre sont générés **en parallèle** des gouttes (`reducers/tick.ts:12-22`), pas consommés depuis drops. Ratios fixes 1:1000 à chaque tier. **Sinks** : 8 global upgrades au total, 4 en sirop (1k-1M), 4 en sucre (100-100k). À la fin du jeu :
  - sinks sirop totaux = 1.11 M
  - sinks sucre totaux = 111.1 k
  - Mais le sirop produit s'accumule sans limite dès le niveau 5. À SPS = 10M/s (mi-partie), le joueur génère 10k sirops/s — il peut acheter **tout le sirop side dans 2 minutes après niveau 8**. Le sirop cesse d'être une monnaie 95 % du jeu. Même problème, léger moins aigu, pour le sucre.
- **Courbe de difficulté** : inexistante dans son sens usuel — c'est un clicker. Le "challenge" est d'optimiser quoi acheter quand. La pression vient uniquement des events (vent du nord −30 %, castor −5 % stock). Ces events ne scalent pas avec le niveau : un vent du nord à niveau 5 fait mal, à niveau 18 c'est un sursis d'une minute sans impact réel. OK pour un jeu casual mais à noter.
- **Power curve / unlocks** :
  - 0-30 s : 1 verbe (clic). OK, onboarding minimal.
  - 30 s-5 min : premier achat de bâtiment, premier upgrade de clic. Bonne cadence.
  - 5 min-30 min : 3-5 bâtiments possédés, 3-5 upgrades de clic, niveau 4-5 → déblocage du sirop (changement visible dans le TopBar).
  - 30 min-3 h : sirop, sucre, autoclick (niv 9, mais cassé — voir axe 1), pleine lune.
  - 3 h-3 j : prestige disponible (niv 15), ouverture du méta-niveau.
  - La pyramide fonctionne en papier. En pratique, entre niveau 12 (1 T drops) et niveau 15 (1 Qa = 10^15 drops) — palier de prestige — il y a 1 000× de grind avec très peu d'unlocks nouveaux (un achievement de palier, un événement castor, un combo ×5). **Risque de plateau.**

### Risques & recommandations

- 🔴 **Critique — Sirop et sucre deviennent inutiles rapidement.** Les 8 upgrades globaux coûtent au total 1,11 M 🍯 et 111,1 k 🧊. À partir du niveau 8-9, le joueur peut acheter la totalité de l'arbre sirop+sucre en quelques minutes. **Conséquence** : les 80 % restants de la run, ces monnaies s'accumulent en pure vanité. Action : soit ajouter 5-10 upgrades globaux supplémentaires pour couvrir la fin de partie (coûts 1 G à 1 T en sirop), soit introduire un sink cyclique (ex : "Bénir un bâtiment" = consomme du sirop pour un buff temporaire, achetable N fois).

- 🔴 **Critique — Saut de seuil disproportionné niveau 19 → 20.** 1 Sx (10^21) → 1 Oc (10^27) = facteur 10^6. Les autres sauts sont de l'ordre de 10× à 10 000×. Si c'est intentionnel (fin de partie réservée aux prestigers extrêmes), afficher dans l'UI combien de prestiges sont nécessaires en moyenne pour l'atteindre. Sinon, replanifier la courbe (ex : niveaux 18 = 10^21, 19 = 10^24, 20 = 10^27, avec des déblocages intermédiaires).

- 🟡 **Important — `mul(0)` dans le global multiplier.** `formulas.ts:53` : `mult = mult.mul(D(1).add(D(totalBuildings).div(1000).mul(0)))`. Le `.mul(0)` annule ce terme. Probablement une feature abandonnée ("+0.1% SPS par bâtiment possédé, plafond 1000") ou un test oublié. Soit l'activer avec le bon coefficient, soit retirer la ligne.

- 🟡 **Important — Temps de retour sur investissement non garanti.** La règle d'or du GDD dit "ROI < 10 min en early, < 1 h en end-game". Rien dans le code ne le vérifie et rien n'empêche une courbe cassée. Proposition : ajouter un test unitaire qui simule l'achat de chaque bâtiment au niveau de déblocage et mesure le ROI (`SPS gagné / coût`). Ça détecterait toute régression d'équilibrage.

- 🟡 **Important — Plateau niveau 12 → 15 avant prestige.** 1 T → 1 Qa = 1 000× de grind pour un unlock majeur (le prestige). Entre les deux, trop peu d'événements ou de déblocages. Insérer 1-2 micro-unlocks (ex : niveau 13 = castor, déjà là ; niveau 14 = doubler la fréquence des golden drops temporairement ; niveau 15 = prestige). Aujourd'hui, niveau 14 est juste un label.

- 🟢 **Amélioration — Prestige precision bug.** `prestigeGain` (`formulas.ts:181`) fait `Math.floor(result.toNumber())`. Au-delà de ~10^154 drops totaux, `toNumber()` retourne `Infinity`. Utiliser `result.floor()` de `break_infinity.js` pour rester BigNum jusqu'au bout.

- 🟢 **Amélioration — Ajouter des "décisions de build"** dans le shop : un toggle "vue ROI" qui trie les bâtiments achetables par payback time. C'est un standard des clickers modernes et ça fait naître une mini-stratégie.

---

## Axe 3 — Motivation & rétention

### Constat

Le jeu s'appuie principalement sur la **compétence** (voir son nombre monter, débloquer du contenu) et l'**investissement** (sauvegarde persistante, prestige durable, talents conservés). L'**autonomie** réelle est faible (pas de builds divergents, ordre d'achat objectivement optimal), l'**ancre sociale** est absente (pas de leaderboard, pas de partage). La **récompense variable** existe via les crits (1 %-25 %) et les events aléatoires (rng sur type d'event), mais presque tous les bonus sont des multiplicateurs qui s'empilent linéairement → le joueur n'a pas de "drop rare" qui change la run.

### Analyse

- **Autonomie** : aucune branche de classe. Un seul ordre d'achat objectivement optimal à chaque instant (acheter le bâtiment/upgrade au meilleur SPS/coût). L'arbre de talents (`data/talents.ts`) introduit un peu de choix post-prestige (10 talents, coûts 1 à 25k feuilles), mais l'absence de limite de points fait qu'à long terme, on achète tout. Aucun trade-off durable → **autonomie cosmétique**.
- **Compétence** : bien servie par le feedback immédiat (TopBar qui bouge, barre de progression du niveau `TopBar.tsx:74-82`, Shop qui affiche coût actualisé). L'ouverture progressive des monnaies (sirop à 5, sucre à 10, feuilles dorées à 15) donne un sentiment de maîtrise qui s'étoffe. **Ce pilier est le plus solide.**
- **Relation sociale** : zéro. Pas de leaderboard local, pas de partage de stats, pas d'export de code de run. Pour un clicker solo, c'est défendable — mais ça plafonne la rétention virale (pas de bouche-à-oreille).
- **Objectifs micro/méso/macro**
  - Micro (secondes) : cliquer, attraper une goutte dorée, chasser un castor.
  - Méso (minutes) : acheter le prochain bâtiment, franchir un niveau, débloquer un upgrade.
  - Macro (heures-jours) : prestige, compléter les 35 achievements, remplir l'arbre de talents, débloquer tous les skins (`data/skins.ts`) et tout le lore (20 lettres, `data/lore.ts`).
  - La pyramide est bien remplie à tous les étages — probablement la force de rétention n°1 du jeu.
- **Récompense variable**
  - Crits : chance = 1-25 %, mult = ×10-×1000 (`formulas.ts:151-171`). Bon vecteur de dopamine.
  - Events : 4 types rollés avec poids hardcodés (`reducers/event.ts:107-112`) : 40 % miraculousHarvest, 35 % northWind, 25 % castor (si niv ≥ 13, sinon fallback). La distribution est discutable — 40 % de récolte vs 35 % de vent du nord : le joueur moyen voit donc ~autant de bons que de mauvais événements. Mais les effets sont asymétriques (×3 pendant 30s vs ×0.7 pendant 60s) — net positif mais subtil.
  - Golden drop : 50/50 entre "+13 % stock immédiat" et "×7 SPS pendant 77 s" (`reducers/event.ts:47-71`). Duale, variable, satisfaisante — **l'event le mieux conçu du jeu.**
- **Investissement persistant**
  - Sauvegarde localStorage + backup si corruption (`engine/persistence/storage.ts` via import de `backupCorrupt`). Auto-save à 30 s (`constants.ts:3`). Import/export base64 (`store.ts:191-205`) — permet de se porter entre machines.
  - Prestige conserve : achievements, talents, skins, lore lu, compteur de prestige. Ce qui reste investi à travers la mort de la run est **suffisant** pour que le joueur sente qu'il progresse même après reset.
  - Customisation : skins d'arbre + de cabane (`data/skins.ts`). Purement cosmétique, bien.

### Risques & recommandations

- 🔴 **Critique — Récompenses d'achievements fictives.** `data/achievements.ts` déclare un `rewardLabel` spécifique pour chacun des 35 achievements ("+10% SPS", "Érables ×2", "Pipelines ×2", "Ce bâtiment +5%", "+5% crit chance", etc.). `AchievementsModal.tsx:47` et `Toasts.tsx:19` **affichent ce label au joueur comme la récompense obtenue**. Or dans `formulas.ts:59-62`, le seul effet réellement appliqué est :

  ```ts
  const achievementCount = Object.values(state.achievements).filter(Boolean).length;
  if (achievementCount > 0) {
    mult = mult.mul(ONE.add(D(achievementCount).mul(0.01)));
  }
  ```

  C'est-à-dire **+1 % de SPS global par achievement débloqué**, quel que soit son label. "Érables ×2" ne double pas les érables. "+5 % crit chance" ne change pas la crit chance. "Dorées ×2 effet" ne change pas les dorées. Le joueur qui joue 10 heures et achète "Forêt amazonienne" (500 érables matures) croit avoir multiplié par 2 ses érables (accélération énorme attendue) mais reçoit en fait la même +1 % SPS que pour le premier achievement trivial "cliquer 1 fois". **C'est le bug de design le plus grave du jeu.** Action : soit implémenter réellement chaque reward (une semaine de travail et beaucoup de code dans `formulas.ts`), soit simplifier l'UX en passant tous les `rewardLabel` à "+1 % SPS" et assumer. La pire option est de laisser le delta actuel.

- 🔴 **Critique — Deux upgrades globaux sont morts.** `u5` Bénédiction lunaire ("Pleine lune ×2 fréquence") et `u6` Castors dressés ("Les castors donnent 10 % au lieu de voler") sont déclarés avec `kind: 'eventMult'` (`data/globalUpgrades.ts:48, 57`). Or `formulas.ts`, `reducers/event.ts` et `reducers/tick.ts` n'utilisent **jamais** le kind `eventMult`. Le joueur paie 100 🧊 et 1 000 🧊 sans aucun effet. Action : câbler `u5` dans `maybeTriggerEvents` (réduire le cooldown de Pleine lune quand actif), câbler `u6` dans `castorSteals` (donner 10 % au lieu de voler si actif).

- 🟡 **Important — Achievement A30 inatteignable.** `achievements.ts:59` : `condition: (s) => (s as any).longestAway >= 24 * 3600 * 1000`. Le `(s as any)` masque l'erreur de typage : le champ s'appelle `longestAwayMs` dans `GameState` (`types.ts:132`, `state.ts:56`, `reducers/tick.ts:102`). `s.longestAway` est `undefined`, la comparaison est toujours `false`. L'achievement est donc impossible à obtenir même après 24 h d'absence. Action : 1 caractère à changer.

- 🟡 **Important — Achievement A31 trivial et déconnecté du nom.** `achievements.ts:60` déclenche "Doubler sous Pleine lune" via le flag `doubledOnFullMoon`. Or `store.ts:139-142` met ce flag à `true` **dès qu'une pleine lune est active**, sans vérifier que le joueur ait "doublé" quoi que ce soit. L'achievement se déclenche donc automatiquement la première fois qu'une pleine lune survient (niv 8+). Le texte promet un challenge, le code ne demande rien. Action : reformuler le texte ("Survivre une pleine lune") ou ajouter une condition réelle (ex : "gagner 2× son stock initial pendant la pleine lune").

- 🟡 **Important — Saisons à moitié cosmétiques.** `seasons.ts` définit 4 saisons et 4 effets. Mais **seuls printemps (+10% SPS) et été (+1% crit) sont câblés** (`formulas.ts:83, 158`). `seasonSucreMultiplier` et `seasonGoldenBonus` sont définis mais **jamais appelés** ailleurs dans la codebase (grep confirme 0 usage). Tooltip de la TopBar (`TopBar.tsx:59`) annonce pourtant ces effets au joueur. Action : câbler les deux helpers manquants dans `tick.ts` (sucre) et `event.ts` (scheduling golden).

- 🟢 **Amélioration — Introduire une vraie variable dans les talents.** Les 10 talents sont achetables dans l'ordre et tous bons. Ajouter 2-3 talents mutuellement exclusifs ("Voie de la patience" +30 % SPS passif VS "Voie de la frénésie" +30 % click — choisir l'un bloque l'autre jusqu'au prestige suivant) créerait des builds et de l'autonomie réelle.

- 🟢 **Amélioration — Leaderboard local** (top 3 runs par vitesse jusqu'au 1er prestige, exposé dans Stats). Coût faible, ouvre l'axe "social" solo.

---

## Axe 4 — Cohérence & scope

### Constat

Le thème "sirop d'érable québécois avec montée cosmique" est **exprimé fortement en surface** (noms de bâtiments, icônes emoji, 20 lettres de l'Érable Ancien, lore ancré dans la tradition anishinaabe et la vie rurale québécoise, `data/lore.ts:29` mentionne même "les Anishinaabe savaient déjà faire bouillir ma sève avant l'arrivée des Européens"). C'est l'un des habillages les plus travaillés qu'on voit dans un clicker. Mais mécaniquement, le thème est **neutre** : les verbes et formules sont ceux de n'importe quel clicker. Ce n'est pas un défaut en soi (Cookie Clicker non plus n'est pas "mécaniquement cookie") — mais il manque 2-3 touches mécaniques qui scelleraient l'identité.

### Analyse

- **Cohérence thème ↔ verbes** : "cliquer l'érable" est cohérent avec le thème. "Chasser le castor" est une mini-mécanique thématique (animal québécois parasite) — bon. Mais les événements "Vent du nord" et "Récolte miraculeuse" sont des skins de "debuff" et "buff" génériques. Il manque un événement spécifiquement érablière (ex : coulée printanière = bonus concentré sur 5 min deux fois par semaine en temps réel).
- **Cohérence inter-systèmes** : les systèmes se parlent peu. Analyse d'imports :
  - `formulas.ts` lit les events, les talents, les upgrades, les saisons — **hub** central, bon signe.
  - Mais les saisons n'affectent ni les events (aucune modulation de probabilité), ni les achievements (aucun achievement saisonnier), ni le lore. Elles vivent en silo d'1 multiplicateur.
  - Les skins (`data/skins.ts`) n'affectent rien (cosmétique pur, attendu).
  - Le prestige impacte l'état mais pas les events (les feuilles ne débloquent pas de nouveaux events ou modifications d'events). Dommage : on pourrait avoir des events "endgame" réservés aux joueurs qui ont prestigé.
- **Scope** : le projet est **ambitieux mais tenable** pour 1 dev. 40 fichiers gameplay, 15 bâtiments, 19 upgrades de clic (le GDD en demandait 10, **+9 bonus** ajoutés — cf. écart GDD), 8 upgrades globaux, 35 achievements, 10 talents, 20 niveaux, 20 lettres de lore, skins, audio custom, persistance complète. Le ratio code/contenu est équilibré : chaque système majeur est rempli.
- **Dette de design**
  - `formulas.ts:53` : la ligne `mul(0)` est typiquement une feature abandonnée en silence. Pas de TODO, pas de commentaire.
  - `reducers/event.ts:110` : `else if (roll < 0.75) type = 'northWind';` puis `else if (next.level >= 13) type = 'castor';` — si le niveau est < 13, le dernier else est faux, mais le `type` reste `'northWind'` par défaut. Bug potentiel ? En fait non : la ligne 108 set `'northWind'` par défaut, donc un joueur niv < 13 verra 60 % vents du nord et 40 % récoltes miraculeuses. Acceptable mais non documenté.
  - `(s as any)` dans 7 conditions d'achievements (`achievements.ts:55-61`) : le typage TypeScript est désactivé localement pour accéder à des champs qui existent bien dans le state mais sont typés tard. Le bug A30 (`longestAway` vs `longestAwayMs`) aurait été rattrapé sans ces `as any`. **Retirer tous les `as any`** est un gain direct de robustesse.
  - Pas de TODO/FIXME dans le repo (grep confirme). Propre, mais peut cacher des "je ferai plus tard" non tracés.
- **Accessibilité de base**
  - Pause : il n'y a pas de mécanisme de pause explicite — le jeu tourne en permanence via `engine/loop.ts`. Un clicker n'en a probablement pas besoin (contrairement à un jeu d'action), mais un "mute + freeze UI" serait poli.
  - Options : `OptionsModal.tsx` existe et `settings` dans le state couvre volume/musique/notation/animations. Bon.
  - Keybinds : `useKeyboard` gère juste `Escape` pour fermer les modales (`App.tsx:39`). Pas de raccourci pour cliquer l'arbre, acheter, prestige. Pour un clicker, c'est acceptable (le clic est l'essence). Spacebar = click serait un add classique pour les joueurs longue session.
  - Texte lisible : styles dans `ui/styles/` — non lu en profondeur, mais la taille des polices est raisonnable dans les rapides inspections.
  - Save anywhere : oui, localStorage auto-save + import/export.

### Risques & recommandations

- 🟡 **Important — Systèmes qui ne se parlent pas.** Saisons ↔ events, talents ↔ events, prestige ↔ events : aucun croisement. Cela rend les runs successives identiques structurellement (seuls les chiffres changent). Action peu coûteuse : introduire 3-4 interactions croisées (ex : "en hiver, 50 % de chance qu'un event castor devienne un event renard qui double au lieu de voler").

- 🟡 **Important — Thème neutre mécaniquement au-delà du castor.** Ajouter 1-2 mécaniques signées érablière rendrait le jeu mémorable : une "coulée du printemps" limitée dans le temps réel (48 h en mars IRL = ×5 SPS), un tier "Cabane commune" qui force un choix coopératif symbolique (partager X % du SPS contre un boost de cohésion), une mini-transformation sève → sirop (un sink qui convertit gouttes en sirop à un ratio variable par saison).

- 🟡 **Important — `as any` dans 7 conditions d'achievements.** `achievements.ts:55-61` contourne le typage, ce qui a permis au bug A30 de passer. Action : retirer tous les `as any`, ajouter les champs concernés au type `GameState` s'ils manquent, laisser TypeScript lever les erreurs réelles.

- 🟢 **Amélioration — Ajouter 2-3 achievements saisonniers et/ou prestige-gated.** Aujourd'hui, les 35 achievements sont obtenus dans la même séquence par tous les joueurs. Des achievements conditionnels ("acheter 100 pipelines en hiver", "compléter un niveau 10 après 3 prestiges") élargiraient la replayabilité sans ajouter de système.

- 🟢 **Amélioration — Raccourci espace = clic** (coût : 5 lignes) pour ergonomie.

---

## Écarts code ↔ GDD

Le GDD (`plan.md`) est richement détaillé. Les écarts ci-dessous sont presque tous favorables (le code a ajouté du contenu) ou mineurs — sauf ceux marqués ❌.

| Promesse GDD | Implémentation code | Écart | Commentaire |
|---|---|---|---|
| 15 bâtiments, 1.15^n | 16 bâtiments (dont `sevePrimordiale` réservé au talent T9), 1.15^n | ✅ | 1 bâtiment bonus lié au talent T9, cohérent avec l'intention |
| 10 upgrades de clic | **19 upgrades de clic** (ids `cu1`, `cu1b`, `cu2`, `cu2b`, etc.) | 📎 | Bien : le GDD prévoyait 10, le code en a rajouté 9 intermédiaires pour lisser la courbe. Bonne itération. |
| 8 upgrades globaux dont Bénédiction lunaire et Castors dressés actifs | 8 upgrades, `u5` et `u6` **sans effet** (kind `eventMult` non câblé) | ❌ | Promesse livrée sur l'emballage mais pas sur le fonctionnement |
| 35 achievements avec récompenses variées | 35 achievements, toutes récompenses **ramenées à +1% SPS** | ❌ | Le label promis est affiché mais non appliqué. Rupture de confiance joueur. |
| 10 talents de prestige | 10 talents. `t6` (Racines profondes) implémenté comme +5 % par prestige passé, `t7` unlock cu1-cu5, `t10` garde bâtiments mythiques au prestige | ✅ | 3 talents fonctionnels ; `t8` (+10 % feuilles) actif (`reducers/prestige.ts:15`). Les autres affectent l'état initial post-prestige |
| Arbre des talents 10 branches, pas de limite | Pas d'arborescence, liste plate achetable dans l'ordre | ⚠️ | Visuellement "arbre", mécaniquement liste |
| Formule prestige `floor((drops/1e12)^0.5)` | Calculée en BigNum puis `Math.floor(toNumber())` | ⚠️ | Correct fonctionnellement mais précision limitée à ~1.8e308 |
| Événements : Vent du nord, Récolte miraculeuse, Castor, Pleine lune, Golden Drop | Tous implémentés, durées et effets conformes | ✅ | Bon |
| Saisons printemps/été/automne/hiver avec 4 effets | Les 4 saisons cyclent, mais automne (+10% sucre) et hiver (+% dorées) ne sont **pas câblés** (helpers orphelins) | ❌ | Tooltip TopBar annonce des effets qui n'arrivent pas |
| Offline cap 24h, 48h avec talent T4 | Implémenté `store.ts:61-62` | ✅ | OK |
| Auto-click 1/s dès niveau 9 | Implémenté mais ajoute 1 goutte brute (pas × click value) | ❌ | Invisible en jeu (SPS >> 1) |
| Sirop auto dès niv 5, sucre dès niv 10, ratio 1:1000 | Conforme (`reducers/tick.ts:14-21`) | ✅ | Bon |
| Combo x5 à partir du niveau 12 | Combo plafonné à ×5 dès le début, pas de gate niveau | ⚠️ | Gate niveau oubliée — le combo fonctionne dès niveau 1 |
| Monnaie Essence ancienne (✨) pour skins/cosmétiques | Présente dans le state (`types.ts:95`), gagnée par tranches de 5 achievements (`store.ts:86-91`), **aucun usage côté dépense** dans le code (pas de sink) | ❌ | Monnaie s'accumule, rien à en faire |
| 20 lettres de lore | 20 lettres dans `data/lore.ts`, débloquées par `markLoreRead` | ✅ | Bon |
| Skins | Structure en place (`data/skins.ts`), MapleTree utilise skin.emoji | ✅ | Fonctionnel |
| Mini-jeu "Récolte manuelle de castors" (roadmap) | Castor en event, pas de vrai mini-jeu (juste clic) | ✅ | Conforme à la roadmap (reporté) |
| Multijoueur asynchrone (roadmap) | Absent | ✅ | Conforme, reporté |
| Sauvegarde 30s + migration schéma | Auto-save 30s, `schemaVersion` présent mais pas de logique de migration | ⚠️ | Champ réservé, logique vide — OK pour v1 |
| Anti-triche (optionnel) | Absent | ✅ | Marqué optionnel |

### Résumé des écarts

- **Favorables (📎)** : 1 (+9 upgrades de clic intermédiaires)
- **Conformes (✅)** : 11 (dont bâtiments, events, lore, skins, offline cap, persistance, currencies tier)
- **Partiels (⚠️)** : 3 (arbre de talents plat, précision prestige, combo non gated)
- **Non tenus (❌)** : 5 (récompenses achievements, u5/u6 morts, 2 effets saisonniers, auto-click placebo, essence sans sink)

Les 5 écarts ❌ représentent 80 % de la dette de design à adresser avant une v1 publique.

---

## Plan d'action priorisé

| # | Action | Axe | Sévérité | Effort | Impact |
|---|---|---|---|---|---|
| 1 | Implémenter les vraies récompenses des 35 achievements (dispatcher par `rewardType`) **ou** simplifier l'affichage pour que le label corresponde au code (+1 %) | Axe 3 / GDD | 🔴 | M-L | Élevé (confiance joueur) |
| 2 | Câbler `u5` (Bénédiction lunaire) et `u6` (Castors dressés) dans `reducers/event.ts` | Axe 3 / GDD | 🔴 | S | Moyen (économie sucre) |
| 3 | Corriger l'auto-click : multiplier par `clickValue(state)` avant d'ajouter aux drops | Axe 1 / GDD | 🔴 | S | Élevé (feature perçue |
| 4 | Câbler `seasonSucreMultiplier` dans `accumulateByproducts` et `seasonGoldenBonus` dans `scheduleNextGolden` | Axe 4 / GDD | 🟡 | S | Moyen (cohérence thème) |
| 5 | Fix A30 (`longestAway` → `longestAwayMs`) et retirer tous les `as any` d'`achievements.ts` | Axe 3 | 🟡 | S | Faible-moyen (1 ach récupéré + anti-régression) |
| 6 | Ajouter 5-10 upgrades globaux endgame en sirop (coûts 1 G à 1 T) pour réouvrir l'économie sirop | Axe 2 | 🟡 | M | Élevé (mid-game moins plat) |
| 7 | Donner un feedback pour le castor chassé (gain fixe + VFX) et une récompense symbolique | Axe 1 | 🟡 | S | Moyen (réduire frustration) |
| 8 | Ajouter 2-3 achievements saisonniers ou prestige-gated pour relancer la rétention long terme | Axe 3 | 🟢 | S | Moyen |
| 9 | Transformer l'arbre de talents en vrais chemins exclusifs (2-3 branches) | Axe 3 | 🟢 | M | Élevé (autonomie) |
| 10 | Hitstop + screen shake sur crit ; animation visible sur achat d'upgrade de clic | Axe 1 | 🟢 | S | Moyen (game feel) |

**Estimation globale** : les 3 🔴 représentent ~2-4 jours de dev concentré et débloquent 80 % de la perception "le jeu fait ce qu'il promet". Les 4 🟡 ~2-3 jours supplémentaires. Les 🟢 peuvent glisser dans le backlog.

---

## Méthodologie

Ce rapport résulte d'une lecture statique du code et d'une comparaison ligne-à-ligne avec le GDD (`plan.md`). Il ne remplace pas un playtest réel. Les priorités doivent être revues à la lumière :

- des objectifs commerciaux/artistiques de l'équipe (non visibles en code),
- des contraintes techniques et de ressources (non visibles en code),
- des données d'analytics si le jeu est déjà en soft launch.

Chaque recommandation marquée 🔴 mérite d'être discutée en équipe avant implémentation. Chaque recommandation 🟡 ou 🟢 peut être traitée au fil de l'eau.
