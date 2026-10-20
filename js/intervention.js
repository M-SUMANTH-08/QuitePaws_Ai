/** QuietPaws — closed-loop intervention + response verification. */
import { CONFIG, STATE } from './config.js';

export class InterventionManager {
  constructor() {
    this.lastInterventionMs = 0;
    this.log = this._load();
    this.active = null;
    /** @type {Blob|null} Owner-recorded primary cue */
    this.recordedCue = this._loadCue('quietpaws_cue_primary');
    /** @type {Blob|null} Owner-recorded alternate cue */
    this.recordedAltCue = this._loadCue('quietpaws_cue_alternate');
    /** Currently playing audio element */
    this._audioEl = null;
  }

  shouldFire(stateName, ready) {
    if (!ready) return false;
    return Date.now() - this.lastInterventionMs >= CONFIG.INTERVENTION_COOLDOWN_MS && !this.active;
  }

  async run({ stateName, metrics, getResponse, onPlay, onFail }) {
    this.lastInterventionMs = Date.now();
    const firstCue = this.recordedCue ? 'Owner Recording' : 'NOT RECORDED';
    this.active = { stateName, startedAt: Date.now(), attempt: 1 };

    this._vibrate();
    
    if (this.recordedCue) {
      await this._playCue(this.recordedCue, 
        () => { if (onPlay) onPlay(firstCue); },
        (reason) => { if (onFail) onFail(reason); }
      );
    } else {
      if (onFail) onFail('NOT RECORDED');
      await new Promise(r => setTimeout(r, 2000));
    }

    const first = await this._observe(getResponse, CONFIG.OBSERVE_WINDOW_MS);
    if (first.success) {
      this._log(stateName, { ...metrics, cue: firstCue, attempt: 1, outcome: 'SUCCESS', response: first.response });
      this.active = null;
      return { success: true, attempt: 1, outcome: 'SUCCESS' };
    }

    this.active.attempt = 2;
    const altCue = this.recordedAltCue ? 'Owner Recording (Alt)' : 'NOT RECORDED';
    
    if (this.recordedAltCue) {
      await this._playCue(this.recordedAltCue,
        () => { if (onPlay) onPlay(altCue); },
        (reason) => { if (onFail) onFail(reason); }
      );
    } else {
      if (onFail) onFail('NOT RECORDED');
      await new Promise(r => setTimeout(r, 1500));
    }
    
    const second = await this._observe(getResponse, CONFIG.OBSERVE_WINDOW_MS);
    const success = second.success;
    this._log(stateName, { ...metrics, cue: altCue, attempt: 2, outcome: success ? 'SUCCESS' : 'STOPPED_ALERT', response: second.response });
    if (!success) this._vibrate(true);
    this.active = null;
    return { success, attempt: 2, outcome: success ? 'SUCCESS' : 'STOPPED_ALERT' };
  }

  _observe(getResponse, ms) {
    return new Promise(resolve => {
      const started = performance.now();
      const poll = setInterval(() => {
        const response = typeof getResponse === 'function' ? getResponse() : null;
        if (response?.success) {
          clearInterval(poll);
          resolve({ success: true, response });
        } else if (performance.now() - started >= ms) {
          clearInterval(poll);
          resolve({ success: false, response: { reason: 'no verified movement' } });
        }
      }, 120);
    });
  }

  /**
   * Play a recorded cue blob, or fall back to SpeechSynthesis TTS.
   * @param {Blob|null} blob
   * @param {string} fallbackText
   */
  get audioCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  async _playCue(blob, onPlay, onFail) {
    if (!blob || blob.size === 0) {
      if (onFail) onFail('INVALID RECORDING');
      return false;
    }
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      const ended = new Promise((resolve) => {
        source.onended = resolve;
        setTimeout(resolve, Math.max(audioBuffer.duration * 1000 + 500, 4000));
      });
      
      source.start();
      if (onPlay) onPlay();
      await ended;
      return true;
    } catch (err) {
      console.error('Web Audio playback failed', err);
      return await this._playCueHTML5(blob, onPlay, onFail);
    }
  }

  async _playCueHTML5(blob, onPlay, onFail) {
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = 1;
      this._audioEl = audio;
      
      await audio.play(); // Throws if blocked
      if (onPlay) onPlay();
      
      await new Promise(resolve => {
        audio.onended = resolve;
        audio.onerror = resolve;
        setTimeout(resolve, 4000);
      });
      
      URL.revokeObjectURL(url);
      this._audioEl = null;
      return true;
    } catch (err) {
      console.error('HTML5 audio playback failed', err);
      if (onFail) onFail('PLAYBACK FAILED');
      return false;
    }
  }

  _vibrate(escalation = false) {
    if (typeof navigator.vibrate === 'function') {
      const pattern = escalation ? [70, 40, 70, 40, 220] : [90, 50, 180];
      return navigator.vibrate(pattern);
    }
    return false;
  }

  /* -------- Owner voice recording -------- */

  /**
   * Record an owner voice cue from the microphone.
   * Returns the Blob and persists it to localStorage.
   * @param {'primary'|'alternate'} slot
   * @param {number} maxMs Maximum recording duration in ms
   * @returns {Promise<Blob>}
   */
  async recordCue(slot = 'primary', maxMs = 4000) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: this._mimeType() });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

    return new Promise((resolve, reject) => {
      recorder.onerror = reject;
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (slot === 'primary') this.recordedCue = blob;
        else this.recordedAltCue = blob;
        await this._saveCue(slot === 'primary' ? 'quietpaws_cue_primary' : 'quietpaws_cue_alternate', blob);
        resolve(blob);
      };
      recorder.start();
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, maxMs);
    });
  }

  /** Stop a currently running recording early. */
  stopRecording(recorder) {
    if (recorder && recorder.state === 'recording') recorder.stop();
  }

  /** Check if a cue slot has a recording. */
  hasCue(slot = 'primary') {
    return slot === 'primary' ? !!this.recordedCue : !!this.recordedAltCue;
  }

  /** Delete a recorded cue. */
  deleteCue(slot = 'primary') {
    const key = slot === 'primary' ? 'quietpaws_cue_primary' : 'quietpaws_cue_alternate';
    if (slot === 'primary') this.recordedCue = null;
    else this.recordedAltCue = null;
    try { localStorage.removeItem(key); } catch (_) {}
  }

  /** Preview playback of a recorded cue. */
  async previewCue(slot = 'primary') {
    const blob = slot === 'primary' ? this.recordedCue : this.recordedAltCue;
    if (!blob) return;
    await this._playCue(blob);
  }

  _mimeType() {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    return '';
  }

  /* -------- Persistence -------- */

  async _saveCue(key, blob) {
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise(r => { reader.onload = () => r(reader.result); reader.readAsDataURL(blob); });
      localStorage.setItem(key, dataUrl);
    } catch (_) {
      // Storage full or private mode — cue still works this session
    }
  }

  _loadCue(key) {
    try {
      const dataUrl = localStorage.getItem(key);
      if (!dataUrl) return null;
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'audio/webm';
      const binary = atob(parts[1]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
      return new Blob([array], { type: mime });
    } catch (_) {
      return null;
    }
  }

  /* -------- Session log -------- */

  getLog() { return this.log; }
  clearLog() { this.log = []; this._save(); }

  _log(state, metrics) {
    this.log.unshift({ state, t: Date.now(), metrics });
    this.log = this.log.slice(0, CONFIG.LOG_MAX_ENTRIES);
    this._save();
  }

  _load() { try { return JSON.parse(localStorage.getItem(CONFIG.LOG_STORAGE_KEY) || '[]'); } catch (_) { return []; } }
  _save() { try { localStorage.setItem(CONFIG.LOG_STORAGE_KEY, JSON.stringify(this.log)); } catch (_) {} }
}
