import { useGameStore } from '../../engine/store';
import type { GameState } from '../../core/types';

/**
 * Subscribe to a derived slice of game state.
 * Wraps zustand's selector hook for cleaner call sites.
 */
export function useGameSelector<T>(selector: (s: GameState) => T): T {
  return useGameStore((s) => selector(s as unknown as GameState)) as T;
}

export function useActions() {
  return useGameStore((s) => s.actions);
}
