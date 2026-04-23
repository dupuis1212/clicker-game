import type { BigNum } from './bignum';

export type BuildingId =
  | 'chalumeau'
  | 'seau'
  | 'erableMature'
  | 'bouilloire'
  | 'evaporateur'
  | 'cabaneRustique'
  | 'tracteur'
  | 'foretErables'
  | 'pipeline'
  | 'evaporateurIndustriel'
  | 'raffinerie'
  | 'laboratoire'
  | 'distillerie'
  | 'temple'
  | 'portail'
  | 'sevePrimordiale';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  description: string;
  icon: string;
  baseCost: BigNum;
  baseSps: BigNum;
  unlockLevel: number;
  mythical?: boolean;
}

export interface ClickUpgradeDef {
  id: string;
  name: string;
  cost: BigNum;
  kind: 'clickMult' | 'clickPctSps' | 'critChance' | 'critMult';
  value: number;
  unlockLevel?: number;
}

export interface GlobalUpgradeDef {
  id: string;
  name: string;
  cost: BigNum;
  currency: 'sirop' | 'sucre';
  kind: 'buildingMult' | 'allBuildingsMult' | 'eventMult';
  target?: BuildingId[];
  value: number;
  unlockLevel?: number;
}

export interface LevelDef {
  level: number;
  name: string;
  threshold: BigNum;
  bonus: string;
}

export type EventType =
  | 'goldenDrop'
  | 'northWind'
  | 'castor'
  | 'fullMoon'
  | 'miraculousHarvest';

export interface ActiveEvent {
  type: EventType;
  startedAt: number;
  endsAt: number;
  data?: Record<string, unknown>;
}

export type Season = 'printemps' | 'ete' | 'automne' | 'hiver';

export interface Skins {
  tree: string; // 'default' | 'cerisier' | 'sequoia' | 'noel' | 'doree' | 'cosmique'
  cabane: string; // 'default' | 'plaquee-or' | 'cristal' | etc.
}

export interface Settings {
  volume: number;
  music: boolean;
  musicVolume: number;
  notation: 'suffixes' | 'scientific';
  animations: boolean;
}

/**
 * A daily quest instance (one of 3 rolled per day).
 *   - `progress` resets each day, `startValue` snapshots the relevant counter
 *     at quest generation so progress = current - startValue.
 */
export interface DailyQuest {
  id: string;                                       // unique quest-id for this day
  kind: 'clicks' | 'buildings' | 'goldens' | 'upgrades' | 'crits';
  label: string;
  target: number;                                   // amount required
  startValue: number;                               // snapshot at day start
  reward: number;                                   // essence awarded
  claimed: boolean;
}

export interface DailyQuestsState {
  date: string;                                     // YYYY-MM-DD (local) of current quest set
  quests: DailyQuest[];
  streak: number;                                   // consecutive days all-claimed
  lastAllClaimedDate: string;                       // '' if never
}

/**
 * Local leaderboard: summary of completed runs (up to first prestige of a run).
 */
export interface RunRecord {
  startedAt: number;
  endedAt: number;
  durationMs: number;
  feuillesGained: string;                           // BigNum serialized
  totalDropsEver: string;                           // BigNum serialized
  seed: string | null;
}

/**
 * Pending lunar boon (audit recommendation: agency on events).
 * When full moon triggers, the event sits in `activeEvents` with data
 * `{ pending: true }`. Formulas ignore it until the player picks.
 */
export type LunarChoice = 'sps' | 'click' | 'golden';

export interface GameState {
  schemaVersion: number;

  // Currencies
  drops: BigNum;
  sirop: BigNum;
  sucre: BigNum;
  feuillesDorees: BigNum;
  essence: BigNum;
  essenceEarnedTotal: BigNum;

  // Running totals
  totalDropsEver: BigNum;
  totalClicks: number;
  totalCrits: number;
  startedAt: number;
  lastTickAt: number;
  sessionStartedAt: number;
  playTimeMs: number;

  level: number;

  buildings: Record<BuildingId, number>;
  clickUpgrades: Record<string, boolean>;
  globalUpgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;

  prestigeCount: number;
  talents: Record<string, boolean>;

  activeEvents: ActiveEvent[];
  nextGoldenDropAt: number;
  nextRandomEventAt: number;
  lastFullMoonAt: number;

  combo: {
    count: number;
    windowStartedAt: number;
    stack: number;
  };

  rngState: string | null;

  // Counters for achievements
  goldensCaught: number;
  castorFastKills: number;
  longestAwayMs: number;
  doubledOnFullMoon: boolean;
  secret77: boolean;
  last77Clicks: number[];

  // Auto-click (level 9+)
  autoClickAccumulator: number;

  // Cosmetic / meta
  readLore: number[]; // niveaux dont la lettre a été lue
  skins: Skins;
  settings: Settings;

  // Last unlocks for UI fanfares
  lastLevelUp: number | null;

  // Daily quests + streak (audit: hook de retour quotidien).
  dailyQuests: DailyQuestsState;

  // Per-run stats for local leaderboard.
  buildingsBoughtThisRun: number;
  upgradesBoughtThisRun: number;
  runsHistory: RunRecord[];

  // Coulée du printemps — event temps réel sur la saison IRL.
  // On mémorise l'année où on a déjà consommé le bonus de départ, pour
  // éviter un "welcome back" chaque tick.
  couleeWelcomeYear: number;
}
