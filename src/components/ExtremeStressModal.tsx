import { useState } from 'react';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  Zap,
  ExternalLink,
  X,
  Flame,
  Brain,
  Sparkles,
  Smile,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  LOGIC_STRESS_TESTS,
  CHAOS_STRESS_TESTS,
  EXTREME_STRESS_TESTS,
  runSingleStressTestCase,
  StressTestResult,
  StressTestCase,
} from '../engine/stressTests';

interface ExtremeStressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFen: (fen: string, title: string) => void;
}

type TestCategoryTab = 'ALL' | 'LOGIC' | 'CHAOS';

export function ExtremeStressModal({ isOpen, onClose, onLoadFen }: ExtremeStressModalProps) {
  const [activeTab, setActiveTab] = useState<TestCategoryTab>('ALL');
  const [results, setResults] = useState<StressTestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningIndex, setRunningIndex] = useState<number>(-1);

  if (!isOpen) return null;

  const currentTestCases: StressTestCase[] =
    activeTab === 'LOGIC'
      ? LOGIC_STRESS_TESTS
      : activeTab === 'CHAOS'
      ? CHAOS_STRESS_TESTS
      : EXTREME_STRESS_TESTS;

  const handleRunSuite = async () => {
    setIsRunning(true);
    setResults([]);

    const targetCases = currentTestCases;
    const accumulated: StressTestResult[] = [];

    for (let i = 0; i < targetCases.length; i++) {
      setRunningIndex(i);
      // Give the browser event loop a moment to render progress
      await new Promise(resolve => setTimeout(resolve, 30));
      const res = runSingleStressTestCase(targetCases[i]);
      accumulated.push(res);
      setResults([...accumulated]);
    }

    setRunningIndex(-1);
    setIsRunning(false);
  };

  const filteredResults = results
    ? results.filter(r => (activeTab === 'ALL' ? true : r.testType === activeTab))
    : null;

  const allPassed = filteredResults && filteredResults.length === currentTestCases.length && filteredResults.every(r => r.passed);
  const passedCount = filteredResults ? filteredResults.filter(r => r.passed).length : 0;

  const logicPassed = results ? results.filter(r => r.testType === 'LOGIC' && r.passed).length : 0;
  const chaosPassed = results ? results.filter(r => r.testType === 'CHAOS' && r.passed).length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 max-w-3xl w-full rounded-2xl p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-950/80 border border-rose-800/80 rounded-lg text-rose-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 font-display flex items-center gap-2">
                ARENA DUAL STRESS TEST DEUS
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  Logika Absolut & Jurus Khaos
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Uji ketahanan kalkulasi Deus di 2 alam: <strong className="text-amber-300">Logika Grandmaster Murni</strong> &{' '}
                <strong className="text-cyan-300">Khaos Bocah Sakti (Pura-Pura Bego & Trojan Ambush)</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center bg-neutral-950/90 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-rose-950 text-rose-200 border border-rose-800/70 font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua ({EXTREME_STRESS_TESTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('LOGIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'LOGIC'
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-800/70 font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Logika Murni ({LOGIC_STRESS_TESTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CHAOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'CHAOS'
                  ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-800/70 font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smile className="w-3.5 h-3.5 text-cyan-400" />
              <span>2. Jurus Khaos / Bocah ({CHAOS_STRESS_TESTS.length})</span>
            </button>
          </div>

          <button
            onClick={handleRunSuite}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Menguji Triliunan Cabang...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Jalankan Dual Stress Test</span>
              </>
            )}
          </button>
        </div>

        {/* Action Header Banner */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-200 font-bold">
                  {results && results.length > 0
                    ? `Hasil Uji: ${passedCount} / ${currentTestCases.length} Skenario Lolos (${Math.round(
                        (passedCount / currentTestCases.length) * 100
                      )}%)`
                    : 'Siap menjalankan simulasi 12 skenario stress test ekstrim'}
                </span>
                {results && results.length > 0 && (
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300">
                      Logika: {logicPassed}/{LOGIC_STRESS_TESTS.length}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                      Khaos: {chaosPassed}/{CHAOS_STRESS_TESTS.length}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                {isRunning && runningIndex >= 0
                  ? `Sedang mengkalkulasi skenario (${runningIndex + 1}/${currentTestCases.length}): ${currentTestCases[runningIndex]?.title}...`
                  : allPassed
                  ? 'Semua uji logika dan penjinakan jebakan pura-pura bego tuntas tereksekusi tanpa cela!'
                  : 'Tekan tombol di atas untuk menguji ketahanan Deus melawan grandmaster & gaya gila.'}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Dual Persona Engine: Aktif</span>
            </div>
          </div>

          {/* Live Progress Bar when running */}
          {isRunning && (
            <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-200"
                style={{
                  width: `${Math.round(((results?.length || 0) / currentTestCases.length) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Results / Test Cases List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {currentTestCases.map((test, idx) => {
            const result = results?.find(r => r.testId === test.id);
            const isChaos = test.testType === 'CHAOS';
            const isCurrentlyCalculating = isRunning && idx === runningIndex;

            return (
              <div
                key={test.id}
                className={`p-3.5 rounded-xl border transition-all text-xs font-mono ${
                  isCurrentlyCalculating
                    ? 'bg-neutral-950 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                    : result
                    ? result.passed
                      ? isChaos
                        ? 'bg-neutral-950/70 border-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                        : 'bg-neutral-950/70 border-emerald-900/60'
                      : 'bg-neutral-950/70 border-rose-900/60'
                    : 'bg-neutral-950/40 border-neutral-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isChaos
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {isChaos ? '🌀 UJI KHAOS' : '⚡ UJI LOGIKA'}
                      </span>
                      <span className="font-bold text-neutral-200 text-[13px]">{test.title}</span>
                      {isCurrentlyCalculating ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <RotateCcw className="w-2.5 h-2.5 animate-spin" />
                          <span>MENGHITUNG CABANG...</span>
                        </span>
                      ) : result ? (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                            result.passed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{result.passed ? '✓ LOLOS TANPA CELA' : 'GAGAL'}</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">{test.description}</p>

                    {test.trojanThreat && (
                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[10px] text-amber-200/90">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-400 font-bold">Sengatan Tersembunyi (Trojan Sting):</strong>{' '}
                          {test.trojanThreat}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onLoadFen(test.fen, test.title);
                      onClose();
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono border border-neutral-700 transition-colors cursor-pointer"
                    title="Muat posisi ini ke papan utama untuk dimainkan langsung melawan Deus"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                    <span>Muat ke Papan</span>
                  </button>
                </div>

                {result && (
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-800/70 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
                      <div className="flex items-center gap-3">
                        <span>
                          Langkah Deus:{' '}
                          <strong className="text-amber-300 text-xs font-bold">{result.chosenMove}</strong>
                        </span>
                        <span>
                          Target:{' '}
                          <span className="text-neutral-300 font-semibold">{result.expectedMoves.join(' / ')}</span>
                        </span>
                        {result.deusPersona && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              result.deusPersona === 'LUDIC_CHILD'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            Persona: {result.deusPersona === 'LUDIC_CHILD' ? 'Bocah Sakti Bertaring' : 'Dewa Logika'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>{result.executionTimeMs}ms</span>
                        <span>·</span>
                        <span>{result.projectedNodes.toLocaleString()} cabang</span>
                      </div>
                    </div>

                    {result.coldThought && (
                      <div className="p-2 bg-black/50 rounded-lg border border-neutral-800/60 text-[10px] text-neutral-300 italic">
                        "{result.coldThought}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="border-t border-neutral-800 pt-3 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kekebalan Deus: Logika Grandmaster 100% + Refleks Bocah Sakti 100%</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
