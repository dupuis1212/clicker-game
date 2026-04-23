import type { GameState } from '../types';
import { clickValue, critChance, critMultiplier } from '../formulas';
import { accumulateByproducts } from './tick';
import { COMBO_CLICKS_NEEDED, COMBO_MAX_STACK, COMBO_STEP, COMBO_WINDOW_MS } from '../constants';

export interface ClickResult {
  state: GameState;
  gained: import('../bignum').BigNum;
  crit: boolean;
}

const SECRET_WINDOW_MS = 7_000;
const SECRET_CLICKS_NEEDED = 77;

export function applyClick(state: GameState, now: number, rng: () => number): ClickResult {
  const updatedCombo = updateCombo(state, now);
  const withCombo: GameState = { ...state, combo: updatedCombo };

  const base = clickValue(withCombo);
  const isCrit = rng() < critChance(withCombo);
  let gained = isCrit ? base.mul(critMultiplier(withCombo)) : base;
  // Chain crit: 30% chance to mega-crit (×3 on top of base crit).
  if (isCrit && rng() < 0.3) {
    gained = gained.mul(3);
  }

  // Track secret: 77 clicks en 7s
  const newClicks = [...withCombo.last77Clicks, now].filter(
    (t) => now - t < SECRET_WINDOW_MS,
  );
  const secret77 =
    withCombo.secret77 || newClicks.length >= SECRET_CLICKS_NEEDED;

  let next: GameState = {
    ...withCombo,
    drops: withCombo.drops.add(gained),
    totalDropsEver: withCombo.totalDropsEver.add(gained),
    totalClicks: withCombo.totalClicks + 1,
    totalCrits: withCombo.totalCrits + (isCrit ? 1 : 0),
    last77Clicks: newClicks,
    secret77,
  };
  next = accumulateByproducts(next, gained);

  return { state: next, gained, crit: isCrit };
}

function updateCombo(state: GameState, now: number): GameState['combo'] {
  const { combo } = state;
  const within = now - combo.windowStartedAt < COMBO_WINDOW_MS;
  const newCount = within ? combo.count + 1 : 1;
  const newStart = within ? combo.windowStartedAt : now;
  let stack = combo.stack;
  // GDD: combo unlocks at level 12.
  if (state.level >= 12 && newCount >= COMBO_CLICKS_NEEDED) {
    stack = Math.min(COMBO_MAX_STACK, combo.stack + (COMBO_STEP - 1));
  }
  if (!within) stack = 1;
  return { count: newCount, windowStartedAt: newStart, stack };
}
