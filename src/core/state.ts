import { ZERO } from './bignum';
import { SCHEMA_VERSION } from './constants';
import type { BuildingId, GameState } from './types';
import { BUILDINGS } from '../data/buildings';

export function emptyBuildings(): Record<BuildingId, number> {
  return BUILDINGS.reduce(
    (acc, b) => {
      acc[b.id] = 0;
      return acc;
    },
    {} as Record<BuildingId, number>,
  );
}

export function createInitialState(): GameState {
  const now = Date.now();
  return {
    schemaVersion: SCHEMA_VERSION,

    drops: ZERO,
    sirop: ZERO,
    sucre: ZERO,
    feuillesDorees: ZERO,
    essence: ZERO,
    essenceEarnedTotal: ZERO,

    totalDropsEver: ZERO,
    totalClicks: 0,
    totalCrits: 0,
    startedAt: now,
    lastTickAt: now,
    sessionStartedAt: now,
    playTimeMs: 0,

    level: 1,

    buildings: emptyBuildings(),
    clickUpgrades: {},
    globalUpgrades: {},
    achievements: {},

    prestigeCount: 0,
    talents: {},

    activeEvents: [],
    nextGoldenDropAt: now + 5 * 60 * 1000,
    nextRandomEventAt: now + 10 * 60 * 1000,
    lastFullMoonAt: 0,

    combo: { count: 0, windowStartedAt: 0, stack: 1 },

    rngState: null,

    goldensCaught: 0,
    castorFastKills: 0,
    longestAwayMs: 0,
    doubledOnFullMoon: false,
    secret77: false,
    last77Clicks: [],

    autoClickAccumulator: 0,

    readLore: [],
    skins: { tree: 'default', cabane: 'default' },
    settings: { volume: 0.5, music: true, musicVolume: 0.3, notation: 'suffixes', animations: true },

    lastLevelUp: null,

    dailyQuests: {
      date: '',
      quests: [],
      streak: 0,
      lastAllClaimedDate: '',
    },

    buildingsBoughtThisRun: 0,
    upgradesBoughtThisRun: 0,
    runsHistory: [],

    couleeWelcomeYear: 0,
  };
}
