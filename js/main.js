import { CONFIG, STATE, STATE_DISPLAY } from './config.js';
import { VisionEngine } from './vision.js';
import { AudioEngine } from './audio.js';
import { FusionEngine } from './fusion.js';
import { InterventionManager } from './intervention.js';

const $ = id => document.getElementById(id);
const video = $('camera'), overlay = $('overlay'), idleScreen = $('idleScreen');
const cameraSection = $('cameraSection');
const waveform = $('waveform'), fpsCounter = $('fpsCounter'), logList = $('logList');
const dotCamera = $('dotCamera'), dotMic = $('dotMic'), dotModel = $('dotModel');
const btnStart = $('btnStart'), btnMeeting = $('btnMeeting');

const statusMeeting = $('statusMeeting'), statusDog = $('statusDog'), statusIntervention = $('statusIntervention');
const cardDog = $('cardDog'), cardIntervention = $('cardIntervention');

const voiceState = $('voiceState'), voiceSub = $('voiceSub');
const btnRecordPrimary = $('btnRecordPrimary'), btnPreviewPrimary = $('btnPreviewPrimary'), btnDeletePrimary = $('btnDeletePrimary');
const btnClearLog = $('btnClearLog');

const vision = new VisionEngine(), audio = new AudioEngine(), fusion = new FusionEngine(), intervention = new InterventionManager();
const runtime = {
  running: false, 
  videoStream: null, 
  audioStream: null,
  cameraActive: false,
  cameraStartTime: 0,
  frameCount: 0, 
  lastFpsTime: 0, 
  currentState: STATE.IDLE, 
  meetingMode: true, 
  responseBaseline: null,
  hapticsSupported: typeof navigator.vibrate === 'function'
};

// Check haptics immediately
const hapticCheckState = $('hapticCheckState');
if (hapticCheckState) {
  hapticCheckState.textContent = runtime.hapticsSupported ? 'READY' : 'UNAVAILABLE ON THIS DEVICE';
  hapticCheckState.style.color = runtime.hapticsSupported ? 'var(--yellow)' : 'var(--muted)';
}

// UI Helpers
const waveformBars = [];
for(let i=0; i<CONFIG.WAVEFORM_BARS; i++) {
  const b = document.createElement('div');
  b.className = 'waveform-bar';
  waveform.appendChild(b);
  waveformBars.push(b);
}
function setWaveform(level) {
  const c = Math.max(0, Math.min(1, level));
  waveform.classList.toggle('active', c > 0.1);
  waveformBars.forEach((b, i) => {
    const amp = i > waveformBars.length * 0.75 ? 2 + c * 16 : 2 + c * 8;
    b.style.height = `${Math.max(2, amp + Math.random() * 3)}px`;
  });
}

function setMeetingMode(on) {
  runtime.meetingMode = on;
  statusMeeting.textContent = on ? '● ON' : 'OFF';
  statusMeeting.style.color = on ? 'var(--yellow)' : 'var(--muted)';
  
  if (!on && runtime.running) {
    stopCameraAndInference();
    updateDashState({ state: STATE.IDLE, metrics: {} });
    logEvent('SYSTEM', 'Meeting mode disabled');
  } else if (on && runtime.running) {
    updateDashState({ state: STATE.MEETING_LISTENING, metrics: {} });
    logEvent('SYSTEM', 'Meeting mode enabled');
  }
}

function updateDashState(result) {
  if (result.state) {
    const stateDisplay = STATE_DISPLAY[result.state];
    statusDog.textContent = stateDisplay ? stateDisplay.text : result.state;
    cardDog.classList.toggle('active', stateDisplay?.highlight);
    cameraSection.classList.toggle('alert-state', stateDisplay?.highlight);
  }
}

// Logging
function pad(n) { return n < 10 ? '0'+n : n; }
function logEvent(type, detail, highlight = false) {
  const now = new Date();
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  const div = document.createElement('div');
  div.className = 'log-item';
  div.innerHTML = `<div class="log-time">${time}</div><div class="log-event ${highlight?'highlight':''}">${type}: ${detail}</div>`;
  
  const empty = logList.querySelector('.log-empty');
  if (empty) empty.remove();
  
  logList.insertBefore(div, logList.firstChild);
  while (logList.children.length > CONFIG.LOG_MAX_ENTRIES) {
    logList.removeChild(logList.lastChild);
  }
}

function renderPersistedLog() {
  logList.innerHTML = '';
  const entries = intervention.getLog();
  if (!entries.length) {
    logList.innerHTML = '<div class="log-empty">SYSTEM IDLE</div>';
    return;
  }
  entries.slice(0, CONFIG.LOG_DISPLAY_COUNT).forEach(e => {
    const d = new Date(e.t);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const m = e.metrics || {};
    const div = document.createElement('div');
    div.className = 'log-item';
    const highlight = m.outcome === 'SUCCESS';
    div.innerHTML = `<div class="log-time">${time}</div><div class="log-event ${highlight?'highlight':''}">${m.outcome || 'EVENT'}: ${m.cue || 'Intervention'}</div>`;
    logList.appendChild(div);
  });
}

// Camera Lifecycle
async function startCameraAndInference() {
  if (runtime.cameraActive) return;
  try {
    updateDashState({ state: STATE.CAMERA_STARTING });
    
    runtime.videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });
    
    video.srcObject = runtime.videoStream;
    video.style.display = 'block';
    dotCamera.classList.add('on');
    dotCamera.classList.remove('standby');
    
    await new Promise(r => video.videoWidth ? r() : video.onloadedmetadata = r);
    const w = video.videoWidth || 640, h = video.videoHeight || 480;
    overlay.width = w; overlay.height = h;
    const wrap = video.closest('.video-wrap');
    if (wrap) wrap.style.aspectRatio = `${w}/${h}`;
    
    runtime.cameraActive = true;
    runtime.cameraStartTime = Date.now();
    updateDashState({ state: STATE.CAMERA_TRACKING });
    
    requestAnimationFrame(visionLoop);
  } catch (err) {
    console.error('Failed to wake camera', err);
    logEvent('ERROR', 'Camera wake failed');
  }
}

function stopCameraAndInference() {
  if (!runtime.cameraActive) return;
  runtime.cameraActive = false;
  if (runtime.videoStream) {
    runtime.videoStream.getTracks().forEach(t => t.stop());
    runtime.videoStream = null;
  }
  video.style.display = 'none';
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  
  dotCamera.classList.remove('on');
  dotCamera.classList.add('standby');
  fusion.reset(); // clear vision tracking history
}

// Pipeline
async function visionLoop() {
  if (!runtime.running || !runtime.cameraActive) return;
  try {
    const result = await vision.detect(video);
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    if (result.dogs.length) {
      ctx.strokeStyle = '#FFD600'; ctx.lineWidth = 2;
      for (const d of result.dogs) {
        const [x, y, w, h] = d.bbox;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(255,214,0,0.1)';
        ctx.fillRect(x,y,w,h);
        
        ctx.fillStyle = '#FFD600';
        ctx.font = '12px monospace';
        ctx.fillText(`DOG ${Math.round(d.score*100)}%`, x, y > 15 ? y - 4 : y + 12);
      }
      fusion.pushVision(result.dogs, video.videoWidth || 640, video.videoHeight || 480);
    } else {
      fusion.pushVision([]);
    }
    runtime.frameCount++;
  } catch (e) {}
  
  // High arousal or persistent dog without bark handles camera via evaluateFusion
  requestAnimationFrame(visionLoop);
}

function audioLoop() {
  if (!runtime.running) return;
  const r = audio.analyze();
  setWaveform(r.rms * 6);
  if (r.label !== '—' && r.label !== 'Ambient' && r.label !== 'Speech/Noise' && r.confidence > 0.2) {
    if (!intervention.active) {
      fusion.pushAudio(r.label, r.confidence);
    }
  }
  setTimeout(audioLoop, CONFIG.AUDIO_LOOP_INTERVAL_MS);
}

function fpsLoop() {
  if (!runtime.running) return;
  const now = performance.now();
  if (runtime.lastFpsTime) {
    const fps = Math.round(runtime.frameCount / ((now - runtime.lastFpsTime) / 1000));
    fpsCounter.textContent = runtime.cameraActive ? `${fps} FPS` : `CAMERA STANDBY`;
    runtime.frameCount = 0;
  }
  runtime.lastFpsTime = now;
  setTimeout(fpsLoop, 1000);
}

function responseSnapshot() {
  const dogs = fusion.recentVision.filter(v => v.hasDog && v.geometry);
  if (!dogs.length) return { success: false, reason: 'dog not visible' };
  const first = runtime.responseBaseline;
  const latest = dogs.at(-1).geometry;
  if (!first) return { success: false };
  const movedAway = latest.area < first.area * 0.86 || latest.cy < first.cy - 0.05;
  const gone = latest.area < 0.05; // Dog is far away
  return { success: movedAway || gone };
}

async function evaluateFusion() {
  if (!runtime.meetingMode) return;
  
  const result = fusion.evaluate(runtime.meetingMode);
  
  // Logic 1: Audio Wakeup
  if (result.metrics.barkEventConfirmed && !runtime.cameraActive) {
    logEvent('AUDIO EVENT', 'Bark confirmed', true);
    await startCameraAndInference();
    return;
  }

  // Logic 2: Camera Observation Timeouts
  if (runtime.cameraActive && !intervention.active) {
    if (result.metrics.dogPresent) {
      if (result.metrics.approach) {
        updateDashState({ state: STATE.APPROACH_CONFIRMED });
      } else {
        updateDashState({ state: STATE.DOG_DETECTED });
      }
    } else {
      // No dog present. Wait 3 seconds to see if it appears.
      const msActive = Date.now() - runtime.cameraStartTime;
      if (msActive > 3000) {
        logEvent('AUDIO EVENT', 'No visual confirmation');
        updateDashState({ state: STATE.DOG_NOT_FOUND });
        stopCameraAndInference();
        
        setTimeout(() => {
          if (!runtime.cameraActive) {
            updateDashState({ state: runtime.meetingMode ? STATE.MEETING_LISTENING : STATE.IDLE });
          }
        }, 2000);
        return;
      }
    }
  }
  
  // Logic 3: Intervention
  if (runtime.cameraActive && intervention.shouldFire(result.state, result.interventionReady)) {
    runtime.responseBaseline = fusion.recentVision.filter(v => v.hasDog && v.geometry).at(-1)?.geometry || null;
    
    updateDashState({ state: STATE.INTERVENTION });
    logEvent('SYSTEM', 'Intervention triggered', true);
    
    // Pass onPlay callback so UI syncs when audio physically begins
    await intervention.run({ 
      stateName: result.state, 
      metrics: result.metrics, 
      getResponse: responseSnapshot,
      onPlay: (cueName) => {
        statusIntervention.textContent = 'PLAYING';
        cardIntervention.classList.add('active');
        logEvent('SPEAKER', `${cueName} PLAYING`);
        setTimeout(() => { if(runtime.responseBaseline) {
          statusIntervention.textContent = 'OBSERVING RESPONSE...'; 
          updateDashState({ state: STATE.OBSERVING });
        }}, 1000);
      },
      onFail: (reason) => {
        statusIntervention.textContent = 'PLAYBACK FAILED';
        logEvent('SPEAKER', `PLAYBACK FAILED (${reason})`, true);
      }
    });
    
    const latestLog = intervention.getLog()[0];
    const outcome = latestLog?.metrics?.outcome;
    if (outcome === 'SUCCESS') {
      logEvent('VERIFIED', 'Movement detected', true);
      statusIntervention.textContent = 'RESPONSE VERIFIED';
      updateDashState({ state: STATE.RESPONSE_VERIFIED });
    } else {
      logEvent('NO RESPONSE', 'Owner alerted');
      statusIntervention.textContent = 'NO RESPONSE';
      updateDashState({ state: STATE.NO_RESPONSE });
    }
    
    setTimeout(() => {
      statusIntervention.textContent = 'STANDBY';
      cardIntervention.classList.remove('active');
      stopCameraAndInference(); // End of intervention block -> go back to sleep
      updateDashState({ state: runtime.meetingMode ? STATE.MEETING_LISTENING : STATE.IDLE });
    }, 3000);
    
    renderPersistedLog();
    runtime.responseBaseline = null;
  }
}

function getMediaErrorStr(err) {
  if (err.name === 'NotAllowedError' || err.name === 'SecurityError') return 'ACCESS BLOCKED';
  if (err.name === 'NotFoundError') return 'NOT FOUND';
  if (err.name === 'NotReadableError') return 'BUSY OR UNAVAILABLE';
  if (err.name === 'OverconstrainedError') return 'CONSTRAINTS FAILED';
  if (err.name === 'TypeError') return `TYPE ERROR: ${err.message}`;
  return 'ERROR: ' + err.name + (err.message ? ` (${err.message})` : '');
}

const startError = $('startError');

async function startLive() {
  btnStart.textContent = 'STARTING...';
  btnStart.disabled = true;
  startError.textContent = '';
  
  // Unlock audio during user interaction
  try {
    if (intervention.audioCtx.state === 'suspended') {
      await intervention.audioCtx.resume();
    }
  } catch(e) {}
  
  if (!window.isSecureContext) {
    startError.innerHTML = `CAMERA API UNAVAILABLE<br>Requires Secure Context / HTTPS<br><br>Diagnostics:<br>protocol: ${location.protocol}<br>origin: ${location.origin}`;
    btnStart.textContent = 'RETRY';
    btnStart.disabled = false;
    return;
  }
  
  // 1. Request Camera briefly to get browser permissions locked in, then release.
  try {
    const initCam = await navigator.mediaDevices.getUserMedia({ video: true });
    initCam.getTracks().forEach(t => t.stop()); // Permission acquired, immediately stop camera
    dotCamera.classList.add('standby');
    idleScreen.style.display = 'none';
  } catch (err) {
    console.error('Camera initialization failed', err);
    dotCamera.classList.remove('standby');
    const errStr = getMediaErrorStr(err);
    startError.innerHTML = `CAMERA ACCESS FAILED: ${errStr}<br><br>Please check browser permissions and settings.`;
    btnStart.textContent = 'RETRY';
    btnStart.disabled = false;
    return; // Halt if camera fails
  }

  // 2. Initialize AI Model
  try {
    const statusText = document.getElementById('navStatusText');
    if (statusText) statusText.textContent = 'AI LOADING...';
    
    await vision.load();
    dotModel.classList.add('on');
    if (statusText) statusText.textContent = 'LIVE';
  } catch (err) {
    console.error('Model initialization failed', err);
    idleScreen.style.display = 'flex';
    
    startError.innerHTML = `AI MODEL UNAVAILABLE<br>${err.name}: ${err.message}`;
    btnStart.textContent = 'RETRY';
    btnStart.disabled = false;
    return;
  }

  // 3. Request Microphone for low-power listening
  try {
    runtime.audioStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    await audio.start(runtime.audioStream);
    dotMic.classList.add('on');
  } catch (audioErr) {
    console.warn('Microphone failed', audioErr);
    dotMic.classList.add('err');
    const wfLabel = document.querySelector('.waveform-label');
    if (wfLabel) wfLabel.innerHTML = `MIC <span style="color:var(--muted)">UNAVAILABLE</span>`;
  }
  
  runtime.running = true;
  runtime.frameCount = 0;
  runtime.lastFpsTime = 0;
  
  fusion.reset();
  
  logEvent('SYSTEM', 'Audio Guard Active. Camera on standby.');
  
  updateDashState({ state: STATE.MEETING_LISTENING });
  
  audioLoop();
  fpsLoop();
  setInterval(() => { if (runtime.running) evaluateFusion(); }, 200);
}

// Voice Cue UI
function updateCueUI() {
  const hasPrimary = intervention.hasCue('primary');
  
  if (hasPrimary) {
    voiceState.textContent = 'READY';
    voiceState.classList.add('recorded');
    voiceSub.textContent = 'Saved locally';
  } else {
    voiceState.textContent = 'Not recorded';
    voiceState.classList.remove('recorded');
    voiceSub.textContent = 'No audio will play';
  }
  
  btnRecordPrimary.textContent = hasPrimary ? 'RE-RECORD' : 'RECORD';
  btnPreviewPrimary.hidden = !hasPrimary;
  btnDeletePrimary.hidden = !hasPrimary;
}

async function handleRecord(slot) {
  try {
    btnRecordPrimary.classList.add('recording');
    btnRecordPrimary.textContent = 'REC...';
    voiceState.textContent = 'Recording (max 4s)';
    voiceState.className = 'voice-state';
    
    const blob = await intervention.recordCue(slot, 4000);
    voiceSub.textContent = `${(blob.size / 1024).toFixed(1)} KB saved`;
    updateCueUI();
    voiceSub.textContent = `${(blob.size / 1024).toFixed(1)} KB saved`;
  } catch (err) {
    voiceState.textContent = 'Permission denied';
  } finally {
    btnRecordPrimary.classList.remove('recording');
    updateCueUI();
  }
}

btnRecordPrimary.addEventListener('click', () => handleRecord('primary'));
btnPreviewPrimary.addEventListener('click', () => intervention.previewCue('primary'));
btnDeletePrimary.addEventListener('click', () => { intervention.deleteCue('primary'); updateCueUI(); });
btnClearLog.addEventListener('click', () => { intervention.clearLog(); renderPersistedLog(); });

// Init
btnStart.addEventListener('click', startLive);
btnMeeting.addEventListener('click', () => setMeetingMode(!runtime.meetingMode));

setMeetingMode(true);
intervention.clearLog(); // Clear stale logs from previous architecture
renderPersistedLog();
updateCueUI();
