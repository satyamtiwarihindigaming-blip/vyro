// Web Audio API Call Sound & Haptic Vibration Engine (Zero external asset dependencies)

class CallSoundEngine {
  private ctx: AudioContext | null = null;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private ensureContext(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public unlock() {
    this.ensureContext();
  }

  private playTone(freq: number, durationMs: number, delayMs = 0, volume = 0.14, type: OscillatorType = 'sine') {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delayMs / 1000;
    const stopTime = startTime + durationMs / 1000;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(stopTime + 0.02);

    this.activeOscillators.push(osc);
    osc.onended = () => {
      this.activeOscillators = this.activeOscillators.filter((o) => o !== osc);
    };
  }

  public vibrate(pattern: number | number[]) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Vibration API not supported on this device
    }
  }

  public stopAll() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Ignore already stopped
      }
    });
    this.activeOscillators = [];
    this.vibrate(0);
  }

  // Outgoing Caller Ringback Tone ("Tring... Tring...") + subtle outgoing haptic
  public startOutgoingDialTone() {
    this.stopAll();
    this.vibrate([90, 60, 90]);

    const pulse = () => {
      // Standard dual-frequency ringback tone (440Hz + 480Hz)
      this.playTone(440, 1100, 0, 0.08, 'sine');
      this.playTone(480, 1100, 0, 0.08, 'sine');
    };

    pulse();
    this.loopTimer = setInterval(pulse, 3000);
  }

  // Incoming Call Ringtone + continuous phone vibration pattern
  public startIncomingRingtone() {
    this.stopAll();

    const ring = () => {
      // Melodic modern cyber chime (C5 -> E5 -> G5 -> C6)
      this.playTone(523.25, 180, 0, 0.16, 'triangle');
      this.playTone(659.25, 180, 160, 0.16, 'triangle');
      this.playTone(783.99, 220, 320, 0.16, 'triangle');
      this.playTone(1046.5, 400, 500, 0.18, 'sine');
      this.vibrate([450, 250, 450, 700]);
    };

    ring();
    this.loopTimer = setInterval(ring, 2400);
  }

  public playConnectedChime() {
    this.stopAll();
    this.vibrate(80);
    this.playTone(587.33, 120, 0, 0.14, 'sine');
    this.playTone(880, 220, 110, 0.16, 'sine');
  }

  public playEndedTone() {
    this.stopAll();
    this.vibrate([60, 40, 60]);
    this.playTone(440, 130, 0, 0.12, 'sine');
    this.playTone(329.63, 220, 120, 0.12, 'sine');
  }
}

export const callSoundEngine = new CallSoundEngine();
