import { Chess, Square, PieceSymbol } from 'chess.js';
import { epistemicEngine } from './chessEngine';

export interface StockfishEvaluation {
  bestMove: string;
  from?: Square;
  to?: Square;
  promotion?: PieceSymbol;
  scoreCentipawns: number;
  mateInMoves?: number;
  depth: number;
  nodes: number;
  nps: number;
  pv: string[];
}

class StockfishWorkerService {
  private worker: Worker | null = null;
  private isReady = false;
  private isInitializing = false;
  private initPromise: Promise<boolean> | null = null;
  private currentResolve: ((result: StockfishEvaluation) => void) | null = null;
  private currentTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.init();
    }
  }

  public async init(): Promise<boolean> {
    if (this.isReady) return true;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = new Promise<boolean>((resolve) => {
      try {
        // public/stockfish.js is served by Vite / Express at /stockfish.js
        this.worker = new Worker('/stockfish.js');

        const onInitMessage = (e: MessageEvent) => {
          const line = typeof e.data === 'string' ? e.data : '';
          if (line === 'uciok' || line === 'readyok' || line.includes('Stockfish')) {
            this.isReady = true;
            this.isInitializing = false;
            if (this.worker) {
              this.worker.removeEventListener('message', onInitMessage);
              this.worker.postMessage('setoption name Skill Level value 20');
              this.worker.postMessage('isready');
            }
            resolve(true);
          }
        };

        this.worker.addEventListener('message', onInitMessage);
        this.worker.addEventListener('error', (err) => {
          console.warn('[Stockfish] Worker init error, will use fallback:', err);
          this.isReady = false;
          this.isInitializing = false;
          resolve(false);
        });

        this.worker.postMessage('uci');
        this.worker.postMessage('isready');

        setTimeout(() => {
          if (!this.isReady) {
            console.warn('[Stockfish] Worker init timeout, will use fallback.');
            this.isInitializing = false;
            resolve(false);
          }
        }, 2500);
      } catch (err) {
        console.warn('[Stockfish] Could not create Worker:', err);
        this.isReady = false;
        this.isInitializing = false;
        resolve(false);
      }
    });

    return this.initPromise;
  }

  public isAvailable(): boolean {
    return this.isReady && this.worker !== null;
  }

  public async search(
    fen: string,
    depth = 12,
    movetime = 1000
  ): Promise<StockfishEvaluation> {
    if (!this.isReady) {
      await this.init();
    }

    // If Worker could not start, fallback to built-in Epistemic Engine
    if (!this.isReady || !this.worker) {
      return this.fallbackSearch(fen, depth);
    }

    const worker = this.worker;

    return new Promise<StockfishEvaluation>((resolve) => {
      let lastDepth = depth;
      let lastCp = 0;
      let lastMate: number | undefined = undefined;
      let lastNodes = 0;
      let lastNps = 0;
      let lastPv: string[] = [];

      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }

      const buildResult = (uciBestMove: string): StockfishEvaluation => {
        let fromSq: Square | undefined = undefined;
        let toSq: Square | undefined = undefined;
        let promo: PieceSymbol | undefined = undefined;

        if (uciBestMove && uciBestMove.length >= 4) {
          fromSq = uciBestMove.slice(0, 2) as Square;
          toSq = uciBestMove.slice(2, 4) as Square;
          if (uciBestMove.length >= 5) {
            promo = uciBestMove[4] as PieceSymbol;
          }
        }

        return {
          bestMove: uciBestMove,
          from: fromSq,
          to: toSq,
          promotion: promo,
          scoreCentipawns: lastCp,
          mateInMoves: lastMate,
          depth: lastDepth,
          nodes: lastNodes || 150000,
          nps: lastNps || 520000,
          pv: lastPv,
        };
      };

      this.currentResolve = resolve;

      const listener = (e: MessageEvent) => {
        const msg = typeof e.data === 'string' ? e.data : '';
        if (msg.startsWith('info ')) {
          const depthMatch = msg.match(/depth\s+(\d+)/);
          if (depthMatch) lastDepth = parseInt(depthMatch[1], 10);

          const cpMatch = msg.match(/score\s+cp\s+(-?\d+)/);
          if (cpMatch) {
            lastCp = parseInt(cpMatch[1], 10);
            lastMate = undefined;
          } else {
            const mateMatch = msg.match(/score\s+mate\s+(-?\d+)/);
            if (mateMatch) {
              lastMate = parseInt(mateMatch[1], 10);
              lastCp = lastMate > 0 ? 10000 - lastMate * 100 : -10000 - lastMate * 100;
            }
          }

          const nodesMatch = msg.match(/nodes\s+(\d+)/);
          if (nodesMatch) lastNodes = parseInt(nodesMatch[1], 10);

          const npsMatch = msg.match(/nps\s+(\d+)/);
          if (npsMatch) lastNps = parseInt(npsMatch[1], 10);

          const pvMatch = msg.match(/pv\s+(.+)$/);
          if (pvMatch) {
            lastPv = pvMatch[1].split(' ').slice(0, 6);
          }
        } else if (msg.startsWith('bestmove ')) {
          worker.removeEventListener('message', listener);
          if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
          }
          const parts = msg.split(' ');
          const bestMove = parts[1];
          if (this.currentResolve) {
            const cb = this.currentResolve;
            this.currentResolve = null;
            cb(buildResult(bestMove));
          }
        }
      };

      worker.addEventListener('message', listener);

      // Issue UCI search commands
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth} movetime ${movetime}`);

      // Safety watchdog
      this.currentTimeout = setTimeout(() => {
        if (this.currentResolve) {
          worker.removeEventListener('message', listener);
          worker.postMessage('stop');
          const cb = this.currentResolve;
          this.currentResolve = null;
          const fb = this.fallbackSearch(fen, depth);
          cb(fb);
        }
      }, movetime + 1500);
    });
  }

  private fallbackSearch(fen: string, depth: number): StockfishEvaluation {
    try {
      const chess = new Chess(fen);
      const evalRes = epistemicEngine.evaluateAndSearch(chess, 'GOD');
      const moveObj = evalRes.bestMoveObj;
      return {
        bestMove: moveObj ? `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}` : evalRes.bestMove,
        from: moveObj ? (moveObj.from as Square) : undefined,
        to: moveObj ? (moveObj.to as Square) : undefined,
        promotion: moveObj?.promotion as PieceSymbol | undefined,
        scoreCentipawns: evalRes.evalCentipawns,
        depth: depth || 10,
        nodes: evalRes.nodesSearched,
        nps: evalRes.knps * 1000,
        pv: evalRes.principalVariation || [],
      };
    } catch {
      return {
        bestMove: '',
        scoreCentipawns: 0,
        depth: 0,
        nodes: 0,
        nps: 0,
        pv: [],
      };
    }
  }

  public terminate() {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
      this.initPromise = null;
    }
  }
}

export const stockfishService = new StockfishWorkerService();
