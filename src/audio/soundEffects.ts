/**
 * Web Audio API synthesized sound effects for Deus Chess.
 * Zero external audio files required, instantaneous and latency-free.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playMove() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  }

  playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;

    [587.33, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.2);
    });
  }

  playGodModeActivation(active: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (active) {
      // Cosmic ominous deep drone sweep
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'sine';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.9);

      osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A1
      osc2.frequency.setValueAtTime(110, ctx.currentTime);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.9);
      osc2.stop(ctx.currentTime + 0.9);
    } else {
      // Gentle deactivation chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  }

  playSlash() {
    const ctx = this.getContext();
    if (!ctx) return;

    // High energy metallic / lightsaber swoosh & zap
    const osc = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  playGodMove() {
    const ctx = this.getContext();
    if (!ctx) return;

    // Cinematic deep cosmic thud with high shimmer harmonic
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(160, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.28);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.32);
    osc2.stop(ctx.currentTime + 0.32);
  }

  playGameOver(victory: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = victory ? [261.63, 329.63, 392.0, 523.25] : [392.0, 369.99, 349.23, 293.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = victory ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 0.4);
    });
  }
}

export const soundManager = new SoundController();
