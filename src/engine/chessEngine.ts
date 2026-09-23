/**
 * Deus Chess Epistemic Engine
 * Implements high-performance Alpha-Beta Minimax with Opening Book, Quiescence Search,
 * PeSTO Piece-Square Tables, Transposition Table, and Epistemic Metrics.
 */

import { Chess, Move, Square, PieceSymbol } from 'chess.js';
import { OPENING_BOOK } from './openingBook.ts';

export type GameDifficulty = 'NOVICE' | 'CLUB' | 'GRANDMASTER' | 'GOD';

export interface EpistemicEvaluation {
  bestMove: string;
  bestMoveObj: Move | null;
  evalCentipawns: number;
  depth: number;
  qDepth: number;
  nodesSearched: number;
  searchTimeMs: number;
  knps: number;
  principalVariation: string[];
  humanWinProbability: number;
  boardEntropy: number;
  branchesPruned: number;
  coldThought: string;
}

// Classical Piece Values (Centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (White's perspective, index 0 = a8, 63 = h1)
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const PST_QUEEN = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const PST_KING_MIDDLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

// Static evaluation function: positive favours White, negative favours Black
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  let whiteBishops = 0;
  let blackBishops = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const sqIdx = r * 8 + c;
      const flippedIdx = (7 - r) * 8 + c; // Black views from bottom
      const val = PIECE_VALUES[piece.type];

      let pstBonus = 0;
      switch (piece.type) {
        case 'p':
          pstBonus = piece.color === 'w' ? PST_PAWN[sqIdx] : PST_PAWN[flippedIdx];
          break;
        case 'n':
          pstBonus = piece.color === 'w' ? PST_KNIGHT[sqIdx] : PST_KNIGHT[flippedIdx];
          break;
        case 'b':
          pstBonus = piece.color === 'w' ? PST_BISHOP[sqIdx] : PST_BISHOP[flippedIdx];
          if (piece.color === 'w') whiteBishops++;
          else blackBishops++;
          break;
        case 'r':
          pstBonus = piece.color === 'w' ? PST_ROOK[sqIdx] : PST_ROOK[flippedIdx];
          break;
        case 'q':
          pstBonus = piece.color === 'w' ? PST_QUEEN[sqIdx] : PST_QUEEN[flippedIdx];
          break;
        case 'k':
          pstBonus = piece.color === 'w' ? PST_KING_MIDDLE[sqIdx] : PST_KING_MIDDLE[flippedIdx];
          break;
      }

      if (piece.color === 'w') {
        score += val + pstBonus;
      } else {
        score -= val + pstBonus;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 35;
  if (blackBishops >= 2) score -= 35;

  return score;
}

// Transposition Table Entry
interface TTEntry {
  depth: number;
  score: number;
  flag: 'EXACT' | 'LOWER' | 'UPPER';
  bestMove?: Move;
}

export class EpistemicChessEngine {
  private tt: Map<string, TTEntry> = new Map();
  private nodesCount: number = 0;
  private branchesPruned: number = 0;
  private maxQDepth: number = 0;
  private killerMoves: [Move | null, Move | null][] = Array.from({ length: 30 }, () => [null, null]);

  // Clears transposition cache
  resetCache() {
    this.tt.clear();
    this.killerMoves = Array.from({ length: 30 }, () => [null, null]);
  }

  // Fast Quiescence Search: resolves capture sequences up to depth 3 with delta pruning
  private quiescence(chess: Chess, alpha: number, beta: number, qDepth: number, isMaximizing: boolean): number {
    this.nodesCount++;
    if (qDepth > this.maxQDepth) this.maxQDepth = qDepth;

    const standPat = evaluateBoard(chess);

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;
    }

    // Strict quiescence cutoff to guarantee instant response
    if (qDepth >= 2) return standPat;

    // Search captures only
    const allMoves = chess.moves({ verbose: true });
    const captureMoves = allMoves.filter(m => {
      if (!m.captured) return false;
      // Delta pruning
      const gain = PIECE_VALUES[m.captured] || 0;
      if (isMaximizing && standPat + gain + 200 < alpha) return false;
      if (!isMaximizing && standPat - gain - 200 > beta) return false;
      return true;
    });

    if (captureMoves.length === 0) return standPat;

    // MVV-LVA move ordering for captures
    captureMoves.sort((a, b) => {
      const valA = (PIECE_VALUES[a.captured!] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
      const valB = (PIECE_VALUES[b.captured!] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
      return valB - valA;
    });

    if (isMaximizing) {
      for (const move of captureMoves) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, qDepth + 1, false);
        chess.undo();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
      return alpha;
    } else {
      for (const move of captureMoves) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, qDepth + 1, true);
        chess.undo();

        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
      return beta;
    }
  }

  // Move ordering to trigger faster alpha-beta cutoffs
  private orderMoves(moves: Move[], ply: number, ttMove?: Move): Move[] {
    return moves.sort((a, b) => {
      // 1. Transposition table move gets highest priority
      if (ttMove && a.lan === ttMove.lan) return -10000;
      if (ttMove && b.lan === ttMove.lan) return 10000;

      // 2. Captures (MVV-LVA)
      const scoreA = a.captured ? (PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece]) : 0;
      const scoreB = b.captured ? (PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece]) : 0;

      if (scoreA !== scoreB) return scoreB - scoreA;

      // 3. Killer moves
      if (ply < 30) {
        if (this.killerMoves[ply][0]?.lan === a.lan) return -500;
        if (this.killerMoves[ply][0]?.lan === b.lan) return 500;
        if (this.killerMoves[ply][1]?.lan === a.lan) return -250;
        if (this.killerMoves[ply][1]?.lan === b.lan) return 250;
      }

      // 4. Promotions
      if (a.promotion && !b.promotion) return -800;
      if (!a.promotion && b.promotion) return 800;

      return 0;
    });
  }

  // Alpha-Beta Minimax with Transposition Table
  private minimax(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    ply: number,
    isMaximizing: boolean
  ): { score: number; bestMove?: Move; pv: Move[] } {
    this.nodesCount++;

    if (depth <= 0 || chess.isGameOver()) {
      const qScore = this.quiescence(chess, alpha, beta, 0, isMaximizing);
      return { score: qScore, pv: [] };
    }

    const fenKey = chess.fen().split(' ').slice(0, 4).join(' ');
    const ttEntry = this.tt.get(fenKey);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'EXACT') {
        return { score: ttEntry.score, bestMove: ttEntry.bestMove, pv: ttEntry.bestMove ? [ttEntry.bestMove] : [] };
      }
      if (ttEntry.flag === 'LOWER' && ttEntry.score >= beta) {
        return { score: ttEntry.score, bestMove: ttEntry.bestMove, pv: ttEntry.bestMove ? [ttEntry.bestMove] : [] };
      }
      if (ttEntry.flag === 'UPPER' && ttEntry.score <= alpha) {
        return { score: ttEntry.score, bestMove: ttEntry.bestMove, pv: ttEntry.bestMove ? [ttEntry.bestMove] : [] };
      }
    }

    const rawMoves = chess.moves({ verbose: true });
    if (rawMoves.length === 0) {
      if (chess.isCheck()) {
        return { score: isMaximizing ? -25000 + ply : 25000 - ply, pv: [] };
      }
      return { score: 0, pv: [] }; // Stalemate
    }

    const orderedMoves = this.orderMoves(rawMoves, ply, ttEntry?.bestMove);
    let bestMove: Move | undefined = orderedMoves[0];
    let bestPV: Move[] = [];
    const originalAlpha = alpha;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of orderedMoves) {
        chess.move(move);
        const result = this.minimax(chess, depth - 1, alpha, beta, ply + 1, false);
        chess.undo();

        if (result.score > maxEval) {
          maxEval = result.score;
          bestMove = move;
          bestPV = [move, ...result.pv];
        }
        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) {
          this.branchesPruned++;
          if (!move.captured && ply < 30) {
            this.killerMoves[ply][1] = this.killerMoves[ply][0];
            this.killerMoves[ply][0] = move;
          }
          break;
        }
      }

      let flag: 'EXACT' | 'LOWER' | 'UPPER' = 'EXACT';
      if (maxEval <= originalAlpha) flag = 'UPPER';
      else if (maxEval >= beta) flag = 'LOWER';
      this.tt.set(fenKey, { depth, score: maxEval, flag, bestMove });

      return { score: maxEval, bestMove, pv: bestPV };
    } else {
      let minEval = Infinity;
      for (const move of orderedMoves) {
        chess.move(move);
        const result = this.minimax(chess, depth - 1, alpha, beta, ply + 1, true);
        chess.undo();

        if (result.score < minEval) {
          minEval = result.score;
          bestMove = move;
          bestPV = [move, ...result.pv];
        }
        beta = Math.min(beta, result.score);
        if (beta <= alpha) {
          this.branchesPruned++;
          if (!move.captured && ply < 30) {
            this.killerMoves[ply][1] = this.killerMoves[ply][0];
            this.killerMoves[ply][0] = move;
          }
          break;
        }
      }

      let flag: 'EXACT' | 'LOWER' | 'UPPER' = 'EXACT';
      if (minEval <= originalAlpha) flag = 'UPPER';
      else if (minEval >= beta) flag = 'LOWER';
      this.tt.set(fenKey, { depth, score: minEval, flag, bestMove });

      return { score: minEval, bestMove, pv: bestPV };
    }
  }

  // Calculate Shannon entropy of the position's legal branching space
  private calculateEntropy(chess: Chess): number {
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return 0;

    // Uniform distribution entropy = log2(N)
    // Normalized 0 to 1 where 40 moves is high branching freedom (1.0)
    const rawEntropy = Math.log2(legalMoves.length);
    const normalized = Math.min(1.0, rawEntropy / 5.32);
    return Math.round(normalized * 100) / 100;
  }

  // Primary API to compute the best move and cold epistemic calculation
  public evaluateAndSearch(chess: Chess, mode: GameDifficulty): EpistemicEvaluation {
    this.nodesCount = 0;
    this.branchesPruned = 0;
    this.maxQDepth = 0;

    const startTime = performance.now();
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      return {
        bestMove: '',
        bestMoveObj: null,
        evalCentipawns: 0,
        depth: 0,
        qDepth: 0,
        nodesSearched: 0,
        searchTimeMs: 0,
        knps: 0,
        principalVariation: [],
        humanWinProbability: 0,
        boardEntropy: 0,
        branchesPruned: 0,
        coldThought: 'Papan telah terkunci dalam terminasi definitif.',
      };
    }

    const isWhite = chess.turn() === 'w';

    // 1. Check Grandmaster Opening Book for instant theoretical response
    const cleanFen = chess.fen().split(' ').slice(0, 4).join(' ');
    const bookCandidates = OPENING_BOOK[cleanFen];
    if (bookCandidates && bookCandidates.length > 0) {
      // Pick top opening move or random among top theoretical choices
      const selectedSan = bookCandidates[Math.floor(Math.random() * bookCandidates.length)];
      const matchedMove = legalMoves.find(m => m.san === selectedSan);
      if (matchedMove) {
        const elapsed = Math.max(1, Math.round(performance.now() - startTime));
        const staticScore = evaluateBoard(chess);
        return {
          bestMove: matchedMove.san,
          bestMoveObj: matchedMove,
          evalCentipawns: staticScore,
          depth: 12, // Book theoretical depth
          qDepth: 0,
          nodesSearched: 1,
          searchTimeMs: elapsed,
          knps: 1.0,
          principalVariation: [matchedMove.san],
          humanWinProbability: mode === 'GOD' ? 3.8 : 49.5,
          boardEntropy: this.calculateEntropy(chess),
          branchesPruned: 0,
          coldThought: mode === 'GOD'
            ? `Teori pembukaan sempurna teridentifikasi (${matchedMove.san}). Jalur variasi telah dipetakan hingga ujung rantai.`
            : `Langkah buku pembukaan standar (${matchedMove.san}) untuk mengontrol petak sentral.`,
        };
      }
    }

    // 2. Configure search parameters by difficulty
    // Using optimal depths for rapid response within ~200ms - 800ms
    let targetDepth = 2;
    if (mode === 'NOVICE') {
      targetDepth = 1;
    } else if (mode === 'CLUB') {
      targetDepth = 2;
    } else if (mode === 'GRANDMASTER') {
      targetDepth = 2;
    } else if (mode === 'GOD') {
      // In God Mode, if moves count is small (e.g. endgame or forced positions), depth 3, else depth 2 + Quiescence
      targetDepth = legalMoves.length <= 15 ? 3 : 2;
    }

    // Minimax search
    let bestResult = this.minimax(chess, targetDepth, -Infinity, Infinity, 0, isWhite);

    // Novice blunder injection: 25% chance of choosing a random playable move
    if (mode === 'NOVICE' && Math.random() < 0.28 && legalMoves.length > 1) {
      const nonBestMoves = legalMoves.filter(m => m.lan !== bestResult.bestMove?.lan);
      if (nonBestMoves.length > 0) {
        bestResult.bestMove = nonBestMoves[Math.floor(Math.random() * nonBestMoves.length)];
      }
    }

    const elapsed = Math.max(1, performance.now() - startTime);
    const knps = Math.round((this.nodesCount / elapsed) * 1000) / 1000;

    // Human survival probability calculation
    const evalFromWhite = bestResult.score;
    const whiteProb = 1 / (1 + Math.pow(10, -evalFromWhite / 400));
    const humanProb = isWhite ? (1 - whiteProb) : whiteProb;
    const humanWinPercentage = Math.max(0, Math.min(100, Math.round(humanProb * 10000) / 100));

    // Epistemic cold thought generation
    let coldThought = '';
    const bestSan = bestResult.bestMove?.san || '';

    if (mode === 'GOD') {
      if (bestResult.score > 15000 || bestResult.score < -15000) {
        coldThought = `Skakmat deterministik terverifikasi. Seluruh variasi pertahanan lawan runtuh tanpa sisa.`;
      } else if (Math.abs(bestResult.score) > 400) {
        coldThought = `Entropi posisional kolaps. Variasi ${bestSan} mengunci struktur perwira lawan dalam asimetri fatal.`;
      } else if (Math.abs(bestResult.score) > 150) {
        coldThought = `Kelemahan struktur pion telah diisolasi. Perhitungan multi-cabang memastikan degradasi tempo lawan.`;
      } else {
        coldThought = `Langkah ${bestSan} menyeimbangkan tegangan papan pada koordinat optimal dengan presisi dingin mutlak.`;
      }
    } else if (mode === 'GRANDMASTER') {
      coldThought = `Langkah solid ${bestSan}. Mempertahankan inisiatif dan membatasi mobilitas lawan.`;
    } else if (mode === 'CLUB') {
      coldThought = `Mengembangkan perwira ke ${bestSan} untuk mengontrol petak strategis.`;
    } else {
      coldThought = `Langkah santai ${bestSan}, mari kita lihat respon Anda!`;
    }

    const pvStrings = (bestResult.pv || []).map(m => m.san);

    return {
      bestMove: bestResult.bestMove?.san || legalMoves[0].san,
      bestMoveObj: bestResult.bestMove || legalMoves[0],
      evalCentipawns: bestResult.score,
      depth: targetDepth,
      qDepth: this.maxQDepth,
      nodesSearched: this.nodesCount,
      searchTimeMs: Math.round(elapsed),
      knps,
      principalVariation: pvStrings.slice(0, 6),
      humanWinProbability: mode === 'GOD' ? Math.min(humanWinPercentage, 4.2) : humanWinPercentage,
      boardEntropy: this.calculateEntropy(chess),
      branchesPruned: this.branchesPruned,
      coldThought,
    };
  }
}

export const epistemicEngine = new EpistemicChessEngine();
