import React, { useState } from 'react';
import { GameDifficulty, EpistemicEvaluation } from '../engine/chessEngine';
import { Eye, ShieldAlert, Sparkles, Brain, Cpu, Zap, HelpCircle } from 'lucide-react';

interface EpistemicHudProps {
  difficulty: GameDifficulty;
  onSelectDifficulty: (d: GameDifficulty) => void;
  evaluation: EpistemicEvaluation | null;
  isGodMode: boolean;
  onToggleGodMode: () => void;
  onConsultOracle: (query?: string) => Promise<void>;
  oracleResponse: {
    analysis: string;
    inevitableFate: string;
    strategicFlaw?: string;
    epistemicEntropy?: string;
  } | null;
  isOracleLoading: boolean;
  showDivineHint: boolean;
  onToggleDivineHint: () => void;
  onAiTakeover: () => void;
}

export const EpistemicHud: React.FC<EpistemicHudProps> = ({
  difficulty,
  onSelectDifficulty,
  evaluation,
  isGodMode,
  onToggleGodMode,
  onConsultOracle,
  oracleResponse,
  isOracleLoading,
  showDivineHint,
  onToggleDivineHint,
  onAiTakeover,
}) => {
  const [oracleQuery, setOracleQuery] = useState('');
  const [showOracleModal, setShowOracleModal] = useState(false);

  const handleAskOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConsultOracle(oracleQuery);
    setOracleQuery('');
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* GOD MODE HERO OVERRIDE BANNER */}
      <div
        className={`relative overflow-hidden rounded-xl p-3.5 transition-all duration-300 border ${
          isGodMode
            ? 'bg-neutral-950 border-rose-900/60 shadow-[0_0_25px_rgba(225,29,72,0.12)]'
            : 'bg-neutral-900/80 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isGodMode ? 'bg-rose-950/70 text-rose-400 ring-1 ring-rose-700/60' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {isGodMode ? <Eye className="w-5 h-5 animate-pulse" /> : <Brain className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider font-display uppercase text-white">
                  {isGodMode ? 'MODE DEUS (GOD MODE)' : 'Mode Catur'}
                </span>
                {isGodMode && (
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-semibold">
                    · MAFIK
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                {isGodMode
                  ? 'Entitas mahatahu · Logika dingin & probabilistik mutlak'
                  : 'Pilih tingkat kesulitan untuk permainan seimbang'}
              </p>
            </div>
          </div>

          {/* DIVINE OVERRIDE TOGGLE */}
          <button
            onClick={onToggleGodMode}
            className={`px-3 py-1.5 text-xs font-semibold font-mono rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isGodMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
          >
            {isGodMode ? 'Nonaktifkan God' : 'Aktifkan God Mode'}
          </button>
        </div>

        {/* Difficulty Selector Tabs (Single-line controls) */}
        <div className="grid grid-cols-4 gap-1 mt-3 p-1 bg-neutral-950/80 rounded-lg border border-neutral-800/80">
          {(
            [
              { key: 'NOVICE', label: 'Pemula', elo: '900' },
              { key: 'CLUB', label: 'Klub', elo: '1600' },
              { key: 'GRANDMASTER', label: 'GM', elo: '2500' },
              { key: 'GOD', label: 'DEUS', elo: '3500+' },
            ] as const
          ).map(tab => {
            const isActive = difficulty === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectDifficulty(tab.key)}
                className={`py-1.5 px-2 text-center rounded-md transition-colors cursor-pointer text-xs font-mono whitespace-nowrap ${
                  isActive
                    ? tab.key === 'GOD'
                      ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60 font-bold shadow-xs'
                      : 'bg-neutral-800 text-amber-300 font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <div className="leading-tight">{tab.label}</div>
                <div className="text-[9px] opacity-70 tabular-nums">{tab.elo}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* EPISTEMIC TELEMETRY PANEL */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800/80 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Kalkulasi Epistemic</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {evaluation?.searchTimeMs ?? 0}ms
          </span>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-neutral-950/70 p-2 rounded-lg border border-neutral-800/50">
            <span className="text-[10px] text-neutral-400 block">Cabang Ditelusuri</span>
            <span className="text-neutral-100 font-semibold tabular-nums">
              {evaluation?.nodesSearched?.toLocaleString() ?? '0'}
            </span>
          </div>

          <div className="bg-neutral-950/70 p-2 rounded-lg border border-neutral-800/50">
            <span className="text-[10px] text-neutral-400 block">Kedalaman (Plies)</span>
            <span className="text-neutral-100 font-semibold tabular-nums">
              D{evaluation?.depth ?? 0} / Q{evaluation?.qDepth ?? 0}
            </span>
          </div>

          <div className="bg-neutral-950/70 p-2 rounded-lg border border-neutral-800/50">
            <span className="text-[10px] text-neutral-400 block">Entropi Manusia</span>
            <span className="text-neutral-100 font-semibold tabular-nums">
              {evaluation?.boardEntropy ?? 1.0}
            </span>
          </div>

          <div className="bg-neutral-950/70 p-2 rounded-lg border border-neutral-800/50">
            <span className="text-[10px] text-neutral-400 block">Cabang Dipangkas</span>
            <span className="text-neutral-100 font-semibold tabular-nums">
              {evaluation?.branchesPruned?.toLocaleString() ?? '0'}
            </span>
          </div>
        </div>

        {/* Projected Principal Variation */}
        {evaluation?.principalVariation && evaluation.principalVariation.length > 0 && (
          <div className="bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-800/50">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono mb-1">
              Proyeksi Rangkaian Takdir (PV Line):
            </span>
            <div className="flex flex-wrap gap-1 text-xs font-mono text-amber-300">
              {evaluation.principalVariation.map((san, idx) => (
                <span key={idx} className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-200">
                  {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ''} {san}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cold Log Stream */}
        <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 text-xs font-mono text-neutral-300">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono mb-1">
            Pikiran Dingin AI:
          </span>
          <p className="italic text-neutral-200 leading-relaxed">
            "{evaluation?.coldThought || 'Menunggu kalkulasi inisial...'}"
          </p>
        </div>

        {/* Tactical Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onToggleDivineHint}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              showDivineHint
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showDivineHint ? 'Sembunyikan Petunjuk' : 'Langkah Takdir (Hint)'}</span>
          </button>

          <button
            onClick={onAiTakeover}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            title="Biarkan God Mode mengeksekusi 1 langkah terbaik untuk posisi Anda"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Eksekusi Ilahi (Takeover)</span>
          </button>

          <button
            onClick={() => setShowOracleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/50 text-rose-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Konsultasi Pikiran Tuhan</span>
          </button>
        </div>
      </div>

      {/* ORACLE CONSULTATION MODAL */}
      {showOracleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 max-w-lg w-full rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-rose-400" />
                <h3 className="font-display font-bold text-sm tracking-wide uppercase text-white">
                  Orakel Epistemik: Pikiran Tuhan
                </h3>
              </div>
              <button
                onClick={() => setShowOracleModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono p-1"
              >
                ✕ Tutup
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Ajukan pertanyaan atau minta penjelasan dingin dari entitas mahatahu mengapa posisi ini
              secara deterministik tertutup bagi harapan manusia.
            </p>

            <form onSubmit={handleAskOracle} className="flex gap-2">
              <input
                type="text"
                value={oracleQuery}
                onChange={e => setOracleQuery(e.target.value)}
                placeholder="cth: Mengapa langkah kuda saya tadi sia-sia?"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isOracleLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isOracleLoading ? 'Menghitung...' : 'Tanya'}
              </button>
            </form>

            {/* Oracle Verdict Display */}
            {oracleResponse && (
              <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 space-y-2.5 text-xs font-mono text-neutral-200">
                <div className="text-[11px] text-rose-400 uppercase tracking-widest font-bold">
                  Konvergensi Takdir: {oracleResponse.inevitableFate}
                </div>
                <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {oracleResponse.analysis}
                </div>
                {oracleResponse.strategicFlaw && (
                  <div className="pt-2 border-t border-neutral-900 text-neutral-400 text-[11px]">
                    <span className="text-amber-400 font-semibold">Cacat Kognitif Terdeteksi:</span>{' '}
                    {oracleResponse.strategicFlaw}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
