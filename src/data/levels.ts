import { D } from '../core/bignum';
import type { LevelDef } from '../core/types';

/**
 * Tighter level curve (~7× between paliers instead of 10×) so the player
 * climbs ranks more often. End-game levels stay logarithmic to keep prestige
 * meaningful, but no more 10^6 jumps.
 */
export const LEVELS: LevelDef[] = [
  { level: 1, name: 'La souche solitaire', threshold: D(0), bonus: 'Départ' },
  { level: 2, name: 'Le petit boisé', threshold: D(50), bonus: 'Chalumeau amélioré' },
  { level: 3, name: 'La clairière', threshold: D(500), bonus: 'Seaux multiples' },
  { level: 4, name: 'Le premier bouilleur', threshold: D(3_500), bonus: 'Évaporateur' },
  { level: 5, name: 'La cabane rustique', threshold: D(25_000), bonus: '🆕 Sirop d\'érable' },
  { level: 6, name: 'Le hameau sucré', threshold: D(180_000), bonus: 'Upgrades click tier 2' },
  { level: 7, name: 'Le village de l\'érable', threshold: D(1_300_000), bonus: 'Achievements tier 2' },
  { level: 8, name: 'La forêt étendue', threshold: D(9_000_000), bonus: 'Événement Pleine lune' },
  { level: 9, name: 'Le domaine sucrier', threshold: D(60_000_000), bonus: 'Auto-click (1/s)' },
  { level: 10, name: 'L\'industrie du sirop', threshold: D(450_000_000), bonus: '🆕 Sucre d\'érable' },
  { level: 11, name: 'La région sirupeuse', threshold: D(3e9), bonus: 'Skins de cabane' },
  { level: 12, name: 'Le royaume de l\'érable', threshold: D(20e9), bonus: 'Combo x5 débloqué' },
  { level: 13, name: 'L\'empire du sucre', threshold: D(150e9), bonus: 'Castors travailleurs' },
  { level: 14, name: 'La métropole sucrée', threshold: D(1e12), bonus: 'Recettes secrètes' },
  { level: 15, name: 'La nation sucrière', threshold: D(7e12), bonus: 'Prestige disponible' },
  { level: 16, name: 'Le continent collant', threshold: D(50e12), bonus: 'Feuilles dorées x2' },
  { level: 17, name: 'La planète-érable', threshold: D(350e12), bonus: 'Bâtiment mythique #1' },
  { level: 18, name: 'Le système sirupeux', threshold: D(2.5e15), bonus: 'Bâtiment mythique #2' },
  { level: 19, name: 'La galaxie dorée', threshold: D(1e18), bonus: 'Portail inter-dimensionnel' },
  { level: 20, name: 'L\'Érable Éternel', threshold: D(1e21), bonus: 'Fin de partie — ascension' },
];

export function levelFromTotalDrops(total: import('break_infinity.js').default): number {
  let level = 1;
  for (const l of LEVELS) {
    if (total.gte(l.threshold)) level = l.level;
    else break;
  }
  return level;
}

export const LEVEL_BY_NUM: Record<number, LevelDef> = LEVELS.reduce<Record<number, LevelDef>>(
  (acc, l) => {
    acc[l.level] = l;
    return acc;
  },
  {},
);
