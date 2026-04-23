import type { Season } from './types';

/**
 * Seasons rotate every 15 real minutes : printemps → été → automne → hiver.
 * Effects are gentle — don't break balance, just add flavor:
 *   - printemps: +10% SPS (croissance)
 *   - été:       +1% crit chance additive (soleil plein)
 *   - automne:   +10% sucre
 *   - hiver:     +5% chance de goutte dorée (quiet time)
 */
export const SEASON_DURATION_MS = 15 * 60 * 1000;
export const SEASON_ORDER: Season[] = ['printemps', 'ete', 'automne', 'hiver'];

export function currentSeason(now: number): Season {
  const cycle = Math.floor(now / SEASON_DURATION_MS) % 4;
  return SEASON_ORDER[cycle];
}

export function seasonLabel(s: Season): { name: string; icon: string; effect: string } {
  switch (s) {
    case 'printemps':
      return { name: 'Printemps', icon: '🌸', effect: 'Production +10 %' };
    case 'ete':
      return { name: 'Été', icon: '☀️', effect: 'Crit chance +1 %' };
    case 'automne':
      return { name: 'Automne', icon: '🍂', effect: 'Sucre +10 %' };
    case 'hiver':
      return { name: 'Hiver', icon: '❄️', effect: 'Gouttes dorées + fréquentes' };
  }
}

export function seasonSpsMultiplier(s: Season): number {
  return s === 'printemps' ? 1.1 : 1;
}

export function seasonCritBonus(s: Season): number {
  return s === 'ete' ? 0.01 : 0;
}

export function seasonSucreMultiplier(s: Season): number {
  return s === 'automne' ? 1.1 : 1;
}

export function seasonGoldenBonus(s: Season): number {
  return s === 'hiver' ? 0.2 : 0; // 20% faster
}
