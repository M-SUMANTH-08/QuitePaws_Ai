/** QuietPaws — Multimodal + workspace-aware fusion engine. */
import { CONFIG, STATE } from './config.js';

export class FusionEngine {
  constructor() {
    this.recentVision = [];
    this.recentAudio = [];
    this.currentState = STATE.NO_DOG;
    this.previousDog = null;
  }

  pushVision(dogs = [], frameWidth = 640, frameHeight = 480) {
    const now = Date.now();
    const top = dogs.length ? dogs.reduce((a, b) => (a.score > b.score ? a : b)) : null;
    const v = top ? this._geometry(top.bbox, frameWidth, frameHeight) : null;
    this.recentVision.push({ hasDog: !!top, confidence: top?.score || 0, geometry: v, t: now });
    this._prune();
  }

  // Backward-compatible helper for controlled simulation.
  pushVisionLegacy(hasDog, confidence, geometry = null) {
    const now = Date.now();
    this.recentVision.push({ hasDog, confidence, geometry, t: now });
    this._prune();
  }

  pushAudio(label, confidence) {
    if (confidence < 0.15) return;
    this.recentAudio.push({ label, confidence, t: Date.now() });
    this._prune();
  }

  evaluate(meetingMode = true) {
    this._prune();
    const visionWindow = this.recentVision.slice(-CONFIG.VISION_CONSENSUS_WINDOW);
    const dogFrames = visionWindow.filter(v => v.hasDog && v.geometry);
    const dogPresent = dogFrames.length >= CONFIG.VISION_CONSENSUS_MIN_FRAMES;
    const latest = dogFrames.at(-1)?.geometry || null;
    const previous = dogFrames.length > 1 ? dogFrames.at(-2).geometry : null;

    const audioStats = label => {
      const matches = this.recentAudio.filter(a => a.label === label);
      if (!matches.length) return { avg: 0, samples: 0 };
      const recent = matches.slice(-8);
      return { avg: recent.reduce((sum, a) => sum + a.confidence, 0) / recent.length, samples: recent.length };
    };
    const growl = audioStats('Growling');
    const bark = audioStats('Bark');
    const whimper = audioStats('Whimper');
    const dogVocal = audioStats('Dog');
    const audioQualifies = stat => stat.samples >= CONFIG.AUDIO_CONSENSUS_MIN_SAMPLES;

    const workspace = latest ? this._inWorkspace(latest) : false;
    const areaGrowth = previous && latest ? latest.area / Math.max(previous.area, 0.0001) : 1;
    const movingToward = previous && latest ? areaGrowth >= CONFIG.APPROACH_AREA_RATIO : false;
    const proximityHeld = this._workspaceHeld();
    const approach = dogPresent && workspace && (movingToward || proximityHeld);

    let next;
    if (!dogPresent && this.recentAudio.length === 0) next = STATE.NO_DOG;
    else if (!dogPresent) next = STATE.UNCERTAIN;
    else if ((audioQualifies(growl) && growl.avg > CONFIG.THRESHOLD_GROWL) ||
             (audioQualifies(bark) && bark.avg > CONFIG.THRESHOLD_BARK_STRONG && audioQualifies(dogVocal) && dogVocal.avg > CONFIG.THRESHOLD_DOG_VOCAL)) next = STATE.HIGH_AROUSAL;
    else if (audioQualifies(whimper) && whimper.avg > CONFIG.THRESHOLD_WHIMPER) next = STATE.ATTENTION_SEEKING;
    else if (audioQualifies(bark) && bark.avg > CONFIG.THRESHOLD_BARK) next = STATE.ACTIVE_PLAYFUL;
    else next = STATE.CALM;

    const changed = next !== this.currentState;
    this.currentState = next;
    const behavioralTrigger = next === STATE.HIGH_AROUSAL || next === STATE.ATTENTION_SEEKING;
    const interventionReady = meetingMode && behavioralTrigger && approach;

    return {
      state: next,
      changed,
      meetingMode,
      metrics: {
        dogPresent, dogFrames: dogFrames.length,
        growl: growl.avg, bark: bark.avg, whimper: whimper.avg, dogVocal: dogVocal.avg,
        workspace, movingToward, proximityHeld, approach, areaGrowth,
        audioSamples: { growl: growl.samples, bark: bark.samples, whimper: whimper.samples, dog: dogVocal.samples },
      },
      interventionReady,
    };
  }

  _geometry(bbox, frameWidth = 640, frameHeight = 480) {
    const [px, py, pw, ph] = bbox;
    const x = px / frameWidth, y = py / frameHeight, w = pw / frameWidth, h = ph / frameHeight;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, area: Math.max(0.0001, w * h) };
  }

  _inWorkspace(g) {
    const W = CONFIG.WORKSPACE;
    return g.cx >= W.x && g.cx <= W.x + W.w && g.cy >= W.y && g.cy <= W.y + W.h;
  }

  _workspaceHeld() {
    const recent = this.recentVision.filter(v => v.hasDog && v.geometry).slice(-5);
    if (recent.length < 3) return false;
    return recent.filter(v => this._inWorkspace(v.geometry)).length >= 3;
  }

  reset() {
    this.recentVision = [];
    this.recentAudio = [];
    this.currentState = STATE.NO_DOG;
  }

  _prune() {
    const cutoff = Date.now() - CONFIG.FUSION_WINDOW_MS;
    this.recentVision = this.recentVision.filter(v => v.t > cutoff);
    this.recentAudio = this.recentAudio.filter(a => a.t > cutoff);
  }
}
