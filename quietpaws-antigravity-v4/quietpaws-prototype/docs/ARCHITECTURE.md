# QuietPaws — Architecture & Resources

## Product architecture
SEE → HEAR → THINK → ACT → VERIFY → INFORM.

### SEE
Browser: COCO-SSD.
Native candidate: EfficientDet-Lite0.

### HEAR
Browser: Web Audio spectral features.
Native candidate: YAMNet TFLite.

### THINK
Temporal fusion, workspace context, behavioral state and intervention eligibility.

### ACT
Owner voice cue through the device speaker.

### VERIFY
Relative movement / workspace exit observed after intervention.

### INFORM
Haptic feedback and local session log.

## Data models
- VisionSample: timestamp, dog confidence, normalized geometry.
- AudioSample: timestamp, label, heuristic/model confidence.
- FusionState: state, evidence counts, workspace, approach, intervention readiness.
- InterventionEvent: cue, attempt, outcome, response metrics.
- SessionSummary: counts and timestamps derived from events.

## Module boundaries
- `vision.js`: camera inference and overlay.
- `audio.js`: browser audio capture and spectral analysis.
- `fusion.js`: temporal + workspace decision logic.
- `intervention.js`: cue, observation, retry, haptic and local logging.
- `main.js`: UI orchestration.
- `config.js`: thresholds and tunable parameters.

## Resources
- Browser ML: TensorFlow.js + COCO-SSD.
- Native target: TensorFlow Lite/LiteRT candidates.
- Hosting: Vercel static deployment.
- Analytics: optional Vercel Web Analytics.
- Storage: browser localStorage; native SQLite/Room candidate.

## Optional advanced modules
- TDOA/GCC-PHAT.
- Automatic meeting detection.
- Advanced animal pose.
- Multi-actuator haptics.

These are not dependencies for the core demo.
