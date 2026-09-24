import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  ArrowUpDown,
  Palette,
  ToggleLeft,
  ToggleRight,
  Settings,
  Check,
} from 'lucide-react';
import { BoardTheme } from './ChessBoard';
import { Color } from 'chess.js';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFlipBoard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  theme: BoardTheme;
  onCycleTheme: () => void;
  onOpenRules: () => void;
  onOpenPhilosophy: () => void;
  humanColor: Color;
  onSelectColor: (color: Color) => void;
  userControlsDeusFirstMove: boolean;
  onToggleUserControlsDeusFirstMove: () => void;
  deusFirstMoveExecuted: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onNewGame,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onFlipBoard,
  isMuted,
  onToggleMute,
  theme,
  onCycleTheme,
  onOpenRules,
  onOpenPhilosophy,
  humanColor,
  onSelectColor,
  userControlsDeusFirstMove,
  onToggleUserControlsDeusFirstMove,
  deusFirstMoveExecuted,
}) => {
  return (
    <header className="flex items-center justify-between px-3 sm:px-8 py-3.5 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark & Color Selector */}
      <div className="flex items-center gap-3">
        <span className="text-base sm:text-xl font-bold tracking-tight text-white font-display select-none">
          Deus Chess
        </span>

        {/* User Color Switcher Pill */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            onClick={() => onSelectColor('w')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              humanColor === 'w'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Anda bermain sebagai Bidak Putih"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400" />
            <span>Putih</span>
          </button>
          <button
            onClick={() => onSelectColor('b')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              humanColor === 'b'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Anda bermain sebagai Bidak Hitam"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-600" />
            <span>Hitam</span>
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Deskripsi & Filosofi) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={onOpenRules}
          className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          Spesifikasi
        </button>
        <button
          onClick={onOpenPhilosophy}
          className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          Filosofi
        </button>
        <button
          onClick={onCycleTheme}
          className="text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          title={`Tema Saat Ini: ${theme}`}
        >
          <Palette className="w-4 h-4 text-amber-400" />
          <span className="capitalize">{theme}</span>
        </button>
      </nav>

      {/* Zone 3: Functional Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Saklar Kontrol Langkah Pembuka Deus (Hanya muncul jika user memilih Bidak Hitam) */}
        {humanColor === 'b' && (
          <button
            onClick={onToggleUserControlsDeusFirstMove}
            disabled={deusFirstMoveExecuted}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              deusFirstMoveExecuted
                ? 'bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                : userControlsDeusFirstMove
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={
              userControlsDeusFirstMove
                ? 'Saklar AKTIF: Anda bebas klik atau drag bidak putih pertama Deus di papan'
                : 'Saklar NONAKTIF: Deus langsung gerak sendiri secara otomatis dari awal'
            }
          >
            {userControlsDeusFirstMove ? (
              <ToggleRight className="w-4 h-4 text-amber-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-neutral-500" />
            )}
            <span className="hidden sm:inline">
              1st Move Deus:{' '}
              <strong className={userControlsDeusFirstMove ? 'text-amber-300' : 'text-neutral-400'}>
                {userControlsDeusFirstMove ? 'MANUAL (Papan)' : 'AUTO'}
              </strong>
            </span>
          </button>
        )}

        {/* Install Android PWA Button */}
        <PWAInstallButton />

        <button
          onClick={onFlipBoard}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
          title="Putar Sudut Pandang Papan"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
          title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Tarik Kembali Langkah (Undo / Mundur)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Redo Button */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Ulangi Langkah (Redo / Maju)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={onNewGame}
          className="px-3 sm:px-3.5 py-1.5 text-xs font-mono font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Mulai Ulang
        </button>
      </div>
    </header>
  );
};
