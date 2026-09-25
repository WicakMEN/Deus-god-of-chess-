import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { ChessBoard, BoardTheme } from './components/ChessBoard';
import { EpistemicHud } from './components/EpistemicHud';
import { TopNav, ActiveEngine } from './components/TopNav';
import { EvaluationBar } from './components/EvaluationBar';
import { MoveHistory } from './components/MoveHistory';
import { CapturedPieces } from './components/CapturedPieces';
import { PhilosophyModal, RulesModal } from './components/InfoModals';
import { ExtremeStressModal } from './components/ExtremeStressModal';
import { ArenaDuelDashboard } from './components/ArenaDuelDashboard';
import { epistemicEngine, EpistemicEvaluation, GameDifficulty } from './engine/chessEngine';
import { stockfishService, StockfishEvaluation } from './engine/stockfishService';
import { soundManager } from './audio/soundEffects';
import { Trophy } from 'lucide-react';

function convertStockfishToEpistemic(
  sfEval: StockfishEvaluation,
  chessInstance: Chess,
  humanColor: Color
): EpistemicEvaluation {
  const currentTurn = chessInstance.turn();
  const cp = sfEval.scoreCentipawns;
  const humanAdvantage = currentTurn === humanColor ? cp : -cp;
  const clampedAdv = Math.max(-2000, Math.min(2000, humanAdvantage));
  const humanWinProb = 1 / (1 + Math.pow(10, -clampedAdv / 400));
  const humanWinProbability = Number((humanWinProb * 100).toFixed(2));
  const godWinProbability = Number((100 - humanWinProbability).toFixed(2));

  let moveObj: Move | null = null;
  if (sfEval.from && sfEval.to) {
    const legalMoves = chessInstance.moves({ verbose: true });
    moveObj =
      legalMoves.find(
        m =>
          m.from === sfEval.from &&
          m.to === sfEval.to &&
          (!sfEval.promotion || m.promotion === sfEval.promotion)
      ) || null;
  }

  const mateNote =
    sfEval.mateInMoves !== undefined
      ? `Forced Mate dalam ${Math.abs(sfEval.mateInMoves)} langkah!`
      : '';

  return {
    bestMove: sfEval.bestMove || '',
    bestMoveObj: moveObj,
    evalCentipawns: cp,
    depth: sfEval.depth || 10,
    qDepth: 0,
    nodesSearched: sfEval.nodes || 0,
    projectedNodes: (sfEval.nodes || 1000) * 1500,
    searchTimeMs: 400,
    knps: Math.round((sfEval.nps || 0) / 1000),
    principalVariation: sfEval.pv || [],
    humanWinProbability,
    godWinProbability,
    boardEntropy: 0.15,
    branchesPruned: Math.round((sfEval.nodes || 0) * 0.8),
    coldThought: mateNote
      ? `Stockfish 10+ UCI: ${mateNote} Varian taktis deterministik.`
      : `Stockfish 10+ UCI: Memindai kedalaman ${sfEval.depth || 10} ply (${(sfEval.nodes || 0).toLocaleString()} node) dengan presisi Grandmaster FIDE.`,
    isGeniusTrap: false,
    dynamicScaling: {
      tier: 'STANDARD',
      label: `Stockfish 10+ UCI (Depth ${sfEval.depth || 10})`,
      badgeText: `⚡ STOCKFISH UCI D${sfEval.depth || 10}`,
      badgeColor: 'cyan',
      depth: sfEval.depth || 10,
      qDepth: 0,
      reason: 'Ditenagai langsung oleh Stockfish WebAssembly/WebWorker Engine berstandar FIDE GM.',
    },
  };
}

export default function App() {
  const [chess] = useState(() => new Chess());
  const [, setBoardVersion] = useState(0); // Force re-render on chess state changes

  const [difficulty, setDifficulty] = useState<GameDifficulty>('GOD');
  const [isGodMode, setIsGodMode] = useState<boolean>(true);
  const [humanColor, setHumanColor] = useState<Color>('w');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [theme, setTheme] = useState<BoardTheme>('obsidian');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Saklar: User bebas gerakkan langkah pertama bidak putih Deus di papan beneran
  const [userControlsDeusFirstMove, setUserControlsDeusFirstMove] = useState<boolean>(true);
  const [deusFirstMoveExecuted, setDeusFirstMoveExecuted] = useState<boolean>(false);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [inevitableMove, setInevitableMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showDivineHint, setShowDivineHint] = useState<boolean>(false);

  const [evaluation, setEvaluation] = useState<EpistemicEvaluation | null>(null);

  // Full move branch history (stores SAN moves of the main line)
  const [fullMoveHistory, setFullMoveHistory] = useState<string[]>([]);
  // Current active step index in history: -1 = initial starting board, 0 = move 1, etc.
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  const [oracleResponse, setOracleResponse] = useState<{
    analysis: string;
    inevitableFate: string;
    strategicFlaw?: string;
    epistemicEntropy?: string;
  } | null>(null);
  const [isOracleLoading, setIsOracleLoading] = useState<boolean>(false);

  const [showPhilosophy, setShowPhilosophy] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showStressModal, setShowStressModal] = useState<boolean>(false);

  // Compute captured pieces by counting pieces missing from initial army
  const computeCapturedPieces = useCallback(() => {
    const fullArmy: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          fullArmy[piece.color][piece.type]--;
        }
      }
    }

    const captured: { type: PieceSymbol; color: Color }[] = [];
    (['w', 'b'] as Color[]).forEach(color => {
      (['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).forEach(type => {
        const count = Math.max(0, fullArmy[color][type]);
        for (let i = 0; i < count; i++) {
          captured.push({ type, color });
        }
      });
    });

    return captured;
  }, [chess]);

  // Compute material difference
  const computeMaterialDiff = useCallback(() => {
    const pieceValues: Record<PieceSymbol, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let whiteScore = 0;
    let blackScore = 0;

    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          if (p.color === 'w') whiteScore += pieceValues[p.type];
          else blackScore += pieceValues[p.type];
        }
      }
    }

    return {
      whiteScore,
      blackScore,
      whiteAdvantage: Math.max(0, whiteScore - blackScore),
      blackAdvantage: Math.max(0, blackScore - whiteScore),
    };
  }, [chess]);

  // Update evaluation
  const updateEvaluation = useCallback(() => {
    if (difficulty === 'STOCKFISH') {
      stockfishService.search(chess.fen(), 10, 500).then(sfEval => {
        if (sfEval.bestMove) {
          setEvaluation(convertStockfishToEpistemic(sfEval, chess, humanColor));
        } else {
          const evalData = epistemicEngine.evaluateAndSearch(chess, 'GOD');
          setEvaluation(evalData);
        }
      });
    } else if (difficulty === 'DEUS_EX_MACHINA') {
      // Hybrid evaluation: Deus Epistemic + Stockfish telemetry
      const epistemicEval = epistemicEngine.evaluateAndSearch(chess, 'DEUS_EX_MACHINA');
      stockfishService.search(chess.fen(), 10, 400).then(sfEval => {
        if (sfEval.scoreCentipawns) {
          // Merge centipawns
          const blendedScore = Math.round(
            epistemicEval.evalCentipawns * 0.45 + sfEval.scoreCentipawns * 0.55
          );
          setEvaluation({
            ...epistemicEval,
            evalCentipawns: blendedScore,
            nodesSearched: epistemicEval.nodesSearched + (sfEval.nodes || 50000),
            projectedNodes: 9999000000000,
          });
        } else {
          setEvaluation(epistemicEval);
        }
      });
    } else {
      const evalData = epistemicEngine.evaluateAndSearch(chess, difficulty);
      setEvaluation(evalData);
    }
  }, [chess, difficulty, humanColor]);

  // Initial evaluation on mount or difficulty change
  useEffect(() => {
    updateEvaluation();
  }, [updateEvaluation]);

  // Trigger AI Move
  const triggerAiMove = useCallback(() => {
    if (chess.isGameOver()) return;

    setIsCalculating(true);

    if (difficulty === 'DEUS_EX_MACHINA') {
      // DEUS EX MACHINA ☠️ HYBRID ARBITRATION:
      // Computes both Deus (tactics & traps) and Stockfish (pure precision).
      // If Deus finds an active tactical trap / sacrifice, Deus takes command!
      // Otherwise, if in endgame or cold defense, Stockfish's flawless line is executed.
      const deusEval = epistemicEngine.evaluateAndSearch(chess, 'DEUS_EX_MACHINA');

      stockfishService.search(chess.fen(), 12, 800).then(sfEval => {
        const legalMoves = chess.moves({ verbose: true });
        let chosenMove: Move | null = null;

        if (deusEval.isGeniusTrap && deusEval.bestMoveObj) {
          // Deus trap prioritized
          chosenMove = deusEval.bestMoveObj;
        } else if (sfEval.from && sfEval.to) {
          chosenMove =
            legalMoves.find(
              m =>
                m.from === sfEval.from &&
                m.to === sfEval.to &&
                (!sfEval.promotion || m.promotion === sfEval.promotion)
            ) || null;
        }

        const finalMove = chosenMove || deusEval.bestMoveObj || legalMoves[0];
        setEvaluation(deusEval);

        if (finalMove) {
          const moveRes = chess.move(finalMove);
          if (moveRes) {
            if (deusEval.isGeniusTrap) {
              soundManager.playTrapOrGambit();
            } else if (moveRes.captured) {
              soundManager.playSlash();
            } else {
              soundManager.playGodMove();
            }
            if (chess.inCheck()) {
              soundManager.playCheck();
            }

            setLastMove({ from: moveRes.from as Square, to: moveRes.to as Square });
            const newHist = chess.history();
            setFullMoveHistory(newHist);
            setCurrentMoveIndex(newHist.length - 1);
            setBoardVersion(v => v + 1);

            if (deusEval.principalVariation && deusEval.principalVariation.length > 1) {
              const nextSan = deusEval.principalVariation[1];
              const nextMoves = chess.moves({ verbose: true });
              const foundNext = nextMoves.find(m => m.san === nextSan);
              if (foundNext) {
                setInevitableMove({
                  from: foundNext.from as Square,
                  to: foundNext.to as Square,
                });
              }
            }

            if (chess.isGameOver()) {
              const isWin = chess.isCheckmate() && chess.turn() !== humanColor;
              soundManager.playGameOver(isWin);
            }
          }
        }
        setIsCalculating(false);
      });
      return;
    }

    if (difficulty === 'STOCKFISH') {
      stockfishService.search(chess.fen(), 12, 1000).then(sfEval => {
        let chosenMove: Move | null = null;
        if (sfEval.from && sfEval.to) {
          const legalMoves = chess.moves({ verbose: true });
          chosenMove =
            legalMoves.find(
              m =>
                m.from === sfEval.from &&
                m.to === sfEval.to &&
                (!sfEval.promotion || m.promotion === sfEval.promotion)
            ) || null;
        }

        // Fallback to internal engine if worker didn't provide a valid move
        const fallbackEval = epistemicEngine.evaluateAndSearch(chess, 'GOD');
        const finalMove = chosenMove || fallbackEval.bestMoveObj;
        const finalEval = chosenMove
          ? convertStockfishToEpistemic(sfEval, chess, humanColor)
          : fallbackEval;

        setEvaluation(finalEval);

        if (finalMove) {
          const moveRes = chess.move(finalMove);
          if (moveRes) {
            if (moveRes.captured) {
              soundManager.playSlash();
            } else {
              soundManager.playGodMove();
            }
            if (chess.inCheck()) {
              soundManager.playCheck();
            }

            setLastMove({ from: moveRes.from as Square, to: moveRes.to as Square });
            const newHist = chess.history();
            setFullMoveHistory(newHist);
            setCurrentMoveIndex(newHist.length - 1);
            setBoardVersion(v => v + 1);

            // Predict opponent countermove from PV
            if (sfEval.pv && sfEval.pv.length > 1) {
              const nextUci = sfEval.pv[1];
              const fromSq = nextUci.slice(0, 2) as Square;
              const toSq = nextUci.slice(2, 4) as Square;
              setInevitableMove({ from: fromSq, to: toSq });
            }

            if (chess.isGameOver()) {
              const isWin = chess.isCheckmate() && chess.turn() !== humanColor;
              soundManager.playGameOver(isWin);
            }
          }
        }
        setIsCalculating(false);
      });
      return;
    }

    const delay = isGodMode ? 600 : 380;

    setTimeout(() => {
      const evalData = epistemicEngine.evaluateAndSearch(chess, difficulty);
      setEvaluation(evalData);

      const chosenMove = evalData.bestMoveObj;
      if (chosenMove) {
        const moveRes = chess.move(chosenMove);
        if (moveRes) {
          if (evalData.isGeniusTrap) {
            soundManager.playTrapOrGambit();
          } else if (moveRes.captured) {
            soundManager.playSlash();
          } else if (isGodMode) {
            soundManager.playGodMove();
          } else {
            soundManager.playMove();
          }
          if (chess.inCheck()) {
            soundManager.playCheck();
          }

          setLastMove({ from: moveRes.from as Square, to: moveRes.to as Square });
          const newHist = chess.history();
          setFullMoveHistory(newHist);
          setCurrentMoveIndex(newHist.length - 1);
          setBoardVersion(v => v + 1);

          // Inevitable counter-move predicted from current search's PV if available
          if (evalData.principalVariation && evalData.principalVariation.length > 1) {
            const nextSan = evalData.principalVariation[1];
            const nextMoves = chess.moves({ verbose: true });
            const foundNext = nextMoves.find(m => m.san === nextSan);
            if (foundNext) {
              setInevitableMove({
                from: foundNext.from as Square,
                to: foundNext.to as Square,
              });
            }
          }

          // Check if game ended after AI move
          if (chess.isGameOver()) {
            const isWin = chess.isCheckmate() && chess.turn() !== humanColor;
            soundManager.playGameOver(isWin);
          }
        }
      }
      setIsCalculating(false);
    }, delay);
  }, [chess, difficulty, isGodMode, humanColor]);

  // Status apakah kita sedang menunggu user menentukan gerakan pertama Deus Putih di papan
  const isWaitingForUserDeusMove =
    humanColor === 'b' &&
    currentMoveIndex === -1 &&
    chess.turn() === 'w' &&
    userControlsDeusFirstMove &&
    !deusFirstMoveExecuted;

  // Replay board to a specific historical step (supports both Undo, Redo, and Jump)
  const jumpToMoveIndex = useCallback(
    (targetIndex: number) => {
      if (isCalculating) return;

      const clampedIndex = Math.max(-1, Math.min(fullMoveHistory.length - 1, targetIndex));
      chess.reset();
      epistemicEngine.resetCache();

      let lastExecutedMove: { from: Square; to: Square } | null = null;
      for (let i = 0; i <= clampedIndex; i++) {
        const san = fullMoveHistory[i];
        const res = chess.move(san);
        if (i === clampedIndex && res) {
          lastExecutedMove = { from: res.from as Square, to: res.to as Square };
        }
      }

      setCurrentMoveIndex(clampedIndex);
      setLastMove(lastExecutedMove);
      setBoardVersion(v => v + 1);
      soundManager.playMove();
      updateEvaluation();
    },
    [chess, fullMoveHistory, isCalculating, updateEvaluation]
  );

  // Handle Board Move (Player or First Deus Move)
  const handleMakeMove = (moveInput: { from: Square; to: Square; promotion?: PieceSymbol }) => {
    if (isCalculating || chess.isGameOver()) return false;

    // If player makes a new move from an earlier historical step, prune any forward redo history
    let activeHistory = fullMoveHistory;
    if (currentMoveIndex < fullMoveHistory.length - 1) {
      activeHistory = fullMoveHistory.slice(0, currentMoveIndex + 1);
    }

    const isDeusFirstMoveByHuman =
      humanColor === 'b' &&
      activeHistory.length === 0 &&
      chess.turn() === 'w' &&
      userControlsDeusFirstMove &&
      !deusFirstMoveExecuted;

    try {
      const moveRes = chess.move({
        from: moveInput.from,
        to: moveInput.to,
        promotion: moveInput.promotion || 'q',
      });

      if (!moveRes) return false;

      // Audio feedback
      if (moveRes.captured) {
        soundManager.playSlash();
      } else if (isDeusFirstMoveByHuman && isGodMode) {
        soundManager.playGodMove();
      } else {
        soundManager.playMove();
      }

      if (chess.inCheck()) {
        soundManager.playCheck();
      }

      const updatedHistory = chess.history();
      setFullMoveHistory(updatedHistory);
      setCurrentMoveIndex(updatedHistory.length - 1);
      setLastMove({ from: moveRes.from as Square, to: moveRes.to as Square });
      setBoardVersion(v => v + 1);

      if (isDeusFirstMoveByHuman) {
        setDeusFirstMoveExecuted(true);
        updateEvaluation();
        return true;
      }

      // Check game over
      if (chess.isGameOver()) {
        const isWin = chess.isCheckmate() && chess.turn() !== humanColor;
        soundManager.playGameOver(isWin);
        return true;
      }

      // If normal player move against AI:
      // Allow user's piece to complete its smooth glide animation (200ms) and settle FIRST!
      // Deus will not begin calculating until the user's piece has visibly landed.
      if (chess.turn() !== humanColor) {
        setTimeout(() => {
          updateEvaluation();
          triggerAiMove();
        }, 280);
      } else {
        setTimeout(updateEvaluation, 50);
      }
      return true;
    } catch {
      return false;
    }
  };

  // Switch God Mode
  const handleToggleGodMode = () => {
    const nextState = !isGodMode;
    setIsGodMode(nextState);
    if (nextState) {
      setDifficulty('GOD');
      soundManager.playGodModeActivation(true);
    } else {
      setDifficulty('CLUB');
      soundManager.playGodModeActivation(false);
    }
    setTimeout(updateEvaluation, 50);
  };

  const handleSelectDifficulty = (d: GameDifficulty) => {
    setDifficulty(d);
    setIsGodMode(d === 'GOD');
    if (d === 'GOD' || d === 'STOCKFISH') {
      soundManager.playGodModeActivation(true);
    }
    setTimeout(updateEvaluation, 50);
  };

  const activeEngine: ActiveEngine =
    difficulty === 'DEUS_EX_MACHINA'
      ? 'DEUS_EX_MACHINA'
      : difficulty === 'STOCKFISH'
      ? 'STOCKFISH'
      : 'DEUS';

  const handleSelectEngine = (engine: ActiveEngine) => {
    if (engine === 'DEUS_EX_MACHINA') {
      setDifficulty('DEUS_EX_MACHINA');
      setIsGodMode(true);
      soundManager.playGodModeActivation(true);
    } else if (engine === 'STOCKFISH') {
      setDifficulty('STOCKFISH');
      setIsGodMode(true);
      soundManager.playGodModeActivation(true);
    } else {
      setDifficulty('GOD');
      setIsGodMode(true);
      soundManager.playGodModeActivation(true);
    }
    setTimeout(updateEvaluation, 50);
  };

  // Reset Game
  const handleNewGame = () => {
    chess.reset();
    epistemicEngine.resetCache();
    setLastMove(null);
    setInevitableMove(null);
    setShowDivineHint(false);
    setFullMoveHistory([]);
    setCurrentMoveIndex(-1);
    setOracleResponse(null);
    setDeusFirstMoveExecuted(false);
    setBoardVersion(v => v + 1);
    soundManager.playMove();
    updateEvaluation();

    // Jika pemain memilih Hitam
    if (humanColor === 'b') {
      if (userControlsDeusFirstMove) {
        // Saklar ON: Diam menunggu user klik dan gerakkan bidak putih Deus di papan
      } else {
        // Saklar OFF: Deus auto jalan sendiri dari awal
        setTimeout(() => {
          triggerAiMove();
        }, 150);
      }
    }
  };

  // Undo (Mundur 1 putaran langkah jika giliran AI, atau 1 langkah)
  const handleUndo = () => {
    if (isCalculating || currentMoveIndex < 0) return;
    // Step back 1 move; if now opponent turn and we can step back once more to player's turn, jump cleanly
    let targetIndex = currentMoveIndex - 1;
    if (targetIndex >= 0) {
      // Check turn at targetIndex
      const tempChess = new Chess();
      for (let i = 0; i <= targetIndex; i++) {
        tempChess.move(fullMoveHistory[i]);
      }
      if (tempChess.turn() !== humanColor && targetIndex > 0) {
        targetIndex -= 1;
      }
    }
    jumpToMoveIndex(targetIndex);
  };

  // Redo (Maju 1 putaran langkah ke depan)
  const handleRedo = () => {
    if (isCalculating || currentMoveIndex >= fullMoveHistory.length - 1) return;
    let targetIndex = currentMoveIndex + 1;
    // Check turn at targetIndex
    if (targetIndex < fullMoveHistory.length - 1) {
      const tempChess = new Chess();
      for (let i = 0; i <= targetIndex; i++) {
        tempChess.move(fullMoveHistory[i]);
      }
      if (tempChess.turn() !== humanColor) {
        targetIndex += 1;
      }
    }
    jumpToMoveIndex(targetIndex);
  };

  // Select player color (White or Black)
  const handleSelectHumanColor = (color: Color) => {
    setHumanColor(color);
    setIsFlipped(color === 'b');
    chess.reset();
    epistemicEngine.resetCache();
    setLastMove(null);
    setInevitableMove(null);
    setShowDivineHint(false);
    setFullMoveHistory([]);
    setCurrentMoveIndex(-1);
    setOracleResponse(null);
    setDeusFirstMoveExecuted(false);
    setBoardVersion(v => v + 1);
    soundManager.playMove();

    if (color === 'b') {
      if (userControlsDeusFirstMove) {
        updateEvaluation();
      } else {
        setTimeout(() => {
          triggerAiMove();
        }, 150);
      }
    } else {
      updateEvaluation();
    }
  };

  // Muat posisi FEN dari Suite Tes Ekstrem Deus ke papan permainan
  const handleLoadStressFen = (fen: string, title: string) => {
    try {
      chess.load(fen);
      epistemicEngine.resetCache();
      setLastMove(null);
      setInevitableMove(null);
      setShowDivineHint(false);
      const newHist = chess.history();
      setFullMoveHistory(newHist);
      setCurrentMoveIndex(newHist.length - 1);
      setBoardVersion(v => v + 1);
      soundManager.playGodMove();
      updateEvaluation();
      setIsGodMode(true);
      setDifficulty('GOD');

      // Jika giliran AI di skenario FEN ini, biarkan AI merespon seketika
      if (chess.turn() !== humanColor) {
        setTimeout(() => {
          triggerAiMove();
        }, 300);
      }
    } catch (e) {
      console.error('Gagal memuat FEN tes ekstrem', e);
    }
  };

  // Load a completed Arena game onto the interactive chessboard
  const handleLoadArenaGame = (fen: string) => {
    try {
      chess.load(fen);
      const moves = chess.history();
      setFullMoveHistory(moves);
      setCurrentMoveIndex(moves.length - 1);
      setLastMove(null);
      setInevitableMove(null);
      setBoardVersion(v => v + 1);
      soundManager.playGodMove();
      updateEvaluation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('Gagal memuat laga arena ke papan', e);
    }
  };

  // Flip Board
  const handleFlipBoard = () => {
    setIsFlipped(f => !f);
  };

  // Toggle saklar first move Deus
  const handleToggleUserControlsDeusFirstMove = () => {
    setUserControlsDeusFirstMove(prev => {
      const next = !prev;
      if (!next && humanColor === 'b' && fullMoveHistory.length === 0) {
        setTimeout(() => triggerAiMove(), 100);
      }
      return next;
    });
  };

  // AI Takeover (God Mode or Stockfish executes 1 move for human)
  const handleAiTakeover = async () => {
    if (isCalculating || chess.isGameOver()) return;

    if (difficulty === 'STOCKFISH') {
      setIsCalculating(true);
      const sfEval = await stockfishService.search(chess.fen(), 12, 800);
      let chosenMove: Move | null = null;
      if (sfEval.from && sfEval.to) {
        const legalMoves = chess.moves({ verbose: true });
        chosenMove =
          legalMoves.find(
            m =>
              m.from === sfEval.from &&
              m.to === sfEval.to &&
              (!sfEval.promotion || m.promotion === sfEval.promotion)
          ) || null;
      }
      setIsCalculating(false);

      if (chosenMove) {
        const moveRes = chess.move(chosenMove);
        if (moveRes) {
          if (moveRes.captured) soundManager.playCapture();
          else soundManager.playMove();
          if (chess.inCheck()) soundManager.playCheck();

          const updatedHistory = chess.history();
          setFullMoveHistory(updatedHistory);
          setCurrentMoveIndex(updatedHistory.length - 1);
          setLastMove({ from: moveRes.from as Square, to: moveRes.to as Square });
          setBoardVersion(v => v + 1);

          if (!chess.isGameOver()) {
            triggerAiMove();
          }
          return;
        }
      }
    }

    const evalData = epistemicEngine.evaluateAndSearch(chess, 'GOD');
    if (evalData.bestMoveObj) {
      const moveRes = chess.move(evalData.bestMoveObj);
      if (moveRes) {
        if (moveRes.captured) soundManager.playCapture();
        else soundManager.playMove();
        if (chess.inCheck()) soundManager.playCheck();

        const updatedHistory = chess.history();
        setFullMoveHistory(updatedHistory);
        setCurrentMoveIndex(updatedHistory.length - 1);
        setLastMove({ from: moveRes.from as Square, to: moveRes.to as Square });
        setBoardVersion(v => v + 1);

        if (!chess.isGameOver()) {
          triggerAiMove();
        }
      }
    }
  };

  // Oracle Consultation via server endpoint /api/god-oracle
  const handleConsultOracle = async (query?: string) => {
    setIsOracleLoading(true);
    try {
      const res = await fetch('/api/god-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: chess.fen(),
          history: chess.history(),
          evaluation,
          query,
        }),
      });

      if (!res.ok) {
        throw new Error('Oracle consultation failed');
      }

      const data = await res.json();
      setOracleResponse(data);
    } catch {
      setOracleResponse({
        analysis:
          'Entitas Deus mengamati kerapuhan struktur posisi Anda. Semua cabang kemungkinan telah terhitung dan kepastian matematis telah ditentukan.',
        inevitableFate:
          'Determinisme telah mengunci permainan. Tidak ada deviasi yang dapat membalikkan vektor kemenangan.',
        strategicFlaw: 'Kelemahan koordinasi petak dan hilangnya inisiatif tempo spasial.',
        epistemicEntropy: 'Entropi 0.98 - Runtuhnya seluruh alternatif manusiawi.',
      });
    } finally {
      setIsOracleLoading(false);
    }
  };

  const capturedPieces = computeCapturedPieces();
  const materialDiff = computeMaterialDiff();

  // Status GameOver text
  let gameOverVerdict = '';
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Hitam' : 'Putih';
      gameOverVerdict = `Skakmat. Pemenang: ${winner}. Kepastian absolut tercapai.`;
    } else if (chess.isDraw()) {
      gameOverVerdict = 'Remis (Draw). Entropi posisi menemui keseimbangan sempurna.';
    }
  }

  // Board disable rule: board can be interacted with if not calculating and not game over
  const isBoardDisabled =
    isCalculating ||
    chess.isGameOver() ||
    (!isWaitingForUserDeusMove && chess.turn() !== humanColor && !showDivineHint);

  const canUndo = currentMoveIndex >= 0 && !isCalculating;
  const canRedo = currentMoveIndex < fullMoveHistory.length - 1 && !isCalculating;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${
        isGodMode ? 'bg-neutral-950 text-neutral-100' : 'bg-[#0c0d0e] text-neutral-200'
      }`}
    >
      {/* Top Bar matching contract */}
      <TopNav
        onNewGame={handleNewGame}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onFlipBoard={handleFlipBoard}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          soundManager.enabled = !next;
        }}
        theme={theme}
        onCycleTheme={() => {
          const themes: BoardTheme[] = ['obsidian', 'wood', 'emerald'];
          const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
          setTheme(themes[nextIdx]);
        }}
        onOpenRules={() => setShowRules(true)}
        onOpenPhilosophy={() => setShowPhilosophy(true)}
        onOpenStressTest={() => setShowStressModal(true)}
        onScrollToArena={() => {
          const el = document.getElementById('arena-duel-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        humanColor={humanColor}
        onSelectColor={handleSelectHumanColor}
        userControlsDeusFirstMove={userControlsDeusFirstMove}
        onToggleUserControlsDeusFirstMove={handleToggleUserControlsDeusFirstMove}
        deusFirstMoveExecuted={deusFirstMoveExecuted}
        activeEngine={activeEngine}
        onSelectEngine={handleSelectEngine}
      />

      {/* Main Chess Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Game Over Alert Banner */}
        {chess.isGameOver() && (
          <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-4 flex items-center justify-between shadow-xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-white">
                  Permainan Selesai
                </h3>
                <p className="text-xs font-mono text-neutral-300">{gameOverVerdict}</p>
              </div>
            </div>
            <button
              onClick={handleNewGame}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Main Lagi
            </button>
          </div>
        )}

        {/* 3-Column Chess Arena Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_340px] xl:grid-cols-[auto_1fr_400px] gap-6 items-start">
          {/* Col 1: Vertical Evaluation Bar */}
          <div className="hidden sm:flex justify-center pt-2">
            <EvaluationBar
              evalCentipawns={evaluation?.evalCentipawns ?? 0}
              humanWinProbability={evaluation?.humanWinProbability ?? 50}
              godWinProbability={evaluation?.godWinProbability ?? 50}
              isGodMode={isGodMode}
              isFlipped={isFlipped}
              isCalculating={isCalculating}
              projectedNodes={evaluation?.projectedNodes}
            />
          </div>

          {/* Col 2: The Chess Board & Player HUDs */}
          <div className="flex flex-col items-center">
            {/* Top Opponent (AI) Info Strip */}
            <div className="w-full max-w-[540px] px-2 py-2 flex items-center justify-between text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isFlipped ? 'bg-white' : 'bg-neutral-900 border border-neutral-600'
                  }`}
                />
                <span className="font-semibold text-white">
                  {difficulty === 'STOCKFISH'
                    ? 'STOCKFISH 10+ (Grandmaster UCI)'
                    : isGodMode
                    ? 'DEUS (Pikiran Tuhan)'
                    : `AI (${difficulty})`}
                </span>
                {isCalculating && (
                  <span className="text-[10px] text-amber-400 animate-pulse font-mono">
                    · Menghitung cabang...
                  </span>
                )}
                {isWaitingForUserDeusMove && (
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-mono border border-amber-500/40">
                    Pilih/Drag 1st Move di Board
                  </span>
                )}
              </div>
              <CapturedPieces
                captured={capturedPieces}
                color={isFlipped ? 'w' : 'b'}
                materialAdvantage={isFlipped ? materialDiff.whiteAdvantage : materialDiff.blackAdvantage}
              />
            </div>

            {/* The 8x8 Chessboard */}
            <ChessBoard
              chess={chess}
              isFlipped={isFlipped}
              onMakeMove={handleMakeMove}
              lastMove={lastMove}
              inevitableMove={inevitableMove}
              showDivineHint={showDivineHint}
              isGodMode={isGodMode}
              disabled={isBoardDisabled}
              theme={theme}
              isCalculating={isCalculating}
              isWaitingForUserDeusMove={isWaitingForUserDeusMove}
            />

            {/* Bottom Player (Human) Info Strip */}
            <div className="w-full max-w-[540px] px-2 py-2 flex items-center justify-between text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isFlipped ? 'bg-neutral-900 border border-neutral-600' : 'bg-white'
                  }`}
                />
                <span className="font-semibold text-white">Anda (Manusia)</span>
                {chess.turn() === humanColor && !chess.isGameOver() && (
                  <span className="text-[10px] text-emerald-400 font-mono">· Giliran Anda</span>
                )}
              </div>
              <CapturedPieces
                captured={capturedPieces}
                color={isFlipped ? 'b' : 'w'}
                materialAdvantage={isFlipped ? materialDiff.blackAdvantage : materialDiff.whiteAdvantage}
              />
            </div>
          </div>

          {/* Col 3: Epistemic HUD & Move History */}
          <div className="flex flex-col gap-5 w-full">
            {/* Epistemic HUD (Mind of God + Telemetry + Oracle) */}
            <EpistemicHud
              difficulty={difficulty}
              onSelectDifficulty={handleSelectDifficulty}
              evaluation={evaluation}
              isGodMode={isGodMode}
              onToggleGodMode={handleToggleGodMode}
              onConsultOracle={handleConsultOracle}
              oracleResponse={oracleResponse}
              isOracleLoading={isOracleLoading}
              showDivineHint={showDivineHint}
              onToggleDivineHint={() => setShowDivineHint(s => !s)}
              onAiTakeover={handleAiTakeover}
              onOpenStressTest={() => setShowStressModal(true)}
              activeEngine={activeEngine}
              onSelectEngine={handleSelectEngine}
            />

            {/* Move Notation & Step-by-Step History Navigation */}
            <div className="h-64">
              <MoveHistory
                history={fullMoveHistory}
                currentMoveIndex={currentMoveIndex}
                onSelectMove={jumpToMoveIndex}
                pgn={chess.pgn()}
                fen={chess.fen()}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Universal Mega Arena & Multi-Engine Tournament Dashboard */}
      <ArenaDuelDashboard
        onLoadGameToBoard={handleLoadArenaGame}
        onSelectEngineForMainGame={(engine) => {
          if (engine === 'DEUS_EX_MACHINA') {
            handleSelectDifficulty('DEUS_EX_MACHINA');
          } else if (engine === 'STOCKFISH') {
            handleSelectDifficulty('STOCKFISH');
          } else if (engine === 'DEUS') {
            handleSelectDifficulty('GOD');
          } else if (engine === 'GRANDMASTER') {
            handleSelectDifficulty('GRANDMASTER');
          } else if (engine === 'CLUB') {
            handleSelectDifficulty('CLUB');
          } else {
            handleSelectDifficulty('NOVICE');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <PhilosophyModal isOpen={showPhilosophy} onClose={() => setShowPhilosophy(false)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      <ExtremeStressModal
        isOpen={showStressModal}
        onClose={() => setShowStressModal(false)}
        onLoadFen={handleLoadStressFen}
      />
    </div>
  );
}
