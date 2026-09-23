import React, { useEffect, useState } from 'react';

export interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export interface ImpactShockwave {
  id: number;
  xPercent: number;
  yPercent: number;
  isCapture: boolean;
  isGod: boolean;
  isCheck: boolean;
}

interface MoveEffectsOverlayProps {
  shockwaves: ImpactShockwave[];
}

export const MoveEffectsOverlay: React.FC<MoveEffectsOverlayProps> = ({ shockwaves }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {shockwaves.map(wave => (
        <div
          key={wave.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${wave.xPercent}%`, top: `${wave.yPercent}%` }}
        >
          {/* Radial Shockwave Ripple */}
          <div
            className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full animate-ping opacity-75 border-2 ${
              wave.isCheck
                ? 'border-rose-500 bg-rose-500/30'
                : wave.isGod
                ? 'border-amber-400 bg-amber-500/30'
                : wave.isCapture
                ? 'border-orange-500 bg-orange-500/25'
                : 'border-cyan-400 bg-cyan-400/20'
            }`}
          />

          {/* Flash spark core */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full blur-xs animate-pulse ${
              wave.isCheck
                ? 'bg-rose-400 shadow-[0_0_20px_#f43f5e]'
                : wave.isGod
                ? 'bg-amber-300 shadow-[0_0_25px_#f59e0b]'
                : wave.isCapture
                ? 'bg-orange-400 shadow-[0_0_20px_#f97316]'
                : 'bg-cyan-300 shadow-[0_0_15px_#22d3ee]'
            }`}
          />

          {/* God Mode Rune Burst Ring */}
          {wave.isGod && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-amber-300/60 rounded-full animate-spin duration-1000" />
          )}
        </div>
      ))}
    </div>
  );
};
