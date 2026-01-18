import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function UploadZone({ onFileSelect, isLoading, error }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          await onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        await onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-3 font-mono tracking-tight">
          PDF<span className="text-orp">2</span>Fast
        </h1>
        <p className="text-secondary text-sm sm:text-base tracking-wide">
          RSVP Speed Reading
        </p>
      </div>

      {/* Upload zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-md aspect-[4/3]
          border border-dashed rounded-2xl
          flex flex-col items-center justify-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragOver
            ? 'border-orp bg-orp/5 scale-[1.02]'
            : 'border-guideline/60 hover:border-guideline hover:bg-surface/50'
          }
          ${isLoading ? 'pointer-events-none' : 'upload-hover'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orp/5 rounded-full blur-3xl" />
        </div>

        {isLoading ? (
          <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 text-orp spinner mb-4" />
            <p className="text-white/80 text-base sm:text-lg font-mono">Processing...</p>
            <p className="text-secondary/60 text-xs mt-2">Extracting text from PDF</p>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface/80 flex items-center justify-center">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-control/70" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orp/90 flex items-center justify-center">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-base sm:text-lg font-mono mb-1">
              Drop PDF here
            </p>
            <p className="text-secondary/60 text-xs sm:text-sm">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 px-5 py-3 bg-red-950/30 border border-red-500/30 rounded-xl max-w-md">
          <p className="text-red-400/90 text-sm font-mono text-center">{error}</p>
        </div>
      )}

      {/* Keyboard shortcuts */}
      <div className="mt-12 sm:mt-16 text-center">
        <p className="text-secondary/50 text-xs uppercase tracking-widest mb-4">Shortcuts</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="kbd-badge">Space</span>
            <span className="text-secondary/60">Play</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd-badge">Arrow</span>
            <span className="text-secondary/60">Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd-badge">R</span>
            <span className="text-secondary/60">Restart</span>
          </div>
        </div>
      </div>
    </div>
  );
}
