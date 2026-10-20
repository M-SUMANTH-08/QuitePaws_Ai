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
    const first = dogFrames.length > 0 ? dogFrames[0].geometry : null;

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

    let areaGrowth = 1;
    let movingToward = false;
    let proximityHeld = false;
    
    if (dogPresent && first && latest) {
      areaGrowth = latest.area / Math.max(first.area, 0.0001);
      // approach = area growing, OR centroid moving vertically downward (toward camera/owner)
      const movingDown = latest.cy > first.cy + 0.05; 
      movingToward = areaGrowth >= CONFIG.APPROACH_AREA_RATIO || movingDown;
      // Large bounding box means dog is very close (e.g. area > 15% of frame)
      proximityHeld = latest.area > 0.15;
    }

    const approach = dogPresent && (movingToward || proximityHeld);

    let next;
    if (!dogPresent && this.recentAudio.length === 0) next = STATE.NO_DOG;
    else if (!dogPresent) next = STATE.UNCERTAIN;
    else if ((audioQualifies(growl) && growl.avg > CONFIG.THRESHOLD_GROWL) ||
             (audioQualifies(bark) && bark.avg > CONFIG.THRESHOLD_BARK_STRONG && audioQualifies(dogVocal) && dogVocal.avg > CONFIG.THRESHOLD_DOG_VOCAL)) next = STATE.HIGH_AROUSAL;
    else if (audioQualifies(whimper) && whimper.avg > CONFIG.THRESHOLD_WHIMPER) next = STATE.ATTENTION_SEEKING;
    else if (audioQualifies(bark) && bark.avg > CONFIG.THRESHOLD_BARK) next = STATE.ACTIVE_PLAYFUL;
    else next = STATE.CALM;

    const changed = next !== this.currentState;
    const barkEventConfirmed = audioQualifies(bark) || audioQualifies(growl) || audioQualifies(whimper);

    // Let the main state machine manage the high level, we just provide the flags
    const interventionReady = meetingMode && dogPresent && approach;

    return {
      state: next, // Legacy state not strictly used in new event loop
      changed,
      meetingMode,
      metrics: {
        barkEventConfirmed,
        dogPresent, dogFrames: dogFrames.length,
        growl: growl.avg, bark: bark.avg, whimper: whimper.avg, dogVocal: dogVocal.avg,
        workspace: proximityHeld, movingToward, proximityHeld, approach, areaGrowth,
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
