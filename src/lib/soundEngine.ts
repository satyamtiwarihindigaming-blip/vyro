// Procedural Web Audio API Sound Synthesizer (Zero Network Latency, 0kb Audio Assets)

class SoundEngine {
  private ctx: AudioContext | null = null;

  private init(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch {
        return false;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx;
  }

  // 1. Cinematic Boot Sound (Apple / PlayStation 5 Startup Tier)
  // Deep 55Hz sub-bass cosmic drop + spatial crystal harmonic chime chord
  playCinematicBootSound() {
    if (!this.init() || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Sub-Bass Cosmic Drop (55Hz -> 28Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    // Mid Harmonic Atmospheric Shimmer (220Hz -> 440Hz)
    const midOsc = this.ctx.createOscillator();
    const midGain = this.ctx.createGain();
    midOsc.type = 'triangle';
    midOsc.frequency.setValueAtTime(220, now + 0.3);
    midOsc.frequency.exponentialRampToValueAtTime(440, now + 0.9);
    midGain.gain.setValueAtTime(0.001, now + 0.3);
    midGain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    midGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    midOsc.connect(midGain);
    midGain.connect(this.ctx.destination);
    midOsc.start(now + 0.3);
    midOsc.stop(now + 1.6);

    // Crystal Harmonic Chimes (Major 9th Triad: 440Hz, 880Hz, 1320Hz, 1760Hz)
    const freqs = [440, 880, 1320, 1760];
    freqs.forEach((f, idx) => {
      const delay = 0.65 + idx * 0.08;
      const chimeOsc = this.ctx!.createOscillator();
      const chimeGain = this.ctx!.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(f, now + delay);
      chimeGain.gain.setValueAtTime(0.001, now + delay);
      chimeGain.gain.linearRampToValueAtTime(0.08, now + delay + 0.03);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.8);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx!.destination);
      chimeOsc.start(now + delay);
      chimeOsc.stop(now + delay + 0.8);
    });
  }

  // 2. Soft Pop for Likes & Reactions (Sine ramp 320Hz -> 640Hz in 60ms)
  playPop() {
    if (!this.init() || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 3. Apple-Style Mechanical Haptic Tick for Theme Toggles & Story Navigation
  playHapticClick() {
    if (!this.init() || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  // 4. Tactical Biometric Scan Sound for FBI / Cyber Command Login
  playTacticalScan() {
    if (!this.init() || !this.ctx) return;
    const now = this.ctx.currentTime;
    const pulses = [800, 950, 1100, 1350, 1600];
    pulses.forEach((freq, i) => {
      const t = now + i * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    });
  }

  // 5. Camera Shutter Mechanical Double-Click
  playShutter() {
    this.playHapticClick();
    setTimeout(() => this.playHapticClick(), 65);
  }

  // 6. Futuristic Chime for AI Image Generation Complete
  playChime() {
    if (!this.init() || !this.ctx) return;
    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C-E-G-C Major
    chord.forEach((freq, i) => {
      const t = now + i * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // 7. Subtle Air Whoosh for Story 3D Cube Transitions
  playWhoosh() {
    if (!this.init() || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.15);
  }
}

export const soundEngine = new SoundEngine();
