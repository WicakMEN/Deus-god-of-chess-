import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import { MoveEffectsOverlay, ImpactShockwave } from './MoveEffectsOverlay';

export type BoardTheme = 'obsidian' | 'wood' | 'emerald';

interface ActiveGlidingPiece {
  id: string;
  type: PieceSymbol;
  color: Color;
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
  isKnight: boolean;
  isGod: boolean;
  progress: number; // 0 to 1
}

interface DefeatedPieceVFX {
  id: string;
  type: PieceSymbol;
  color: Color;
  xPercent: number;
  yPercent: number;
  effect: 'lightsaber' | 'glitch' | 'slash';
}

interface ChessBoardProps {
  chess: Chess;
  isFlipped: boolean;
  onMakeMove: (move: { from: Square; to: Square; promotion?: PieceSymbol }) => boolean;
  lastMove: { from: Square; to: Square } | null;
  inevitableMove: { from: Square; to: Square } | null;
  showDivineHint: boolean;
  isGodMode: boolean;
  disabled: boolean;
  theme: BoardTheme;
  isCalculating?: boolean;
  isWaitingForUserDeusMove?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  isFlipped,
  onMakeMove,
  lastMove,
  inevitableMove,
  showDivineHint,
  isGodMode,
  disabled,
  theme,
  isCalculating = false,
  isWaitingForUserDeusMove = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [shockwaves, setShockwaves] = useState<ImpactShockwave[]>([]);
  const [boardShaking, setBoardShaking] = useState<boolean>(false);

  // Smooth continuous interpolation animation state
  const [glidingPiece, setGlidingPiece] = useState<ActiveGlidingPiece | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Battle Slash / Glitch Death VFX state
  const [defeatedVfx, setDefeatedVfx] = useState<DefeatedPieceVFX[]>([]);

  // Coordinate mapper based on flip state
  const displayedFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayedRanks = isFlipped ? [...RANKS].reverse() : RANKS;

  // Keep track of the last animated move to prevent duplicate animation runs
  const lastAnimatedMoveRef = useRef<string | null>(null);

  // Whenever lastMove changes, perform smooth, elegant continuous interpolation
  useEffect(() => {
    if (!lastMove) {
      lastAnimatedMoveRef.current = null;
      return;
    }

    const moveKey = `${lastMove.from}-${lastMove.to}-${chess.history().length}`;
    if (lastAnimatedMoveRef.current === moveKey) {
      return;
    }
    lastAnimatedMoveRef.current = moveKey;

    const fromSquare = lastMove.from;
    const toSquare = lastMove.to;

    const fromCol = displayedFiles.indexOf(fromSquare[0]);
    const fromRow = displayedRanks.indexOf(fromSquare[1]);
    const toCol = displayedFiles.indexOf(toSquare[0]);
    const toRow = displayedRanks.indexOf(toSquare[1]);

    if (fromCol >= 0 && fromRow >= 0 && toCol >= 0 && toRow >= 0) {
      const history = chess.history({ verbose: true });
      const currentMove = history[history.length - 1];
      if (currentMove) {
        const pieceType = currentMove.piece;
        const pieceColor = currentMove.color;
        const isKnight = pieceType === 'n';
        const isGod = isGodMode && pieceColor !== (isFlipped ? 'w' : 'b');

        // Cancel previous animation if any
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        const moveDuration = isKnight ? 420 : 360; // Deliberate, smooth, non-instant feel
        const startTime = performance.now();
        const animId = `${Date.now()}`;

        // Initialize gliding piece at origin
        setGlidingPiece({
          id: animId,
          type: pieceType,
          color: pieceColor,
          fromCol,
          fromRow,
          toCol,
          toRow,
          isKnight,
          isGod,
          progress: 0,
        });

        // Easing function (smooth cubic ease in-out)
        const easeInOutCubic = (t: number) => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const tick = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const linearProgress = Math.min(1, elapsed / moveDuration);
          const eased = easeInOutCubic(linearProgress);

          setGlidingPiece(prev => {
            if (!prev || prev.id !== animId) return null;
            return {
              ...prev,
              progress: eased,
            };
          });

          if (linearProgress < 1) {
            animationFrameRef.current = requestAnimationFrame(tick);
          } else {
            // Arrival at destination
            setGlidingPiece(null);

            // Impact shockwave at target square
            const xPercent = ((toCol + 0.5) / 8) * 100;
            const yPercent = ((toRow + 0.5) / 8) * 100;
            const isCheck = chess.inCheck();

            const newWave: ImpactShockwave = {
              id: Date.now() + Math.random(),
              xPercent,
              yPercent,
              isCapture: !!currentMove.captured,
              isGod,
              isCheck,
            };

            setShockwaves(prev => [...prev.slice(-3), newWave]);

            // Gentle screen shake on capture, check or God move
            if (currentMove.captured || isCheck || isGod) {
              setBoardShaking(true);
              setTimeout(() => setBoardShaking(false), 240);
            }

            setTimeout(() => {
              setShockwaves(prev => prev.filter(w => w.id !== newWave.id));
            }, 700);
          }
        };

        animationFrameRef.current = requestAnimationFrame(tick);

        // If a piece was defeated / captured, trigger cyber-glitch and lightsaber battle effect
        if (currentMove.captured) {
          const vfxId = `vfx-${Date.now()}`;
          const xPercent = ((toCol + 0.5) / 8) * 100;
          const yPercent = ((toRow + 0.5) / 8) * 100;
          const effectTypes: ('lightsaber' | 'glitch' | 'slash')[] = ['lightsaber', 'glitch', 'slash'];
          const chosenEffect = isGod ? 'lightsaber' : effectTypes[Math.floor(Math.random() * effectTypes.length)];

          setDefeatedVfx(prev => [
            ...prev,
            {
              id: vfxId,
              type: currentMove.captured as PieceSymbol,
              color: currentMove.color === 'w' ? 'b' : 'w',
              xPercent,
              yPercent,
              effect: chosenEffect,
            },
          ]);

          setTimeout(() => {
            setDefeatedVfx(prev => prev.filter(v => v.id !== vfxId));
          }, 850);
        }
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lastMove?.from, lastMove?.to, isGodMode, isFlipped]);

  // Active check detection
  const inCheck = chess.inCheck();
  let checkedKingSquare: Square | null = null;
  if (inCheck) {
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          checkedKingSquare = (FILES[c] + RANKS[r]) as Square;
          break;
        }
      }
    }
  }

  const handleSquareClick = (square: Square) => {
    if (disabled || pendingPromotion) return;

    // Check destination
    const existingMove = validMoves.find(m => m.to === square);
    if (selectedSquare && existingMove) {
      // Promotion check
      const piece = chess.get(selectedSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'))
      ) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      onMakeMove({ from: selectedSquare, to: square });
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // Select piece
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handlePromotionChoice = (type: PieceSymbol) => {
    if (!pendingPromotion) return;
    onMakeMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: type });
    setPendingPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const getSquareColor = (isDark: boolean) => {
    switch (theme) {
      case 'obsidian':
        return isDark ? 'bg-neutral-800' : 'bg-neutral-600/70';
      case 'emerald':
        return isDark ? 'bg-emerald-900/90' : 'bg-emerald-100/90';
      case 'wood':
        return isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]';
      default:
        return isDark ? 'bg-neutral-800' : 'bg-neutral-600/70';
    }
  };

  // Compute exact position and height for gliding piece
  let glidingStyle: React.CSSProperties | null = null;
  if (glidingPiece) {
    const p = glidingPiece.progress;
    const currentX = glidingPiece.fromCol + (glidingPiece.toCol - glidingPiece.fromCol) * p;
    const currentY = glidingPiece.fromRow + (glidingPiece.toRow - glidingPiece.fromRow) * p;

    // For Knight, calculate an arched parabola jump
    let arcElevation = 0;
    let scaleVal = 1.08;
    if (glidingPiece.isKnight) {
      // Parabola: peaks at p = 0.5
      arcElevation = Math.sin(p * Math.PI) * 26; // pixels up
      scaleVal = 1 + Math.sin(p * Math.PI) * 0.28;
    } else {
      // Slight elevation for pawn, rook, bishop, queen
      arcElevation = Math.sin(p * Math.PI) * 10;
      scaleVal = 1 + Math.sin(p * Math.PI) * 0.12;
    }

    glidingStyle = {
      position: 'absolute',
      width: '12.5%',
      height: '12.5%',
      left: `${(currentX / 8) * 100}%`,
      top: `${(currentY / 8) * 100}%`,
      transform: `translate3d(0, ${-arcElevation}px, 0) scale(${scaleVal})`,
      zIndex: 40,
      pointerEvents: 'none',
    };
  }

  return (
    <div className="relative select-none flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Banner Hint jika user sedang mengontrol gerakan awal bidak putih Deus */}
      {isWaitingForUserDeusMove && (
        <div className="mb-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 text-xs font-mono flex items-center gap-2 animate-pulse shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Silakan pilih & gerakkan langkah pembuka bidak Putih Deus di papan</span>
        </div>
      )}

      {/* Outer Cosmic Board Container with Reactive Screen Shake and Divine Aura */}
      <div
        className={`relative rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ${
          boardShaking ? 'scale-[1.015] -translate-y-1' : ''
        } ${
          isGodMode
            ? 'ring-2 ring-rose-900/70 shadow-[0_0_50px_rgba(225,29,72,0.3)]'
            : 'border border-neutral-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Kinetic Shockwave & Spark Overlay */}
        <MoveEffectsOverlay shockwaves={shockwaves} />

        {/* BATTLE DEATH & LIGHTSABER SLASH OVERLAY */}
        {defeatedVfx.map(vfx => (
          <div
            key={vfx.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
            style={{ left: `${vfx.xPercent}%`, top: `${vfx.yPercent}%` }}
          >
            {/* Lightsaber Energy Beam Strike */}
            {vfx.effect === 'lightsaber' && (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-28 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent rotate-45 animate-ping shadow-[0_0_20px_#22d3ee]" />
                <div className="absolute w-28 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent -rotate-45 animate-pulse shadow-[0_0_20px_#f43f5e]" />
                <div className="w-12 h-12 rounded-full bg-white/40 blur-xs animate-ping" />
              </div>
            )}

            {/* Sword Blade Slash */}
            {vfx.effect === 'slash' && (
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent rotate-[-35deg] animate-slash-beam shadow-[0_0_25px_#f59e0b]" />
                <div className="absolute w-10 h-10 border-2 border-amber-400/80 rounded-full animate-ping" />
              </div>
            )}

            {/* Cyber Glitch Dissolve Ghost */}
            {vfx.effect === 'glitch' && (
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 animate-glitch-dissolve opacity-90 blur-[0.5px]">
                  <ChessPieceSvg type={vfx.type} color={vfx.color} />
                </div>
                <div className="absolute inset-0 border border-emerald-400/80 animate-ping rounded-lg" />
              </div>
            )}
          </div>
        ))}

        {/* SMOOTH CONTINUOUS GLIDING PIECE (True origin to destination interpolation) */}
        {glidingPiece && glidingStyle && (
          <div style={glidingStyle}>
            {/* Elegant Motion Trail Light */}
            <div
              className={`absolute inset-0 rounded-full blur-xs opacity-60 ${
                glidingPiece.isGod
                  ? 'bg-amber-400/40 shadow-[0_0_25px_#f59e0b]'
                  : 'bg-cyan-400/35 shadow-[0_0_20px_#22d3ee]'
              }`}
            />
            {/* Drop Shadow underneath the airborne piece */}
            <div className="w-full h-full p-1.5 relative filter drop-shadow-[0_16px_18px_rgba(0,0,0,0.75)]">
              <ChessPieceSvg
                type={glidingPiece.type}
                color={glidingPiece.color}
                isGodPiece={glidingPiece.isGod}
              />
            </div>
          </div>
        )}

        {/* Ambient Cosmic Ray in God Mode */}
        {isGodMode && (
          <div className="absolute inset-0 bg-radial from-rose-500/10 via-transparent to-black/30 pointer-events-none z-10 animate-pulse" />
        )}

        {/* 8x8 Board Matrix */}
        <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] xs:w-[380px] xs:h-[380px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px]">
          {displayedRanks.map((rank, rankIdx) =>
            displayedFiles.map((file, fileIdx) => {
              const square = (file + rank) as Square;
              const isDark = (rankIdx + fileIdx) % 2 === 1;
              const piece = chess.get(square);

              const isSelected = selectedSquare === square;
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isCheckedKing = checkedKingSquare === square;
              const isInevitableFrom = showDivineHint && inevitableMove?.from === square;
              const isInevitableTo = showDivineHint && inevitableMove?.to === square;

              const targetMove = validMoves.find(m => m.to === square);
              const isValidDestination = !!targetMove;
              const isCapture = isValidDestination && targetMove.captured;

              // Hide piece at destination square WHILE it is gliding to avoid duplicate visual
              const isPieceCurrentlyGlidingToThisSquare =
                glidingPiece &&
                glidingPiece.toCol === fileIdx &&
                glidingPiece.toRow === rankIdx;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${getSquareColor(
                    isDark
                  )}`}
                >
                  {/* Last Move Indicator with Golden Shimmer */}
                  {isLastMoveFrom && (
                    <div className="absolute inset-0 bg-amber-400/20 border border-amber-400/30 pointer-events-none" />
                  )}
                  {isLastMoveTo && (
                    <div className="absolute inset-0 bg-amber-400/35 border-2 border-amber-400/60 pointer-events-none animate-in fade-in duration-200" />
                  )}

                  {/* Selection Highlight with Neon Cyan Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-teal-400/30 ring-2 ring-inset ring-teal-400 shadow-[inset_0_0_15px_rgba(45,212,191,0.5)] pointer-events-none animate-pulse" />
                  )}

                  {/* King Danger/Check Pulsing Beacon */}
                  {isCheckedKing && (
                    <div className="absolute inset-0 bg-rose-600/50 animate-pulse ring-2 ring-inset ring-rose-500 shadow-[inset_0_0_20px_#e11d48] pointer-events-none" />
                  )}

                  {/* Divine Inevitable Move Aura */}
                  {(isInevitableFrom || isInevitableTo) && (
                    <div className="absolute inset-0 bg-amber-500/40 ring-2 ring-amber-300 shadow-[inset_0_0_20px_#f59e0b] animate-pulse pointer-events-none z-10" />
                  )}

                  {/* Static Piece (or piece ready to be moved) */}
                  {piece && (
                    <div
                      className={`w-full h-full p-1.5 transition-all duration-200 ease-out select-none transform ${
                        isPieceCurrentlyGlidingToThisSquare
                          ? 'opacity-0'
                          : 'opacity-100'
                      } ${
                        isSelected
                          ? 'scale-110 -translate-y-1.5 filter drop-shadow-[0_12px_12px_rgba(0,0,0,0.6)] z-10'
                          : 'hover:scale-105 hover:-translate-y-0.5 drop-shadow-xs'
                      }`}
                    >
                      <ChessPieceSvg
                        type={piece.type}
                        color={piece.color}
                        isGodPiece={isGodMode && piece.color === chess.turn()}
                      />
                    </div>
                  )}

                  {/* Move Target Indicators */}
                  {isValidDestination && !isCapture && (
                    <div className="absolute w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-teal-400/80 pointer-events-none shadow-[0_0_12px_rgba(45,212,191,0.9)] animate-in zoom-in duration-150" />
                  )}

                  {/* Capture Target Indicator with Crimson Ring */}
                  {isValidDestination && isCapture && (
                    <div className="absolute inset-1 sm:inset-1.5 rounded-full border-2 sm:border-3 border-rose-500/90 bg-rose-500/25 pointer-events-none shadow-[0_0_14px_rgba(244,63,94,0.8)] animate-pulse" />
                  )}

                  {/* Coordinate Labels: Files on bottom row */}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-mono font-bold leading-none pointer-events-none ${
                        isDark ? 'text-neutral-400/80' : 'text-neutral-600/80'
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Coordinate Labels: Ranks on left column */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] font-mono font-bold leading-none pointer-events-none ${
                        isDark ? 'text-neutral-400/80' : 'text-neutral-600/80'
                      }`}
                    >
                      {rank}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Promotion Modal Overlay */}
        {pendingPromotion && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-neutral-900 border border-neutral-700 p-5 rounded-2xl shadow-2xl text-center max-w-xs">
              <span className="block text-xs uppercase font-mono tracking-widest text-amber-400 font-bold mb-3">
                ★ Promosi Perwira ★
              </span>
              <div className="flex gap-2.5 justify-center">
                {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handlePromotionChoice(type)}
                    className="w-14 h-14 p-2 bg-neutral-800 hover:bg-neutral-700 hover:scale-110 active:scale-95 border border-neutral-600 hover:border-amber-400 rounded-xl transition-all duration-150 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <ChessPieceSvg type={type} color={chess.turn()} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
