import { useEffect, useState } from 'react';
import type { ProcessedWord } from '../types/reader';

interface RSVPDisplayProps {
  currentWord: ProcessedWord | null;
  wpm: number;
  status: string;
}

export function RSVPDisplay({ currentWord, wpm, status }: RSVPDisplayProps) {
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation on word change
  useEffect(() => {
    if (currentWord) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [currentWord?.word]);

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-secondary font-mono text-xl mb-2">Ready to start</p>
          <p className="text-secondary/50 font-mono text-sm">Press Space to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-full select-none">
      {/* Vertical guide line - top */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-px guide-line-gradient"
        style={{
          top: '10%',
          height: '25%',
          opacity: 0.4
        }}
      />

      {/* Vertical guide line - bottom */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-px guide-line-gradient"
        style={{
          bottom: '20%',
          height: '25%',
          opacity: 0.4
        }}
      />

      {/* Horizontal bracket markers - top */}
      <div
        className="absolute left-1/2 h-px bg-orp/60"
        style={{
          top: 'calc(50% - 56px)',
          width: '24px',
          transform: 'translateX(-50%)'
        }}
      />
      <div
        className="absolute left-1/2 w-px bg-orp/60"
        style={{
          top: 'calc(50% - 56px)',
          height: '8px',
          transform: 'translateX(-12px)'
        }}
      />
      <div
        className="absolute left-1/2 w-px bg-orp/60"
        style={{
          top: 'calc(50% - 56px)',
          height: '8px',
          transform: 'translateX(11px)'
        }}
      />

      {/* Horizontal bracket markers - bottom */}
      <div
        className="absolute left-1/2 h-px bg-orp/60"
        style={{
          top: 'calc(50% + 56px)',
          width: '24px',
          transform: 'translateX(-50%)'
        }}
      />
      <div
        className="absolute left-1/2 w-px bg-orp/60"
        style={{
          top: 'calc(50% + 48px)',
          height: '8px',
          transform: 'translateX(-12px)'
        }}
      />
      <div
        className="absolute left-1/2 w-px bg-orp/60"
        style={{
          top: 'calc(50% + 48px)',
          height: '8px',
          transform: 'translateX(11px)'
        }}
      />

      {/* Word display with ORP aligned to center */}
      <div
        key={animationKey}
        className="relative flex items-center justify-center word-animate"
      >
        {/* The ORP character is positioned at the center, with left and right parts around it */}
        <div className="font-mono text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wide whitespace-nowrap text-shadow">
          <span
            className="text-white inline-block text-right"
            style={{ minWidth: `${Math.max(currentWord.leftPart.length, 0) * 0.55}em` }}
          >
            {currentWord.leftPart}
          </span>
          <span className="text-orp font-semibold inline-block w-[0.55em] text-center orp-glow">
            {currentWord.orpChar}
          </span>
          <span className="text-white inline-block text-left">
            {currentWord.rightPart}
          </span>
        </div>
      </div>

      {/* Status indicator - centered at top */}
      {status === 'paused' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <span className="text-secondary/70 text-xs font-mono uppercase tracking-[0.3em]">
            Paused
          </span>
        </div>
      )}

      {status === 'complete' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <span className="text-orp/80 text-xs font-mono uppercase tracking-[0.3em]">
            Complete
          </span>
        </div>
      )}

      {/* WPM indicator - styled like reference */}
      <div className="absolute bottom-12 right-8 wpm-indicator">
        <span className="text-secondary/80 text-sm font-mono">
          <span className="text-white/90 font-medium">{wpm}</span>
          <span className="ml-1 text-xs">wpm</span>
        </span>
      </div>
    </div>
  );
}
