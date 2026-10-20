/**
 * QuietPaws — Audio Engine
 * Captures microphone, runs FFT, and classifies sounds heuristically.
 * Matches the spirit of the Android YAMNet classifier (without the model).
 */

import { CONFIG } from './config.js';

export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.freqData = null;
    this.timeData = null;
  }

  /**
   * Start capturing audio from a MediaStream.
   */
  async start(stream) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const source = this.audioCtx.createMediaStreamSource(stream);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = CONFIG.FFT_SIZE;
    this.analyser.smoothingTimeConstant = 0.6;

    source.connect(this.analyser);

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Float32Array(this.analyser.fftSize);
  }

  /**
   * Stop the audio context.
   */
  stop() {
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.analyser = null;
    }
  }

  /**
   * Sample the current audio frame and classify the sound.
   * @returns {{label: string, confidence: number, rms: number, db: number}}
   * NOTE: Browser audio is a spectral heuristic, not YAMNet or a learned classifier.
   */
  analyze() {
    if (!this.analyser) {
      return { label: '—', confidence: 0, rms: 0, db: -100 };
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getFloatTimeDomainData(this.timeData);

    // Compute RMS (loudness)
    let sumSq = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      sumSq += this.timeData[i] * this.timeData[i];
    }
    const rms = Math.sqrt(sumSq / this.timeData.length);
    const db = 20 * Math.log10(Math.max(rms, 1e-6));

    // Frequency band energies (Hz)
    const sampleRate = this.audioCtx.sampleRate;
    const binHz = sampleRate / this.analyser.fftSize;

    const growlBand = this._bandEnergy(80, 200, binHz);
    const barkBand = this._bandEnergy(400, 1200, binHz);
    const whimperBand = this._bandEnergy(1500, 3500, binHz);

    // Classify
    let label = '—';
    let confidence = 0;

    if (rms > CONFIG.AUDIO_MIN_RMS) {
      if (growlBand > barkBand * 1.2 && rms > 0.03) {
        label = 'Growling';
        confidence = Math.min(0.95, growlBand / 200);
      } else if (barkBand > whimperBand * 1.3 && rms > 0.04) {
        label = 'Bark';
        confidence = Math.min(0.95, barkBand / 180);
      } else if (whimperBand > growlBand * 1.2 && rms > 0.015) {
        label = 'Whimper';
        confidence = Math.min(0.85, whimperBand / 150);
      } else {
        label = 'Ambient';
        confidence = Math.min(0.35, rms * 4);
      }
    }

    return { label, confidence, rms, db };
  }

  _bandEnergy(lowHz, highHz, binHz) {
    const lo = Math.max(0, Math.floor(lowHz / binHz));
    const hi = Math.min(this.freqData.length - 1, Math.floor(highHz / binHz));
    let sum = 0;
    let count = 0;
    for (let i = lo; i <= hi; i++) {
      sum += this.freqData[i];
      count++;
    }
    return count > 0 ? sum / count : 0;
  }
}
