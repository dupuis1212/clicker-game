import { D, ONE, ZERO, type BigNum } from './bignum';
import { COST_GROWTH } from './constants';
import { BUILDINGS, BUILDINGS_BY_ID } from '../data/buildings';
import { CLICK_UPGRADES_BY_ID } from '../data/clickUpgrades';
import { GLOBAL_UPGRADES_BY_ID } from '../data/globalUpgrades';
import { currentSeason, seasonCritBonus, seasonSpsMultiplier } from './seasons';
import { couleeSpsMultiplier } from './coulee';
import {
  achievementBuildingMultiplier,
  achievementClickBonus,
  achievementCritChance,
  achievementSpsBonus,
} from './rewards';
import type { BuildingId, GameState } from './types';

/**
 * Cost to buy the next single unit of a building.
 * cost(n) = base * 1.15^n
 */
export function buildingCost(id: BuildingId, owned: number): BigNum {
  const def = BUILDINGS_BY_ID[id];
  return def.baseCost.mul(D(COST_GROWTH).pow(owned));
}

/**
 * Cumulative cost to buy `k` buildings starting from `owned`.
 * sum_{i=0..k-1} base * r^(owned+i) = base * r^owned * (r^k - 1) / (r - 1)
 */
export function buildingCostBulk(id: BuildingId, owned: number, k: number): BigNum {
  if (k <= 0) return ZERO;
  const def = BUILDINGS_BY_ID[id];
  const r = D(COST_GROWTH);
  const factor = r.pow(k).sub(1).div(r.sub(1));
  return def.baseCost.mul(r.pow(owned)).mul(factor);
}

/**
 * Max number of building `id` the player can afford given current drops.
 */
export function maxAffordable(id: BuildingId, owned: number, drops: BigNum): number {
  const def = BUILDINGS_BY_ID[id];
  const r = D(COST_GROWTH);
  // Solve: base * r^owned * (r^k - 1) / (r-1) <= drops
  // => r^k <= 1 + drops*(r-1)/(base*r^owned)
  const rhs = drops.mul(r.sub(1)).div(def.baseCost.mul(r.pow(owned))).add(1);
  if (rhs.lte(1)) return 0;
  const k = Math.floor(rhs.log10() / D(COST_GROWTH).log10());
  return Math.max(0, k);
}

/**
 * Global multiplier from click upgrades that scale with building count (via 'clickMult'),
 * prestige talents, achievements and active event buffs.
 */
export function globalMultiplier(state: GameState): BigNum {
  let mult = ONE;

  // Snowball synergy: every 10 buildings owned (any type) grants +1% global SPS.
  const totalBuildings = BUILDINGS.reduce((sum, b) => sum + state.buildings[b.id], 0);
  if (totalBuildings > 0) {
    mult = mult.mul(ONE.add(D(totalBuildings).div(10).mul(0.01)));
  }

  // Prestige bonus boosted: +5% SPS per feuille (was +2%)
  const prestigeBonus = ONE.add(D(state.feuillesDorees).mul(0.05));
  mult = mult.mul(prestigeBonus);

  // Apply real achievement SPS rewards (replaces former generic +1% per achievement).
  mult = mult.mul(achievementSpsBonus(state));

  for (const uid of Object.keys(state.globalUpgrades)) {
    if (!state.globalUpgrades[uid]) continue;
    const def = GLOBAL_UPGRADES_BY_ID[uid];
    if (def?.kind === 'allBuildingsMult') mult = mult.mul(def.value);
  }

  for (const tid of Object.keys(state.talents)) {
    if (!state.talents[tid]) continue;
    if (tid === 't6') mult = mult.mul(ONE.add(D(state.prestigeCount).mul(0.05)));
    if (tid === 't11') mult = mult.mul(1.30); // Voie de la patience
  }

  for (const ev of state.activeEvents) {
    if (ev.type === 'miraculousHarvest') mult = mult.mul(5);
    if (ev.type === 'northWind') mult = mult.mul(1.5);         // flipped: now a buff (was 0.85 debuff)
    if (ev.type === 'fullMoon') {
      // Pending lunar events grant no bonus until the player picks a boon.
      if (ev.data?.pending === true) continue;
      const choice = ev.data?.choice as string | undefined;
      if (choice === 'click') continue;      // click boon doesn't affect SPS
      if (choice === 'golden') continue;     // golden boon doesn't affect SPS
      // default (sps boon) or legacy event without choice → classic ×3
      const spsMult = choice === 'sps' ? 5 : 3;
      mult = mult.mul(spsMult);
    }
    if (ev.type === 'goldenDrop' && ev.data?.kind === 'frenzy') mult = mult.mul(15);
  }

  const season = currentSeason(Date.now());
  mult = mult.mul(seasonSpsMultiplier(season));

  // Coulée du printemps — real-world March/April bonus.
  mult = mult.mul(couleeSpsMultiplier());

  return mult;
}

/**
 * Per-building multiplier from global upgrades that target it.
 */
function perBuildingMultiplier(id: BuildingId, state: GameState): BigNum {
  let m = ONE;
  for (const uid of Object.keys(state.globalUpgrades)) {
    if (!state.globalUpgrades[uid]) continue;
    const def = GLOBAL_UPGRADES_BY_ID[uid];
    if (!def) continue;
    if (def.kind === 'buildingMult' && def.target?.includes(id)) {
      m = m.mul(def.value);
    }
  }
  m = m.mul(achievementBuildingMultiplier(id, state));
  return m;
}

/**
 * Production of a single building type given owned count + multipliers.
 */
export function buildingSps(id: BuildingId, state: GameState): BigNum {
  const def = BUILDINGS_BY_ID[id];
  const owned = state.buildings[id];
  if (owned <= 0) return ZERO;
  // Self-stacking: +1% per copy owned of THIS building (Cookie Clicker pattern).
  const selfStack = ONE.add(D(owned).mul(0.01));
  return def.baseSps.mul(owned).mul(selfStack).mul(perBuildingMultiplier(id, state));
}

/**
 * Total SPS = sum of all buildings × global multiplier.
 */
export function totalSps(state: GameState): BigNum {
  let base = ZERO;
  for (const b of BUILDINGS) {
    base = base.add(buildingSps(b.id, state));
  }
  return base.mul(globalMultiplier(state));
}

/**
 * Value of a single click, before crit.
 */
export function clickValue(state: GameState): BigNum {
  let base = ONE;
  let pctSps = 0;

  for (const id of Object.keys(state.clickUpgrades)) {
    if (!state.clickUpgrades[id]) continue;
    const def = CLICK_UPGRADES_BY_ID[id];
    if (!def) continue;
    if (def.kind === 'clickMult') base = base.mul(def.value);
    if (def.kind === 'clickPctSps') pctSps += def.value;
  }

  if (pctSps > 0) {
    base = base.add(totalSps(state).mul(pctSps));
  }

  if (state.talents['t3']) base = base.mul(2);
  if (state.talents['t12']) base = base.mul(1.30); // Voie de la frénésie

  // Pleine lune — "click" boon grants ×5 click power instead of the SPS mult.
  for (const ev of state.activeEvents) {
    if (ev.type === 'fullMoon' && ev.data?.choice === 'click') {
      base = base.mul(5);
    }
  }

  // Click mastery: +1% click power per 100 lifetime clicks (capped at +500%).
  const masteryPct = Math.min(5, state.totalClicks / 10_000);
  base = base.mul(ONE.add(D(masteryPct)));

  base = base.mul(state.combo.stack);
  base = base.mul(achievementClickBonus(state));

  return base.mul(globalMultiplier(state));
}

export function critChance(state: GameState): number {
  let c = 0.05; // base buffed (was 0.01)
  for (const id of Object.keys(state.clickUpgrades)) {
    if (!state.clickUpgrades[id]) continue;
    const def = CLICK_UPGRADES_BY_ID[id];
    if (def?.kind === 'critChance') c = Math.max(c, def.value);
  }
  c += seasonCritBonus(currentSeason(Date.now()));
  c += achievementCritChance(state);
  return Math.min(1, c);
}

export function critMultiplier(state: GameState): number {
  let m = 15; // base buffed (was 10)
  for (const id of Object.keys(state.clickUpgrades)) {
    if (!state.clickUpgrades[id]) continue;
    const def = CLICK_UPGRADES_BY_ID[id];
    if (def?.kind === 'critMult') m = Math.max(m, def.value);
  }
  if (state.clickUpgrades['cu10']) m = 2500; // was 1000
  return m;
}

/**
 * Prestige: feuilles = floor(sqrt(totalDrops / 1e9))
 * Lowered threshold (1e9 vs 1e12) so first prestige is reachable around level 11-12.
 * Stays in BigNum the whole way to avoid Infinity past Number.MAX_VALUE.
 */
export function prestigeGain(totalDropsEver: BigNum): BigNum {
  const div = totalDropsEver.div(D(1e9));
  if (div.lt(1)) return ZERO;
  const lg = div.log10() / 2;
  return D(10).pow(lg).floor();
}
