import type { ProcessedWord } from '../types/reader';
import { PAUSE_DURATIONS } from '../types/reader';

export function getORPIndex(wordLength: number): number {
  if (wordLength <= 1) return 0;
  if (wordLength <= 4) return 1;
  return Math.floor((wordLength - 1) / 2);
}

export function processWord(word: string): ProcessedWord {
  const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '');
  const orpIndex = getORPIndex(cleanWord.length);

  let pauseAfter = 0;
  if (/[.!?]$/.test(word)) {
    pauseAfter = PAUSE_DURATIONS.SENTENCE_END;
  } else if (/[,;:]$/.test(word)) {
    pauseAfter = PAUSE_DURATIONS.CLAUSE_END;
  }

  const safeOrpIndex = Math.min(orpIndex, Math.max(0, word.length - 1));

  return {
    original: word,
    leftPart: word.substring(0, safeOrpIndex),
    orpChar: word.charAt(safeOrpIndex),
    rightPart: word.substring(safeOrpIndex + 1),
    orpIndex: safeOrpIndex,
    pauseAfter,
  };
}

export function processWords(words: string[]): ProcessedWord[] {
  return words.map(processWord);
}
