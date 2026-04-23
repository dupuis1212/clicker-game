import { useGameStore } from '../store';
import { SAVE_INTERVAL_MS } from '../../core/constants';

let timerHandle: number | null = null;

export function startAutosave(): void {
  if (timerHandle !== null) return;
  timerHandle = window.setInterval(() => {
    useGameStore.getState().actions.save();
  }, SAVE_INTERVAL_MS);

  const flush = () => useGameStore.getState().actions.save();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('beforeunload', flush);
}

export function stopAutosave(): void {
  if (timerHandle !== null) {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
}
