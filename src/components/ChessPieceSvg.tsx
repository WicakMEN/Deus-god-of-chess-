import React from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface PieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
  isGodPiece?: boolean;
}

export const ChessPieceSvg: React.FC<PieceProps> = ({ type, color, className = "w-full h-full", isGodPiece = false }) => {
  const isWhite = color === 'w';

  // High contrast clean vector styling
  const fillPrimary = isWhite ? '#F8FAFC' : '#18181B';
  const fillSecondary = isWhite ? '#E2E8F0' : '#09090B';
  const strokeColor = isWhite ? '#0F172A' : '#E2E8F0';
  const highlightColor = isGodPiece
    ? (isWhite ? '#F59E0B' : '#E11D48') // Gold for white deity, crimson for dark deity
    : (isWhite ? '#FFFFFF' : '#3F3F46');

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fillPrimary}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M12 39.5h21" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          {isGodPiece && (
            <circle cx="22.5" cy="13" r="1.5" fill={highlightColor} />
          )}
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
            fill={fillPrimary}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <path
            d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.163-.326-1.742 0-2 .813-.646 1.83-1.417 2-2 1.25-4.25-.5-5 0-7 .6-2.4 3-3.2 4-4 .9-1.2 1-3.5 1-4 1-1.5 2.5-3 5-3 1.5 0 2 .5 2 1.5 0 1-1 1.5-1 2.5z"
            fill={fillPrimary}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <circle cx="15.5" cy="15.5" r="1.5" fill={highlightColor} stroke={strokeColor} strokeWidth="0.5" />
          <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill={strokeColor} />
          <path d="M12 39.5h26" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill={fillPrimary} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
          </g>
          <path d="M17.5 26h10M22.5 21v10" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="22.5" cy="8" r="1.5" fill={highlightColor} />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill={fillPrimary} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" />
          </g>
          {isGodPiece && (
            <rect x="21" y="21" width="3" height="5" fill={highlightColor} rx="1" />
          )}
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill={fillPrimary} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-4-14-4.5 14-4.5-14-4 14-7-11 2 12z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5 0-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" />
          </g>
          <circle cx="22.5" cy="7.5" r="1.5" fill={highlightColor} />
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.5 11.63V6M20 8h5"
            stroke={highlightColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g fill={fillPrimary} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 25c0 0 4.5-7.5 3-10.5-1.5-3-6-3-7.5 0-1.5 3 3 10.5 3 10.5" />
            <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0 0-4-3-4-3-6.5 0-3 3-5 3-7.5 0-4-5-5-11-5s-11 1-11 5c0 2.5 3 4.5 3 7.5 0 2.5-3 2.5-3 6.5z" />
            <path d="M11.5 30c5.5-2 16.5-2 22 0M11.5 33.5c5.5-1.5 16.5-1.5 22 0M11.5 37c5.5-.5 16.5-.5 22 0" />
          </g>
          {isGodPiece && (
            <circle cx="22.5" cy="18" r="2" fill={highlightColor} />
          )}
        </svg>
      );

    default:
      return null;
  }
};
