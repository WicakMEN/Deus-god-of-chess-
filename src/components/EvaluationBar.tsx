import React from 'react';

interface EvaluationBarProps {
  evalCentipawns: number;
  humanWinProbability: number;
  isGodMode: boolean;
  isFlipped: boolean;
  isCalculating: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evalCentipawns,
  humanWinProbability,
  isGodMode,
  isFlipped,
  isCalculating,
}) => {
  // Normalize centipawns (-1000 to +1000 range) to percentage (0% to 100%)
  // evalCentipawns: > 0 means White is winning, < 0 means Black is winning
  const clampedEval = Math.max(-1200, Math.min(1200, evalCentipawns));
  // White advantage mapped: 0 centipawns = 50%, +1000 = 98%, -1000 = 2%
  const whitePercent = Math.max(3, Math.min(97, 50 + (clampedEval / 1200) * 47));

  // If board is flipped, invert bar display
  const topPercent = isFlipped ? whitePercent : 100 - whitePercent;

  // Format evaluation text
  let evalText = '0.0';
  if (Math.abs(evalCentipawns) >= 20000) {
    const movesToMate = Math.ceil((30000 - Math.abs(evalCentipawns)) / 2);
    evalText = evalCentipawns > 0 ? `+M${movesToMate}` : `-M${movesToMate}`;
  } else {
    const formatted = (evalCentipawns / 100).toFixed(1);
    evalText = evalCentipawns > 0 ? `+${formatted}` : formatted;
  }

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Probability Gauge Label */}
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
          {isGodMode ? 'Probabilitas Manusia' : 'Keunggulan'}
        </span>
        <span
          className={`font-mono text-xs font-semibold tabular-nums ${
            isGodMode && humanWinProbability < 5
              ? 'text-rose-400 animate-pulse'
              : 'text-neutral-200'
          }`}
        >
          {isGodMode ? `${humanWinProbability.toFixed(1)}%` : evalText}
        </span>
      </div>

      {/* Vertical Eval Bar */}
      <div className="relative w-4.5 h-72 sm:h-96 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shadow-inner flex flex-col">
        {/* Top Segment (Black or White based on flip) */}
        <div
          className={`w-full transition-all duration-300 ease-out ${
            isFlipped
              ? 'bg-neutral-100'
              : isGodMode
              ? 'bg-gradient-to-b from-rose-950 via-neutral-900 to-neutral-900'
              : 'bg-neutral-800'
          }`}
          style={{ height: `${topPercent}%` }}
        />

        {/* Bottom Segment */}
        <div
          className={`w-full transition-all duration-300 ease-out flex-1 ${
            isFlipped
              ? isGodMode
                ? 'bg-gradient-to-t from-rose-950 via-neutral-900 to-neutral-900'
                : 'bg-neutral-800'
              : 'bg-neutral-100'
          }`}
        />

        {/* Divider / Equality Notch */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber-500/60 z-10 pointer-events-none" />

        {/* Calculating Glow */}
        {isCalculating && (
          <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Current Eval badge */}
      <div className="text-[11px] font-mono text-neutral-400 tabular-nums">
        {evalText}
      </div>
    </div>
  );
};
