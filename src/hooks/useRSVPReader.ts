import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReaderState, ReaderActions, ProcessedWord } from '../types/reader';
import { WPM_CONFIG } from '../types/reader';
import { extractTextFromPDF } from '../utils/pdfParser';
import { processWords } from '../utils/orpCalculator';

const initialState: ReaderState = {
  fileName: null,
  words: [],
  totalWords: 0,
  currentIndex: 0,
  isPlaying: false,
  wpm: WPM_CONFIG.DEFAULT,
  status: 'idle',
  error: null,
};

export function useRSVPReader(): [ReaderState, ReaderActions] {
  const [state, setState] = useState<ReaderState>(initialState);
  const timeoutRef = useRef<number | null>(null);

  const getInterval = useCallback((wpm: number): number => {
    return 60000 / wpm;
  }, []);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const loadPDF = useCallback(async (file: File): Promise<void> => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
      fileName: file.name,
    }));

    try {
      const rawWords = await extractTextFromPDF(file);
      const processedWords: ProcessedWord[] = processWords(rawWords);

      setState((prev) => ({
        ...prev,
        words: processedWords,
        totalWords: processedWords.length,
        currentIndex: 0,
        isPlaying: false,
        status: 'ready',
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'idle',
        error: error instanceof Error ? error.message : 'Failed to load PDF',
      }));
    }
  }, [clearTimer]);

  const play = useCallback((): void => {
    setState((prev) => {
      if (prev.status === 'complete') {
        return { ...prev, currentIndex: 0, isPlaying: true, status: 'playing' };
      }
      if (prev.totalWords === 0) return prev;
      return { ...prev, isPlaying: true, status: 'playing' };
    });
  }, []);

  const pause = useCallback((): void => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      status: prev.totalWords > 0 ? 'paused' : prev.status,
    }));
  }, [clearTimer]);

  const togglePlay = useCallback((): void => {
    setState((prev) => {
      if (prev.isPlaying) {
        clearTimer();
        return { ...prev, isPlaying: false, status: 'paused' };
      }
      if (prev.status === 'complete') {
        return { ...prev, currentIndex: 0, isPlaying: true, status: 'playing' };
      }
      if (prev.totalWords === 0) return prev;
      return { ...prev, isPlaying: true, status: 'playing' };
    });
  }, [clearTimer]);

  const restart = useCallback((): void => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      currentIndex: 0,
      isPlaying: false,
      status: prev.totalWords > 0 ? 'ready' : prev.status,
    }));
  }, [clearTimer]);

  const skipForward = useCallback((count: number = 10): void => {
    setState((prev) => {
      const newIndex = Math.min(prev.currentIndex + count, prev.totalWords - 1);
      return { ...prev, currentIndex: Math.max(0, newIndex) };
    });
  }, []);

  const skipBack = useCallback((count: number = 10): void => {
    setState((prev) => {
      const newIndex = Math.max(0, prev.currentIndex - count);
      return { ...prev, currentIndex: newIndex };
    });
  }, []);

  const setWPM = useCallback((wpm: number): void => {
    const clampedWPM = Math.max(WPM_CONFIG.MIN, Math.min(WPM_CONFIG.MAX, wpm));
    setState((prev) => ({ ...prev, wpm: clampedWPM }));
  }, []);

  const seekTo = useCallback((index: number): void => {
    setState((prev) => {
      const clampedIndex = Math.max(0, Math.min(index, prev.totalWords - 1));
      return { ...prev, currentIndex: clampedIndex };
    });
  }, []);

  const reset = useCallback((): void => {
    clearTimer();
    setState(initialState);
  }, [clearTimer]);

  useEffect(() => {
    if (!state.isPlaying || state.status !== 'playing') {
      return;
    }

    if (state.currentIndex >= state.totalWords) {
      setState((prev) => ({ ...prev, status: 'complete', isPlaying: false }));
      return;
    }

    const currentWord = state.words[state.currentIndex];
    const baseInterval = getInterval(state.wpm);
    const totalDelay = baseInterval + (currentWord?.pauseAfter || 0);

    timeoutRef.current = window.setTimeout(() => {
      setState((prev) => {
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= prev.totalWords) {
          return { ...prev, status: 'complete', isPlaying: false };
        }
        return { ...prev, currentIndex: nextIndex };
      });
    }, totalDelay);

    return () => {
      clearTimer();
    };
  }, [state.isPlaying, state.currentIndex, state.wpm, state.status, state.totalWords, state.words, getInterval, clearTimer]);

  const actions: ReaderActions = {
    loadPDF,
    play,
    pause,
    togglePlay,
    restart,
    skipForward,
    skipBack,
    setWPM,
    seekTo,
    reset,
  };

  return [state, actions];
}
