import React, { useRef, useEffect } from 'react';
import { Copy, Download, Check, SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

interface MoveHistoryProps {
  history: string[]; // Standard algebraic notation array: ['e4', 'e5', 'Nf3', ...]
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  pgn: string;
  fen: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onSelectMove,
  pgn,
  fen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const [copiedFen, setCopiedFen] = React.useState(false);

  // Group moves into pairs (White move, Black move)
  const movePairs: { num: number; white: string; black?: string; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < history.length ? i + 1 : undefined,
    });
  }

  // Auto-scroll ONLY inside containerRef itself WITHOUT scrolling the browser window / page
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector<HTMLElement>('.active-move-step');
      if (activeEl) {
        // Calculate offset purely inside container
        const container = containerRef.current;
        const targetTop = activeEl.offsetTop - container.offsetTop;
        container.scrollTo({
          top: Math.max(0, targetTop - container.clientHeight / 2 + activeEl.clientHeight / 2),
          behavior: 'smooth',
        });
      }
    }
  }, [currentMoveIndex]);

  const copyToClipboard = (text: string, type: 'pgn' | 'fen') => {
    navigator.clipboard.writeText(text);
    if (type === 'pgn') {
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    } else {
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    }
  };

  const handleFirst = () => onSelectMove(-1);
  const handlePrev = () => onSelectMove(Math.max(-1, currentMoveIndex - 1));
  const handleNext = () => onSelectMove(Math.min(history.length - 1, currentMoveIndex + 1));
  const handleLast = () => onSelectMove(history.length - 1);

  return (
    <div className="flex flex-col h-full bg-neutral-900/60 rounded-xl border border-neutral-800/80 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-3.5 py-2 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Notasi Langkah
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            ({currentMoveIndex + 1}/{history.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyToClipboard(fen, 'fen')}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-800/60 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            title="Salin FEN"
          >
            {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>
          <button
            onClick={() => copyToClipboard(pgn, 'pgn')}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-800/60 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            title="Salin PGN"
          >
            {copiedPgn ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
            <span>PGN</span>
          </button>
        </div>
      </div>

      {/* Move Table with isolated scrollable container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono overscroll-contain"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 italic text-[11px]">
            Belum ada langkah yang dieksekusi.
          </div>
        ) : (
          movePairs.map(pair => (
            <div
              key={pair.num}
              className="grid grid-cols-[36px_1fr_1fr] items-center py-0.5 px-2 rounded hover:bg-neutral-800/40 transition-colors"
            >
              <span className="text-neutral-500 tabular-nums">{pair.num}.</span>
              <button
                onClick={() => onSelectMove(pair.whiteIdx)}
                className={`text-left px-2 py-1 rounded transition-colors cursor-pointer ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'active-move-step bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                    : 'text-neutral-200 hover:text-white'
                }`}
              >
                {pair.white}
              </button>
              {pair.black && (
                <button
                  onClick={() => pair.blackIdx !== undefined && onSelectMove(pair.blackIdx)}
                  className={`text-left px-2 py-1 rounded transition-colors cursor-pointer ${
                    currentMoveIndex === pair.blackIdx
                      ? 'active-move-step bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                      : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  {pair.black}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Interactive Move Navigation Controller (Awal, Mundur, Maju, Akhir) */}
      <div className="p-2 border-t border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between gap-1">
        <button
          onClick={handleFirst}
          disabled={currentMoveIndex === -1 || history.length === 0}
          className="flex-1 py-1.5 px-2 flex items-center justify-center rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Ke Awal Permainan (Start)"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handlePrev}
          disabled={currentMoveIndex === -1 || history.length === 0}
          className="flex-1 py-1.5 px-2 flex items-center justify-center rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Mundur 1 Langkah (Undo visual / step back)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentMoveIndex >= history.length - 1}
          className="flex-1 py-1.5 px-2 flex items-center justify-center rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Maju 1 Langkah (Redo visual / step forward)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleLast}
          disabled={currentMoveIndex >= history.length - 1}
          className="flex-1 py-1.5 px-2 flex items-center justify-center rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Ke Langkah Terakhir (Live position)"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
