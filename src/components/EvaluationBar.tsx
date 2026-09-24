import React from 'react';

interface EvaluationBarProps {
  evalCentipawns: number;
  humanWinProbability: number;
  godWinProbability?: number;
  isGodMode: boolean;
  isFlipped: boolean;
  isCalculating: boolean;
  projectedNodes?: number;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evalCentipawns,
  humanWinProbability,
  godWinProbability = 100 - humanWinProbability,
  isGodMode,
  isFlipped,
  isCalculating,
}) => {
  // Map centipawns (-1200 to +1200) into 0% to 100%
  // evalCentipawns > 0 means White is winning, < 0 means Black is winning
  const clampedEval = Math.max(-1500, Math.min(1500, evalCentipawns));
  
  // High precision logistic mapping for White's share of the bar
  let whitePercent: number;
  if (Math.abs(evalCentipawns) >= 20000) {
    whitePercent = evalCentipawns > 0 ? 98.5 : 1.5;
  } else if (isGodMode) {
    // In God Mode, the bar dynamically depicts Deus's overwhelming domination
    const humanShare = Math.max(0.5, Math.min(99.5, humanWinProbability));
    // If Human is White, whitePercent is humanShare; otherwise White is Deus so 100 - humanShare
    whitePercent = isFlipped ? (100 - humanShare) : humanShare;
  } else {
    // Standard Elo-based sigmoid conversion
    whitePercent = Math.max(2, Math.min(98, 50 + (clampedEval / 1500) * 48));
  }

  // If board is flipped (player playing as Black), adjust top/bottom accordingly
  const topPercent = isFlipped ? whitePercent : 100 - whitePercent;

  // Format evaluation text
  let evalText = '0.00';
  if (Math.abs(evalCentipawns) >= 20000) {
    const movesToMate = Math.ceil((32000 - Math.abs(evalCentipawns)) / 2);
    evalText = evalCentipawns > 0 ? `+M${movesToMate}` : `-M${movesToMate}`;
  } else {
    const formatted = (evalCentipawns / 100).toFixed(2);
    evalText = evalCentipawns > 0 ? `+${formatted}` : formatted;
  }

  return (
    <div className="flex flex-col items-center gap-2 select-none w-14 sm:w-16">
      {/* Precision Probability Gauge Header */}
      <div className="text-center w-full">
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-mono font-bold leading-tight">
          {isGodMode ? 'CHANCE MENANG' : 'EVALUASI'}
        </span>
        <div className="flex flex-col items-center mt-0.5">
          <span
            className={`font-mono text-xs font-bold tabular-nums tracking-tight ${
              isGodMode
                ? humanWinProbability <= 1.5
                  ? 'text-rose-500 animate-pulse'
                  : 'text-amber-400'
                : 'text-neutral-200'
            }`}
          >
            {isGodMode ? `${humanWinProbability.toFixed(2)}%` : evalText}
          </span>
          {isGodMode && (
            <span className="text-[8px] font-mono text-neutral-500 tabular-nums">
              Deus: {godWinProbability.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Vertical Eval Bar with precise gradient & indicator lines */}
      <div className="relative w-5 h-72 sm:h-96 rounded-full overflow-hidden bg-neutral-950 border border-neutral-700/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Top Segment */}
        <div
          className={`w-full transition-all duration-300 ease-out ${
            isFlipped
              ? 'bg-neutral-100 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.2)]'
              : isGodMode
              ? 'bg-gradient-to-b from-rose-950 via-neutral-900 to-neutral-900 border-b border-rose-900/60'
              : 'bg-neutral-800'
          }`}
          style={{ height: `${topPercent}%` }}
        />

        {/* Bottom Segment */}
        <div
          className={`w-full transition-all duration-300 ease-out flex-1 ${
            isFlipped
              ? isGodMode
                ? 'bg-gradient-to-t from-rose-950 via-neutral-900 to-neutral-900 border-t border-rose-900/60'
                : 'bg-neutral-800'
              : 'bg-neutral-100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]'
          }`}
        />

        {/* Center 50/50 Baseline Notch */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber-500/80 z-20 pointer-events-none shadow-[0_0_4px_rgba(245,158,11,0.8)]" />

        {/* 25% and 75% subtle tick marks */}
        <div className="absolute top-1/4 left-1 right-1 h-[1px] bg-neutral-600/40 z-10 pointer-events-none" />
        <div className="absolute top-3/4 left-1 right-1 h-[1px] bg-neutral-600/40 z-10 pointer-events-none" />

        {/* Real-time Omniscient Calculation Pulse */}
        {isCalculating && (
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-amber-400/25 to-rose-500/20 animate-pulse pointer-events-none z-30" />
        )}
      </div>

      {/* Numerical Centipawn / Relative Score Footer */}
      <div className="text-[10px] font-mono text-neutral-400 tabular-nums font-semibold bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
        {evalText}
      </div>
    </div>
  );
};
