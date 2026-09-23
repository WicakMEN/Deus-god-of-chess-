/**
 * Deus Chess Opening Book
 * Master Grandmaster responses for high-speed instant moves in opening theory.
 */

export const OPENING_BOOK: Record<string, string[]> = {
  // Initial position
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': ['e4', 'd4', 'Nf3', 'c4'],

  // After 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -': ['e5', 'c5', 'e6', 'c6', 'Nf6'],
  // After 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -': ['d5', 'Nf6', 'e6', 'g6'],
  // After 1. Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': ['d5', 'Nf6', 'c5'],
  // After 1. c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -': ['e5', 'c5', 'Nf6', 'e6'],

  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['Nf3', 'Nc3', 'Bc4'],
  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': ['Nc6', 'Nf6', 'd6'],
  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['Bb5', 'Bc4', 'd4', 'Nc3'],
  // Ruy Lopez 1. e4 e5 2. Nf3 Nc6 3. Bb5
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -': ['a6', 'Nf6', 'd6'],
  // Italian Game 1. e4 e5 2. Nf3 Nc6 3. Bc4
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -': ['Bc5', 'Nf6'],

  // Sicilian Defense 1. e4 c5
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['Nf3', 'Nc3', 'c3'],
  // 1. e4 c5 2. Nf3
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': ['d6', 'Nc6', 'e6'],
  // French Defense 1. e4 e6
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d4', 'd3', 'Nf3'],
  // Caro-Kann 1. e4 c6
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d4', 'Nc3'],

  // 1. d4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c4', 'Nf3', 'Bf4'],
  // 1. d4 Nf6
  'rnbqkbnr/pppppp1p/8/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -': ['e6', 'g6', 'd5'],
  // Queen's Gambit 1. d4 d5 2. c4
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -': ['e6', 'c6', 'dxc4'],
};
