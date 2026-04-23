import type { GameState } from './types';
import { BUILDINGS } from '../data/buildings';
import { LEVELS } from '../data/levels';
import { totalSps, clickValue, critChance, critMultiplier } from './formulas';

export function getTotalSps(state: GameState) {
  return totalSps(state);
}

export function getClickValue(state: GameState) {
  return clickValue(state);
}

export function getCritChance(state: GameState) {
  return critChance(state);
}

export function getCritMult(state: GameState) {
  return critMultiplier(state);
}

export function getNextLevel(state: GameState) {
  return LEVELS.find((l) => l.level === state.level + 1);
}

export function getCurrentLevel(state: GameState) {
  return LEVELS.find((l) => l.level === state.level);
}

export function getTotalBuildings(state: GameState): number {
  return BUILDINGS.reduce((sum, b) => sum + state.buildings[b.id], 0);
}
