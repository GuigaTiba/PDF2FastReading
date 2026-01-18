export interface ProcessedWord {
  original: string;
  leftPart: string;
  orpChar: string;
  rightPart: string;
  orpIndex: number;
  pauseAfter: number;
}

export interface ReaderState {
  fileName: string | null;
  words: ProcessedWord[];
  totalWords: number;
  currentIndex: number;
  isPlaying: boolean;
  wpm: number;
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'complete';
  error: string | null;
}

export interface ReaderActions {
  loadPDF: (file: File) => Promise<void>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  restart: () => void;
  skipForward: (count?: number) => void;
  skipBack: (count?: number) => void;
  setWPM: (wpm: number) => void;
  seekTo: (index: number) => void;
  reset: () => void;
}

export const WPM_CONFIG = {
  DEFAULT: 300,
  MIN: 100,
  MAX: 1000,
  STEP: 25,
} as const;

export const PAUSE_DURATIONS = {
  SENTENCE_END: 150,
  CLAUSE_END: 100,
} as const;
