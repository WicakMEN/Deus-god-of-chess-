import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';

interface CapturedPiecesProps {
  captured: { type: PieceSymbol; color: Color }[];
  color: Color; // The player color who owns these captured trophies
  materialAdvantage: number;
}

const PIECE_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ captured, color, materialAdvantage }) => {
  // Captured pieces of the OPPONENT's color that THIS player has captured
  const opponentColor = color === 'w' ? 'b' : 'w';
  const playerCaptured = captured.filter(p => p.color === opponentColor);

  // Group by type and sort
  const sortedPieces = [...playerCaptured].sort(
    (a, b) => PIECE_ORDER.indexOf(a.type) - PIECE_ORDER.indexOf(b.type)
  );

  return (
    <div className="flex items-center gap-1.5 min-h-[28px] overflow-hidden">
      <div className="flex items-center -space-x-1.5">
        {sortedPieces.map((p, idx) => (
          <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 filter drop-shadow">
            <ChessPieceSvg type={p.type} color={p.color} />
          </div>
        ))}
      </div>
      {materialAdvantage > 0 && (
        <span className="text-xs font-mono font-medium text-amber-400 tabular-nums ml-1">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
