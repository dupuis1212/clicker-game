# Audit Direction Artistique — L'Empire du Sirop d'Érable

> Audit basé sur lecture statique des assets et du code de rendu. Les affirmations sur la perception joueur sont des hypothèses à valider en playtest.
>
> **Date :** 23 avril 2026 · **Auditeur :** skill `game-art-direction-audit`

---

## Fiche DA

- **Jeu** : L'Empire du Sirop d'Érable (idle clicker React/TypeScript, web desktop)
- **Technique dominante** : **zéro asset image**. Tout le visuel est produit par CSS procédural (dégradés, ombres, repeating-gradients, keyframes) + **emojis Unicode** comme "sprites" pour l'arbre, les bâtiments, les buffs, les saisons.
- **Volume d'assets** : 0 png/jpg/svg/aseprite/ttf dans le repo. 1 715 lignes de `src/ui/styles/index.css`. 16 bâtiments (emojis dans un dictionnaire dupliqué côté `Shop.tsx` et `BuildingScene.tsx`). 8 skins d'arbre (emojis). 5 events (emojis). 4 saisons (emojis). 20 niveaux (titres only, aucune variation visuelle).
- **Palette dominante** : ~25 variables CSS centralisées dans `:root`, 41 couleurs hex uniques dans `index.css`. Registre = bois chaud + cream + rouge grange + feuille-érable orange + vert campagne. **5 couleurs hardcodées hors palette** dans `CastorOverlay.tsx`, `PrestigeModal.tsx`, `OfflinePopup.tsx`.
- **Intention artistique fournie ?** Oui, `plan.md` + `IMPLEMENTATION.md` : "Canvas pour l'érable + particules, DOM pour les menus", "thème visuel par niveau", "animations shake + particules", "PixiJS en phase polish", saisons avec effets ambiance. Grand écart avec l'implémentation actuelle.
- **Langue dominante détectée** : français (100 % des strings UI, 100 % des noms d'objets, commentaires code mixtes FR/EN). Rapport en français.

---

## Synthèse

Pour un clicker web solo en DOM/CSS sans un seul fichier image, le résultat est **plus cohérent qu'attendu**. L'identité "cabane à sucre canadienne" se lit tout de suite — repeating-gradient de planches en bois en haut et en bas, rouge grange sur cream, dégradé de colline + clôture sticky au-dessus du champ, stats encadrées de wood-trim avec shadow-offset 2-3px qui fait "plaque en bois". Les CSS variables sont bien structurées, la hiérarchie visuelle du HUD est limpide, et le juice est généreux et tenu (squish de clic, crit-shake + hitstop sur les crits, fanfare de level-up avec sparks radiaux, tree-sway perpétuelle, cloud-drift paramétré en 60/85/100s pour éviter l'effet métronome).

Trois vraies faiblesses pèsent sur l'ensemble : **(1)** la police prévue (Fredoka/Nunito/Baloo 2) n'est jamais chargée — aucun `@font-face`, aucun import Google Fonts dans `index.html` — donc sur la majorité des machines le jeu tourne en **system-ui**, ce qui casse net le registre farm-kawaii intended. **(2)** les **skins d'arbre** (`palmier 🌴`, `séquoia 🌲`, `sapin 🎄`) empilent un emoji-arbre-complet sur un tronc CSS dur-codé — un tronc en bois dépasse visuellement d'un arbre qui a déjà le sien. **(3)** le plan promet 20 "thèmes visuels" par niveau et 4 saisons animées ; l'arena est strictement identique au niveau 1 et au niveau 20, hiver/été/printemps ne sont qu'une étiquette avec un emoji. Pour un jeu dont la dopamine repose sur la **progression visible**, c'est le plus grand trou d'ambition.

**Top 3 forces observées**

1. **Identité "grange canadienne" lisible en 2 secondes** — bois/cream/rouge-grange, clôture, colline, planches verticales en topbar/bottombar. C'est osé d'aller aussi cheesy, et c'est tenu bout en bout (`src/ui/styles/index.css:82-103` topbar, `:396-429` building-scene avec motif damier conic-gradient et clôture sticky). Résultat : on n'est pas devant "un énième clicker flat", on est devant une scène avec un parti pris.
2. **HUD hiérarchisé et tabulaire** — chiffres en `font-variant-numeric: tabular-nums`, labels UPPER 0.08em letterspacing, stat-value barn-red 900-weight, level-bar à rayures -45deg qui se lit même en périphérie. Même avec 2 buff-timers + 3 toasts + floaters + combo indicator, le HUD reste lisible (`TopBar.tsx:38-88`, `LiveStats.tsx`).
3. **Juice systémique et cohérent** — squish `scale(0.9, 0.86)` sur clic, crit → `floatUpCrit` + `critShake` + hitstop 200ms + scale(1.4), fanfare de level-up avec 12 sparks sur `rotate(i*30deg)`, frenzy-aura pulsante sur l'arbre pendant un Golden Drop, flash-bought jaune 500ms sur les achats. Rare d'avoir autant de feedback cohérent sur un projet solo (`MapleTree.tsx:56-63`, `index.css:370-380`, `:623-631`, `:633-644`).

**Top 3 risques majeurs**

1. 🔴 **Les 3 polices déclarées ne sont jamais chargées** — `index.css:36` spécifie `"Fredoka", "Nunito", "Baloo 2", system-ui` mais aucun `<link>` Google Fonts dans `index.html`, aucun `@font-face`, aucun `@import`. Sur 99 % des machines le rendu tombe sur **system-ui** (San Francisco/Segoe UI/Roboto) → la typo corporate trahit le registre farm-cartoon.
2. 🔴 **Les skins d'arbre cassent le compositing arbre = emoji-crown + CSS-trunk** — `MapleTree.tsx:76-77` rend `<span class="tree-crown">{skin.emoji}</span><span class="tree-trunk" />`. Le tronc CSS (42×46 px, bois hachuré) reste visible même quand la skin est 🌴 / 🌲 / 🎄 / 🍄, qui sont déjà des arbres complets avec leur propre tronc. Résultat : un petit moignon de bois qui dépasse du bas d'un palmier.
3. 🔴 **Zéro variation visuelle par niveau ou par saison** — `plan.md:61` promet "chaque niveau apporte un thème visuel", `plan.md:290` promet des saisons ambiance. L'implémentation actuelle : même ciel, mêmes nuages, même colline, même arbre du niveau 1 au niveau 20. L'hiver = juste l'icône ❄️ dans une stat-row du TopBar. C'est LE levier manqué pour un clicker (paliers visibles = dopamine de progression).

---

## Axe 1 — Palette & lumière

### Constat

La palette est **centralisée et nommée** dans `src/ui/styles/index.css:1-30` (c'est bien — 25 variables sémantiques : `--wood`, `--barn-red`, `--cream`, `--sky-top`, etc.). Elle est tenue partout **sauf** dans trois composants qui contournent le système en hardcodant des hex étrangers à la palette : `CastorOverlay.tsx`, `PrestigeModal.tsx`, `OfflinePopup.tsx`.

### Analyse

- **Palette dominante** (pondérée par la surface qu'elle couvre réellement à l'écran) :
    - `cream #fdf6e3` + `cream-dark #ecdcb8` — grande majorité (modals, panneaux, stats, tooltips)
    - `wood #c89469` + `b8875e` + `wood-trim #5a3418` — topbar, bottombar, bordures
    - `barn-red #b23a2a` + `barn-red-dark #8a2a1e` — accents, headers de modal, level-bar, stat-values
    - `sky-top #8ecdf5` → `sky-mid #b3dff7` → `sky-horizon #fef3c7` — ciel fixe
    - `grass-light #8bc34a` + `grass #6fa638` + `grass-dark #558b2f` — scène du champ (damier conic-gradient `index.css:402-406`)
    - `maple #e67e22` / `gold #f1c40f` — accents de skin doré, auras
- **Cohérence inter-zones** : excellente au centre. Arena + Shop + Upgrade-panel + modals partagent cream+wood+barn-red. **MAIS trois exceptions cassent la palette** :
    - `CastorOverlay.tsx:49-60` : `background: '#2a1a0f'` (brun quasi-noir, pas dans la palette — le wood-trim est `#5a3418`), `border: '#ef4444'` et `color: '#ef4444'` (rouge Tailwind-400 plat, pas `var(--barn-red)`), `color: '#fbbf24'` pour le floater (jaune Tailwind, pas `var(--gold)`). **Double pénalité** : le CSS `.castor-overlay` (index.css:826-833) utilise `!important` pour forcer `background: var(--cream) !important; border-color: var(--barn-red) !important` — il y a donc un **conflit** entre les inline-styles (qui essaient `#2a1a0f`) et les `!important` du CSS. Résultat visuel aléatoire selon l'ordre de spécificité et un code qui ment à lui-même.
    - `PrestigeModal.tsx:70` : `color: can ? '#1a0f08' : undefined` — brun quasi-noir hors palette.
    - `OfflinePopup.tsx:45` : même `#1a0f08`.
- **Contraste gameplay (hero-vs-décor)** : l'arbre a un drop-shadow `0 4px 0 var(--maple-dark)` qui le décolle du ciel bleu — bon contraste (feuille orange/rouge sur ciel clair). Les gouttes dorées (🌟) sur le ciel bleu-cream ont une aura `drop-shadow(0 0 28px gold)` + `0 4px 8px rgba(0,0,0,0.4)` — lecture immédiate. Bon.
- **Contraste gameplay (danger vs safe)** : le **castor** (🦫 emoji brun sur overlay qui devrait être barn-red/cream) est un danger à cliquer en < 3s. Sa visibilité dépend aujourd'hui d'un conflit de styles non résolu, alors que c'est précisément le signal qui doit "pop".
- **Éclairage** : un seul soleil fixe en `top:15%; right:10%` avec `sun-pulse` 4s (`index.css:204-220`). L'ombre de l'arbre est centrée sous lui (`tree-shadow`, bottom:20px, `index.css:261-271`) — **incohérent avec la direction du soleil** (un soleil haut-droite devrait projeter une ombre bas-gauche). Personne n'en mourra, mais pour un joueur un peu attentif l'œil lit "la lumière ne vient de nulle part".
- **Saturation / température** : le centre (arena) est plutôt frais (ciel bleu, grass vert), les panneaux latéraux sont chauds (cream + barn-red). La transition est marquée par la bordure `border-left: 4px solid var(--wood-trim)` (Shop) — OK. Par contre le **header de modal est systématiquement barn-red saturé** (`index.css:871-886`), ce qui empile 6+ modales toutes vues depuis la bottom-bar (Achievements, Prestige, Guide, Stats, Options, Skins, Lore) avec exactement la même bande rouge en haut — monotone à l'usage.

### Risques & recommandations

- 🔴 **Critique — Harmoniser le CastorOverlay.** Supprimer les inline-styles qui imposent `#2a1a0f`/`#ef4444`/`#fbbf24` dans `CastorOverlay.tsx:19,49,50,60` et laisser la classe `.castor-overlay` (déjà cohérente avec la palette) faire son travail sans `!important`. Le castor est un signal d'**urgence** — il doit être lu en < 500 ms. Aujourd'hui le conflit de styles produit un rendu incertain.
- 🔴 **Critique — Retirer les `#1a0f08` hors palette** dans `PrestigeModal.tsx:70` et `OfflinePopup.tsx:45`. Utiliser `var(--text)` (`#3a2418`) ou `var(--wood-trim)` (`#5a3418`). Sinon 3 composants parlent en absolu et ne suivront pas un re-skin de palette.
- 🟡 **Important — Corriger la direction d'éclairage.** Soit déplacer `.tree-shadow` en bas-gauche (ombre cohérente avec soleil haut-droite), soit supprimer le soleil fixe et gérer un cycle jour/nuit avec l'ombre qui suit (solution la plus intéressante visuellement mais coûteuse).
- 🟡 **Important — Varier le header de modal.** Aujourd'hui Achievements, Prestige, Guide, Stats, Options, Skins, Lore ont tous la même bande barn-red `index.css:871-886`. Pour différencier : soit un ruban couleur par type (par ex. gold pour Prestige, green pour Achievements, maple pour Skins, wood pour Options), soit un petit pictogramme thématique (coin supérieur gauche) qui donne une identité à chaque modale.
- 🟢 **Amélioration — Désaturer légèrement la saison active.** Aujourd'hui seul l'emoji change. Un simple filter global `.arena[data-season="hiver"] { filter: saturate(0.6) hue-rotate(-10deg); }` ajouterait une signature perceptuelle sans refaire d'assets.

---

## Axe 2 — Style & cohérence

### Constat

Technique 100 % DOM+CSS+emoji. Le parti pris est assumé et cohérent dans le chrome (panneaux, HUD). Le point faible est que **les emojis eux-mêmes** sont des "assets tiers" dont le rendu varie radicalement selon l'OS et dont le vocabulaire visuel se défait en late-game.

### Analyse

- **Technique & résolution de référence** : aucune — c'est du DOM. Les tailles de rendu sont stables (tree-crown 16rem, stage-icon 1.7rem, shop-icon 2rem). Pas de pixel snapping, pas de shader, pas de canvas.
- **Niveau de détail homogène ?** Le chrome (panneaux, boutons, tooltips) partage un langage formel clair : border 2-3-4px wood-trim, box-shadow `0 2-3-4px 0 var(--wood-trim)` qui simule une plaque qui se décolle, `border-radius: 8-10-12px`. C'est un vocabulaire et il est tenu.
- **Pipeline de rendu** : CSS `transition` partout, `will-change` nulle part (pas de pré-élévation GPU), `transform-origin: bottom center` sur l'arbre pour un squish naturel, `animation-delay` cascade sur les stage-icon (`BuildingScene.tsx:71`) pour un effet d'apparition en pop-corn — bonne idée.
- **Sources d'assets** : aucune image, aucun SVG custom, aucune font web. Tout vient du système. C'est un choix radical et ça fonctionne pour un clicker web, mais ça sous-traite l'identité graphique à Apple/Microsoft/Google (qui dessinent les emojis).
- **Unité formelle des emojis** :
    - **Saisons** 🌸 ☀️ 🍂 ❄️ — partagent un registre "nature" cohérent.
    - **Events** ✨ ❄️ 🌾 🌕 🦫 — hétérogènes mais lisibles.
    - **Bâtiments (16)** 🔧 🪣 🌳 🫕 ♨️ 🏚️ 🚜 🌲 🛢️ 🏭 ⚗️ 🧪 🔮 🏛️ 🌀 💎 — **ici le registre casse**. Le flow narratif va "outil-outil-arbre-cuisine-bâtiment-véhicule-arbre-**baril de pétrole**-usine-chimie-chimie-mystique-temple-portail-diamant". Les **transitions 7→8→9 (tracteur → forêt d'érables → pipeline) et 13→14 (distillerie → temple) sont les plus rudes** : on passe de "ferme" à "industrie lourde" puis à "mysticisme gréco-cosmique" sans narration visuelle. Voir `data/buildings.ts` + ICONS dans `Shop.tsx:13-30` et `BuildingScene.tsx:7-24`.
    - **Skins d'arbre (8)** : 🍁 🌸 🌴 🌲 🍄 🎄 🌟 🌌. Le problème structurel est qu'ils sont rendus par le **même composant** qui empile `skin.emoji` au-dessus d'un `<span class="tree-trunk" />` (tronc CSS visible, 42×46px, `index.css:315-338`). Pour le skin default 🍁 (feuille seule) → le compositing "feuille-crown + trunk CSS" a du sens. Pour 🌴 🌲 🎄 🍄 qui **contiennent déjà un tronc**, le résultat est un tronc de bois hachuré qui dépasse d'un arbre déjà complet. Pour 🌟 🌌 (étoile / galaxie), le trunk CSS fait encore moins de sens.
- **DRY du dictionnaire ICONS** : `Shop.tsx:13-30` et `BuildingScene.tsx:7-24` dupliquent le mapping BuildingId → emoji. Si un changement visuel intervient à un endroit et pas à l'autre, **l'emoji de la scène ne correspond plus à celui du Shop** — drift garanti à moyen terme.
- **Patterns/tilesets** : `repeating-linear-gradient` pour les planches du topbar/bottombar (`index.css:82-83, 740-741`), `repeating-conic-gradient` pour le damier de gazon (`:402-406`), `radial-gradient` pour les collines (`:196-201`) et l'éclat du soleil (`:185`). **Ce sont les vrais "tiles" du jeu**, et ils forment un vocabulaire CSS cohérent — bonne unité formelle, sans faire d'assets.

### Risques & recommandations

- 🔴 **Critique — Résoudre le compositing arbre+skin.** Deux options au choix :
    - (a) rendre le `.tree-trunk` conditionnel : `{skin.hasOwnTrunk ? null : <span class="tree-trunk"/>}` en ajoutant un flag `hasOwnTrunk: true` dans la définition `SkinDef` (`data/skins.ts`). Les skins 🍁 et 🌸 gardent le trunk, les autres non.
    - (b) supprimer le trunk CSS partout et compenser par un socle/colline (`.tree-area::before` existe déjà à `index.css:249-259`) pour ancrer l'arbre quelle que soit la skin. Plus unifiant.
- 🔴 **Critique — Dédupliquer le dictionnaire ICONS.** Déplacer le mapping BuildingId → emoji dans `data/buildings.ts` directement (un champ `icon: string` sur `BuildingDef`), puis le consommer dans `Shop.tsx` et `BuildingScene.tsx`. Une seule source de vérité.
- 🟡 **Important — Recaler la narration des emojis de bâtiments.** Le jump 🌲→🛢️→🏭 (forêt → baril de pétrole → usine) sort complètement du récit "érablière". Pistes concrètes :
    - Pipeline `🛢️` → quelque chose qui évoque un tube/pipe clair : `🚿` (peu convaincant) ou laisser 🛢️ mais renommer le bâtiment "Citerne à sève" (le nom actuel "Pipeline à sève" invite à lire 🛢️ comme un pipeline de sève, mais l'emoji lit pétrole — le problème est autant dans le nom que dans l'icône).
    - Temple `🏛️` (temple grec) → `⛩️` (torii japonais, cohérent avec le skin cerisier) ou laisser 🏛️ mais assumer que le late-game bascule dans une mythologie plus large.
    - `💎` pour la "Sève primordiale" → `🫧` (bulle) ou `🧿` (œil protecteur) pour rester dans un registre "substance vivante" plutôt que minéral.
- 🟡 **Important — Documenter le choix emoji vs la fragmentation OS.** Sur macOS, 🍁 est Apple Color (rouge orangé doux arrondi) ; sur Windows 11, c'est Segoe UI Emoji (plus plat, cinq lobes nets) ; sur Android, Noto Color Emoji. Le même joueur passant de son laptop au PC de son ami verra **un autre jeu**. Solution pragmatique : intégrer **Twemoji** (fonts Twitter open-source, rendu identique sur toutes les plateformes). Coût : ~100-300 kb à charger, 1 fichier `<script>`.
- 🟢 **Amélioration — Ajouter un léger grain/texture CSS sur le cream.** Un `background-image` très discret (noise.svg inline base64, ~500 bytes) sur `body` ou sur `.modal-body` donnerait une texture "papier" cohérente avec le thème cabane. Faible effort, gain d'identité.

---

## Axe 3 — Mood & références

### Constat

Mood dominant visé : **"cabane à sucre canadienne cozy, kawaii amateur"**. Mood effectivement produit : **"farm-cartoon plat sur système-ui"**. L'écart vient à 80 % de la police non chargée.

### Analyse

- **Mood dominant** : quand on observe sans lire le texte, on reconnaît un clicker "farm" — collines, clôtures, soleil qui tourne, nuages qui dérivent, arbre qui se balance. Le registre émotionnel implicite est "chaleureux, doux, un peu désuet, sans tension". C'est **le bon mood pour le gameplay** (idle relaxing).
- **Références implicites reconnaissables** :
    - **Stardew Valley** (palette grange rouge + bois + cream, mood cosy agricole).
    - **Cookie Clicker** (layout : hero central + shop scrollable à droite, big-number compteur en haut).
    - Un soupçon d'**Animal Crossing** dans l'intention (polices rondes Fredoka/Baloo) mais non réalisé.
- **VFX vs mood** : cohérents. sparks ✨ dorés pour le level-up, golden-float sinusoïdal 3s, tree-sway rotatif ±1.8°, frenzyPulse doux 1.2s. Aucun VFX ne jure avec le mood cozy — il n'y a ni explosion "crunchy" ni particule "high-tech" qui ferait basculer dans un autre genre. Bon.
- **Typo (point névralgique)** : `index.css:36` déclare `"Fredoka", "Nunito", "Baloo 2", system-ui`. Ces trois polices sont exactement les bonnes pour le mood (sans-serif rondes, généreuses, légèrement enfantines). **Problème** : aucune n'est chargée. Vérification :
    - `index.html` : aucun `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` ni `<link rel="preconnect" href="https://fonts.gstatic.com">`.
    - `index.css` : aucun `@font-face`, aucun `@import url(...)`.
    - Aucun fichier `.ttf`/`.woff2` dans le repo ou dans `node_modules` qui serait livré.
    
    Résultat : sur 99 % des machines, le navigateur saute Fredoka/Nunito/Baloo 2 et tombe sur `system-ui`. Sur macOS ça veut dire San Francisco, qui est **élégant mais corporate** — opposé du registre voulu. **C'est le single point of failure de la DA du jeu.**
- **UI comme extension du mood** : le chrome (plaques en bois, boutons qui s'enfoncent avec `translateY(3px)` au click, wood-grain sur les barres) lit très bien "cabane à sucre artisanale". Les modals ont des shadow-offset 12-0px wood-trim qui les font lire comme des panneaux de bois posés. Les stat-cards en topbar avec border 2px wood-trim + shadow 2-0 wood-trim lisent comme des ardoises de prix sur un stand de marché. Vraiment bien.
- **Narration visuelle de fin** : les niveaux 19-20 débloquent 🌀 Portail + 💎 Sève primordiale + le titre "Érable Éternel". Le jeu tente donc une **ascension cosmique finale**. Mais visuellement, l'arena (ciel bleu + colline + herbe + clôture) reste identique. L'arbre cosmique 🌌 (skin) est le seul signe du shift — et il reste posé sur la même colline verte. Opportunité manquée de récompenser les 20-50h de jeu par une transformation scénique.

### Risques & recommandations

- 🔴 **Critique — Charger les polices intended.** Dans `index.html`, ajouter avant le `<script>` :
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700;900&family=Nunito:wght@700;900&display=swap" rel="stylesheet">
    ```
    Choisir **une seule** des trois (Fredoka est la plus "farm" et la mieux typée pour les chiffres) et simplifier la font-stack en `"Fredoka", system-ui, sans-serif`. C'est **la plus petite action à plus gros impact** de tout cet audit.
- 🟡 **Important — Créer une progression scénique sur 3-4 biomes.** Pas un par niveau (trop coûteux), mais des paliers perceptibles :
    - niv 1-5 : scène actuelle (ferme, ciel jour)
    - niv 6-11 : crépuscule orangé, champ plus grand
    - niv 12-17 : nuit étoilée, cabane → temple au loin
    - niv 18-20 : ciel cosmique (fade vers un gradient violet/magenta), arbre flottant
    
    Implémentation CSS-only possible via `.arena[data-biome="..."]` et override des variables de ciel/grass. Coût modéré, impact énorme sur la dopamine de progression.
- 🟡 **Important — Saison visible.** Changer au minimum la couleur du ciel et l'opacité/teinte des nuages par saison. Hiver : ciel gris-bleu froid, nuages plus opaques, ajouter 2-3 flocons ❄️ en `cloud-drift`. Automne : ciel horizon doré, grass teinté `hue-rotate(25deg)`. Une nuit de code.
- 🟢 **Amélioration — Skins et mood.** Un skin "cerisier" 🌸 serait plus convaincant si la scène basculait aussi sur un mood japonais (tonal pink + rim-light sur la colline). Pas indispensable pour la v1.

---

## Axe 4 — Composition & UI/UX

### Constat

Layout desktop-first très classique (et efficace) : topbar + panneau gauche (upgrades) + arena centrale (hero) + panneau droit (shop) + bottombar utilitaire. Hiérarchie visuelle impeccable. Lisibilité du gameplay : excellente. Quelques fragilités de responsive et d'a11y.

### Analyse

- **Cadrage / échelle** : grid figée `300px 1fr 360px` × `76px 1fr 56px` (`index.css:67-77`). L'arena centrale fait ~1fr, soit ~780px sur un 1440px, 500px sur un 1080px. L'arbre fait 320×340px — bien proportionné sur desktop large. **Pas de breakpoint mobile** (la seule media-query du fichier est `@media (max-width: 700px)` dans `.guide-list-row`, qui ne traite que le tableau du guide). Un clicker web est pourtant tout indiqué pour le mobile. Choix à documenter (desktop-only assumé ?) ou à adresser.
- **Hiérarchie visuelle** : claire, sans compétition. L'œil lit : stats top → arbre central → shop droite (qui pulse légèrement par les `flash-bought` jaunes quand on achète) → upgrades gauche → bottom info. Les modals prennent 90 % du viewport et backdrop-blur le reste — focus absolu.
- **Lisibilité gameplay** : l'arbre fait ~33 % de la hauteur de l'arena, parfait target. Les floaters `+X` apparaissent en `position: absolute` centrés sur le clic, avec `pointer-events: none` pour ne pas bloquer le click suivant. Les crits se distinguent nettement (scale 1.4, couleur blanche sur redglow). Le castor apparaît en `position: absolute; right: 20; bottom: 80` — donc au-dessus de la scène des bâtiments, pas au-dessus de l'arbre, ce qui évite la compétition d'input.
- **HUD** : ~25 % de la surface (topbar + bottombar + shop + upgrade panel). Pour un clicker c'est attendu. Chaque stat a sa frame 2px wood-trim + shadow 2-0 wood-trim → lit comme une "ardoise". Les chiffres tabulaires évitent le jitter quand on passe de 999 à 1 000. Très bon.
- **Feedback visuel des actions** : abondant et cohérent.
    - Clic : squish 0.9-0.86 120ms, floater `+X`, son (`sfx.click`).
    - Crit : squish 200ms, floater agrandi x1.4 blanc, `crit-shake` 220ms, hitstop 25 % (floater stagné au peak 10→35 %), son crit.
    - Achat : `flash-bought` jaune 500ms avec scale 1.04 et glow or.
    - Level-up : fanfare plein écran, backdrop noir, card pop avec 12 sparks ✨ radiaux, auto-dismiss 3.5s.
    - Golden Drop : aura pulsante sur l'arbre pendant `frenzy` (`index.css:633-644`).
    - Castor : overlay contrasté cream+barn-red (via `!important`) qui wiggle ±2° (à condition que les inline styles soient nettoyés).
- **Accessibilité** :
    - ✅ `aria-label="Cliquer l'érable"` sur le bouton principal (`MapleTree.tsx:74`).
    - ⚠️ `title` attributes partout dans les tiles, mais certains boutons du bottombar sont **emoji-only sans label** : `🏆` achievements, `⚙️` options. Screen reader lit "trophy", "gear" — insuffisant.
    - ⚠️ **Contraste barn-red sur wood** : `stat-value` (barn-red #b23a2a) sur topbar (wood #c89469 repeating-gradient avec #b8875e) = ratio ~3:1. AA grand texte OK mais les stat-value ne sont pas "grand texte" (1.2rem = ~19px). **Borderline WCAG AA**. Pour protan/deutan, le barn-red et le wood-dark sont quasi-indistinguables.
    - ❌ Aucun `@media (prefers-reduced-motion: reduce)`. Les animations tournent en continu (sun-rotate 30s, cloud-drift 60-100s, tree-sway 4s, buff-pulse 1.5s, castor-wiggle 0.5s). Pour un joueur vestibulaire (~35 % souffre d'inconfort avec animations permanentes), le jeu est inconfortable.
    - ❌ `user-select: none` sur tout html/body (cohérent pour un jeu de clic) mais **empêche aussi de copier/coller** les sauvegardes exportées dans la modale Options. `OptionsModal.tsx:20-21` utilise `navigator.clipboard.writeText` pour contourner — OK, mais à documenter.
- **Position magique du BuffTimers** : `position: fixed; top: 92px; left: 312px` (`index.css:1318-1326`). 312 = 300px (upgrade-panel width) + 12 gutter. Si on change la largeur de l'upgrade-panel (ex : 280px), les buff-timers se décrochent. À remplacer par une position relative à l'upgrade-panel (CSS Grid slot ou calc(var(--upgrade-width) + 12px)).
- **Modals** : 90 % × 90vh max (`index.css:853-866`). Sur petit écran, marche. Mais le layout interne (prestige-header `grid-template-columns: 1fr 1fr 1fr`, skins-grid 180px min) est surdimensionné sur mobile — pas de breakpoint.

### Risques & recommandations

- 🔴 **Critique — `prefers-reduced-motion`.** Ajouter en fin de `index.css` :
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    ```
    Couvre les joueurs vestibulaires sans sacrifier l'expérience par défaut. Obligatoire pour un jeu qui veut exister plus que 48h en web.
- 🔴 **Critique — Labels ARIA sur les boutons emoji-only.** Dans `BottomBar.tsx:49,54` : `<button aria-label="Achievements" onClick={...}>🏆</button>`, `<button aria-label="Options" onClick={...}>⚙️</button>`. Même chose pour `SkinsModal.tsx` (bouton ✕ fermer) et tous les autres emoji-only. Deux minutes de travail.
- 🟡 **Important — Responsive mobile**. Un clicker est un usage-cible évident pour mobile. Au minimum : media-query `@media (max-width: 900px)` qui passe le grid en `grid-template-areas: "topbar" "center" "left" "right" "bottom"` (stack vertical), cap la taille de l'arbre à 240px, et collapse les panneaux en tabs (boutons "🏗️ Shop", "⚡ Upgrades" dans la bottombar). Sinon, clairement afficher "desktop only" à l'entrée.
- 🟡 **Important — Améliorer le contraste barn-red sur wood en topbar.** Le `stat-value` passe de `#b23a2a` sur `#c89469` (ratio 3:1, limite). Solutions : (a) ajouter un `background: var(--cream)` au `.stat` (déjà fait en réalité — `index.css:109` : `background: var(--cream)` → le chiffre rouge tombe sur cream, pas sur wood. Bon point. **Confirmer** que la refacto n'a rien cassé et éventuellement ajouter `font-weight: 900` + `text-shadow: 0 1px 0 rgba(255,255,255,0.5)` pour les cas limites).
- 🟡 **Important — Positionnement du BuffTimers.** Soit déplacer dans le flow (colonne gauche en bas de `.upgrade-panel`), soit `left: calc(var(--upgrade-panel-width, 300px) + 12px)` avec variable déclarée dans :root. Évite la fragilité du magic number 312.
- 🟢 **Amélioration — Dédupliquer les panels modaux.** 7 modals ayant tous le même chrome (`.modal-header` barn-red fixe). Une prop `headerTone: 'red'|'gold'|'green'|'maple'` sur un composant `<Modal>` partagé donnerait plus d'identité par modale à peu de frais (voir recommandation Axe 1).
- 🟢 **Amélioration — Mini-indicateur saison visuel.** Au-delà de l'emoji, un petit badge sur la colline (petite fleur 🌸 qui pousse au printemps, flocon ❄️ sur l'arbre en hiver) donnerait une présence plus que textuelle.

---

## Écarts intention ↔ implémentation

Le repo fournit une intention explicite via `plan.md` et `IMPLEMENTATION.md` — voici le croisement avec ce qui est réellement codé.

| Promesse (intention) | Implémentation (assets/code) | Écart | Commentaire |
|---|---|---|---|
| "Canvas pour l'érable + particules, DOM pour les menus" (`plan.md:303`) | 100 % DOM + CSS, zéro canvas, zéro PixiJS | ❌ | Le choix DOM est parfaitement défendable pour un clicker — mais ça mérite d'être **acté** dans la doc au lieu de laisser `IMPLEMENTATION.md:30` dire "PixiJS phase polish" qui ne viendra peut-être jamais. |
| "Chaque niveau (1-20) apporte un **thème visuel**" (`plan.md:61`) | Niveau 1 et niveau 20 ont la même arena (ciel, colline, arbre). Seul le `TopBar.tsx:83-88` affiche un petit "🍁 Érable Éternel" au niv 20. | ❌ | Manque majeur. Le plan d'action propose 3-4 biomes plutôt que 20 thèmes — gain 80 % pour 20 % d'effort. |
| "Saisons : hiver (sève ralentie), printemps (x2), été, automne" avec effets **d'ambiance** (`plan.md:290`) | Les effets **gameplay** sont implémentés (`seasons.ts`), mais aucun changement visuel : le ciel est identique les 4 saisons, la scène ne bouge pas. | ❌ | Une nuit de CSS pour changer les `--sky-*` par saison corrige 80 % du problème. |
| "Animations de clic (shake, scaling) + particules" (`IMPLEMENTATION.md:267`) | Shake OK (`crit-shake`), scaling OK (squish), **particules : 0**. Les floaters `+X` sont des ASCII, pas des particules. | ⚠️ | Les sparks ✨ de la fanfare sont les seules "particules" du jeu — limité à l'événement level-up. À ajouter sur le clic crit (3-5 ✨ qui partent en étoile). |
| "Skins d'érable (cerisier, séquoia, arbre de Noël)" (`plan.md:293`) | Présents (`data/skins.ts`), mais **compositing cassé** — tronc CSS dur-codé même quand le skin est déjà un arbre complet. | ⚠️ | Voir recommandation critique Axe 2. |
| Font stack "Fredoka / Nunito / Baloo 2" (`index.css:36`) | Aucune des 3 n'est chargée | ❌ | Plus gros écart perceptuel du projet. 3 minutes à fixer. |
| "20 lettres de l'Érable Ancien" (`plan.md:295`) | `data/lore.ts` contient bien 20 titres + composant `LoreModal.tsx`. | ✅ | OK. |
| "Cabane à sucre", cosmetics, mood cozy farm | Chrome (bois, rouge grange, cream) très fidèle. | ✅ | Vraie force du projet. |

---

## Plan d'action priorisé

| # | Action | Axe | Sévérité | Effort estimé | Impact |
|---|---|---|---|---|---|
| 1 | **Charger Fredoka** (ou Nunito) via Google Fonts dans `index.html` et simplifier la font-stack. Corrige le mood à 80 %. | Mood | 🔴 | S (10 min) | **Très élevé** |
| 2 | **Corriger le compositing tree-trunk + skin** : ajouter `hasOwnTrunk` dans `SkinDef`, conditionner le `<span class="tree-trunk" />` dans `MapleTree.tsx`. | Style | 🔴 | S (30 min) | Élevé |
| 3 | **Retirer les hex hors palette** dans `CastorOverlay.tsx`, `PrestigeModal.tsx:70`, `OfflinePopup.tsx:45`. Laisser `.castor-overlay` faire son travail sans inline-styles contradictoires. | Palette | 🔴 | S (20 min) | Élevé |
| 4 | **`prefers-reduced-motion` + labels ARIA** sur les boutons emoji-only de `BottomBar.tsx`. | Composition/a11y | 🔴 | S (30 min) | Élevé (accessibilité) |
| 5 | **Ajouter 3-4 biomes par palier de niveau** (ferme → crépuscule → nuit → cosmos) via CSS variables overrides sur `.arena[data-biome="..."]`. | Mood / Style | 🟡 | M (4-6h) | **Très élevé** sur la dopamine de progression |
| 6 | Variation saisonnière du ciel et des nuages (teinte + flocons en hiver). | Palette / Mood | 🟡 | S (1-2h) | Moyen-élevé |
| 7 | Dédupliquer le dictionnaire ICONS (déplacer dans `data/buildings.ts`). | Style / maintenance | 🟡 | S (20 min) | Moyen (évite drift futur) |
| 8 | Ruban-couleur ou pictogramme par type de modal pour différencier les 7 headers barn-red identiques. | Palette / Composition | 🟡 | S-M (2-3h) | Moyen |
| 9 | Twemoji pour uniformiser le rendu cross-OS des emojis. | Style | 🟡 | S (1h) | Moyen-élevé selon la répartition OS de la cible |
| 10 | Particules ✨ (3-5) qui partent en étoile sur chaque crit. | Composition / VFX | 🟢 | S (1h) | Moyen (juice) |

**Règle de bascule** : les #1 à #4 se font en une soirée et **transforment la perception** du jeu. Le #5 est le gros chantier qui distingue "clicker en prototype" de "clicker qu'on a envie de finir". Le reste est du confort.

---

## Méthodologie

Ce rapport résulte d'une lecture statique des assets et du code de rendu (`src/ui/`, `src/data/`, `index.css`, `index.html`, `plan.md`, `IMPLEMENTATION.md`). Aucune image n'est présente dans le repo — tous les visuels sont produits par CSS et emojis Unicode, ce qui a été vérifié par :

- `find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" -o -name "*.gif" -o -name "*.aseprite" \)` — 0 résultats hors `node_modules`
- Inspection des font-face : 0 trouvés, 0 import Google Fonts
- Comptage des couleurs : 41 hex uniques dans `index.css`, 5 hex hors palette dans 3 composants TSX
- Lecture intégrale des 22 composants React UI + des 8 fichiers `data/`

Ce rapport ne remplace pas :

- un **playtest réel** (perception moment-à-moment en mouvement, évaluation du "feel" des animations superposées)
- un **test utilisateur daltonien** (les ratios de contraste barn-red/wood sont borderline et méritent vérification en conditions)
- une **revue de typographie chargée** (l'impact visuel de Fredoka vs system-ui sur les chiffres tabulaires et les headers peut seulement se valider une fois la font active)
- une **revue de rendu multi-OS** (voir le même jeu sur macOS / Windows / Android pour mesurer la fragmentation emoji)

Chaque recommandation marquée 🔴 mérite d'être discutée avant implémentation — certains choix en apparence critiques peuvent être des partis pris assumés (ex : absence de saisons visuelles pour rester en MVP, desktop-only pour cibler un cœur de joueurs). Les recommandations 🟡 et 🟢 peuvent être traitées au fil de l'eau.
