# PDF2FastReading - Technical Blueprint

## Project Overview

RSVP (Rapid Serial Visual Presentation) speed reading application that converts PDFs into a fast-reading format with one word displayed at a time, middle letter highlighted in red.

---

## 1. Project Structure

```
PDF2FastReading/
├── public/
│   └── pdf.worker.min.mjs    # PDF.js worker file
├── src/
│   ├── components/
│   │   ├── UploadZone.tsx     # PDF upload drag-and-drop
│   │   ├── RSVPDisplay.tsx    # Main word display with ORP
│   │   ├── ControlPanel.tsx   # Play/pause/speed controls
│   │   └── ProgressBar.tsx    # Reading progress indicator
│   ├── hooks/
│   │   ├── useRSVPReader.ts   # Core reading logic
│   │   ├── usePDFParser.ts    # PDF text extraction
│   │   └── useKeyboardShortcuts.ts
│   ├── utils/
│   │   ├── orpCalculator.ts   # ORP index calculation
│   │   ├── wordProcessor.ts   # Word processing pipeline
│   │   └── pdfParser.ts       # PDF.js integration
│   ├── types/
│   │   └── reader.ts          # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 2. TypeScript Interfaces

```typescript
// src/types/reader.ts

export interface ProcessedWord {
  original: string;
  leftPart: string;
  orpChar: string;
  rightPart: string;
  orpIndex: number;
  pauseAfter: number; // milliseconds
}

export interface ReaderState {
  // Document
  fileName: string | null;
  words: ProcessedWord[];
  totalWords: number;

  // Playback
  currentIndex: number;
  isPlaying: boolean;
  wpm: number;

  // Status
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
}
```

---

## 3. ORP Calculator

```typescript
// src/utils/orpCalculator.ts

export function getORPIndex(wordLength: number): number {
  if (wordLength <= 1) return 0;
  if (wordLength <= 4) return 1;
  return Math.floor((wordLength - 1) / 2);
}

export function processWord(word: string): ProcessedWord {
  // Strip punctuation for ORP calculation but keep for display
  const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '');
  const orpIndex = getORPIndex(cleanWord.length);

  // Calculate pause based on ending punctuation
  let pauseAfter = 0;
  if (/[.!?]$/.test(word)) pauseAfter = 150;
  else if (/[,;:]$/.test(word)) pauseAfter = 100;

  // Handle case where ORP index might exceed word length
  const safeOrpIndex = Math.min(orpIndex, word.length - 1);

  return {
    original: word,
    leftPart: word.substring(0, safeOrpIndex),
    orpChar: word.charAt(safeOrpIndex),
    rightPart: word.substring(safeOrpIndex + 1),
    orpIndex: safeOrpIndex,
    pauseAfter
  };
}
```

---

## 4. PDF Parser

```typescript
// src/utils/pdfParser.ts

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function extractTextFromPDF(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textContent: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    textContent.push(pageText);
  }

  // Join all pages and split into words
  const fullText = textContent.join(' ');
  const words = fullText
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words;
}
```

---

## 5. useRSVPReader Hook

```typescript
// src/hooks/useRSVPReader.ts

export function useRSVPReader(): [ReaderState, ReaderActions] {
  const [state, setState] = useState<ReaderState>(initialState);
  const intervalRef = useRef<number | null>(null);

  // Calculate interval based on WPM
  // 60000ms / WPM = ms per word
  const getInterval = useCallback((wpm: number) => {
    return 60000 / wpm;
  }, []);

  // Advance to next word
  const advance = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.totalWords) {
        return { ...prev, status: 'complete', isPlaying: false };
      }
      return { ...prev, currentIndex: nextIndex };
    });
  }, []);

  // Play effect - handles interval timing
  useEffect(() => {
    if (state.isPlaying && state.status === 'playing') {
      const currentWord = state.words[state.currentIndex];
      const baseInterval = getInterval(state.wpm);
      const totalDelay = baseInterval + (currentWord?.pauseAfter || 0);

      intervalRef.current = window.setTimeout(() => {
        advance();
      }, totalDelay);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.currentIndex, state.wpm]);

  // Actions implementation...
}
```

---

## 6. Component Specifications

### RSVPDisplay Component

```tsx
// Key styling for ORP alignment
<div className="relative flex items-center justify-center h-screen bg-[#0A0A0A]">
  {/* Vertical guide lines */}
  <div className="absolute top-1/2 -translate-y-1/2 w-[2px] h-[200px] bg-[#333333]" />

  {/* Word display - ORP aligned to center */}
  <div className="font-mono text-5xl md:text-7xl tracking-wider">
    <span className="text-white">{currentWord.leftPart}</span>
    <span className="text-[#FF0000]">{currentWord.orpChar}</span>
    <span className="text-white">{currentWord.rightPart}</span>
  </div>

  {/* WPM indicator */}
  <div className="absolute bottom-8 right-8 text-[#888888] text-sm">
    {wpm} wpm
  </div>
</div>
```

### UploadZone Component

- Drag-and-drop area with visual feedback
- Click to open file picker
- Accept only .pdf files
- Show loading state during parsing
- Error display for invalid files

### ControlPanel Component

- Play/Pause button (toggles icon)
- Skip back button (-10 words)
- Skip forward button (+10 words)
- WPM slider (100-1000, step 25)
- Restart button

### ProgressBar Component

- Full-width bar at bottom
- Fill color: #FF0000
- Background: #1A1A1A
- Show percentage or word count
- Clickable to seek to position

---

## 7. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Toggle play/pause |
| ArrowLeft | Skip back 10 words |
| ArrowRight | Skip forward 10 words |
| ArrowUp | Increase WPM +25 |
| ArrowDown | Decrease WPM -25 |
| R | Restart |
| Escape | Return to upload |

---

## 8. Implementation Order

1. **Project Setup**
   - Initialize Vite + React + TS
   - Install dependencies
   - Configure Tailwind
   - Set up PDF.js worker

2. **Core Utilities**
   - Create types
   - Implement ORP calculator
   - Implement PDF parser

3. **Main Hook**
   - Implement useRSVPReader
   - Add state management
   - Add timing logic

4. **Components**
   - UploadZone (entry point)
   - RSVPDisplay (main view)
   - ControlPanel (controls)
   - ProgressBar (progress)

5. **Integration**
   - Wire up App.tsx
   - Add keyboard shortcuts
   - Polish animations

---

## 9. Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pdfjs-dist": "^4.0.379",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## 10. Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Near Black | #0A0A0A |
| Text | White | #FFFFFF |
| ORP Highlight | Red | #FF0000 |
| Guide Lines | Dark Gray | #333333 |
| Progress BG | Dark Gray | #1A1A1A |
| Secondary Text | Gray | #888888 |
| Controls | Light Gray | #CCCCCC |
| Control Hover | White | #FFFFFF |

---

Ready for implementation by Code-Developer and Designer agents.
