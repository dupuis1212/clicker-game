import type { ActiveEvent, EventType, GameState, LunarChoice } from '../types';
import { currentSeason, seasonGoldenBonus } from '../seasons';
import { couleeGoldenMultiplier } from '../coulee';
import { totalSps } from '../formulas';
import {
  achievementCastorReward,
  achievementFullMoonDurationMult,
  achievementGoldenDurationBonusSec,
  achievementGoldenEffectMultiplier,
} from '../rewards';

const EVENT_DURATIONS_MS: Record<EventType, number> = {
  goldenDrop: 13_000,
  northWind: 60_000,
  miraculousHarvest: 30_000,
  castor: 10_000,
  fullMoon: 5 * 60_000,
};

/**
 * Schedule next golden drop. Talent T5 gives +1% chance (shortens delay).
 * Hiver season + u5 (Bénédiction lunaire) further reduce delay.
 */
export function scheduleNextGolden(now: number, rng: () => number, state: GameState): number {
  const hasT5 = state.talents['t5'];
  const hasU5 = state.globalUpgrades['u5'];
  const base = 2 * 60_000;     // 2 min minimum (was 5)
  const range = 2 * 60_000;    // 2 min jitter (was 10)
  let mult = hasT5 ? 0.85 : 1;
  const seasonReduction = seasonGoldenBonus(currentSeason(now));
  if (seasonReduction > 0) mult *= 1 - seasonReduction;
  if (hasU5) mult *= 0.5;
  // Coulée du printemps — goldens appear much more often in March/April IRL.
  mult *= couleeGoldenMultiplier();
  // Rosée dorée (pleine lune, choix 'golden') : gouttes 3× plus fréquentes.
  const hasGoldenBoon = state.activeEvents.some(
    (e) => e.type === 'fullMoon' && e.data?.choice === 'golden',
  );
  if (hasGoldenBoon) mult *= 0.33;
  const delay = (base + rng() * range) * mult;
  return now + delay;
}

export function scheduleNextRandomEvent(now: number, rng: () => number): number {
  const delay = 4 * 60_000 + rng() * 6 * 60_000; // 4-10 min (was 10-30)
  return now + delay;
}

export function addActiveEvent(
  state: GameState,
  type: EventType,
  now: number,
  data?: Record<string, unknown>,
): GameState {
  let durationMs = EVENT_DURATIONS_MS[type];
  if (type === 'fullMoon') {
    durationMs = Math.round(durationMs * achievementFullMoonDurationMult(state));
  }
  const ev: ActiveEvent = {
    type,
    startedAt: now,
    endsAt: now + durationMs,
    data,
  };
  return { ...state, activeEvents: [...state.activeEvents, ev] };
}

/**
 * Triggered when the player clicks a golden drop.
 * 50% chance +13% current stock, 50% chance x7 SPS for 77s.
 * a26 (Attrape-goutte) extends frenzy duration; a27 (Ninja sucré) doubles instant gain.
 */
export function triggerGoldenDrop(
  state: GameState,
  now: number,
  rng: () => number,
): GameState {
  const roll = rng();
  const next = { ...state, goldensCaught: state.goldensCaught + 1 };
  const effectMult = achievementGoldenEffectMultiplier(next);
  if (roll < 0.5) {
    const bonus = state.drops.mul(0.13 * effectMult);
    return {
      ...next,
      drops: next.drops.add(bonus),
      totalDropsEver: next.totalDropsEver.add(bonus),
      nextGoldenDropAt: scheduleNextGolden(now, rng, next),
    };
  }
  const withEvent = addActiveEvent(next, 'goldenDrop', now, { kind: 'frenzy' });
  const bonusSec = achievementGoldenDurationBonusSec(next);
  const frenzyEndsAt = now + 77_000 + bonusSec * 1000;
  return {
    ...withEvent,
    activeEvents: withEvent.activeEvents.map((e, i) =>
      i === withEvent.activeEvents.length - 1 ? { ...e, endsAt: frenzyEndsAt } : e,
    ),
    nextGoldenDropAt: scheduleNextGolden(now, rng, withEvent),
  };
}

/**
 * Player chased the castor in time. Reward = 60s of current SPS, +bonus 60s if fast (<3s).
 */
export function castorVictory(state: GameState, startedAt: number, now: number): GameState {
  const duration = now - startedAt;
  const fast = duration < 3_000;
  const seconds = fast ? 120 : 60;
  const reward = totalSps(state).mul(seconds);
  return {
    ...state,
    drops: state.drops.add(reward),
    totalDropsEver: state.totalDropsEver.add(reward),
    activeEvents: state.activeEvents.filter((e) => e.type !== 'castor'),
    castorFastKills: state.castorFastKills + (fast ? 1 : 0),
  };
}

/**
 * Castor expired without being chased.
 * No more theft — always gives a small bonus (3% base, 10% with u6, +achievement reward).
 */
export function castorSteals(state: GameState): GameState {
  const events = state.activeEvents.filter((e) => e.type !== 'castor');
  let pct = 0.03;
  if (state.globalUpgrades['u6']) pct = 0.10;
  pct += achievementCastorReward(state);
  const gift = state.drops.mul(pct);
  return {
    ...state,
    drops: state.drops.add(gift),
    totalDropsEver: state.totalDropsEver.add(gift),
    activeEvents: events,
  };
}

export function maybeTriggerEvents(
  state: GameState,
  now: number,
  rng: () => number,
): GameState {
  let next = state;

  if (state.nextGoldenDropAt === 0) {
    next = { ...next, nextGoldenDropAt: scheduleNextGolden(now, rng, next) };
  }
  if (state.nextRandomEventAt === 0) {
    next = { ...next, nextRandomEventAt: scheduleNextRandomEvent(now, rng) };
  }

  if (now >= next.nextRandomEventAt) {
    const roll = rng();
    // Distribution: 40% miraculousHarvest, 35% northWind, 25% castor (if lvl>=13).
    // Below level 13, castor rolls fall back to northWind.
    let type: EventType = 'northWind';
    if (roll < 0.4) type = 'miraculousHarvest';
    else if (roll < 0.75) type = 'northWind';
    else if (next.level >= 13) type = 'castor';

    next = addActiveEvent(next, type, now);
    next = { ...next, nextRandomEventAt: scheduleNextRandomEvent(now, rng) };
  }

  if (next.level >= 8) {
    const oneDay = 24 * 3600 * 1000;
    // u5 (Bénédiction lunaire) doubles full-moon frequency.
    const cooldown = next.globalUpgrades['u5'] ? oneDay / 2 : oneDay;
    if (now - next.lastFullMoonAt >= cooldown) {
      if (!next.activeEvents.some((e) => e.type === 'fullMoon')) {
        // Pending event → the player picks a boon before it applies.
        next = addActiveEvent(next, 'fullMoon', now, { pending: true });
        next = { ...next, lastFullMoonAt: now };
      }
    }
  }

  return next;
}

/**
 * Player picks a boon for the currently pending full moon. Extends the
 * duration to a clean 3 min and applies the chosen multiplier via data.
 */
export function chooseLunarBoon(state: GameState, choice: LunarChoice, now: number): GameState {
  const idx = state.activeEvents.findIndex(
    (e) => e.type === 'fullMoon' && e.data?.pending === true,
  );
  if (idx < 0) return state;
  const ev = state.activeEvents[idx];
  const duration = 3 * 60_000;          // 3 min (was 5 min for passive)
  const resolved: ActiveEvent = {
    ...ev,
    startedAt: now,
    endsAt: now + duration,
    data: { choice },
  };
  const events = [...state.activeEvents];
  events[idx] = resolved;

  // "doubledOnFullMoon" achievement flag is set when player actively engages.
  return {
    ...state,
    activeEvents: events,
    doubledOnFullMoon: true,
  };
}

export { EVENT_DURATIONS_MS };
