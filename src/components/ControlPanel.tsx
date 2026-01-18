import { Play, Pause, SkipBack, SkipForward, RotateCcw, Upload, Minus, Plus } from 'lucide-react';
import { WPM_CONFIG } from '../types/reader';

interface ControlPanelProps {
  isPlaying: boolean;
  wpm: number;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onRestart: () => void;
  onWPMChange: (wpm: number) => void;
  onReset: () => void;
  disabled?: boolean;
  visible?: boolean;
}

export function ControlPanel({
  isPlaying,
  wpm,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onRestart,
  onWPMChange,
  onReset,
  disabled = false,
  visible = true,
}: ControlPanelProps) {
  const handleWPMDecrease = () => {
    onWPMChange(Math.max(wpm - WPM_CONFIG.STEP, WPM_CONFIG.MIN));
  };

  const handleWPMIncrease = () => {
    onWPMChange(Math.min(wpm + WPM_CONFIG.STEP, WPM_CONFIG.MAX));
  };

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0
        bg-gradient-to-t from-background via-background/95 to-transparent
        border-t border-guideline/30
        transition-opacity duration-300 ease-out
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        {/* Left: New PDF button */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-white interactive btn-press rounded-lg hover:bg-guideline/30"
          title="Load new PDF (Esc)"
        >
          <Upload className="w-4 h-4" />
          <span className="text-xs font-mono hidden sm:inline">New</span>
        </button>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onRestart}
            disabled={disabled}
            className="p-2 text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed interactive btn-press rounded-lg hover:bg-guideline/30"
            title="Restart (R)"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onSkipBack}
            disabled={disabled}
            className="p-2 text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed interactive btn-press rounded-lg hover:bg-guideline/30"
            title="Skip back 10 words (Left Arrow)"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={disabled}
            className={`
              p-3 sm:p-4 rounded-full text-white
              disabled:opacity-30 disabled:cursor-not-allowed
              interactive btn-press
              ${isPlaying
                ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                : 'bg-orp hover:bg-red-600 shadow-lg shadow-orp/20'
              }
            `}
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={onSkipForward}
            disabled={disabled}
            className="p-2 text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed interactive btn-press rounded-lg hover:bg-guideline/30"
            title="Skip forward 10 words (Right Arrow)"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="w-4 sm:w-8" />
        </div>

        {/* Right: WPM controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleWPMDecrease}
            disabled={disabled || wpm <= WPM_CONFIG.MIN}
            className="p-2 text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed interactive btn-press rounded-lg hover:bg-guideline/30"
            title="Decrease speed (Down Arrow)"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          <div className="w-16 sm:w-20 text-center wpm-indicator">
            <span className="text-white font-mono text-xs sm:text-sm font-medium">{wpm}</span>
            <span className="text-secondary font-mono text-[10px] sm:text-xs ml-1">wpm</span>
          </div>

          <button
            onClick={handleWPMIncrease}
            disabled={disabled || wpm >= WPM_CONFIG.MAX}
            className="p-2 text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed interactive btn-press rounded-lg hover:bg-guideline/30"
            title="Increase speed (Up Arrow)"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
