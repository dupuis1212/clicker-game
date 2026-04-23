import type { BuildingId, GameState } from '../types';
import { buildingCost, buildingCostBulk } from '../formulas';
import { CLICK_UPGRADES_BY_ID } from '../../data/clickUpgrades';
import { GLOBAL_UPGRADES_BY_ID } from '../../data/globalUpgrades';

export function buyBuilding(state: GameState, id: BuildingId, amount = 1): GameState {
  const owned = state.buildings[id];
  const cost = amount === 1 ? buildingCost(id, owned) : buildingCostBulk(id, owned, amount);
  if (state.drops.lt(cost)) return state;
  return {
    ...state,
    drops: state.drops.sub(cost),
    buildings: { ...state.buildings, [id]: owned + amount },
    buildingsBoughtThisRun: state.buildingsBoughtThisRun + amount,
  };
}

export function buyClickUpgrade(state: GameState, id: string): GameState {
  const def = CLICK_UPGRADES_BY_ID[id];
  if (!def) return state;
  if (state.clickUpgrades[id]) return state;
  if (state.drops.lt(def.cost)) return state;
  return {
    ...state,
    drops: state.drops.sub(def.cost),
    clickUpgrades: { ...state.clickUpgrades, [id]: true },
    upgradesBoughtThisRun: state.upgradesBoughtThisRun + 1,
  };
}

export function buyGlobalUpgrade(state: GameState, id: string): GameState {
  const def = GLOBAL_UPGRADES_BY_ID[id];
  if (!def) return state;
  if (state.globalUpgrades[id]) return state;
  const balance = def.currency === 'sirop' ? state.sirop : state.sucre;
  if (balance.lt(def.cost)) return state;
  const next = {
    ...state,
    globalUpgrades: { ...state.globalUpgrades, [id]: true },
    upgradesBoughtThisRun: state.upgradesBoughtThisRun + 1,
  };
  if (def.currency === 'sirop') next.sirop = state.sirop.sub(def.cost);
  else next.sucre = state.sucre.sub(def.cost);
  return next;
}
