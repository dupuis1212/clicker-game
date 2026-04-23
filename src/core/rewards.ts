import { D, ONE, type BigNum } from './bignum';
import type { BuildingId, GameState } from './types';
import { ACHIEVEMENTS_BY_ID } from '../data/achievements';

/**
 * Achievement reward kinds. Each unlocked achievement applies its reward
 * exactly once; rewards stack additively within a kind unless noted.
 */
export type AchievementReward =
  | { kind: 'sps'; pct: number }                                // +pct% additive into a global SPS bonus
  | { kind: 'click'; pct: number }                              // +pct% additive into click bonus
  | { kind: 'critChance'; value: number }                       // additive crit chance bonus
  | { kind: 'tier1to5'; pct: number }                           // +pct% multiplier on first 5 buildings
  | { kind: 'centurion'; pct: number }                          // +pct% per building owning >= 100
  | { kind: 'mille'; pct: number }                              // +pct% per building owning >= 1000
  | { kind: 'allBuildings'; pct: number }                       // +pct% multiplier on every building
  | { kind: 'building'; target: BuildingId; mult: number }      // ×mult on a specific building
  | { kind: 'goldenDuration'; seconds: number }                 // adds seconds to golden frenzy event
  | { kind: 'goldenEffect'; mult: number }                      // multiplies golden gain
  | { kind: 'castorReward'; pct: number }                       // castor gives pct of stock instead of stealing
  | { kind: 'fullMoonDuration'; pct: number }                   // multiplies fullMoon duration
  | { kind: 'offline'; pct: number }                            // +pct% offline gains
  | { kind: 'feuilles'; pct: number }                           // +pct% prestige feuilles
  | { kind: 'skin'; skinId: string };                           // unlocks a tree skin

export function unlockedAchievements(state: GameState): AchievementReward[] {
  const out: AchievementReward[] = [];
  for (const id of Object.keys(state.achievements)) {
    if (!state.achievements[id]) continue;
    const def = ACHIEVEMENTS_BY_ID[id];
    if (def?.reward) out.push(def.reward);
  }
  return out;
}

/** Sum of all SPS-percentage rewards (a1-a10, a16, a19, a24, a25, a29). */
export function achievementSpsBonus(state: GameState): BigNum {
  let bonus = 0;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'sps') bonus += r.pct;
  }
  return ONE.add(D(bonus));
}

/** Sum of all click-percentage rewards (a11-a14). */
export function achievementClickBonus(state: GameState): BigNum {
  let bonus = 0;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'click') bonus += r.pct;
  }
  return ONE.add(D(bonus));
}

/** Additive crit chance bonus (a15). */
export function achievementCritChance(state: GameState): number {
  let bonus = 0;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'critChance') bonus += r.value;
  }
  return bonus;
}

const TIER_1_TO_5: BuildingId[] = ['chalumeau', 'seau', 'erableMature', 'bouilloire', 'evaporateur'];

/** Per-building multiplier from achievement rewards. */
export function achievementBuildingMultiplier(id: BuildingId, state: GameState): BigNum {
  let mult = ONE;
  let tierBonus = 0;
  let allBonus = 0;
  let centurionBonus = 0;
  let milleBonus = 0;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'building' && r.target === id) {
      mult = mult.mul(r.mult);
    } else if (r.kind === 'tier1to5' && TIER_1_TO_5.includes(id)) {
      tierBonus += r.pct;
    } else if (r.kind === 'allBuildings') {
      allBonus += r.pct;
    } else if (r.kind === 'centurion' && state.buildings[id] >= 100) {
      centurionBonus += r.pct;
    } else if (r.kind === 'mille' && state.buildings[id] >= 1000) {
      milleBonus += r.pct;
    }
  }
  if (tierBonus > 0) mult = mult.mul(ONE.add(D(tierBonus)));
  if (allBonus > 0) mult = mult.mul(ONE.add(D(allBonus)));
  if (centurionBonus > 0) mult = mult.mul(ONE.add(D(centurionBonus)));
  if (milleBonus > 0) mult = mult.mul(ONE.add(D(milleBonus)));
  return mult;
}

/** Extra seconds added to golden frenzy duration (a26). */
export function achievementGoldenDurationBonusSec(state: GameState): number {
  let bonus = 0;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'goldenDuration') bonus += r.seconds;
  }
  return bonus;
}

/** Multiplier applied to golden drop instant-stock and frenzy SPS (a27). */
export function achievementGoldenEffectMultiplier(state: GameState): number {
  let mult = 1;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'goldenEffect') mult *= r.mult;
  }
  return mult;
}

/** Castor reward percentage (a28). 0 = castor still steals. */
export function achievementCastorReward(state: GameState): number {
  let bonus = 0;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'castorReward') bonus += r.pct;
  }
  return bonus;
}

/** Multiplicative bonus on full moon duration (a31). */
export function achievementFullMoonDurationMult(state: GameState): number {
  let mult = 1;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'fullMoonDuration') mult *= 1 + r.pct;
  }
  return mult;
}

/** Multiplicative bonus on offline gains (a30). */
export function achievementOfflineMultiplier(state: GameState): number {
  let mult = 1;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'offline') mult *= 1 + r.pct;
  }
  return mult;
}

/** Multiplicative bonus on prestige feuilles (a33, a34). */
export function achievementFeuillesMultiplier(state: GameState): BigNum {
  let mult = 1;
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'feuilles') mult *= 1 + r.pct;
  }
  return D(mult);
}

/** List of skin ids unlocked by achievements (a32, a35). */
export function achievementUnlockedSkins(state: GameState): string[] {
  const out: string[] = [];
  for (const r of unlockedAchievements(state)) {
    if (r.kind === 'skin') out.push(r.skinId);
  }
  return out;
}
