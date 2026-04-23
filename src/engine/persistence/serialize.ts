import Decimal from 'break_infinity.js';
import type { GameState } from '../../core/types';
import { SCHEMA_VERSION } from '../../core/constants';
import { createInitialState } from '../../core/state';

export function serialize(state: GameState): string {
  const payload = {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    drops: state.drops.toString(),
    sirop: state.sirop.toString(),
    sucre: state.sucre.toString(),
    feuillesDorees: state.feuillesDorees.toString(),
    essence: state.essence.toString(),
    essenceEarnedTotal: state.essenceEarnedTotal.toString(),
    totalDropsEver: state.totalDropsEver.toString(),
  };
  return JSON.stringify(payload);
}

function toDecimal(v: unknown, fallback: Decimal): Decimal {
  if (v == null) return fallback;
  if (typeof v === 'string' && (v === '' || v.toLowerCase().includes('nan'))) return fallback;
  if (typeof v === 'string' || typeof v === 'number') {
    try {
      const d = new Decimal(v);
      // Reject bogus states like NaN mantissa
      if (d.toString().toLowerCase().includes('nan')) return fallback;
      return d;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Deserialize a save. Backfills any missing fields with defaults so old saves
 * keep working after schema additions.
 */
export function deserialize(raw: string): GameState {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const defaults = createInitialState();
  return {
    ...defaults,
    ...(parsed as Partial<GameState>),
    drops: toDecimal(parsed.drops, defaults.drops),
    sirop: toDecimal(parsed.sirop, defaults.sirop),
    sucre: toDecimal(parsed.sucre, defaults.sucre),
    feuillesDorees: toDecimal(parsed.feuillesDorees, defaults.feuillesDorees),
    essence: toDecimal(parsed.essence, defaults.essence),
    essenceEarnedTotal: toDecimal(parsed.essenceEarnedTotal, defaults.essenceEarnedTotal),
    totalDropsEver: toDecimal(parsed.totalDropsEver, defaults.totalDropsEver),
    // ensure nested objects are safe
    buildings: { ...defaults.buildings, ...(parsed.buildings as object ?? {}) } as GameState['buildings'],
    clickUpgrades: (parsed.clickUpgrades as Record<string, boolean>) ?? {},
    globalUpgrades: (parsed.globalUpgrades as Record<string, boolean>) ?? {},
    achievements: (parsed.achievements as Record<string, boolean>) ?? {},
    talents: (parsed.talents as Record<string, boolean>) ?? {},
    activeEvents: (parsed.activeEvents as GameState['activeEvents']) ?? [],
    combo: (parsed.combo as GameState['combo']) ?? defaults.combo,
    readLore: (parsed.readLore as number[]) ?? [],
    last77Clicks: (parsed.last77Clicks as number[]) ?? [],
    skins: { ...defaults.skins, ...(parsed.skins as object ?? {}) },
    settings: { ...defaults.settings, ...(parsed.settings as object ?? {}) },
    sessionStartedAt: Date.now(),
  };
}
