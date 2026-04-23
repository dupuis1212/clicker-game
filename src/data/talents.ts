import { D } from '../core/bignum';
import type { BigNum } from '../core/bignum';

export interface TalentDef {
  id: string;
  name: string;
  cost: BigNum;
  description: string;
  /** Talents listed here cannot be bought once this one is owned. */
  exclusiveWith?: string[];
}

export const TALENTS: TalentDef[] = [
  { id: 't1', name: 'Sève épaisse', cost: D(1), description: 'Départ avec 100 gouttes.' },
  { id: 't2', name: 'Héritage familial', cost: D(5), description: 'Départ avec 10 chalumeaux.' },
  { id: 't3', name: 'Mémoire du bûcheron', cost: D(20), description: 'Click ×2 dès le début.' },
  { id: 't4', name: 'Esprit patient', cost: D(50), description: 'Offline 48h au lieu de 24h.' },
  { id: 't5', name: 'Bénédiction dorée', cost: D(100), description: '+1% chance de goutte dorée.' },
  { id: 't6', name: 'Racines profondes', cost: D(250), description: 'Tous les SPS +5% par prestige passé.' },
  { id: 't7', name: 'Sagesse ancienne', cost: D(500), description: 'Recettes tier 1-5 débloquées d\'office.' },
  { id: 't8', name: 'Couronne d\'érable', cost: D(1_000), description: '+10% Feuilles dorées gagnées.' },
  { id: 't9', name: 'Sève primordiale', cost: D(5_000), description: 'Nouveau bâtiment spécial.' },
  { id: 't10', name: 'Immortalité', cost: D(25_000), description: 'Pas de reset des bâtiments mythiques.' },

  // Exclusive paths (audit recommendation): only one branch can be active at a time
  // until the next prestige. Choosing one locks the others out for this run.
  { id: 't11', name: 'Voie de la patience', cost: D(2_000), description: '+30% SPS passif. Exclu avec t12 / t13.', exclusiveWith: ['t12', 't13'] },
  { id: 't12', name: 'Voie de la frénésie', cost: D(2_000), description: '+30% valeur de clic. Exclu avec t11 / t13.', exclusiveWith: ['t11', 't13'] },
  { id: 't13', name: 'Voie du sage', cost: D(2_000), description: '+50% feuilles au prochain prestige. Exclu avec t11 / t12.', exclusiveWith: ['t11', 't12'] },
];

export const TALENTS_BY_ID = TALENTS.reduce<Record<string, TalentDef>>((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
