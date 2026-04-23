import { D, ZERO } from '../bignum';
import type { GameState } from '../types';
import { prestigeGain } from '../formulas';
import { emptyBuildings } from '../state';
import { achievementFeuillesMultiplier } from '../rewards';
import { TALENTS_BY_ID } from '../../data/talents';
import { BUILDINGS } from '../../data/buildings';
import { SCHEMA_VERSION } from '../constants';

export function canPrestige(state: GameState): boolean {
  return state.level >= 10 && prestigeGain(state.totalDropsEver).gt(0);
}

export function performPrestige(state: GameState): GameState {
  const baseGain = prestigeGain(state.totalDropsEver);
  const t8Bonus = state.talents['t8'] ? baseGain.mul(0.1) : ZERO;
  const t13Bonus = state.talents['t13'] ? baseGain.mul(0.5) : ZERO; // Voie du sage
  const achMult = achievementFeuillesMultiplier(state);
  const totalGain = baseGain.add(t8Bonus).add(t13Bonus).mul(achMult).floor();

  const now = Date.now();

  // Talent T10: keep mythical buildings across prestige
  const keepMythical = state.talents['t10'];
  const startingBuildings = emptyBuildings();
  if (keepMythical) {
    for (const b of BUILDINGS) {
      if (b.mythical) startingBuildings[b.id] = state.buildings[b.id];
    }
  }

  // Push a RunRecord into history (cap at last 20 runs).
  const runRecord = {
    startedAt: state.startedAt,
    endedAt: now,
    durationMs: now - state.startedAt,
    feuillesGained: totalGain.toString(),
    totalDropsEver: state.totalDropsEver.toString(),
    seed: null,
  };
  const runsHistory = [runRecord, ...state.runsHistory].slice(0, 20);

  const next: GameState = {
    schemaVersion: SCHEMA_VERSION,
    drops: ZERO,
    sirop: ZERO,
    sucre: ZERO,
    feuillesDorees: state.feuillesDorees.add(totalGain),
    essence: state.essence,
    essenceEarnedTotal: state.essenceEarnedTotal,
    totalDropsEver: ZERO,
    totalClicks: 0,
    totalCrits: 0,
    startedAt: now,
    lastTickAt: now,
    sessionStartedAt: now,
    playTimeMs: state.playTimeMs,
    level: 1,
    buildings: startingBuildings,
    clickUpgrades: {},
    globalUpgrades: {},
    achievements: state.achievements,
    prestigeCount: state.prestigeCount + 1,
    talents: resetExclusivePaths(state.talents),
    activeEvents: [],
    nextGoldenDropAt: now + 5 * 60 * 1000,
    nextRandomEventAt: now + 10 * 60 * 1000,
    lastFullMoonAt: 0,
    combo: { count: 0, windowStartedAt: 0, stack: 1 },
    rngState: state.rngState,
    goldensCaught: state.goldensCaught,
    castorFastKills: state.castorFastKills,
    longestAwayMs: state.longestAwayMs,
    doubledOnFullMoon: state.doubledOnFullMoon,
    secret77: state.secret77,
    last77Clicks: [],
    autoClickAccumulator: 0,
    readLore: state.readLore,
    skins: state.skins,
    settings: state.settings,
    lastLevelUp: null,
    dailyQuests: state.dailyQuests,
    buildingsBoughtThisRun: 0,
    upgradesBoughtThisRun: 0,
    runsHistory,
    couleeWelcomeYear: state.couleeWelcomeYear,
  };

  return applyTalentsOnStart(next);
}

/**
 * Exclusive talent paths (t11/t12/t13) reset on each prestige so the player
 * can re-pick a branch.
 */
function resetExclusivePaths(talents: Record<string, boolean>): Record<string, boolean> {
  const next = { ...talents };
  delete next.t11;
  delete next.t12;
  delete next.t13;
  return next;
}

function applyTalentsOnStart(state: GameState): GameState {
  let next = state;
  if (next.talents['t1']) next = { ...next, drops: D(100) };
  if (next.talents['t2']) {
    next = { ...next, buildings: { ...next.buildings, chalumeau: 10 } };
  }
  if (next.talents['t7']) {
    const cu = { ...next.clickUpgrades };
    ['cu1', 'cu2', 'cu3', 'cu4', 'cu5'].forEach((id) => {
      cu[id] = true;
    });
    next = { ...next, clickUpgrades: cu };
  }
  return next;
}

export function buyTalent(state: GameState, id: string): GameState {
  const def = TALENTS_BY_ID[id];
  if (!def) return state;
  if (state.talents[id]) return state;
  if (state.feuillesDorees.lt(def.cost)) return state;
  // Exclusive paths: refuse if a conflicting talent is already owned.
  if (def.exclusiveWith?.some((other) => state.talents[other])) return state;
  return {
    ...state,
    feuillesDorees: state.feuillesDorees.sub(def.cost),
    talents: { ...state.talents, [id]: true },
  };
}
