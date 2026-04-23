export const TICK_HZ = 20;
export const TICK_MS = 1000 / TICK_HZ;
export const SAVE_INTERVAL_MS = 30_000;
export const OFFLINE_CAP_HOURS = 24;
export const OFFLINE_CAP_HOURS_T4 = 48;
export const MAX_DT_SECONDS = 1;

export const CRIT_BASE_CHANCE = 0.05;     // was 0.01 — more dopamine
export const CRIT_BASE_MULT = 15;         // was 10

export const COMBO_WINDOW_MS = 4000;      // was 3000 — easier to maintain
export const COMBO_CLICKS_NEEDED = 5;     // was 10 — ramps faster
export const COMBO_STEP = 1.5;
export const COMBO_MAX_STACK = 10;

export const COST_GROWTH = 1.12;
export const UPGRADE_PROD_MULT_BASE = 1.08;

export const SCHEMA_VERSION = 2;

/**
 * Daily quest config (audit recommendation: hook de retour quotidien + streak).
 * Quests reset each day at local midnight. Streak: +10% essence reward per
 * consecutive day, capped at 7 days (×1.7).
 */
export const DAILY_QUEST_STREAK_CAP = 7;
export const DAILY_QUEST_STREAK_BONUS = 0.1;  // +10% per day
export const DAILY_QUEST_COUNT = 3;
