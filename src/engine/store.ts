import { create } from 'zustand';
import type { GameState, BuildingId } from '../core/types';
import { createInitialState } from '../core/state';
import { applyClick } from '../core/reducers/click';
import { buyBuilding, buyClickUpgrade, buyGlobalUpgrade } from '../core/reducers/buy';
import { applyTick, applyOfflineProgress } from '../core/reducers/tick';
import { checkAchievements } from '../core/reducers/achievement';
import {
  maybeTriggerEvents,
  triggerGoldenDrop,
  castorVictory,
  castorSteals,
  chooseLunarBoon,
} from '../core/reducers/event';
import { canPrestige, performPrestige, buyTalent } from '../core/reducers/prestige';
import { D } from '../core/bignum';
import { ensureTodayQuests, claimQuestReducer } from '../core/dailyQuests';
import { isCouleeActive, shouldGrantCouleeWelcome } from '../core/coulee';
import { totalSps } from '../core/formulas';
import type { LunarChoice } from '../core/types';
import { loadRaw, saveRaw, backupCorrupt } from './persistence/storage';
import { deserialize, serialize } from './persistence/serialize';
import { initRng, rand, rngState } from './rng';
import { sfx } from './audio';

interface StoreActions {
  click: () => { gained: import('../core/bignum').BigNum; crit: boolean };
  buyBuilding: (id: BuildingId, amount?: number) => void;
  buyClickUpgrade: (id: string) => void;
  buyGlobalUpgrade: (id: string) => void;
  tick: (dtSeconds: number) => void;
  save: () => void;
  reset: () => void;
  clickGoldenDrop: () => void;
  chaseCastor: (startedAt: number) => void;
  prestige: () => void;
  buyTalent: (id: string) => void;
  notifyAchievements: (ids: string[]) => void;
  importSave: (raw: string) => boolean;
  exportSave: () => string;
  markLoreRead: (level: number) => void;
  setSkin: (kind: 'tree' | 'cabane', value: string) => void;
  updateSettings: (patch: Partial<GameState['settings']>) => void;
  dismissLevelUp: () => void;
  chooseLunarBoon: (choice: LunarChoice) => void;
  claimDailyQuest: (questId: string) => void;
  refreshDailyQuests: () => void;
  grantCouleeWelcome: () => void;
}

type Store = GameState & {
  actions: StoreActions;
  recentAchievements: string[];
  offlineGain: { seconds: number; gained: string } | null;
};

function loadInitialState(): {
  state: GameState;
  offlineGain: { seconds: number; gained: string } | null;
} {
  const raw = loadRaw();
  if (!raw) {
    initRng(null);
    return { state: createInitialState(), offlineGain: null };
  }
  try {
    const loaded = deserialize(raw);
    initRng(loaded.rngState);
    const now = Date.now();
    const capH = loaded.talents['t4'] ? 48 : 24;
    const { state: withOffline, dtSeconds, gained } = applyOfflineProgress(loaded, now, capH);
    const reconciled = reconcileEssence(withOffline);
    return {
      state: reconciled,
      offlineGain: dtSeconds > 60 ? { seconds: dtSeconds, gained: gained.toString() } : null,
    };
  } catch (err) {
    console.error('Corrupt save, starting fresh:', err);
    backupCorrupt(raw);
    initRng(null);
    return { state: createInitialState(), offlineGain: null };
  }
}

const { state: initial, offlineGain: initialOffline } = loadInitialState();

/**
 * Reconcile essence with lifetime sources:
 *  - 1 ✨ per achievement unlocked
 *  - 2 ✨ per prestige done
 * `essenceEarnedTotal` tracks lifetime earnings so spending doesn't re-grant.
 */
function reconcileEssence(state: GameState): GameState {
  const achCount = Object.values(state.achievements).filter(Boolean).length;
  const expectedTotal = D(achCount).add(D(state.prestigeCount).mul(2));
  if (expectedTotal.gt(state.essenceEarnedTotal)) {
    const diff = expectedTotal.sub(state.essenceEarnedTotal);
    return {
      ...state,
      essence: state.essence.add(diff),
      essenceEarnedTotal: expectedTotal,
    };
  }
  return state;
}

function withAchievementsAndEssence(state: GameState): {
  state: GameState;
  newlyUnlocked: string[];
} {
  const { state: checked, newlyUnlocked } = checkAchievements(state);
  const reconciled = reconcileEssence(checked);
  return { state: reconciled, newlyUnlocked };
}

export const useGameStore = create<Store>((set, get) => ({
  ...initial,
  recentAchievements: [],
  offlineGain: initialOffline,
  actions: {
    click: () => {
      const now = Date.now();
      const { state: next, gained, crit } = applyClick(
        get() as unknown as GameState,
        now,
        rand,
      );
      const { state: withAch, newlyUnlocked } = withAchievementsAndEssence(next);
      set(withAch);
      if (newlyUnlocked.length) get().actions.notifyAchievements(newlyUnlocked);
      return { gained, crit };
    },
    buyBuilding: (id, amount = 1) => {
      const state = get() as unknown as GameState;
      const next = buyBuilding(state, id, amount);
      if (next !== state) sfx.buy();
      const { state: withAch, newlyUnlocked } = withAchievementsAndEssence(next);
      set(withAch);
      if (newlyUnlocked.length) get().actions.notifyAchievements(newlyUnlocked);
    },
    buyClickUpgrade: (id) => {
      const state = get() as unknown as GameState;
      const next = buyClickUpgrade(state, id);
      if (next !== state) sfx.upgrade();
      set(next);
    },
    buyGlobalUpgrade: (id) => {
      const state = get() as unknown as GameState;
      const next = buyGlobalUpgrade(state, id);
      if (next !== state) sfx.upgrade();
      set(next);
    },
    tick: (dtSeconds) => {
      const now = Date.now();
      const prev = get() as unknown as GameState;
      let next = applyTick(prev, dtSeconds, now);
      const prevEvents = prev.activeEvents.length;
      next = maybeTriggerEvents(next, now, rand);
      // Ensure today's daily quests are rolled.
      next = ensureTodayQuests(next);
      // Coulée welcome (first time player opens the game in March/April each year).
      if (isCouleeActive() && shouldGrantCouleeWelcome(next)) {
        const gift = totalSps(next).mul(600);
        next = {
          ...next,
          drops: next.drops.add(gift),
          totalDropsEver: next.totalDropsEver.add(gift),
          couleeWelcomeYear: new Date().getFullYear(),
        };
      }
      if (next.level > prev.level) sfx.levelUp();
      if (next.activeEvents.length > prevEvents) sfx.event();
      // Track "doubled on full moon" achievement (SPS ≥ 2× baseline while full moon active)
      const fullMoon = next.activeEvents.find((e) => e.type === 'fullMoon');
      if (fullMoon && !next.doubledOnFullMoon) {
        next = { ...next, doubledOnFullMoon: true };
      }
      next = { ...next, rngState: rngState() };
      const { state: withAch, newlyUnlocked } = withAchievementsAndEssence(next);
      set(withAch);
      if (newlyUnlocked.length) get().actions.notifyAchievements(newlyUnlocked);
    },
    save: () => {
      try {
        const snapshot = get() as unknown as GameState;
        saveRaw(serialize({ ...snapshot, rngState: rngState() }));
      } catch (err) {
        console.error('Save failed:', err);
      }
    },
    reset: () => {
      set({
        ...createInitialState(),
        actions: get().actions,
        recentAchievements: [],
        offlineGain: null,
      } as Store);
    },
    clickGoldenDrop: () => {
      const now = Date.now();
      const next = triggerGoldenDrop(get() as unknown as GameState, now, rand);
      sfx.golden();
      set(next);
    },
    chaseCastor: (startedAt) => {
      const now = Date.now();
      set(castorVictory(get() as unknown as GameState, startedAt, now));
    },
    prestige: () => {
      const state = get() as unknown as GameState;
      if (!canPrestige(state)) return;
      set({ ...performPrestige(state), recentAchievements: [] } as Partial<Store> as Store);
    },
    buyTalent: (id) => {
      set(buyTalent(get() as unknown as GameState, id));
    },
    notifyAchievements: (ids) => {
      set({ recentAchievements: [...get().recentAchievements, ...ids] });
      sfx.achievement();
      setTimeout(() => {
        set((s) => ({
          recentAchievements: s.recentAchievements.filter((id) => !ids.includes(id)),
        }));
      }, 4000);
    },
    importSave: (raw) => {
      try {
        const decoded = atob(raw);
        const state = deserialize(decoded);
        set({ ...state, recentAchievements: [], offlineGain: null } as Partial<Store> as Store);
        return true;
      } catch (err) {
        console.error('Import failed:', err);
        return false;
      }
    },
    exportSave: () => {
      const snapshot = get() as unknown as GameState;
      return btoa(serialize(snapshot));
    },
    markLoreRead: (level) => {
      const s = get() as unknown as GameState;
      if (s.readLore.includes(level)) return;
      set({ readLore: [...s.readLore, level] });
    },
    setSkin: (kind, value) => {
      const s = get() as unknown as GameState;
      set({ skins: { ...s.skins, [kind]: value } });
    },
    updateSettings: (patch) => {
      const s = get() as unknown as GameState;
      set({ settings: { ...s.settings, ...patch } });
    },
    dismissLevelUp: () => set({ lastLevelUp: null }),
    chooseLunarBoon: (choice) => {
      const now = Date.now();
      const s = get() as unknown as GameState;
      set(chooseLunarBoon(s, choice, now));
    },
    claimDailyQuest: (questId) => {
      const s = get() as unknown as GameState;
      const next = claimQuestReducer(s, questId);
      if (next !== s) sfx.achievement();
      set(next);
    },
    refreshDailyQuests: () => {
      const s = get() as unknown as GameState;
      const next = ensureTodayQuests(s);
      if (next !== s) set(next);
    },
    grantCouleeWelcome: () => {
      const s = get() as unknown as GameState;
      if (!shouldGrantCouleeWelcome(s)) return;
      // Grant 10 min of current SPS as welcome gift.
      const gift = totalSps(s).mul(600);
      const currentYear = new Date().getFullYear();
      set({
        drops: s.drops.add(gift),
        totalDropsEver: s.totalDropsEver.add(gift),
        couleeWelcomeYear: currentYear,
      } as Partial<Store> as Store);
    },
  },
}));

// Castor auto-timeout
setInterval(() => {
  const now = Date.now();
  const s = useGameStore.getState() as unknown as GameState;
  const expired = s.activeEvents.find((e) => e.type === 'castor' && e.endsAt <= now);
  if (expired) {
    useGameStore.setState(castorSteals(s));
  }
}, 500);

export function getGameState(): GameState {
  return useGameStore.getState() as unknown as GameState;
}
