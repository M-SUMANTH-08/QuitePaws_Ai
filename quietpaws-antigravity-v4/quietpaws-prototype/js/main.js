import { CONFIG, STATE, STATE_DISPLAY } from './config.js';
import { VisionEngine } from './vision.js';
import { AudioEngine } from './audio.js';
import { FusionEngine } from './fusion.js';
import { InterventionManager } from './intervention.js';

const $ = id => document.getElementById(id);
const video = $('camera'), overlay = $('overlay'), idleScreen = $('idleScreen');
const statePill = $('statePill'), flashOverlay = $('flashOverlay');
const visionValue = $('visionValue'), audioValue = $('audioValue'), levelValue = $('levelValue');
const approachValue = $('approachValue'), responseValue = $('responseValue'), meetingBadge = $('meetingBadge');
const workspaceBox = $('workspaceBox'), waveform = $('waveform'), fpsCounter = $('fpsCounter'), logList = $('logList');
const dotCamera = $('dotCamera'), dotMic = $('dotMic'), dotModel = $('dotModel');
const navStatus = $('navStatus'), navStatusText = $('navStatusText');
const btnStart = $('btnStart'), btnStop = $('btnStop'), btnMeeting = $('btnMeeting');
const simButtons = document.querySelectorAll('[data-sim]');

const vision = new VisionEngine(), audio = new AudioEngine(), fusion = new FusionEngine(), intervention = new InterventionManager();
const runtime = {
  running:false, stream:null, fusionTimer:null, frameCount:0, lastFpsTime:0, currentState:STATE.NO_DOG,
  meetingMode:true, lastVision:null, approachReady:false, lastMetrics:null, demoScenario:false,
  responseBaseline:null,
};

const waveformBars=[];
for(let i=0;i<CONFIG.WAVEFORM_BARS;i++){const b=document.createElement('div');b.className='waveform-bar';waveform.appendChild(b);waveformBars.push(b);}
function setWaveform(level){const c=Math.max(0,Math.min(1,level));waveformBars.forEach((b,i)=>{const amp=i>waveformBars.length*.75?2+c*22:2+c*10;b.style.height=`${Math.max(2,amp+Math.random()*3)}px`;});}
function resetWaveform(){waveformBars.forEach(b=>b.style.height='2px');}
function setStatePill(s){const d=STATE_DISPLAY[s]||STATE_DISPLAY[STATE.CALM];statePill.className=`state-pill ${d.cls}`;statePill.textContent=d.text;}
function triggerFlash(){flashOverlay.classList.remove('active');void flashOverlay.offsetWidth;flashOverlay.classList.add('active');}
function setMeetingMode(on){runtime.meetingMode=on;btnMeeting.textContent=on?'MEETING MODE  ·  ON':'MEETING MODE  ·  OFF';btnMeeting.classList.toggle('active',on);meetingBadge.textContent=on?'MEETING MODE ON':'MEETING MODE OFF';}
function setApproach(metrics){
  const text=metrics?.approach?'INTERVENTION ZONE':metrics?.workspace?'IN WORKSPACE':'OUTSIDE WORKSPACE';
  approachValue.textContent=text;
  approachValue.className='tel-value '+(metrics?.approach?'err':metrics?.workspace?'warn':'');
}
function renderLog(){const entries=intervention.getLog();if(!entries.length){logList.innerHTML='<div class="log-empty">No interventions yet.</div>';return;}logList.innerHTML=entries.slice(0,CONFIG.LOG_DISPLAY_COUNT).map(e=>{const d=STATE_DISPLAY[e.state]||STATE_DISPLAY[STATE.CALM];const t=new Date(e.t).toTimeString().slice(0,8);const m=e.metrics||{};return `<div class="log-item"><div class="log-dot" style="background:${d.color}"></div><div class="log-state"><b>${m.outcome||'EVENT'}</b><span>${m.cue||d.text} · attempt ${m.attempt||1}</span></div><div class="log-time">${t}</div></div>`;}).join('');}
function setStatusBadge(live){navStatus.classList.toggle('live',live);navStatusText.textContent=live?'LIVE':'OFFLINE';}
function drawWorkspace(){const w=video.videoWidth||640,h=video.videoHeight||480;overlay.width=w;overlay.height=h;const wrap=video.closest('.video-wrap');if(wrap)wrap.style.aspectRatio=`${w}/${h}`;workspaceBox.style.left=`${CONFIG.WORKSPACE.x*100}%`;workspaceBox.style.top=`${CONFIG.WORKSPACE.y*100}%`;workspaceBox.style.width=`${CONFIG.WORKSPACE.w*100}%`;workspaceBox.style.height=`${CONFIG.WORKSPACE.h*100}%`;}

async function visionLoop(){if(!runtime.running)return;try{const result=await vision.detect(video);vision.drawTo(overlay,result.dogs);if(result.dogs.length){visionValue.textContent=`dog ${Math.round(result.topConfidence*100)}%`;fusion.pushVision(result.dogs, video.videoWidth || 640, video.videoHeight || 480);runtime.lastVision=result.dogs[0];}else{visionValue.textContent='no dog';fusion.pushVision([]);runtime.lastVision=null;}runtime.frameCount++;evaluateFusion();}catch(e){console.warn('vision loop',e);}requestAnimationFrame(visionLoop);}
function audioLoop(){if(!runtime.running)return;const r=audio.analyze();levelValue.textContent=r.db>-100?`${Math.round(r.db)} dB`:'—';setWaveform(r.rms*6);if(r.label!=='—'&&r.label!=='Ambient'&&r.confidence>0){audioValue.textContent=`${r.label} · heuristic ${Math.round(r.confidence*100)}%`;fusion.pushAudio(r.label,r.confidence);}else audioValue.textContent='—';evaluateFusion();setTimeout(audioLoop,CONFIG.AUDIO_LOOP_INTERVAL_MS);}
function fpsLoop(){if(!runtime.running)return;const now=performance.now();if(runtime.lastFpsTime){const fps=Math.round(runtime.frameCount/((now-runtime.lastFpsTime)/1000));fpsCounter.textContent=`${fps} FPS · ${Math.round(vision.lastInferenceMs)}ms`;runtime.frameCount=0;}runtime.lastFpsTime=now;setTimeout(fpsLoop,1000);}

function responseSnapshot(){
  const dogs=fusion.recentVision.filter(v=>v.hasDog&&v.geometry);
  if(!dogs.length)return {success:false,reason:'dog not visible'};
  const first=runtime.responseBaseline;
  const latest=dogs.at(-1).geometry;
  if(!first)return {success:false};
  const movedAway = latest.area < first.area*0.86 || latest.cx < first.cx-0.04 || latest.cx > first.cx+0.04;
  const outside = !fusion._inWorkspace(latest);
  return {success:movedAway||outside,movedAway,outside,workspaceDistance:movedAway||outside?'increased':'unchanged'};
}

async function evaluateFusion(){
  const result=fusion.evaluate(runtime.meetingMode); runtime.lastMetrics=result.metrics; setApproach(result.metrics);
  if(result.changed)setStatePill(result.state);
  if(result.metrics.approach && !runtime.approachReady){runtime.approachReady=true;}
  if(!result.metrics.approach)runtime.approachReady=false;
  if(intervention.shouldFire(result.state,result.interventionReady)){
    runtime.responseBaseline=fusion.recentVision.filter(v=>v.hasDog&&v.geometry).at(-1)?.geometry||null;
    responseValue.textContent='OBSERVING 2.6s';
    triggerFlash();
    await intervention.run({stateName:result.state,metrics:result.metrics,getResponse:responseSnapshot,demo:false});
    responseValue.textContent=intervention.getLog()[0]?.metrics?.outcome==='SUCCESS'?'VERIFIED · MOVED AWAY':'STOPPED · OWNER ALERT';
    renderLog();
    runtime.responseBaseline=null;
  }
}

async function startLive(){btnStart.disabled=true;btnStart.innerHTML='<span class="btn-icon">⏳</span><span>Loading model…</span>';try{await vision.load();dotModel.classList.add('on');runtime.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480}},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});video.srcObject=runtime.stream;video.style.display='block';idleScreen.style.display='none';dotCamera.classList.add('on');await new Promise(r=>video.videoWidth?r():video.onloadedmetadata=r);drawWorkspace();await audio.start(runtime.stream);dotMic.classList.add('on');runtime.running=true;runtime.frameCount=0;runtime.lastFpsTime=0;btnStart.hidden=true;btnStop.hidden=false;setStatusBadge(true);setMeetingMode(true);setStatePill(STATE.NO_DOG);responseValue.textContent='WAITING';requestAnimationFrame(visionLoop);audioLoop();fpsLoop();runtime.fusionTimer=setInterval(()=>{if(runtime.running)evaluateFusion();},400);}catch(err){console.error(err);idleScreen.innerHTML=`<div class="idle-icon">⚠️</div><div class="idle-title">${err.name}</div><div class="idle-sub">${err.name==='NotAllowedError'?'Permission denied. Allow camera + mic and try again.':err.message||'Unable to start camera.'}</div><div class="idle-sub" style="font-size:11px;margin-top:8px">Controlled demo buttons remain available.</div>`;btnStart.disabled=false;btnStart.innerHTML='<span class="btn-icon">🎥</span><span>Start Live Detection</span>';}}
function stopLive(){runtime.running=false;if(runtime.fusionTimer){clearInterval(runtime.fusionTimer);runtime.fusionTimer=null;}if(runtime.stream)runtime.stream.getTracks().forEach(t=>t.stop());runtime.stream=null;audio.stop();video.srcObject=null;video.style.display='none';idleScreen.style.display='flex';idleScreen.innerHTML='<div class="idle-icon">📷</div><div class="idle-title">Camera stopped</div><div class="idle-sub">Click Start to resume</div>';dotCamera.classList.remove('on');dotMic.classList.remove('on');setStatusBadge(false);btnStart.hidden=false;btnStart.disabled=false;btnStart.innerHTML='<span class="btn-icon">🎥</span><span>Start Live Detection</span>';btnStop.hidden=true;resetWaveform();setStatePill(STATE.NO_DOG);approachValue.textContent='—';responseValue.textContent='—';}

async function simulateScenario(type){
  runtime.demoScenario=true; runtime.responseBaseline=null; intervention.lastInterventionMs=0; intervention.active=null; responseValue.textContent='DEMO · PROCESSING';
  const now=Date.now();
  fusion.recentVision=[];fusion.recentAudio=[];
  const geometry={x:0.78,y:0.42,w:0.10,h:0.18,cx:0.83,cy:0.51,area:0.018};
  fusion.recentVision.push({hasDog:true,confidence:.86,geometry,t:now});
  fusion.recentAudio.push({label:type==='calm'?'Dog':type==='retry'?'Whimper':'Whimper',confidence:.78,t:now});
  visionValue.textContent='dog 86%';audioValue.textContent=type==='retry'?'Whimper 78%':'Whimper 78%';approachValue.textContent='INTERVENTION ZONE';approachValue.className='tel-value err';setStatePill(STATE.ATTENTION_SEEKING);
  if(type==='calm'){responseValue.textContent='NO INTERVENTION';runtime.demoScenario=false;return;}
  const result=fusion.evaluate(true);runtime.responseBaseline=geometry;triggerFlash();
  await intervention.run({stateName:result.state,metrics:{...result.metrics,approach:true,workspace:true,simulated:true},demo:type==='retry',getResponse:()=>({success:type==='success'})});
  const latest=intervention.getLog()[0];responseValue.textContent=latest?.metrics?.outcome==='SUCCESS'?'VERIFIED · MOVED AWAY':'STOPPED · OWNER ALERT';renderLog();runtime.demoScenario=false;
}

btnStart.addEventListener('click',startLive);btnStop.addEventListener('click',stopLive);btnMeeting.addEventListener('click',()=>setMeetingMode(!runtime.meetingMode));
simButtons.forEach(b=>b.addEventListener('click',()=>simulateScenario(b.dataset.sim)));
setMeetingMode(true);renderLog();setStatePill(STATE.NO_DOG);
