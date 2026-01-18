import { useEffect, useCallback } from 'react';
import type { ReaderActions, ReaderState } from '../types/reader';
import { WPM_CONFIG } from '../types/reader';

interface UseKeyboardShortcutsOptions {
  state: ReaderState;
  actions: ReaderActions;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  state,
  actions,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (state.status === 'idle' || state.status === 'loading') {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          actions.togglePlay();
          break;

        case 'ArrowLeft':
          event.preventDefault();
          actions.skipBack(10);
          break;

        case 'ArrowRight':
          event.preventDefault();
          actions.skipForward(10);
          break;

        case 'ArrowUp':
          event.preventDefault();
          actions.setWPM(Math.min(state.wpm + WPM_CONFIG.STEP, WPM_CONFIG.MAX));
          break;

        case 'ArrowDown':
          event.preventDefault();
          actions.setWPM(Math.max(state.wpm - WPM_CONFIG.STEP, WPM_CONFIG.MIN));
          break;

        case 'KeyR':
          event.preventDefault();
          actions.restart();
          break;

        case 'Escape':
          event.preventDefault();
          actions.reset();
          break;

        default:
          break;
      }
    },
    [state, actions, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
