import { useState, useEffect, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { RSVPDisplay } from './components/RSVPDisplay';
import { ControlPanel } from './components/ControlPanel';
import { ProgressBar } from './components/ProgressBar';
import { useRSVPReader } from './hooks/useRSVPReader';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [state, actions] = useRSVPReader();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useKeyboardShortcuts({
    state,
    actions,
    enabled: state.status !== 'idle' && state.status !== 'loading',
  });

  // Auto-hide controls when playing
  useEffect(() => {
    if (state.isPlaying) {
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      // Hide controls after 2 seconds of playing
      const timeout = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
      setHideTimeout(timeout);
    } else {
      // Show controls when paused
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
      setControlsVisible(true);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [state.isPlaying]);

  // Show controls on mouse move
  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);

    if (state.isPlaying) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      const timeout = setTimeout(() => {
        if (state.isPlaying) {
          setControlsVisible(false);
        }
      }, 2000);
      setHideTimeout(timeout);
    }
  }, [state.isPlaying, hideTimeout]);

  // Show controls on any interaction
  const handleInteraction = useCallback(() => {
    setControlsVisible(true);
  }, []);

  const currentWord = state.words[state.currentIndex] || null;

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <UploadZone
        onFileSelect={actions.loadPDF}
        isLoading={state.status === 'loading'}
        error={state.error}
      />
    );
  }

  return (
    <div
      className="relative h-screen bg-background overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchStart={handleInteraction}
    >
      {/* Progress bar at top */}
      <ProgressBar
        currentIndex={state.currentIndex}
        totalWords={state.totalWords}
        onSeek={actions.seekTo}
        visible={controlsVisible}
      />

      {/* File name indicator - top right */}
      <div
        className={`
          absolute top-3 right-4 z-10
          text-secondary/50 text-xs font-mono truncate max-w-[200px]
          transition-opacity duration-300
          ${controlsVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {state.fileName}
      </div>

      {/* Main RSVP display area - full screen centered */}
      <div className="h-full">
        <RSVPDisplay
          currentWord={currentWord}
          wpm={state.wpm}
          status={state.status}
        />
      </div>

      {/* Control panel at bottom */}
      <ControlPanel
        isPlaying={state.isPlaying}
        wpm={state.wpm}
        onTogglePlay={actions.togglePlay}
        onSkipBack={() => actions.skipBack(10)}
        onSkipForward={() => actions.skipForward(10)}
        onRestart={actions.restart}
        onWPMChange={actions.setWPM}
        onReset={actions.reset}
        disabled={state.totalWords === 0}
        visible={controlsVisible}
      />
    </div>
  );
}

export default App;
