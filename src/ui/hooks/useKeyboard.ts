import { useEffect } from 'react';
import { useGameStore } from '../../engine/store';
import { sfx } from '../../engine/audio';

type Handler = () => void;

export interface KeyboardHandlers {
  onEscape?: Handler;
}

/**
 * Global keyboard shortcuts:
 * - Space: click the maple tree
 * - Escape: call onEscape (close top modal)
 */
export function useKeyboard(handlers: KeyboardHandlers = {}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const store = useGameStore.getState();
        const { crit } = store.actions.click();
        (crit ? sfx.crit : sfx.click)();
      } else if (e.code === 'Escape') {
        handlers.onEscape?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers]);
}
