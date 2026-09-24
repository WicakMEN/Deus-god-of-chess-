/**
 * Deus Chess Opening Book - Hyper-Aggressive & Sacrificial Master Lines
 * Features world-class gambits (Evans, King's Gambit, Danish, Smith-Morra, Fried Liver, Scotch Gambit)
 * and sharp counter-attacking master variations for GOD mode.
 */

export const OPENING_BOOK: Record<string, string[]> = {
  // Initial position: Aggressive e4 (open game / gambits) and d4 (sharp queen's gambit / Catalan)
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': ['e4', 'd4', 'c4', 'Nf3'],

  // After 1. e4
  // If Deus is Black against 1. e4: Sharp Sicilian Najdorf/Dragon or aggressive e5
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -': ['c5', 'e5', 'e6', 'c6'],
  // After 1. d4: Sharp King's Indian / Budapest / Nimzo
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -': ['Nf6', 'd5', 'e5', 'e6'],
  // After 1. Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': ['d5', 'Nf6', 'c5'],
  // After 1. c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -': ['e5', 'c5', 'Nf6'],

  // 1. e4 e5 -> Deus prefers sharp King's Gambit or Italian Evans Gambit
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['Nf3', 'Bc4', 'f4', 'd4'],

  // King's Gambit Accepted 1. e4 e5 2. f4 exf4
  'rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq -': ['Nf3', 'Bc4'],

  // Danish / Center Game 1. e4 e5 2. d4 exd4 3. c3 (Danish Gambit)
  'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['c3', 'Nf3', 'Qxd4'],
  // Danish Gambit double sacrifice 1. e4 e5 2. d4 exd4 3. c3 dxc3 4. Bc4
  'rnbqkbnr/pppp1ppp/8/8/4P3/2p5/PP3PPP/RNBQKBNR w KQkq -': ['Bc4', 'Nxc3'],

  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['Bc4', 'd4', 'Bb5', 'Nc3'],

  // Italian Game 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5
  // Evans Gambit! 4. b4! (Legendary sacrifice of b-pawn for blistering center attack)
  'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['b4', 'c3', 'd3'],
  // After Evans Gambit accepted 4... Bxb4 5. c3
  'r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['c3', 'O-O'],
  // 4... Bxb4 5. c3 Ba5 6. d4!
  'r1bqk1nr/pppp1ppp/2n5/8/1bB1P3/2P2N2/PP3PPP/RNBQK2R b KQkq -': ['Ba5', 'Bc5', 'Be7'],

  // Two Knights Defense: 1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6
  // Fried Liver Attack! 4. Ng5!
  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['Ng5', 'd4', 'd3'],
  // Fried Liver: 4. Ng5 d5 5. exd5
  'r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq -': ['Na5', 'Nxd5'],
  // Fried Liver: 5... Nxd5 6. Nxf7! (Crazy Knight sacrifice for devastating king hunt!)
  'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq -': ['Nxf7', 'd4'],

  // Scotch Game: 1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 (Scotch Gambit)
  'r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -': ['Bc4', 'Nxd4', 'c3'],

  // Sicilian Defense: 1. e4 c5
  // Deus plays Open Sicilian or Smith-Morra Gambit (2. d4 cxd4 3. c3!)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['Nf3', 'd4', 'Nc3'],
  // Smith-Morra: 1. e4 c5 2. d4 cxd4 3. c3!
  'rnbqkbnr/pp1ppppp/8/8/3pP3/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c3', 'Nf3'],

  // Sicilian 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3
  'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -': ['a6', 'g6', 'Nc6'],
  // Sicilian Najdorf 5... a6 6. Bg5 or 6. Be3 (English Attack / Fischer Attack)
  'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -': ['Bg5', 'Be3', 'Bc4', 'f3'],

  // French Defense: 1. e4 e6 2. d4 d5 3. Nc3
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d4', 'Nc3'],
  'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['Nc3', 'e5', 'Nd2'],

  // Caro-Kann: 1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d4', 'Nc3'],
  'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['Nc3', 'e5', 'exd5'],

  // 1. d4 d5 -> Queen's Gambit 2. c4!
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c4', 'Nf3', 'Bf4'],
  // Queen's Gambit Accepted 2... dxc4 3. e4!
  'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['e4', 'Nf3', 'e3'],
  // Queen's Gambit Declined 2... e6 3. Nc3 Nf6 4. Bg5
  'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['Nc3', 'Nf3'],

  // 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 (King's Indian full center)
  'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['Nc3', 'Nf3', 'g3'],
  'rnbqkb1r/pppppp1p/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -': ['d6', 'O-O'],
};
