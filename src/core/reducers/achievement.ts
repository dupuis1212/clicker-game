import { ACHIEVEMENTS } from '../../data/achievements';
import type { GameState } from '../types';

/**
 * Check all achievements and return the new state with newly unlocked ones.
 * Also returns the list of newly unlocked IDs for toast notifications.
 */
export function checkAchievements(state: GameState): {
  state: GameState;
  newlyUnlocked: string[];
} {
  const newlyUnlocked: string[] = [];
  let next = state.achievements;
  for (const a of ACHIEVEMENTS) {
    if (next[a.id]) continue;
    if (a.condition(state)) {
      if (next === state.achievements) next = { ...state.achievements };
      next[a.id] = true;
      newlyUnlocked.push(a.id);
    }
  }
  if (newlyUnlocked.length === 0) return { state, newlyUnlocked };
  return { state: { ...state, achievements: next }, newlyUnlocked };
}
