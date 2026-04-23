import { useGameStore } from './store';
import { MAX_DT_SECONDS, TICK_MS } from '../core/constants';

let rafHandle: number | null = null;
let lastFrameMs = 0;
let accumulator = 0;

export function startLoop(): void {
  if (rafHandle !== null) return;
  lastFrameMs = performance.now();
  accumulator = 0;
  const frame = (now: number) => {
    const dtMs = now - lastFrameMs;
    lastFrameMs = now;
    accumulator += dtMs;
    const cap = MAX_DT_SECONDS * 1000;
    if (accumulator > cap) accumulator = cap;

    while (accumulator >= TICK_MS) {
      useGameStore.getState().actions.tick(TICK_MS / 1000);
      accumulator -= TICK_MS;
    }

    rafHandle = requestAnimationFrame(frame);
  };
  rafHandle = requestAnimationFrame(frame);
}

export function stopLoop(): void {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
}
