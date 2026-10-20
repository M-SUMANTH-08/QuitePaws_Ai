/** QuietPaws — closed-loop intervention + response verification. */
import { CONFIG, STATE } from './config.js';

export class InterventionManager {
  constructor() {
    this.lastInterventionMs = 0;
    this.log = this._load();
    this.active = null;
  }

  shouldFire(stateName, ready) {
    if (!ready || (stateName !== STATE.HIGH_AROUSAL && stateName !== STATE.ATTENTION_SEEKING)) return false;
    return Date.now() - this.lastInterventionMs >= CONFIG.INTERVENTION_COOLDOWN_MS && !this.active;
  }

  async run({ stateName, metrics, getResponse, demo = false }) {
    this.lastInterventionMs = Date.now();
    const firstCue = 'Owner Voice';
    this.active = { stateName, startedAt: Date.now(), attempt: 1 };
    this._speak(CONFIG.VOICE_CUE_TEXT);
    this._vibrate();

    const first = await this._observe(getResponse, CONFIG.OBSERVE_WINDOW_MS, demo, true);
    if (first.success) {
      this._log(stateName, { ...metrics, cue: firstCue, attempt: 1, outcome: 'SUCCESS', response: first.response });
      this.active = null;
      return { success: true, attempt: 1, outcome: 'SUCCESS' };
    }

    this.active.attempt = 2;
    this._speak(CONFIG.ALTERNATE_CUE_TEXT);
    const second = await this._observe(getResponse, CONFIG.OBSERVE_WINDOW_MS, demo, false);
    const success = second.success;
    this._log(stateName, { ...metrics, cue: 'Alternate Cue', attempt: 2, outcome: success ? 'SUCCESS' : 'STOPPED_ALERT', response: second.response });
    if (!success) this._vibrate();
    this.active = null;
    return { success, attempt: 2, outcome: success ? 'SUCCESS' : 'STOPPED_ALERT' };
  }

  _observe(getResponse, ms, demo, firstAttempt) {
    return new Promise(resolve => {
      const started = performance.now();
      const poll = setInterval(() => {
        const response = typeof getResponse === 'function' ? getResponse() : null;
        if (response?.success) {
          clearInterval(poll);
          resolve({ success: true, response });
        } else if (performance.now() - started >= ms) {
          clearInterval(poll);
          // Simulation is explicitly labeled; it is not presented as a live measurement.
          if (demo && firstAttempt) resolve({ success: false, response: { simulated: true, reason: 'no movement' } });
          else if (demo) resolve({ success: true, response: { simulated: true, reason: 'alternate cue accepted' } });
          else resolve({ success: false, response: { reason: 'no verified movement' } });
        }
      }, 120);
    });
  }

  _speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = CONFIG.VOICE_CUE_RATE;
      u.pitch = CONFIG.VOICE_CUE_PITCH;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }

  _vibrate() {
    if ('vibrate' in navigator) navigator.vibrate(CONFIG.VIBRATION_PATTERN);
  }

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
