class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicInterval: number | null = null;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.12,
    endFreq?: number,
    delay = 0
  ) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(540, 0.055, 'triangle', 0.06, 360);
  }

  public playMove() {
    // Tactile wooden board thock
    this.playTone(210, 0.09, 'triangle', 0.14, 95);
    this.playTone(120, 0.07, 'sine', 0.12, 65, 0.01);
  }

  public playCapture() {
    this.playTone(320, 0.08, 'square', 0.08, 120);
    this.playTone(180, 0.12, 'triangle', 0.16, 70, 0.025);
  }

  public playCheck() {
    this.playTone(523.25, 0.18, 'triangle', 0.13);
    this.playTone(659.25, 0.24, 'triangle', 0.11, undefined, 0.06);
  }

  public playPromote() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'triangle', 0.1, undefined, idx * 0.055);
    });
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.35, 'triangle', 0.12, undefined, idx * 0.09);
    });
  }

  public playDefeat() {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.32, 'sine', 0.11, undefined, idx * 0.11);
    });
  }

  private startMusic() {
    if (typeof window === 'undefined' || this.musicInterval !== null) return;
    const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
    const pattern = [0, 2, 4, 5, 4, 2, 1, 3];

    const tick = () => {
      if (!this.musicEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      const note = scale[pattern[this.musicStep % pattern.length]];
      this.musicStep++;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.45);
    };

    tick();
    this.musicInterval = window.setInterval(tick, 950);
  }

  private stopMusic() {
    if (this.musicInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
