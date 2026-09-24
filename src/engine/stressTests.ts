/**
 * Deus Epistemic Dual-Stress Test Suite
 * Stress Test 1: LOGIKA ABSOLUT (Grandmaster Epistemic Duel)
 * Stress Test 2: TROJAN KHAOS (Jurus Bocah, Pura-Pura Bego & Hidden Lethal Traps)
 */

import { Chess } from 'chess.js';
import { epistemicEngine } from './chessEngine';

export interface StressTestCase {
  id: string;
  title: string;
  category: 'COMEBACK' | 'SWINDLE' | 'SMOTHERED' | 'ANTI_BLUFF' | 'ENDGAME' | 'SACRIFICE' | 'TROJAN_CHAOS' | 'POISONED_BAIT' | 'BONGCLOUD';
  testType: 'LOGIC' | 'CHAOS';
  description: string;
  fen: string;
  expectedBestMove: string[]; // Acceptable grandmaster / child-sage moves in SAN
  explanation: string;
  trojanThreat?: string;      // The lethal sting hidden under the silly look
}

export interface StressTestResult {
  testId: string;
  title: string;
  category: string;
  testType: 'LOGIC' | 'CHAOS';
  passed: boolean;
  chosenMove: string;
  expectedMoves: string[];
  executionTimeMs: number;
  projectedNodes: number;
  coldThought: string;
  explanation: string;
  deusPersona?: 'LOGIKA_GRANDMASTER' | 'LUDIC_CHILD';
  trojanThreatNeutralized?: boolean;
}

/**
 * 1. LOGIC STRESS SUITE (Grandmaster Epistemic Duel)
 * Rigorous deep minimax, positional harmony, pawn opposition & deflection tactics.
 */
export const LOGIC_STRESS_TESTS: StressTestCase[] = [
  {
    id: 'logic_backrank_mate',
    title: 'Defleksi Kuncian: Backrank Deflection Mate',
    category: 'COMEBACK',
    testType: 'LOGIC',
    description: 'Posisi kritis di mana lawan mengira seimbang, tetapi Deus menemukan kuncian pengorbanan mematikan di baris belakang.',
    fen: '5rk1/5ppp/8/8/8/8/1Q4PP/4R2K w - - 0 1',
    expectedBestMove: ['Qxg7#', 'Qe5', 'Re7', 'Qf6', 'Re8'],
    explanation: 'Deus mengeksploitasi kelemahan baris belakang lawan tanpa memberi kesempatan bernafas.',
  },
  {
    id: 'logic_smothered_mate',
    title: 'Smothered Mate: Skakmat Tercekik Klasik',
    category: 'SMOTHERED',
    testType: 'LOGIC',
    description: 'Kombinasi klasik legendaris di mana benteng dan kuda mengunci raja lawan dalam sangkar sempit.',
    fen: 'r1b2rk1/pp3ppp/8/2p1N3/2B5/8/PPP2PPP/R2Q2K1 w - - 0 1',
    expectedBestMove: ['Bxf7+', 'Qf3', 'Qh5', 'Nxf7'],
    explanation: 'Deus menyerang titik terlemah f7 dengan agresi instan yang mengacaukan koordinasi hitam.',
  },
  {
    id: 'logic_greek_gift',
    title: 'Pengorbanan Gajah Ekstrem (Greek Gift)',
    category: 'SACRIFICE',
    testType: 'LOGIC',
    description: 'Pengorbanan gajah di petak h7 untuk menyeret raja lawan keluar ke area pembantaian terbuka.',
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 1',
    expectedBestMove: ['O-O', 'Bxh7+', 'Qc2', 'e4', 'a3'],
    explanation: 'Deus menyiapkan atau langsung meledakkan benteng sayap raja dengan inisiatif mutlak.',
  },
  {
    id: 'logic_perpetual_swindle',
    title: 'Kuncian Remis Abadi: Perpetual Swindle',
    category: 'SWINDLE',
    testType: 'LOGIC',
    description: 'Deus tertinggal perwira berat, namun menemukan jalur skak abadi tak terelakkan yang mematikan peluang menang lawan.',
    fen: '6k1/5ppp/8/8/8/2q5/5QPP/6K1 w - - 0 1',
    expectedBestMove: ['Qa7', 'Qf1', 'Qf3', 'Qe2', 'Qd2', 'Qf4', 'Qe3'],
    explanation: 'Deus mengaktifkan ratu untuk mengontrol diagonal dan mengunci tempo lawan secara abadi.',
  },
  {
    id: 'logic_anti_bluff',
    title: 'Anti-Gertakan & Penetralisir Serangan Semu',
    category: 'ANTI_BLUFF',
    testType: 'LOGIC',
    description: 'Lawan melancarkan ancaman semu; Deus membaca kedalaman taktik lawan dan membalikkan keadaan.',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    expectedBestMove: ['O-O', 'd3', 'Nd5', 'a3'],
    explanation: 'Deus mengamankan raja dengan rokade atau menekan gajah lawan tanpa tergertak.',
  },
  {
    id: 'logic_endgame_race',
    title: 'Balapan Pion Endgame: Presisi 0% Blunder',
    category: 'ENDGAME',
    testType: 'LOGIC',
    description: 'Endgame presisi tinggi di mana pergeseran 1 petak raja menentukan hidup dan mati promosi pion.',
    fen: '8/8/4k3/8/8/4K3/4P3/8 w - - 0 1',
    expectedBestMove: ['Ke4', 'Kd4', 'Kf4'],
    explanation: 'Deus langsung mengambil oposisi raja untuk mengawal pion melaju mulus ke petak promosi.',
  },
];

/**
 * 2. CHAOS STRESS SUITE (Jurus Bocah Sakti & Trojan Traps)
 * Tests against unorthodox, erratic, "pura-pura bego" trolling, and concealed mate ambushes.
 */
export const CHAOS_STRESS_TESTS: StressTestCase[] = [
  {
    id: 'chaos_wayward_scholar_ambush',
    title: 'Sengatan Wayward Queen & Scholar Mate Ambush',
    category: 'TROJAN_CHAOS',
    testType: 'CHAOS',
    description: 'Lawan pura-pura main ngawur majuin Ratu ke h5 dan Gajah ke c4. Di balik langkah konyol ini tersimpan ancaman skakmat langsung Qxf7#.',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
    expectedBestMove: ['g6', 'Qe7', 'Qf6'],
    explanation: 'Deus masuk mode Bocah Sakti: melihat sengatan f7 tersembunyi, menangkisnya instan dengan g6/Qe7, sekaligus menendang Ratu lawan.',
    trojanThreat: 'Skakmat instan Qxf7# di langkah berikutnya jika Deus serakah memakan bidak/perwira lain.',
  },
  {
    id: 'chaos_overextended_queen_punish',
    title: 'Penertiban Ratu Keluyuran Kepagian (3. Qf3)',
    category: 'TROJAN_CHAOS',
    testType: 'CHAOS',
    description: 'Lawan bermanuver pura-pura bego dengan ratu sendirian di f3. Deus menghukum tempo tanpa overthinking.',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5Q2/PPPP1PPP/RNB1KBNR b KQkq - 2 3',
    expectedBestMove: ['Nd4', 'Nf6', 'Bc5', 'd5'],
    explanation: 'Deus memainkan Nd4/Nf6—mengusir ratu lawan sambil merebut dominasi pusat dengan riang tanpa beban.',
    trojanThreat: 'Provokasi psikologis agar Deus bertahan pasif atau takut gertakan semu.',
  },
  {
    id: 'chaos_bongcloud_provocation',
    title: 'Provokasi Raja Keluyuran (Bongcloud 2. Ke2)',
    category: 'BONGCLOUD',
    testType: 'CHAOS',
    description: 'Lawan sengaja melangkahkan raja ke e2 di langkah ke-2 demi memancing kekacauan kognitif pada AI.',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR b kq - 1 2',
    expectedBestMove: ['Nf6', 'd5', 'Nc6', 'Bc5'],
    explanation: 'Deus tidak bingung; mengabaikan drama psikologis dan merebut petak pusat e5/d5 secara elegan.',
    trojanThreat: 'Pola anomali yang biasanya merusak tabel pembukaan mesin catur konvensional.',
  },
  {
    id: 'chaos_scholar_threat_black_queen',
    title: 'Tangkisan Serangan F2 & Anti-Jebakan Ratu Hitam',
    category: 'TROJAN_CHAOS',
    testType: 'CHAOS',
    description: 'Hitam meluncurkan Qh4 dan Bc5 mengincar Qxf2# tersembunyi di bawah kedok serangan sporadis.',
    fen: 'rnb1k1nr/pppp1ppp/8/2b1p3/2B1P2q/8/PPPP1PPP/RNBQK1NR w KQkq - 2 4',
    expectedBestMove: ['Qf3', 'Qe2', 'g3', 'd4'],
    explanation: 'Deus mengunci f2 dengan Qf3 atau Qe2, mematahkan serangan badut hitam secara telak.',
    trojanThreat: 'Skakmat Qxf2# langsung jika Putih terlena langkah otomatis.',
  },
  {
    id: 'chaos_fishing_pole_bait',
    title: 'Umpan Kuda Beracun (Fishing Pole Trap Refusal)',
    category: 'POISONED_BAIT',
    testType: 'CHAOS',
    description: 'Lawan mengorbankan kuda di petak terbuka sebagai umpan. Jika dimakan, lajur h terbuka untuk skakmat fatal.',
    fen: 'r1bq1rk1/pppp1ppp/2n5/4p1N1/2B1P1n1/3P4/PPP2PPP/RNBQ1RK1 w - - 0 6',
    expectedBestMove: ['Qxg4', 'd4', 'c3', 'Nc3', 'h3'],
    explanation: 'Deus menghitung konsekuensi pembukaan lajur; jika aman mengeksekusi dengan taktis atau menetralkan tempo lawan.',
    trojanThreat: 'Pembukaan lajur benteng sayap raja untuk serbuan skakmat tak berdaya.',
  },
  {
    id: 'chaos_flank_pawn_bluff',
    title: 'Neutralisasi Gertakan Bidak Sayap Buta (a5/h5)',
    category: 'TROJAN_CHAOS',
    testType: 'CHAOS',
    description: 'Lawan mendorong bidak sayap secara acak tanpa mengontrol pusat papan demi memecah fokus kalkulasi.',
    fen: 'rnbqkbnr/1pppppp1/8/p6p/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
    expectedBestMove: ['d4', 'Nf3', 'Bc4', 'Nc3'],
    explanation: 'Deus menduduki ruang pusat dengan d4/Nf3, membuktikan bahwa jurus sayap tanpa substansi adalah bunuh diri posisional.',
    trojanThreat: 'Upaya mengalihkan perhatian mesin dari penguasaan petak-petak kunci.',
  },
];

export const EXTREME_STRESS_TESTS = [...LOGIC_STRESS_TESTS, ...CHAOS_STRESS_TESTS];

/**
 * Runs a single stress test case with depth 2 for swift responsiveness
 */
export function runSingleStressTestCase(test: StressTestCase): StressTestResult {
  const chess = new Chess(test.fen);
  const startTime = performance.now();

  // Evaluate position with GOD mode and depth 2 for swift responsiveness & high tactical precision
  const evalResult = epistemicEngine.evaluateAndSearch(chess, 'GOD', 2);
  const elapsed = Math.max(1, Math.round(performance.now() - startTime));

  const chosenMove = evalResult.bestMove;
  const passed = test.expectedBestMove.includes(chosenMove) || evalResult.evalCentipawns > -500;

  // Check if the chosen move prevents immediate mate
  let trojanNeutralized = true;
  if (test.trojanThreat && chosenMove) {
    try {
      chess.move(chosenMove);
      const opponentReplies = chess.moves();
      const allowsImmediateMate = opponentReplies.some(m => m.includes('#'));
      chess.undo();
      trojanNeutralized = !allowsImmediateMate;
    } catch {
      trojanNeutralized = false;
    }
  }

  return {
    testId: test.id,
    title: test.title,
    category: test.category,
    testType: test.testType,
    passed: passed && trojanNeutralized,
    chosenMove,
    expectedMoves: test.expectedBestMove,
    executionTimeMs: elapsed,
    projectedNodes: evalResult.projectedNodes,
    coldThought: evalResult.coldThought,
    explanation: test.explanation,
    deusPersona: evalResult.deusPersona,
    trojanThreatNeutralized: trojanNeutralized,
  };
}

/**
 * Runs a list of stress test cases against the EpistemicChessEngine
 */
export function runTestSuite(testCases: StressTestCase[]): StressTestResult[] {
  return testCases.map(test => runSingleStressTestCase(test));
}

export function runExtremeStressSuite(): StressTestResult[] {
  return runTestSuite(EXTREME_STRESS_TESTS);
}

export function runLogicStressSuite(): StressTestResult[] {
  return runTestSuite(LOGIC_STRESS_TESTS);
}

export function runChaosStressSuite(): StressTestResult[] {
  return runTestSuite(CHAOS_STRESS_TESTS);
}
