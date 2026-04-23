/**
 * Daily quests — 3 rolled quests per day, with a streak bonus for
 * consecutive all-completed days. Hooks the player back into the game
 * every 24 h.
 *
 * Progress is tracked via counter snapshots: at day start we capture
 * `totalClicks`, `buildingsBoughtThisRun`, etc., and progress is the
 * delta from that snapshot. This keeps quest logic pure — the reducers
 * just need to increment those counters and we read them back here.
 */
import { D } from './bignum';
import { DAILY_QUEST_COUNT, DAILY_QUEST_STREAK_BONUS, DAILY_QUEST_STREAK_CAP } from './constants';
import type { DailyQuest, GameState } from './types';

type QuestKind = DailyQuest['kind'];

interface QuestTemplate {
  kind: QuestKind;
  label: (target: number) => string;
  targets: number[];          // possible difficulty tiers
  baseReward: number;         // essence reward for easiest tier
  minLevel: number;           // quest only rolls if player reached this level
}

const TEMPLATES: QuestTemplate[] = [
  {
    kind: 'clicks',
    label: (n) => `Cliquer ${n.toLocaleString('fr-FR')} fois aujourd'hui`,
    targets: [200, 500, 1000, 2000],
    baseReward: 1,
    minLevel: 1,
  },
  {
    kind: 'buildings',
    label: (n) => `Acheter ${n} bâtiments`,
    targets: [10, 25, 50, 100],
    baseReward: 1,
    minLevel: 2,
  },
  {
    kind: 'upgrades',
    label: (n) => `Acheter ${n} upgrade${n > 1 ? 's' : ''}`,
    targets: [1, 2, 3],
    baseReward: 2,
    minLevel: 3,
  },
  {
    kind: 'goldens',
    label: (n) => `Attraper ${n} goutte${n > 1 ? 's' : ''} dorée${n > 1 ? 's' : ''}`,
    targets: [1, 3, 5],
    baseReward: 2,
    minLevel: 5,
  },
  {
    kind: 'crits',
    label: (n) => `Déclencher ${n} crits`,
    targets: [25, 75, 200],
    baseReward: 1,
    minLevel: 4,
  },
];

/** Local "YYYY-MM-DD" based on player's timezone. */
export function todayString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Simple deterministic pseudo-RNG per-day so quests don't re-roll across reloads. */
function dailyHash(seed: string, salt: number): number {
  let h = 2166136261;
  const s = seed + ':' + salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function readCounter(state: GameState, kind: QuestKind): number {
  switch (kind) {
    case 'clicks': return state.totalClicks;
    case 'buildings': return state.buildingsBoughtThisRun;
    case 'upgrades': return state.upgradesBoughtThisRun;
    case 'goldens': return state.goldensCaught;
    case 'crits': return state.totalCrits;
  }
}

function rollQuest(state: GameState, seed: string, slot: number): DailyQuest {
  const available = TEMPLATES.filter((t) => state.level >= t.minLevel);
  const pool = available.length > 0 ? available : TEMPLATES;
  const t = pool[dailyHash(seed, slot) % pool.length];
  // Pick tier based on player level (harder tiers at higher levels).
  const tierIdx = Math.min(t.targets.length - 1, Math.floor(state.level / 5));
  const target = t.targets[tierIdx];
  const reward = t.baseReward + tierIdx;
  return {
    id: `${t.kind}-${slot}`,
    kind: t.kind,
    label: t.label(target),
    target,
    startValue: readCounter(state, t.kind),
    reward,
    claimed: false,
  };
}

/**
 * Ensure the state has quests for today. Roll new ones if we're on a
 * different date, and update streak based on whether yesterday was fully
 * claimed.
 */
export function ensureTodayQuests(state: GameState): GameState {
  const today = todayString();
  const dq = state.dailyQuests;
  if (dq.date === today && dq.quests.length === DAILY_QUEST_COUNT) return state;

  const quests: DailyQuest[] = [];
  for (let slot = 0; slot < DAILY_QUEST_COUNT; slot++) {
    quests.push(rollQuest(state, today, slot));
  }

  // Streak: bumped only if yesterday's quests were all claimed.
  let streak = dq.streak;
  const yesterday = yesterdayString(new Date());
  if (dq.lastAllClaimedDate !== yesterday && dq.date !== '' && dq.date !== today) {
    // Missed a day → reset streak unless we already had a clean prior claim.
    if (dq.lastAllClaimedDate !== yesterday) streak = 0;
  }

  return {
    ...state,
    dailyQuests: {
      date: today,
      quests,
      streak,
      lastAllClaimedDate: dq.lastAllClaimedDate,
    },
  };
}

function yesterdayString(now: Date): string {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return todayString(y);
}

/** Current progress (0..target) for a quest. */
export function questProgress(state: GameState, q: DailyQuest): number {
  const current = readCounter(state, q.kind);
  return Math.max(0, current - q.startValue);
}

/** True if quest is complete but not yet claimed. */
export function questCanClaim(state: GameState, q: DailyQuest): boolean {
  if (q.claimed) return false;
  return questProgress(state, q) >= q.target;
}

/** Streak-bonus multiplier applied to claim rewards. */
export function streakMultiplier(streak: number): number {
  const effective = Math.min(streak, DAILY_QUEST_STREAK_CAP);
  return 1 + effective * DAILY_QUEST_STREAK_BONUS;
}

/** Pure reducer: mark a quest claimed, grant essence, update streak. */
export function claimQuestReducer(state: GameState, questId: string): GameState {
  const dq = state.dailyQuests;
  const idx = dq.quests.findIndex((q) => q.id === questId);
  if (idx < 0) return state;
  const q = dq.quests[idx];
  if (!questCanClaim(state, q)) return state;

  const mult = streakMultiplier(dq.streak);
  const essenceGain = Math.max(1, Math.round(q.reward * mult));

  const newQuests = dq.quests.map((qq, i) =>
    i === idx ? { ...qq, claimed: true } : qq,
  );

  // If that completes the full set, bump streak + remember it.
  const allClaimed = newQuests.every((qq) => qq.claimed);
  const today = todayString();
  let streak = dq.streak;
  let lastAll = dq.lastAllClaimedDate;
  if (allClaimed && lastAll !== today) {
    streak = dq.streak + 1;
    lastAll = today;
  }

  const add = D(essenceGain);
  return {
    ...state,
    essence: state.essence.add(add),
    essenceEarnedTotal: state.essenceEarnedTotal.add(add),
    dailyQuests: {
      ...dq,
      quests: newQuests,
      streak,
      lastAllClaimedDate: lastAll,
    },
  };
}
