import React, { useRef, useEffect } from 'react';
import { Copy, Download, Check } from 'lucide-react';

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

  // Auto-scroll to latest move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

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

  return (
    <div className="flex flex-col h-full bg-neutral-900/60 rounded-xl border border-neutral-800/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-neutral-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
          Notasi Langkah
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyToClipboard(fen, 'fen')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 rounded transition-colors"
            title="Salin FEN"
          >
            {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>
          <button
            onClick={() => copyToClipboard(pgn, 'pgn')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 rounded transition-colors"
            title="Salin PGN"
          >
            {copiedPgn ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
            <span>PGN</span>
          </button>
        </div>
      </div>

      {/* Move Table */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 italic text-[11px]">
            Belum ada langkah yang dieksekusi.
          </div>
        ) : (
          movePairs.map(pair => (
            <div
              key={pair.num}
              className="grid grid-cols-[36px_1fr_1fr] items-center py-1 px-2 rounded hover:bg-neutral-800/40 transition-colors"
            >
              <span className="text-neutral-500 tabular-nums">{pair.num}.</span>
              <button
                onClick={() => onSelectMove(pair.whiteIdx)}
                className={`text-left px-2 py-0.5 rounded transition-colors ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-neutral-200 hover:text-white'
                }`}
              >
                {pair.white}
              </button>
              {pair.black && (
                <button
                  onClick={() => pair.blackIdx !== undefined && onSelectMove(pair.blackIdx)}
                  className={`text-left px-2 py-0.5 rounded transition-colors ${
                    currentMoveIndex === pair.blackIdx
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
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
    </div>
  );
};
