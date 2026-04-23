import type { BigNum } from '../bignum';
import { D } from '../bignum';
import type { GameState } from '../types';
import { clickValue, totalSps } from '../formulas';
import { levelFromTotalDrops } from '../../data/levels';
import { currentSeason, seasonSucreMultiplier } from '../seasons';
import { achievementOfflineMultiplier } from '../rewards';
import { COMBO_WINDOW_MS } from '../constants';

/**
 * Accumulate byproducts (sirop, sucre) from a drop gain.
 * Drops are NOT consumed — sirop and sucre are produced in parallel based on
 * conversion ratios (1 sirop = 1000 drops, 1 sucre = 1000 sirops).
 */
export function accumulateByproducts(state: GameState, dropsGained: BigNum): GameState {
  if (dropsGained.lte(0)) return state;
  let next = state;
  const sucreMult = D(seasonSucreMultiplier(currentSeason(Date.now())));
  if (next.level >= 5) {
    next = { ...next, sirop: next.sirop.add(dropsGained.div(1000)) };
  }
  if (next.level >= 10) {
    next = { ...next, sucre: next.sucre.add(dropsGained.div(1_000_000).mul(sucreMult)) };
  }
  return next;
}

export function applyTick(state: GameState, dtSeconds: number, now: number): GameState {
  if (dtSeconds <= 0) return state;

  const sps = totalSps(state);
  const gained = sps.mul(dtSeconds);

  let nextState: GameState = {
    ...state,
    drops: state.drops.add(gained),
    totalDropsEver: state.totalDropsEver.add(gained),
    lastTickAt: now,
    playTimeMs: state.playTimeMs + dtSeconds * 1000,
  };

  nextState = accumulateByproducts(nextState, gained);
  nextState = applyAutoClick(nextState, dtSeconds);
  nextState = decayCombo(nextState, now);
  nextState = decayEvents(nextState, now);
  nextState = updateLevel(nextState);

  return nextState;
}

/**
 * Auto-click bonus: starts at level 7 (was 9), 5 clicks/sec (was 1).
 * Each auto-click produces clickValue(state) gouttes (no crit/combo applied).
 */
function applyAutoClick(state: GameState, dtSeconds: number): GameState {
  if (state.level < 7) return state;
  const rate = 5; // 5 auto-clicks per second
  const prevAcc = Number.isFinite(state.autoClickAccumulator) ? state.autoClickAccumulator : 0;
  const acc = prevAcc + dtSeconds * rate;
  const clicks = Math.floor(acc);
  if (clicks <= 0) {
    return { ...state, autoClickAccumulator: acc };
  }
  const perClick = clickValue(state);
  const gained = perClick.mul(clicks);
  return {
    ...state,
    drops: state.drops.add(gained),
    totalDropsEver: state.totalDropsEver.add(gained),
    totalClicks: state.totalClicks + clicks,
    autoClickAccumulator: acc - clicks,
  };
}

function decayCombo(state: GameState, now: number): GameState {
  if (now - state.combo.windowStartedAt > COMBO_WINDOW_MS) {
    if (state.combo.stack !== 1 || state.combo.count !== 0) {
      return { ...state, combo: { count: 0, windowStartedAt: 0, stack: 1 } };
    }
  }
  return state;
}

function decayEvents(state: GameState, now: number): GameState {
  const active = state.activeEvents.filter((e) => e.endsAt > now);
  if (active.length === state.activeEvents.length) return state;
  return { ...state, activeEvents: active };
}

function updateLevel(state: GameState): GameState {
  const lvl = levelFromTotalDrops(state.totalDropsEver);
  if (lvl === state.level) return state;
  // Level-up burst: gain 60s of current SPS as instant drops.
  const burst = totalSps(state).mul(60);
  return {
    ...state,
    drops: state.drops.add(burst),
    totalDropsEver: state.totalDropsEver.add(burst),
    level: lvl,
    lastLevelUp: lvl,
  };
}

export function applyOfflineProgress(state: GameState, now: number, capHours = 24): {
  state: GameState;
  dtSeconds: number;
  gained: BigNum;
} {
  const elapsedMs = Math.max(0, now - state.lastTickAt);
  const capMs = capHours * 3600 * 1000;
  const effectiveMs = Math.min(elapsedMs, capMs);
  const dtSeconds = effectiveMs / 1000;
  const sps = totalSps(state);
  const offlineMult = achievementOfflineMultiplier(state);
  const gained = sps.mul(dtSeconds).mul(offlineMult);
  const withLongest: GameState = {
    ...state,
    longestAwayMs: Math.max(state.longestAwayMs, elapsedMs),
  };
  let nextState = applyTick(withLongest, dtSeconds, now);
  // Apply the offline-only bonus on top of the normal tick gain.
  if (offlineMult > 1) {
    const extra = sps.mul(dtSeconds).mul(offlineMult - 1);
    nextState = {
      ...nextState,
      drops: nextState.drops.add(extra),
      totalDropsEver: nextState.totalDropsEver.add(extra),
    };
  }
  return { state: nextState, dtSeconds, gained };
}
