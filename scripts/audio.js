/* World Cat - Audio System (Procedural) */

const Audio = {
  ctx: null,
  enabled: true,
  initialized: false,

  init() {
    // Create audio context on first user interaction
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Audio not available');
      this.enabled = false;
    }
  },

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  setEnabled(on) {
    this.enabled = on;
  },

  // Play a tone with parameters
  playTone(freq, duration, type, volume, delay) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (delay || 0));
    gain.gain.setValueAtTime(volume || 0.15, this.ctx.currentTime + (delay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (delay || 0) + duration);

    osc.start(this.ctx.currentTime + (delay || 0));
    osc.stop(this.ctx.currentTime + (delay || 0) + duration);
  },

  // Play noise burst
  playNoise(duration, volume, delay) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    source.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(volume || 0.1, this.ctx.currentTime + (delay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (delay || 0) + duration);
    source.start(this.ctx.currentTime + (delay || 0));
  },

  // === Sound Effects ===

  playMenuSelect() {
    this.playTone(440, 0.08, 'square', 0.12);
    this.playTone(660, 0.08, 'square', 0.12, 0.06);
  },

  playMenuConfirm() {
    this.playTone(523, 0.1, 'square', 0.15);
    this.playTone(659, 0.1, 'square', 0.15, 0.08);
    this.playTone(784, 0.15, 'square', 0.15, 0.16);
  },

  playMenuBack() {
    this.playTone(440, 0.1, 'square', 0.10);
    this.playTone(330, 0.12, 'square', 0.10, 0.08);
  },

  playKick() {
    this.playNoise(0.08, 0.25);
    this.playTone(150, 0.15, 'sine', 0.2);
    this.playTone(100, 0.1, 'sine', 0.15, 0.05);
  },

  playSave() {
    this.playNoise(0.06, 0.2);
    this.playTone(200, 0.1, 'square', 0.12);
    this.playTone(250, 0.08, 'square', 0.10, 0.08);
  },

  playGoal() {
    // Crowd cheer approximation
    this.playNoise(0.6, 0.15);
    this.playTone(523, 0.15, 'square', 0.15);
    this.playTone(659, 0.15, 'square', 0.15, 0.12);
    this.playTone(784, 0.2, 'square', 0.15, 0.24);
    this.playTone(1047, 0.3, 'square', 0.12, 0.36);
    // Extra crowd roar
    this.playNoise(0.8, 0.12, 0.2);
  },

  playMiss() {
    this.playNoise(0.3, 0.08);
    this.playTone(300, 0.15, 'sawtooth', 0.08);
    this.playTone(200, 0.2, 'sawtooth', 0.06, 0.12);
  },

  playCrowd() {
    this.playNoise(0.4, 0.06);
  },

  playCoinToss() {
    for (let i = 0; i < 6; i++) {
      this.playTone(800 + Math.random() * 400, 0.05, 'square', 0.08, i * 0.08);
    }
  },

  playCountdown() {
    this.playTone(440, 0.06, 'square', 0.10);
  },

  playLock() {
    this.playTone(880, 0.05, 'square', 0.15);
    this.playTone(1100, 0.08, 'square', 0.15, 0.04);
  },

  playVictory() {
    // Victory fanfare - retro style
    const notes = [523, 523, 523, 659, 784, 784, 659, 784, 1047];
    const durations = [0.12, 0.12, 0.12, 0.15, 0.12, 0.12, 0.15, 0.15, 0.4];
    let time = 0;
    for (let i = 0; i < notes.length; i++) {
      this.playTone(notes[i], durations[i], 'square', 0.13, time);
      time += durations[i] * 0.85;
    }
    this.playNoise(1.2, 0.08, 0.2);
  },

  playWhistle() {
    this.playTone(900, 0.3, 'sine', 0.15);
    this.playTone(1100, 0.2, 'sine', 0.12, 0.1);
    this.playTone(900, 0.4, 'sine', 0.15, 0.25);
  }
};
