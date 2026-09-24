import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';

export type BoardTheme = 'obsidian' | 'wood' | 'emerald';

interface ActiveGlidingPiece {
  id: string;
  type: PieceSymbol;
  color: Color;
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
  progress: number;
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
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Drag and drop tracking
  const [isActivelyDragging, setIsActivelyDragging] = useState<boolean>(false);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragHoverSquare, setDragHoverSquare] = useState<Square | null>(null);

  // Pointer refs for touch / drag
  const pointerStartRef = useRef<{ x: number; y: number; square: Square; pieceColor: Color } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const suppressNextClickRef = useRef<boolean>(false);

  // Smooth piece gliding state
  const [glidingPiece, setGlidingPiece] = useState<ActiveGlidingPiece | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastAnimatedMoveRef = useRef<string | null>(null);

  // Coordinate mapper based on flip state
  const displayedFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayedRanks = isFlipped ? [...RANKS].reverse() : RANKS;

  // Clear selection if current turn doesn't match selected piece
  useEffect(() => {
    if (selectedSquare) {
      const piece = chess.get(selectedSquare);
      if (!piece || piece.color !== chess.turn()) {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  }, [chess.turn(), selectedSquare]);

  // Clean gliding animation on move
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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        const moveDuration = 200;
        const startTime = performance.now();
        const animId = `${Date.now()}`;

        setGlidingPiece({
          id: animId,
          type: currentMove.piece,
          color: currentMove.color,
          fromCol,
          fromRow,
          toCol,
          toRow,
          progress: 0,
        });

        const easeOutQuad = (t: number) => t * (2 - t);

        const tick = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const linearProgress = Math.min(1, elapsed / moveDuration);
          const eased = easeOutQuad(linearProgress);

          setGlidingPiece(prev => {
            if (!prev || prev.id !== animId) return null;
            return { ...prev, progress: eased };
          });

          if (linearProgress < 1) {
            animationFrameRef.current = requestAnimationFrame(tick);
          } else {
            setGlidingPiece(null);
          }
        };

        animationFrameRef.current = requestAnimationFrame(tick);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lastMove?.from, lastMove?.to, isFlipped]);

  // Check detection
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

  // Calculate destination square resolving special chess moves (including Castling / Rokade)
  const resolveTargetSquare = (fromSquare: Square, targetSquare: Square, candidateMoves: Move[]): Square => {
    const directMove = candidateMoves.find(m => m.from === fromSquare && m.to === targetSquare);
    if (directMove) return targetSquare;

    const piece = chess.get(fromSquare);
    if (piece && piece.type === 'k') {
      if (piece.color === 'w' && fromSquare === 'e1') {
        if (targetSquare === 'h1') {
          const kingCastle = candidateMoves.find(m => m.from === 'e1' && m.to === 'g1');
          if (kingCastle) return 'g1';
        } else if (targetSquare === 'a1') {
          const queenCastle = candidateMoves.find(m => m.from === 'e1' && m.to === 'c1');
          if (queenCastle) return 'c1';
        }
      } else if (piece.color === 'b' && fromSquare === 'e8') {
        if (targetSquare === 'h8') {
          const kingCastle = candidateMoves.find(m => m.from === 'e8' && m.to === 'g8');
          if (kingCastle) return 'g8';
        } else if (targetSquare === 'a8') {
          const queenCastle = candidateMoves.find(m => m.from === 'e8' && m.to === 'c8');
          if (queenCastle) return 'c8';
        }
      }
    }

    return targetSquare;
  };

  // Convert client coordinates to square
  const getSquareFromClientCoords = (clientX: number, clientY: number): Square | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }
    const colIdx = Math.floor(((clientX - rect.left) / rect.width) * 8);
    const rowIdx = Math.floor(((clientY - rect.top) / rect.height) * 8);
    if (colIdx >= 0 && colIdx < 8 && rowIdx >= 0 && rowIdx < 8) {
      const file = displayedFiles[colIdx];
      const rank = displayedRanks[rowIdx];
      return (file + rank) as Square;
    }
    return null;
  };

  // Execute move if legal
  const attemptExecuteMove = (fromSquare: Square, rawTargetSquare: Square, movesList?: Move[]): boolean => {
    const list = movesList || (selectedSquare === fromSquare ? validMoves : chess.moves({ square: fromSquare, verbose: true }));
    const finalTo = resolveTargetSquare(fromSquare, rawTargetSquare, list);
    const existingMove = list.find(m => m.from === fromSquare && m.to === finalTo);

    if (existingMove) {
      const piece = chess.get(fromSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && finalTo[1] === '8') || (piece.color === 'b' && finalTo[1] === '1'))
      ) {
        setPendingPromotion({ from: fromSquare, to: finalTo });
        return true;
      }

      onMakeMove({ from: fromSquare, to: finalTo });
      setSelectedSquare(null);
      setValidMoves([]);
      return true;
    }
    return false;
  };

  // Click on a square (Pure tap / click move)
  const handleSquareClick = (square: Square) => {
    if (disabled || pendingPromotion) return;

    // If click was immediately preceded by a drag release, ignore to avoid accidental deselect
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    // 1. If a piece is already selected:
    if (selectedSquare) {
      // Clicking same square deselects it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Check if clicking another friendly piece
      const clickedPiece = chess.get(square);
      if (clickedPiece && clickedPiece.color === chess.turn()) {
        // King clicking Rook = Castling Rokade
        const selPiece = chess.get(selectedSquare);
        if (selPiece && selPiece.type === 'k' && clickedPiece.type === 'r') {
          const moved = attemptExecuteMove(selectedSquare, square);
          if (moved) return;
        }

        // Otherwise switch selection to newly clicked friendly piece!
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setValidMoves(moves);
        return;
      }

      // Try executing move to the clicked square (e.g. clicking on one of the move dots)
      const moved = attemptExecuteMove(selectedSquare, square);
      if (moved) return;

      // Clicked on an illegal empty square -> deselect
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // 2. No piece selected yet: Click friendly piece to select and SHOW move dots
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setValidMoves(moves);
    }
  };

  // Pointer Down: Record start for drag detection
  const handlePointerDown = (e: React.PointerEvent, square: Square) => {
    if (disabled || pendingPromotion) return;
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) return;

    // If King is currently selected and pointer is pressed on Rook, check castling
    if (selectedSquare && selectedSquare !== square) {
      const selPiece = chess.get(selectedSquare);
      if (selPiece && selPiece.type === 'k' && piece.type === 'r') {
        const moved = attemptExecuteMove(selectedSquare, square);
        if (moved) return;
      }
    }

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      square,
      pieceColor: piece.color,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const distance = Math.hypot(dx, dy);

    // Only switch to active dragging if moved significantly (> 12px)
    if (distance > 12) {
      if (!isActivelyDragging) {
        setIsActivelyDragging(true);
        setDraggedSquare(pointerStartRef.current.square);
        // Also select piece so valid targets stay visible
        setSelectedSquare(pointerStartRef.current.square);
        const moves = chess.moves({ square: pointerStartRef.current.square, verbose: true });
        setValidMoves(moves);
      }
      setDragPosition({ x: e.clientX, y: e.clientY });
      const hoverSq = getSquareFromClientCoords(e.clientX, e.clientY);
      setDragHoverSquare(hoverSq);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const startInfo = pointerStartRef.current;
    const wasDragging = isActivelyDragging;

    pointerStartRef.current = null;
    setIsActivelyDragging(false);
    setDraggedSquare(null);
    setDragPosition(null);
    setDragHoverSquare(null);

    if (wasDragging && startInfo) {
      suppressNextClickRef.current = true;
      const releaseTargetSquare = getSquareFromClientCoords(e.clientX, e.clientY);
      if (releaseTargetSquare && releaseTargetSquare !== startInfo.square) {
        attemptExecuteMove(startInfo.square, releaseTargetSquare);
      }
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

  // Compute exact position for gliding piece
  let glidingStyle: React.CSSProperties | null = null;
  if (glidingPiece) {
    const p = glidingPiece.progress;
    const currentX = glidingPiece.fromCol + (glidingPiece.toCol - glidingPiece.fromCol) * p;
    const currentY = glidingPiece.fromRow + (glidingPiece.toRow - glidingPiece.fromRow) * p;

    glidingStyle = {
      position: 'absolute',
      width: '12.5%',
      height: '12.5%',
      left: `${(currentX / 8) * 100}%`,
      top: `${(currentY / 8) * 100}%`,
      zIndex: 40,
      pointerEvents: 'none',
    };
  }

  // Find legal castling rook destination highlights if king is selected
  const castlingTargetRookSquares: Square[] = [];
  if (selectedSquare) {
    const selPiece = chess.get(selectedSquare);
    if (selPiece && selPiece.type === 'k') {
      validMoves.forEach(m => {
        if (m.flags.includes('k') || m.san === 'O-O') {
          castlingTargetRookSquares.push((selPiece.color === 'w' ? 'h1' : 'h8') as Square);
        }
        if (m.flags.includes('q') || m.san === 'O-O-O') {
          castlingTargetRookSquares.push((selPiece.color === 'w' ? 'a1' : 'a8') as Square);
        }
      });
    }
  }

  const draggedPiece = draggedSquare ? chess.get(draggedSquare) : null;

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 select-none touch-none">
      {/* Board Frame Wrapper with explicit touch-none to prevent page pulling on mobile */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative rounded-xl overflow-hidden shadow-2xl transition-all duration-200 touch-none select-none ${
          theme === 'obsidian'
            ? 'border-2 border-neutral-700 bg-neutral-900 shadow-[0_15px_35px_rgba(0,0,0,0.7)]'
            : theme === 'emerald'
            ? 'border-2 border-emerald-950 bg-emerald-950 shadow-[0_15px_35px_rgba(6,78,59,0.4)]'
            : 'border-2 border-[#5c3e21] bg-[#4a3219] shadow-[0_15px_35px_rgba(40,25,10,0.5)]'
        } ${isGodMode ? 'ring-1 ring-amber-500/40' : ''}`}
      >
        {/* Crisp gliding piece on live move */}
        {glidingPiece && glidingStyle && (
          <div style={glidingStyle}>
            <div className="w-full h-full p-1.5 relative filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]">
              <ChessPieceSvg
                type={glidingPiece.type}
                color={glidingPiece.color}
                isGodPiece={isGodMode && glidingPiece.color === chess.turn()}
              />
            </div>
          </div>
        )}

        {/* 8x8 Board Matrix */}
        <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] xs:w-[380px] xs:h-[380px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px] touch-none">
          {displayedRanks.map((rank, rankIdx) =>
            displayedFiles.map((file, fileIdx) => {
              const square = (file + rank) as Square;
              const isDark = (rankIdx + fileIdx) % 2 === 1;
              const piece = chess.get(square);

              const isSelected = selectedSquare === square;
              const isBeingDraggedCurrently = isActivelyDragging && draggedSquare === square;
              const isDragHover = isActivelyDragging && dragHoverSquare === square && draggedSquare !== square;

              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isCheckedKing = checkedKingSquare === square;
              const isInevitableFrom = showDivineHint && inevitableMove?.from === square;
              const isInevitableTo = showDivineHint && inevitableMove?.to === square;

              const targetMove = validMoves.find(m => m.to === square);
              const isValidDestination = !!targetMove;

              // Check if this rook square is an allowed castling target for King
              const isCastlingRookSquare = castlingTargetRookSquares.includes(square);

              // Hide piece at destination square WHILE it is gliding to avoid duplicate visual
              const isPieceCurrentlyGlidingToThisSquare =
                glidingPiece &&
                glidingPiece.toCol === fileIdx &&
                glidingPiece.toRow === rankIdx;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  onPointerDown={e => handlePointerDown(e, square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 touch-none ${getSquareColor(
                    isDark
                  )} ${isDragHover ? 'ring-2 ring-inset ring-amber-400 bg-amber-500/20' : ''}`}
                >
                  {/* Subtle Clean Last Move Indicator */}
                  {isLastMoveFrom && (
                    <div className="absolute inset-0 bg-amber-400/15 pointer-events-none" />
                  )}
                  {isLastMoveTo && (
                    <div className="absolute inset-0 bg-amber-400/25 border border-amber-400/50 pointer-events-none" />
                  )}

                  {/* Clean Selection Highlight */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-400/25 border-2 border-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.3)] pointer-events-none z-10" />
                  )}

                  {/* King Check Indicator */}
                  {isCheckedKing && (
                    <div className="absolute inset-0 bg-rose-600/40 ring-2 ring-inset ring-rose-500 pointer-events-none" />
                  )}

                  {/* Divine Hint */}
                  {(isInevitableFrom || isInevitableTo) && (
                    <div className="absolute inset-0 bg-amber-500/30 ring-1 ring-amber-400 pointer-events-none" />
                  )}

                  {/* Special Castling Rook Target Highlight */}
                  {isCastlingRookSquare && (
                    <div className="absolute inset-0 bg-amber-400/20 border-2 border-amber-400/70 pointer-events-none z-10" />
                  )}

                  {/* Chess Piece */}
                  {piece && (
                    <div
                      className={`w-full h-full p-1.5 select-none pointer-events-none transform transition-transform duration-100 ${
                        isPieceCurrentlyGlidingToThisSquare || isBeingDraggedCurrently
                          ? 'opacity-0'
                          : 'opacity-100'
                      } ${
                        isSelected
                          ? 'scale-105 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] z-10'
                          : ''
                      }`}
                    >
                      <ChessPieceSvg
                        type={piece.type}
                        color={piece.color}
                        isGodPiece={isGodMode && piece.color === chess.turn()}
                      />
                    </div>
                  )}

                  {/* Move Target Indicator: Distinct Golden Dot for Empty Squares */}
                  {isValidDestination && !piece && (
                    <div className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] pointer-events-none z-20 animate-in fade-in zoom-in-75 duration-100" />
                  )}

                  {/* Move Target Indicator: Distinct Red Ring for Captures */}
                  {isValidDestination && piece && (
                    <div className="absolute inset-1 sm:inset-1.5 rounded-full border-2 border-rose-500 bg-rose-500/20 pointer-events-none z-20 animate-in fade-in duration-100" />
                  )}

                  {/* Clean Rokade Badge */}
                  {isCastlingRookSquare && (
                    <div className="absolute bottom-1 px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 font-mono text-[9px] font-bold shadow-xs z-20 pointer-events-none">
                      ROKADE
                    </div>
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

        {/* Real-time Floating Dragged Piece */}
        {isActivelyDragging && draggedPiece && dragPosition && (
          <div
            className="fixed pointer-events-none z-50 w-14 h-14 sm:w-16 sm:h-16 -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)] scale-110"
            style={{
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
            }}
          >
            <ChessPieceSvg
              type={draggedPiece.type}
              color={draggedPiece.color}
              isGodPiece={isGodMode && draggedPiece.color === chess.turn()}
            />
          </div>
        )}

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
