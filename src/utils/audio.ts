// Web Audio API Synthesizer for high-tech Cyber Lab sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private audioBlocked: boolean = false;

  constructor() {
    // Lazy init audio context on first user interaction
  }

  private initCtx(): AudioContext | null {
    if (this.audioBlocked || !this.enabled) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Context resume not permitted or blocked
        });
      }
      return this.ctx;
    } catch {
      this.audioBlocked = true;
      return null;
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled && !this.audioBlocked;
  }

  // Soft high-tech mechanical click
  public playClick() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext unavailable or blocked, quietly ignore
    }
  }

  // Cyber threat / breach alert sound (controlled sci-fi pulse)
  public playAlert() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(220, now + 0.08);
      osc.frequency.setValueAtTime(160, now + 0.16);
      
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.25);
    } catch {
      // AudioContext unavailable
    }
  }

  // Defense Shield / Firewall Activated sound
  public playShield() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.22);
    } catch {
      // AudioContext unavailable
    }
  }

  // Mission Success / Chime
  public playSuccess() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        if (!ctx || ctx.state === 'closed') return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.06;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          
          gain.gain.setValueAtTime(0.07, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(noteTime);
          osc.stop(noteTime + 0.18);
        } catch {
          // Ignored
        }
      });
    } catch {
      // AudioContext unavailable
    }
  }

  // Level Up harmonic chord
  public playLevelUp() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const chords = [440, 554.37, 659.25, 880, 1108.73];
      
      chords.forEach((freq, idx) => {
        if (!ctx || ctx.state === 'closed') return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.07;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          
          gain.gain.setValueAtTime(0.09, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(noteTime);
          osc.stop(noteTime + 0.4);
        } catch {
          // Ignored
        }
      });
    } catch {
      // AudioContext unavailable
    }
  }

  // Keystroke sound for terminal typing
  public playKeystroke() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
      
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.015);
    } catch {
      // Ignored
    }
  }

  // Digital Glitch / Decryption burst sound
  public playGlitch() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(880, now + 0.03);
      osc.frequency.setValueAtTime(120, now + 0.06);
      osc.frequency.setValueAtTime(1200, now + 0.09);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.12);
    } catch {
      // Ignored
    }
  }

  // Access Granted sci-fi sound
  public playAccessGranted() {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const notes = [587.33, 880.00, 1174.66, 1760.00]; // D5, A5, D6, A6
      
      notes.forEach((freq, idx) => {
        if (!ctx || ctx.state === 'closed') return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.05;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          
          gain.gain.setValueAtTime(0.08, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(noteTime);
          osc.stop(noteTime + 0.25);
        } catch {
          // Ignored
        }
      });
    } catch {
      // Ignored
    }
  }

  // Threat neutralized / exploit injection pulse
  public playThreatNeutralized() {
    this.playSuccess();
  }

  // Final Victory sequence chime
  public playVictory() {
    this.playLevelUp();
  }

  // Pill hover aura hum
  public playPillHum(isRed: boolean) {
    if (!this.enabled || this.audioBlocked) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = isRed ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isRed ? 180 : 360, now);
      osc.frequency.exponentialRampToValueAtTime(isRed ? 240 : 480, now + 0.1);
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.1);
    } catch {
      // Ignored
    }
  }
}

export const sound = new SoundEngine();
