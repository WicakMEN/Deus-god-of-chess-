import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  CombatantId,
  COMBATANTS,
  UniversalArenaStats,
  DuelGameRecord,
  loadUniversalStats,
  saveUniversalStats,
  resetUniversalStats,
  simulateUniversalMatch,
  getH2HKey,
  UniversalTournamentProgress,
} from '../engine/arenaRunner';
import {
  Swords,
  Trophy,
  Zap,
  RotateCcw,
  Play,
  Square as StopIcon,
  Shield,
  Eye,
  Cpu,
  BarChart3,
  Flame,
  ExternalLink,
  History,
  Sparkles,
  ArrowRightLeft,
  Skull,
  Award,
} from 'lucide-react';

interface ArenaDuelDashboardProps {
  onLoadGameToBoard?: (fen: string, pgn?: string) => void;
  onSelectEngineForMainGame?: (engine: CombatantId) => void;
}

export const ArenaDuelDashboard: React.FC<ArenaDuelDashboardProps> = ({
  onLoadGameToBoard,
  onSelectEngineForMainGame,
}) => {
  const [stats, setStats] = useState<UniversalArenaStats>(() => loadUniversalStats());
  const [selectedRounds, setSelectedRounds] = useState<number>(1000);
  const [fighterA, setFighterA] = useState<CombatantId>('DEUS_EX_MACHINA');
  const [fighterB, setFighterB] = useState<CombatantId>('STOCKFISH');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<UniversalTournamentProgress>({
    currentRound: 0,
    totalRounds: 0,
    fighterA: 'DEUS_EX_MACHINA',
    fighterB: 'STOCKFISH',
    winsA: 0,
    winsB: 0,
    draws: 0,
    percentage: 0,
    latestGame: null,
    status: 'IDLE',
  });
  const [activeTab, setActiveTab] = useState<'MATCHUP' | 'LEADERBOARD' | 'DEUS_EX_MACHINA' | 'STRENGTHS' | 'LOGS'>('MATCHUP');
  const [logFilter, setLogFilter] = useState<'ALL' | 'WINS' | 'DRAWS'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const abortRef = useRef<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    saveUniversalStats(stats);
  }, [stats]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSwapFighters = () => {
    setFighterA(fighterB);
    setFighterB(fighterA);
  };

  const startSimulation = (rounds: number) => {
    if (isRunning) return;
    if (fighterA === fighterB) {
      showNotification('Pilih dua petarung yang berbeda untuk diadu!');
      return;
    }

    setIsRunning(true);
    abortRef.current = false;

    let winsA = 0;
    let winsB = 0;
    let draws = 0;

    const newRecentGames: DuelGameRecord[] = [];
    const combatantList = Object.keys(COMBATANTS) as CombatantId[];
    const h2hKey = getH2HKey(fighterA, fighterB);

    let round = 0;
    const batchSize = Math.max(1, Math.min(30, Math.ceil(rounds / 35)));

    const processBatch = () => {
      if (abortRef.current) {
        setIsRunning(false);
        setProgress(p => ({ ...p, status: 'IDLE' }));
        showNotification('Simulasi dihentikan pengguna.');
        return;
      }

      const limit = Math.min(round + batchSize, rounds);
      let lastGame: DuelGameRecord | null = null;

      for (; round < limit; round++) {
        const gameId = stats.totalGames + round + 1;
        const game = simulateUniversalMatch(gameId, fighterA, fighterB, round);
        lastGame = game;

        if (game.winner === fighterA) {
          winsA++;
        } else if (game.winner === fighterB) {
          winsB++;
        } else {
          draws++;
        }

        if (newRecentGames.length < 20) {
          newRecentGames.unshift(game);
        }
      }

      const pct = Math.round((round / rounds) * 100);
      setProgress({
        currentRound: round,
        totalRounds: rounds,
        fighterA,
        fighterB,
        winsA,
        winsB,
        draws,
        percentage: pct,
        latestGame: lastGame,
        status: 'RUNNING',
      });

      if (round < rounds) {
        requestAnimationFrame(() => {
          setTimeout(processBatch, 4);
        });
      } else {
        setIsRunning(false);
        setProgress(p => ({ ...p, percentage: 100, status: 'COMPLETED' }));

        startTransition(() => {
          setStats(prev => {
            const newWins = { ...prev.combatantWins };
            newWins[fighterA] = (newWins[fighterA] || 0) + winsA;
            newWins[fighterB] = (newWins[fighterB] || 0) + winsB;

            const newH2H = { ...prev.headToHead };
            const currentH2H = newH2H[h2hKey] || { games: 0, winsA: 0, winsB: 0, draws: 0 };

            // Determine orientation of wins in H2H
            const sorted = [fighterA, fighterB].sort();
            const aIsFirst = sorted[0] === fighterA;

            newH2H[h2hKey] = {
              games: currentH2H.games + rounds,
              winsA: currentH2H.winsA + (aIsFirst ? winsA : winsB),
              winsB: currentH2H.winsB + (aIsFirst ? winsB : winsA),
              draws: currentH2H.draws + draws,
            };

            // Dynamic Elo micro adjustments
            const newElo = { ...prev.currentElo };
            const kFactor = 16;
            const actualA = (winsA + draws * 0.5) / rounds;
            const expectedA =
              1 / (1 + Math.pow(10, -(newElo[fighterA] - newElo[fighterB]) / 400));
            const delta = Math.round(kFactor * (actualA - expectedA) * Math.min(10, rounds / 50));
            newElo[fighterA] = Math.max(800, newElo[fighterA] + delta);
            newElo[fighterB] = Math.max(800, newElo[fighterB] - delta);

            return {
              totalGames: prev.totalGames + rounds,
              combatantWins: newWins,
              headToHead: newH2H,
              currentElo: newElo,
              recentGames: [...newRecentGames, ...prev.recentGames].slice(0, 40),
              lastUpdated: new Date().toISOString(),
            };
          });
        });

        showNotification(
          `Selesai! Duel ${rounds} laga antara ${COMBATANTS[fighterA].name} vs ${COMBATANTS[fighterB].name} tersimpan ke web.`
        );
      }
    };

    requestAnimationFrame(processBatch);
  };

  const stopSimulation = () => {
    abortRef.current = true;
  };

  const handleReset = () => {
    if (confirm('Yakin ingin mereset seluruh rekor Megaduel ke data awal?')) {
      const fresh = resetUniversalStats();
      setStats(fresh);
      setProgress({
        currentRound: 0,
        totalRounds: 0,
        fighterA,
        fighterB,
        winsA: 0,
        winsB: 0,
        draws: 0,
        percentage: 0,
        latestGame: null,
        status: 'IDLE',
      });
      showNotification('Data rekor Megaduel di-reset ke baseline awal.');
    }
  };

  // Current matchup H2H metrics
  const h2hKey = getH2HKey(fighterA, fighterB);
  const h2hRecord = stats.headToHead[h2hKey] || { games: 0, winsA: 0, winsB: 0, draws: 0 };
  const sorted = [fighterA, fighterB].sort();
  const aIsFirst = sorted[0] === fighterA;
  const fighterAWinsTotal = aIsFirst ? h2hRecord.winsA : h2hRecord.winsB;
  const fighterBWinsTotal = aIsFirst ? h2hRecord.winsB : h2hRecord.winsA;
  const h2hGames = Math.max(1, h2hRecord.games);

  const pctA = ((fighterAWinsTotal / h2hGames) * 100).toFixed(1);
  const pctB = ((fighterBWinsTotal / h2hGames) * 100).toFixed(1);
  const pctDraw = ((h2hRecord.draws / h2hGames) * 100).toFixed(1);

  const profA = COMBATANTS[fighterA];
  const profB = COMBATANTS[fighterB];

  // Leaderboard ranking
  const leaderboard = (Object.keys(COMBATANTS) as CombatantId[]).sort((a, b) => {
    return (stats.currentElo[b] || 0) - (stats.currentElo[a] || 0);
  });

  return (
    <section id="arena-duel-section" className="w-full max-w-7xl mx-auto mt-8 mb-12 px-4 scroll-mt-20">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-purple-500/80 text-purple-200 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-neutral-950/95 border border-neutral-800/90 rounded-2xl p-5 md:p-7 shadow-[0_0_60px_rgba(0,0,0,0.85)] backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute top-0 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300">
                <Skull className="w-5 h-5 animate-pulse text-purple-400" />
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Arena Megaduel Multi-Engine: <span className="text-purple-400">Deus ex Machina ☠️</span> vs Semua
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-purple-700/60 text-purple-300">
                Sintesis Deus + Stockfish Aktif
              </span>
            </div>
            <p className="text-xs md:text-sm text-neutral-400">
              Adu siapa pun secara bebas: <strong>Deus ex Machina</strong>, <strong>Stockfish 10+ UCI</strong>, <strong>Deus Epistemic</strong>, <strong>Grandmaster</strong>, <strong>Club</strong>, hingga <strong>Novice</strong> hingga 1.000 kali pertempuran!
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-xl p-1 text-xs">
              {([10, 50, 100, 1000] as const).map(num => (
                <button
                  key={num}
                  disabled={isRunning}
                  onClick={() => setSelectedRounds(num)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                    selectedRounds === num
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {num}x
                </button>
              ))}
            </div>

            {isRunning ? (
              <button
                onClick={stopSimulation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                <StopIcon className="w-3.5 h-3.5 fill-current" />
                <span>Hentikan Duel</span>
              </button>
            ) : (
              <button
                onClick={() => startSimulation(selectedRounds)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Adu {selectedRounds} Laga Sekarang!</span>
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={isRunning}
              title="Reset ke rekor awal"
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Simulation Progress Banner */}
        {isRunning && (
          <div className="mt-5 p-4 rounded-xl bg-neutral-900/90 border border-purple-500/50 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-2 flex-wrap gap-2">
              <span className="font-mono text-purple-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 animate-spin text-purple-400" />
                Simulasi Berjalan: Laga {progress.currentRound} / {progress.totalRounds} ({progress.percentage}%)
              </span>
              <span className="font-mono text-neutral-300">
                {COMBATANTS[fighterA].name}: <span className="text-purple-400 font-bold">{progress.winsA}</span> |{' '}
                {COMBATANTS[fighterB].name}: <span className="text-cyan-400 font-bold">{progress.winsB}</span> | Remis:{' '}
                <span className="text-amber-400 font-bold">{progress.draws}</span>
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-150"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {progress.latestGame && (
              <div className="mt-2 text-[11px] text-neutral-400 font-mono truncate">
                Laga #{progress.latestGame.id}: {progress.latestGame.openingName} · Pemenang:{' '}
                <strong className="text-white font-bold">{COMBATANTS[progress.latestGame.winner as CombatantId]?.name || 'REMIS'}</strong>{' '}
                ({progress.latestGame.movesCount} langkah · {progress.latestGame.termination})
              </div>
            )}
          </div>
        )}

        {/* Matchup Selection Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Fighter A Selector */}
          <div className="flex-1 w-full">
            <label className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
              Petarung 1 (Sudut Kiri)
            </label>
            <select
              value={fighterA}
              disabled={isRunning}
              onChange={e => setFighterA(e.target.value as CombatantId)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {(Object.keys(COMBATANTS) as CombatantId[]).map(id => (
                <option key={id} value={id}>
                  {COMBATANTS[id].name} ({COMBATANTS[id].badge})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapFighters}
            disabled={isRunning}
            title="Tukar Posisi Petarung"
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
          </button>

          {/* Fighter B Selector */}
          <div className="flex-1 w-full">
            <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              Petarung 2 (Sudut Kanan)
            </label>
            <select
              value={fighterB}
              disabled={isRunning}
              onChange={e => setFighterB(e.target.value as CombatantId)}
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {(Object.keys(COMBATANTS) as CombatantId[]).map(id => (
                <option key={id} value={id}>
                  {COMBATANTS[id].name} ({COMBATANTS[id].badge})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Head-to-Head Active Matchup Showcase */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Fighter A Card */}
          <div
            className="relative p-5 rounded-2xl bg-neutral-900/60 border overflow-hidden flex flex-col justify-between"
            style={{ borderColor: `${profA.colorHex}55` }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{ backgroundColor: `${profA.colorHex}22` }}
            />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${profA.colorHex}33`, color: profA.colorHex }}
                  >
                    {fighterA === 'DEUS_EX_MACHINA' ? '☠️' : fighterA === 'STOCKFISH' ? '⚡' : '♟️'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-none">{profA.name}</h3>
                    <span className="text-[10px] font-mono opacity-80" style={{ color: profA.colorHex }}>
                      {profA.title}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-neutral-400 block">Rating ELO</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {stats.currentElo[fighterA] || profA.baseElo}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl md:text-4xl font-black font-mono text-white">
                  {fighterAWinsTotal}
                </span>
                <span className="text-sm font-semibold" style={{ color: profA.colorHex }}>
                  Menang vs {profB.name} ({pctA}%)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                {profA.description}
              </p>
            </div>

            {onSelectEngineForMainGame && (
              <button
                onClick={() => onSelectEngineForMainGame(fighterA)}
                className="mt-4 w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Pakai {profA.name} di Papan Utama</span>
              </button>
            )}
          </div>

          {/* Central H2H Comparison & Verdict */}
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between items-center text-center">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 inline-flex items-center gap-1.5">
                <Trophy className="w-3 h-3" />
                HEAD-TO-HEAD: {h2hRecord.games} LAGA TERCATAT
              </span>

              <h4 className="text-base font-bold text-white mt-3">
                {fighterAWinsTotal > fighterBWinsTotal
                  ? `${profA.name} Unggul Telak`
                  : fighterBWinsTotal > fighterAWinsTotal
                  ? `${profB.name} Menguasai Duel`
                  : 'Hasil Seimbang Sempurna'}
              </h4>

              {/* Progress Visual Bar */}
              <div className="w-full mt-4">
                <div className="flex justify-between text-xs font-mono font-semibold mb-1">
                  <span style={{ color: profA.colorHex }}>
                    {profA.name.split(' ')[0]} {pctA}%
                  </span>
                  <span className="text-amber-400">Remis {pctDraw}%</span>
                  <span style={{ color: profB.colorHex }}>
                    {profB.name.split(' ')[0]} {pctB}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-neutral-950 overflow-hidden flex border border-neutral-800">
                  <div className="h-full" style={{ width: `${pctA}%`, backgroundColor: profA.colorHex }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${pctDraw}%` }} />
                  <div className="h-full" style={{ width: `${pctB}%`, backgroundColor: profB.colorHex }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
                <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Menang {profA.name.split(' ')[0]}</span>
                  <span className="text-white font-bold">{fighterAWinsTotal}</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Total Remis</span>
                  <span className="text-amber-400 font-bold">{h2hRecord.draws}</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block">Menang {profB.name.split(' ')[0]}</span>
                  <span className="text-white font-bold">{fighterBWinsTotal}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 mt-4 leading-relaxed">
              💡 <strong>Status:</strong> Klik tombol <em>"Adu {selectedRounds} Laga Sekarang!"</em> di atas untuk menjalankan pertandingan simultan tanpa batas.
            </p>
          </div>

          {/* Fighter B Card */}
          <div
            className="relative p-5 rounded-2xl bg-neutral-900/60 border overflow-hidden flex flex-col justify-between"
            style={{ borderColor: `${profB.colorHex}55` }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{ backgroundColor: `${profB.colorHex}22` }}
            />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${profB.colorHex}33`, color: profB.colorHex }}
                  >
                    {fighterB === 'DEUS_EX_MACHINA' ? '☠️' : fighterB === 'STOCKFISH' ? '⚡' : '♟️'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-none">{profB.name}</h3>
                    <span className="text-[10px] font-mono opacity-80" style={{ color: profB.colorHex }}>
                      {profB.title}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-neutral-400 block">Rating ELO</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {stats.currentElo[fighterB] || profB.baseElo}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl md:text-4xl font-black font-mono text-white">
                  {fighterBWinsTotal}
                </span>
                <span className="text-sm font-semibold" style={{ color: profB.colorHex }}>
                  Menang vs {profA.name} ({pctB}%)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                {profB.description}
              </p>
            </div>

            {onSelectEngineForMainGame && (
              <button
                onClick={() => onSelectEngineForMainGame(fighterB)}
                className="mt-4 w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Pakai {profB.name} di Papan Utama</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-7 border-b border-neutral-800 pb-2 overflow-x-auto">
          {[
            { key: 'MATCHUP', label: 'Duel Matchup Bebas', icon: Swords },
            { key: 'LEADERBOARD', label: 'Klasemen Global (Leaderboard)', icon: Award },
            { key: 'DEUS_EX_MACHINA', label: 'Tentang Deus ex Machina ☠️', icon: Skull },
            { key: 'STRENGTHS', label: 'Matriks Kekuatan 6 Petarung', icon: Shield },
            { key: 'LOGS', label: 'Riwayat Laga Terkini', icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-purple-300 border border-purple-700/60 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: MATCHUP */}
        {activeTab === 'MATCHUP' && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  title: '☠️ Deus ex Machina vs Stockfish',
                  sub: 'Pertarungan puncak dua raksasa komputasi',
                  a: 'DEUS_EX_MACHINA' as CombatantId,
                  b: 'STOCKFISH' as CombatantId,
                },
                {
                  title: '☠️ Deus ex Machina vs Deus Biasa',
                  sub: 'Bocah bertaring lawan wujud sempurnanya',
                  a: 'DEUS_EX_MACHINA' as CombatantId,
                  b: 'DEUS' as CombatantId,
                },
                {
                  title: '🔥 Deus AI vs Stockfish UCI',
                  sub: 'Duel orisinal 1.000 ronde',
                  a: 'DEUS' as CombatantId,
                  b: 'STOCKFISH' as CombatantId,
                },
                {
                  title: '⚡ Stockfish vs Grandmaster FIDE',
                  sub: 'Mesin dingin membantai master manusia',
                  a: 'STOCKFISH' as CombatantId,
                  b: 'GRANDMASTER' as CombatantId,
                },
                {
                  title: '🎖️ Grandmaster vs Club Champion',
                  sub: 'Kelas master internasional vs lokal',
                  a: 'GRANDMASTER' as CombatantId,
                  b: 'CLUB' as CombatantId,
                },
                {
                  title: '♟️ Club Champion vs Novice',
                  sub: 'Ujian dasar pemula catur',
                  a: 'CLUB' as CombatantId,
                  b: 'NOVICE' as CombatantId,
                },
              ].map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFighterA(preset.a);
                    setFighterB(preset.b);
                  }}
                  className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-600/60 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-white text-xs group-hover:text-purple-300">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">{preset.sub}</div>
                  <div className="mt-2 text-[10px] font-mono text-purple-400">Klik untuk pasang duel ➔</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: LEADERBOARD */}
        {activeTab === 'LEADERBOARD' && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-neutral-400">
              Peringkat resmi 6 mesin catur berdasarkan kemenangan total & rating ELO turnamen:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="py-2.5 px-3">Peringkat</th>
                    <th className="py-2.5 px-3">Mesin Petarung</th>
                    <th className="py-2.5 px-3">Titel & Badge</th>
                    <th className="py-2.5 px-3 text-center">Rating ELO</th>
                    <th className="py-2.5 px-3 text-center text-purple-300">Total Kemenangan</th>
                    <th className="py-2.5 px-3 text-right">Power Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {leaderboard.map((id, index) => {
                    const prof = COMBATANTS[id];
                    const wins = stats.combatantWins[id] || 0;
                    const elo = stats.currentElo[id] || prof.baseElo;

                    return (
                      <tr key={id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-3 font-bold text-neutral-400">
                          {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prof.colorHex }} />
                          <span>{prof.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: `${prof.colorHex}22`, color: prof.colorHex }}
                          >
                            {prof.badge}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">{elo}</td>
                        <td className="py-3 px-3 text-center font-bold text-purple-300">{wins} Menang</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-white font-bold">{prof.powerRating}/100</span>
                            <div className="w-16 h-2 bg-neutral-950 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${prof.powerRating}%`,
                                  backgroundColor: prof.colorHex,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: DEUS EX MACHINA */}
        {activeTab === 'DEUS_EX_MACHINA' && (
          <div className="mt-5 p-5 rounded-2xl bg-neutral-900/70 border border-purple-800/60 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700 text-purple-300 flex items-center justify-center text-xl">
                ☠️
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Deus ex Machina: Lahirnya Entitas Sempurna</h3>
                <span className="text-xs font-mono text-purple-400">
                  Arsitektur Sintesis Epistemik + Stockfish 10+ UCI (3724+ ELO)
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
              <strong>Deus ex Machina</strong> lahir dari penggabungan dua filosofi catur paling ekstrem di dunia:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-rose-900/50">
                <h4 className="font-bold text-rose-400 mb-1">🔥 Jiwa Deus Epistemic (Trojan Gambiteer)</h4>
                <p className="text-neutral-400 leading-relaxed">
                  Memberikan insting pemangsa, umpan pengorbanan racun, dan deteksi kelemahan psikologis lawan. Deus ex Machina tidak pernah bermain pasif atau membosankan.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-cyan-900/50">
                <h4 className="font-bold text-cyan-400 mb-1">⚡ Otak Stockfish 10+ UCI (Cold Calculation)</h4>
                <p className="text-neutral-400 leading-relaxed">
                  Menyediakan verifikasi kedalaman 14+ ply dan presisi endgame 0% blunder. Stockfish memastikan bahwa setiap serangan liar Deus didasarkan pada kebenaran kalkulasi deterministik mutlak.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200">
              👑 <strong>Hasil Sintesis:</strong> Deus ex Machina memenangkan <strong>~68% duel</strong> melawan Stockfish murni dan <strong>~72% duel</strong> melawan Deus murni, menjadikannya entitas catur tertinggi yang pernah ada di aplikasi ini.
            </div>
          </div>
        )}

        {/* Tab 4: STRENGTHS */}
        {activeTab === 'STRENGTHS' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-neutral-400">
              Perbandingan 6 dimensi kekuatan untuk semua mesin petarung:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(COMBATANTS) as CombatantId[]).map(id => {
                const p = COMBATANTS[id];
                return (
                  <div
                    key={id}
                    className="p-4 rounded-xl bg-neutral-900/60 border space-y-2.5"
                    style={{ borderColor: `${p.colorHex}44` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{p.name}</span>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${p.colorHex}22`, color: p.colorHex }}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      {[
                        { label: 'Kedalaman Taktis', val: p.strengths.tacticalDepth },
                        { label: 'Presisi Babak Akhir (Endgame)', val: p.strengths.endgamePrecision },
                        { label: 'Jebakan Chaos & Trojan', val: p.strengths.chaosTraps },
                        { label: 'Inisiatif Serangan', val: p.strengths.attackAggression },
                        { label: 'Soliditas Pertahanan', val: p.strengths.defenseSolidity },
                        { label: 'Kecepatan Komputasi (NPS)', val: p.strengths.speedNps },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <span className="text-neutral-400 truncate">{item.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-neutral-200">{item.val}%</span>
                            <div className="w-16 h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.val}%`, backgroundColor: p.colorHex }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: LOGS */}
        {activeTab === 'LOGS' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-neutral-400">
                Menampilkan {stats.recentGames.length} duel multi-engine terbaru:
              </span>

              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-[11px]">
                {(['ALL', 'WINS', 'DRAWS'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2.5 py-1 rounded-md font-mono ${
                      logFilter === f
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {stats.recentGames
                .filter(g => {
                  if (logFilter === 'DRAWS') return g.winner === 'DRAW';
                  if (logFilter === 'WINS') return g.winner !== 'DRAW';
                  return true;
                })
                .map(game => {
                  const winnerProf = COMBATANTS[game.winner as CombatantId];
                  return (
                    <div
                      key={game.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="font-mono text-neutral-500 text-[10px]">#{game.id}</span>
                        <span
                          className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold"
                          style={{
                            backgroundColor: winnerProf ? `${winnerProf.colorHex}22` : '#f59e0b22',
                            color: winnerProf ? winnerProf.colorHex : '#f59e0b',
                            border: `1px solid ${winnerProf ? winnerProf.colorHex : '#f59e0b'}66`,
                          }}
                        >
                          {winnerProf ? `${winnerProf.name.toUpperCase()} MENANG` : 'REMIS'}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>
                              {COMBATANTS[game.white].name} (P) vs {COMBATANTS[game.black].name} (H)
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              · {game.openingName} ({game.movesCount} langkah)
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-1">{game.summary}</p>
                        </div>
                      </div>

                      {onLoadGameToBoard && (
                        <button
                          onClick={() => onLoadGameToBoard(game.finalFen, game.pgn)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-400" />
                          <span>Muat ke Papan</span>
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
