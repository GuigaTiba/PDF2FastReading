interface ProgressBarProps {
  currentIndex: number;
  totalWords: number;
  onSeek: (index: number) => void;
  visible?: boolean;
}

export function ProgressBar({ currentIndex, totalWords, onSeek, visible = true }: ProgressBarProps) {
  const progress = totalWords > 0 ? (currentIndex / (totalWords - 1)) * 100 : 0;
  const safeProgress = Math.min(100, Math.max(0, progress));

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.round(percentage * (totalWords - 1));
    onSeek(newIndex);
  };

  return (
    <div
      className={`
        absolute top-0 left-0 right-0 z-10
        transition-opacity duration-300 ease-out
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* Progress bar container */}
      <div
        onClick={handleClick}
        className="h-1 bg-surface cursor-pointer group hover:h-2 transition-all duration-150"
        title={`${currentIndex + 1} / ${totalWords} words`}
      >
        {/* Progress fill */}
        <div
          className="h-full bg-orp/80 transition-all duration-75 ease-linear group-hover:bg-orp progress-glow"
          style={{ width: `${safeProgress}%` }}
        />
      </div>

      {/* Word count indicator - top left */}
      <div
        className={`
          absolute top-3 left-4 font-mono transition-opacity duration-300
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <span className="text-white/70 text-xs">{currentIndex + 1}</span>
        <span className="text-secondary/50 text-xs"> / {totalWords}</span>
      </div>
    </div>
  );
}
