import { D } from '../core/bignum';
import type { ClickUpgradeDef } from '../core/types';

/**
 * Progression ~×5 entre chaque upgrade pour éviter les grands gaps.
 */
export const CLICK_UPGRADES: ClickUpgradeDef[] = [
  // Early game — affordable après quelques clics
  { id: 'cu1', name: 'Chalumeau en cuivre', cost: D(100), kind: 'clickMult', value: 2 },
  { id: 'cu2', name: 'Gant de récolteur', cost: D(500), kind: 'clickMult', value: 2 },
  { id: 'cu2b', name: 'Double gant renforcé', cost: D(2_500), kind: 'clickMult', value: 1.5 },
  { id: 'cu3', name: 'Main bénie du grand érable', cost: D(10_000), kind: 'clickMult', value: 4 },
  { id: 'cu3b', name: 'Poignée ergonomique', cost: D(100_000), kind: 'clickMult', value: 2 },

  // Mid-early : le clic commence à scale avec le SPS
  { id: 'cu4', name: 'Frappe du bûcheron', cost: D(500_000), kind: 'clickPctSps', value: 0.01 },
  { id: 'cu4b', name: 'Percussion hydraulique', cost: D(3_000_000), kind: 'clickPctSps', value: 0.01 },
  { id: 'cu5', name: 'Marteau-chalumeau', cost: D(10_000_000), kind: 'clickPctSps', value: 0.02 },

  // Mid : le clic vaut de plus en plus cher
  { id: 'cu5b', name: 'Fer de guerre', cost: D(100_000_000), kind: 'clickMult', value: 2 },
  { id: 'cu6', name: "Rage de l'érable", cost: D(500_000_000), kind: 'critChance', value: 0.15 },
  { id: 'cu6b', name: 'Acier trempé', cost: D(5_000_000_000), kind: 'clickPctSps', value: 0.02 },

  // Late-mid : doigts d'or et bénédictions
  { id: 'cu7', name: 'Doigts plaqués or', cost: D(50_000_000_000), kind: 'clickMult', value: 10 },
  { id: 'cu7b', name: 'Gantelets de platine', cost: D(500_000_000_000), kind: 'clickPctSps', value: 0.03 },
  { id: 'cu8', name: 'Bénédiction de Dame Érable', cost: D(5e12), kind: 'clickPctSps', value: 0.05 },

  // End-game : frappes cosmiques
  { id: 'cu8b', name: 'Corne d\'abondance', cost: D(50e12), kind: 'clickMult', value: 15 },
  { id: 'cu9', name: 'Frappe cosmique', cost: D(500e12), kind: 'clickMult', value: 25 },
  { id: 'cu9b', name: 'Auréole dorée', cost: D(5e15), kind: 'clickPctSps', value: 0.08 },
  { id: 'cu10', name: 'Touch divin', cost: D(50e15), kind: 'critChance', value: 0.25, unlockLevel: 15 },
];

export const CLICK_UPGRADES_BY_ID = CLICK_UPGRADES.reduce<Record<string, ClickUpgradeDef>>(
  (acc, u) => {
    acc[u.id] = u;
    return acc;
  },
  {},
);
