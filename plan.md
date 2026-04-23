# 🍁 L'Empire du Sirop d'Érable — Plan de jeu clicker complet

> **Note :** Le thème « sirop d'érable » est un exemple. La structure, les formules et les mécaniques fonctionnent pour n'importe quel thème (cookie, espace, donjon, ferme, etc.) — remplace juste les noms.

---

## 1. Vue d'ensemble

**Pitch :** Tu commences avec un seul érable et un chalumeau rouillé. À force de taper, tu accumules des gouttes de sève, puis tu automatises ta production, tu bâtis un empire de cabanes à sucre, et tu finis par ouvrir un portail inter-dimensionnel qui déverse du sirop cosmique.

**Boucle principale :**

1. Cliquer sur l'érable géant pour récolter des **gouttes de sève**
2. Acheter des **producteurs automatiques** (bâtiments)
3. Débloquer des **upgrades** qui multiplient les gains
4. Atteindre un **palier de niveau** → débloque de nouvelles mécaniques
5. Éventuellement **prestiger** pour recommencer plus fort

**Durée cible d'une run avant prestige :** 6-10 heures actives (30-50h passives).

---

## 2. Monnaies et ressources

| Monnaie | Symbole | Obtention | Usage |
|---|---|---|---|
| Gouttes de sève | 💧 | Click + production passive | Monnaie principale (achats bâtiments/upgrades) |
| Sirop d'érable | 🍯 | Automatique à partir du niveau 5 | Upgrades premium |
| Sucre d'érable | 🧊 | Niveau 10+, conversion de sirop | Débloque bâtiments mythiques |
| Feuilles dorées | 🍂 | Prestige uniquement | Bonus permanents (+% gains) |
| Essence ancienne | ✨ | Achievements spéciaux | Skins, cosmétiques, raccourcis |

**Règle de conversion :** 1 sirop = 1 000 gouttes ; 1 sucre = 1 000 sirops ; 1 feuille dorée ≈ √(gouttes totales / 10¹²).

---

## 3. Mécaniques principales

### 3.1 Le click

- **Valeur de base :** 1 goutte par click
- **Click critique :** 1% de chance de x10 (monte jusqu'à 25% et x1000 avec upgrades)
- **Combo multiplier :** 10 clicks en moins de 3s = x1.5 temporaire (stack jusqu'à x5)
- **Golden Drop :** une goutte dorée apparaît toutes les 5-15 min, donne +13% du stock actuel ou x7 production pendant 77s

### 3.2 La production passive (SPS — sève par seconde)

Chaque bâtiment produit X gouttes/s. Le SPS total s'affiche en haut. La production continue hors-ligne (jusqu'à 24h max, puis cap).

### 3.3 Les événements aléatoires

- **Vent du nord (rare) :** les érables gèlent, -30% SPS pendant 60s
- **Récolte miraculeuse :** x3 SPS pendant 30s
- **Visite du castor gourmand :** mini-jeu 10s, tu dois cliquer sur le castor pour qu'il parte, sinon il vole 5% de ton stock
- **Pleine lune d'érable :** une fois par vraie journée, double tout pendant 5 min

---

## 4. Les 20 niveaux (Cabanes à Sucre)

Chaque niveau se débloque à un **seuil de gouttes totales produites** (pas le stock actuel). Il apporte un **thème visuel** et un **bonus permanent**.

| Niv | Nom | Seuil (gouttes totales) | Bonus débloqué |
|---:|---|---:|---|
| 1 | La souche solitaire | 0 | Départ — 1 érable, click x1 |
| 2 | Le petit boisé | 100 | Débloque Chalumeau amélioré |
| 3 | La clairière | 1 000 | Débloque Seaux multiples |
| 4 | Le premier bouilleur | 10 000 | Débloque l'Évaporateur |
| 5 | La cabane rustique | 100 000 | 🆕 Monnaie **Sirop d'érable** |
| 6 | Le hameau sucré | 1 000 000 | Upgrades de click tier 2 |
| 7 | Le village de l'érable | 10 M | Achievements tier 2 |
| 8 | La forêt étendue | 100 M | Événement Pleine lune |
| 9 | Le domaine sucrier | 1 G | Auto-click (1/s) |
| 10 | L'industrie du sirop | 10 G | 🆕 Monnaie **Sucre d'érable** |
| 11 | La région sirupeuse | 100 G | Skins de cabane |
| 12 | Le royaume de l'érable | 1 T | Combo x5 débloqué |
| 13 | L'empire du sucre | 10 T | Castors travailleurs (mini-jeu) |
| 14 | La métropole sucrée | 100 T | Upgrade recettes secrètes |
| 15 | La nation sucrière | 1 Qa | Prestige disponible |
| 16 | Le continent collant | 10 Qa | Feuilles dorées x2 |
| 17 | La planète-érable | 100 Qa | Bâtiment mythique #1 |
| 18 | Le système sirupeux | 1 Qi | Bâtiment mythique #2 |
| 19 | La galaxie dorée | 1 Sx | Portail inter-dimensionnel |
| 20 | L'Érable Éternel | 1 Oc | Fin de partie — ascension |

> **Formule des seuils :** `seuil(n) = 10^(n+0)` jusqu'au niv 10, puis `10^(n+2)` pour accélérer les ordres de grandeur.

---

## 5. Les 15 bâtiments (producteurs automatiques)

Chaque bâtiment suit la règle de progression : **coût d'achat x 1.15 par unité possédée** (standard des jeux idle, Cookie Clicker utilise 1.15).

**Formule du coût :** `coût(n) = base × 1.15^n` où `n` = nombre déjà possédé.

**Formule de production d'un tier :** `SPS(tier) = base × 1.08^(upgrades_achetés)`.

| # | Bâtiment | Coût initial | SPS de base | Rôle narratif |
|---:|---|---:|---:|---|
| 1 | Chalumeau manuel | 15 | 0.1 | Une petite tige de métal plantée dans l'arbre |
| 2 | Seau en bois | 100 | 1 | Récolte passive au goutte-à-goutte |
| 3 | Érable mature | 1 100 | 8 | Un vrai arbre qui produit tout seul |
| 4 | Bouilloire à bois | 12 000 | 47 | Transforme la sève en sirop plus vite |
| 5 | Évaporateur | 130 000 | 260 | Concentre 40 L de sève en 1 L de sirop |
| 6 | Cabane à sucre rustique | 1.4 M | 1 400 | Ton premier bâtiment officiel |
| 7 | Tracteur à sève | 20 M | 7 800 | Collecte mécanisée |
| 8 | Forêt d'érables (x1000 arbres) | 330 M | 44 000 | Une plantation industrielle |
| 9 | Pipeline à sève | 5.1 G | 260 000 | Aspire la sève sous vide, 24/7 |
| 10 | Évaporateur industriel | 75 G | 1.6 M | Traitement à haut volume |
| 11 | Raffinerie de sirop | 1 T | 10 M | Sirop grade A garanti |
| 12 | Laboratoire d'osmose | 14 T | 65 M | Double la productivité par L |
| 13 | Distillerie mystique | 170 T | 430 M | Sirop enchanté qui se multiplie seul |
| 14 | Temple de l'Érable Ancien | 2.1 Qa | 2.9 G | Invocation de l'esprit de l'arbre |
| 15 | Portail inter-dimensionnel | 26 Qa | 21 G | Sirop venu d'autres réalités |

**Note balance :** chaque bâtiment coûte environ **13-15x** le précédent, mais produit **~6-7x** plus. C'est volontaire : les bâtiments anciens restent utiles, et tu dois en acheter beaucoup du même type.

---

## 6. Upgrades de click (séparés des bâtiments)

Ces upgrades renforcent **uniquement la valeur du click manuel**. Ils sont cruciaux en début de partie et pour les joueurs actifs.

| # | Nom | Coût | Effet |
|---:|---|---:|---|
| 1 | Chalumeau en cuivre | 100 | Click x2 |
| 2 | Gant de récolteur | 500 | Click x2 |
| 3 | Main bénie du grand érable | 10 000 | Click x4 |
| 4 | Frappe du bûcheron | 500 000 | Click +1% du SPS |
| 5 | Marteau-chalumeau | 10 M | Click +2% du SPS |
| 6 | Rage de l'érable | 500 M | Crit chance 5% → 15% |
| 7 | Doigts plaqués or | 50 G | Click x10 |
| 8 | Bénédiction de Dame Érable | 5 T | Click +5% du SPS |
| 9 | Frappe cosmique | 500 T | Click x25 |
| 10 | Touch divin | 50 Qa | Crit chance 25%, crit x1000 |

---

## 7. Upgrades globaux (achetés avec sirop/sucre)

| # | Nom | Coût | Effet |
|---:|---|---:|---|
| U1 | Recette de grand-mère | 1 000 🍯 | Tous les bâtiments +10% |
| U2 | Sélection génétique des érables | 10 000 🍯 | Érables matures x2 |
| U3 | Automatisation complète | 100 000 🍯 | Pipelines + Évaporateurs x2 |
| U4 | Sirop quantique | 1 M 🍯 | Tous les bâtiments +25% |
| U5 | Bénédiction lunaire | 100 🧊 | Pleine lune x2 fréquence |
| U6 | Castors dressés | 1 000 🧊 | Les castors donnent 10% au lieu de voler |
| U7 | Osmose inverse supérieure | 10 000 🧊 | Tous les bâtiments +50% |
| U8 | Portail stabilisé | 100 000 🧊 | Portail inter-dim x5 |

---

## 8. Achievements (35 au total)

### 🏭 Production / Milestones (10)

| # | Nom | Condition | Récompense |
|---:|---|---|---|
| A1 | Première goutte | Produire 1 goutte | +1% SPS |
| A2 | Le petit bouilleur | 1 000 gouttes | +1% SPS |
| A3 | Apprenti sucrier | 1 M gouttes | +1% SPS |
| A4 | Maître érablier | 1 G gouttes | +1% SPS |
| A5 | Baron du sucre | 1 T gouttes | +1% SPS |
| A6 | Seigneur du sirop | 1 Qa gouttes | +2% SPS |
| A7 | Empereur de l'érable | 1 Qi gouttes | +2% SPS |
| A8 | Divinité sucrière | 1 Sx gouttes | +3% SPS |
| A9 | Au-delà du sucre | 1 Oc gouttes | +5% SPS |
| A10 | L'Érable Éternel | Atteindre niv 20 | +10% SPS permanent |

### 👆 Clicks (5)

| # | Nom | Condition | Récompense |
|---:|---|---|---|
| A11 | Premier coup | 1 click | +1% click |
| A12 | Doigts rapides | 1 000 clicks | +5% click |
| A13 | Main d'acier | 100 000 clicks | +10% click |
| A14 | Tendinite légendaire | 1 M clicks | +25% click |
| A15 | Le Clicker Ultime | 10 M clicks | Crit chance +5% |

### 🏗️ Bâtiments (10)

| # | Nom | Condition | Récompense |
|---:|---|---|---|
| A16 | Un peu de compagnie | 1 bâtiment acheté | +1% SPS |
| A17 | Ça commence à produire | 10 de chaque bâtiment tier 1-5 | Tier 1-5 +5% |
| A18 | Une vraie usine | 50 de chaque bâtiment tier 1-5 | Tier 1-5 +10% |
| A19 | Collection complète | 1 de chaque bâtiment (1-15) | +5% SPS |
| A20 | Centurion | 100 d'un même bâtiment | Ce bâtiment +5% |
| A21 | Mille unités | 1 000 d'un même bâtiment | Ce bâtiment +10% |
| A22 | Forêt amazonienne | 500 érables matures | Érables x2 |
| A23 | Pipeline continental | 200 pipelines | Pipelines x2 |
| A24 | Monopole | 500 de chaque bâtiment | SPS +10% global |
| A25 | L'érablière du Valhalla | 1 000 de chaque bâtiment | SPS +20% global |

### 🎲 Événements et secrets (7)

| # | Nom | Condition | Récompense |
|---:|---|---|---|
| A26 | Attrape-goutte | Cliquer sur 1 goutte dorée | Dorées +1s |
| A27 | Ninja sucré | 100 gouttes dorées attrapées | Dorées x2 effet |
| A28 | Castor vaincu | Chasser un castor en < 3s | Castors donnent 1% au lieu de voler |
| A29 | Insomniaque | Jouer 3h d'affilée | +5% SPS |
| A30 | Retour triomphal | Revenir après 24h d'absence | Bonus offline +25% |
| A31 | Pleine lune maîtrisée | Doubler sous Pleine lune | Pleine lune +50% durée |
| A32 | Le secret de grand-maman | Cliquer l'érable 77 fois en 7s | Débloque skin doré |

### 🌟 Prestige (3)

| # | Nom | Condition | Récompense |
|---:|---|---|---|
| A33 | Première réincarnation | Prestiger 1 fois | +10% Feuilles dorées |
| A34 | Roue karmique | Prestiger 10 fois | +50% Feuilles dorées |
| A35 | L'éternel recommencement | Prestiger 100 fois | Skin cosmique + titre |

---

## 9. Système de prestige (Réincarnation en Esprit de l'Érable)

**Disponible au niveau 15.**

Quand tu prestiges :

- Tu perds : gouttes, sirop, sucre, bâtiments, upgrades, achievements de progression reset
- Tu gardes : achievements, skins, compteur de prestige
- Tu gagnes : **Feuilles dorées 🍂**

**Formule :** `feuilles_gagnées = floor( (gouttes_totales / 10^12) ^ 0.5 )`

Chaque feuille dorée donne **+2% SPS permanent** (multiplicatif entre runs, additif à l'intérieur d'une run).

### Arbre de talents post-prestige (10 branches, coût en feuilles dorées)

| # | Talent | Coût (🍂) | Effet |
|---:|---|---:|---|
| T1 | Sève épaisse | 1 | Départ avec 100 gouttes |
| T2 | Héritage familial | 5 | Départ avec Chalumeau x10 |
| T3 | Mémoire du bûcheron | 20 | Click x2 dès le début |
| T4 | Esprit patient | 50 | Offline gains 48h au lieu de 24h |
| T5 | Bénédiction dorée | 100 | +1% chance de goutte dorée |
| T6 | Racines profondes | 250 | Tous les SPS +5% par prestige passé |
| T7 | Sagesse ancienne | 500 | Recettes tier 1-5 unlocked d'office |
| T8 | Couronne d'érable | 1 000 | +10% Feuilles dorées gagnées |
| T9 | Sève primordiale | 5 000 | Nouveau bâtiment spécial |
| T10 | Immortalité | 25 000 | Pas de reset des bâtiments mythiques |

---

## 10. Courbe de progression (benchmarks)

Un joueur qui joue **moyennement actif** (30 min/jour) devrait atteindre :

| Temps de jeu | Niveau | Gouttes totales | Commentaire |
|---|---:|---|---|
| 5 min | 3 | 1 K | Premiers bâtiments |
| 30 min | 5 | 100 K | Débloquage sirop |
| 2 h | 7 | 10 M | Routine d'upgrades |
| 8 h | 10 | 10 G | Début automation sérieuse |
| 24 h | 13 | 10 T | Mi-parcours |
| 3 jours | 15 | 1 Qa | **Premier prestige** |
| 1 semaine | 17 | 100 Qa | Post-prestige, plus rapide |
| 2 semaines | 19 | 1 Sx | End-game actif |
| 1 mois | 20 | 1 Oc | Ascension / fin |

---

## 11. Interface (UI) — composants clés

1. **Centre :** le gros érable cliquable (avec animation de shake + particules)
2. **Haut :** compteur de gouttes, SPS actuel, niveau + barre de progression vers le prochain niveau
3. **Droite :** liste scrollable des bâtiments (icône + quantité + prix + bouton acheter)
4. **Gauche :** upgrades disponibles + statistiques
5. **Bas :** notifications, événements, timer des buffs
6. **Menu :** Achievements, Options, Prestige, Statistiques détaillées

---

## 12. Équilibrage — règles d'or

1. **Chaque bâtiment doit valoir le coup :** temps de retour sur investissement < 10 min en début, < 1h en end-game.
2. **Le click reste pertinent :** les upgrades de click doivent garder ~5-10% de la production d'un joueur actif.
3. **Le prestige doit être tentant :** viser une run 2 = 3-5x plus rapide qu'une run 1.
4. **Les achievements doivent empiler :** leur bonus cumulé doit représenter +30-50% SPS au end-game.
5. **Ne jamais bloquer :** toujours au moins un bâtiment achetable visible.

---

## 13. Extensions futures (roadmap post-v1)

- **Saisons :** hiver (sève ralentie), printemps (x2), été (événements), automne (sucre bonus)
- **Multijoueur asynchrone :** classement mondial, guildes, échanges de feuilles dorées
- **Mini-jeux :** récolte manuelle de castors, tri du sirop grade A/B/C
- **Cosmétiques :** skins d'érable (cerisier, séquoia, arbre de Noël), animations
- **Mode défi :** runs limitées dans le temps avec modificateurs (pas de click, que des érables, etc.)
- **Histoire :** 20 lettres de l'Érable Ancien qui se débloquent à chaque niveau

---

## 14. Résumé technique pour le dev

- **Stockage :** localStorage (web) ou SQLite (desktop/mobile). Serialize toutes les 30s.
- **Grands nombres :** utilise **BigNumber.js** ou **break_infinity.js** (les nombres dépassent 10³⁰⁸).
- **Rendu :** Canvas pour l'érable + particules, DOM pour les menus.
- **Tick loop :** 20 ticks/s pour le SPS, animations à 60 FPS découplées.
- **Anti-triche (optionnel) :** hash de l'état + timestamp côté serveur si multijoueur.

---

**🍁 Bon dev — et n'oublie pas : tester, tester, tester l'équilibre en jouant soi-même 20h avant de sortir la v1.**