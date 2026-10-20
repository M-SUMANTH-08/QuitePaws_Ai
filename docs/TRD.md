# QuietPaws — Technical Requirements Document (TRD)

## 1. Architecture

```text
Browser / Android device
        │
        ├── Camera ──> Vision model ──┐
        │                             │
        └── Microphone -> Audio model ┤
                                      ▼
                              Temporal Fusion
                                      │
                              Workspace Context
                                      │
                              Decision / Confidence
                                      │
                              Intervention Engine
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                    Speaker cue               Observation
                                                   │
                                             Response verifier
                                                   │
                              ┌────────────────────┴──────────┐
                              ▼                               ▼
                           SUCCESS                         FAILURE
                              │                               │
                            STOP                      one alternate cue
                                                              │
                                                         STOP + HAPTIC
                                                              │
                                                         Local session log
```

## 2. Browser stack
- HTML/CSS/ES modules.
- TensorFlow.js + COCO-SSD for vision.
- Web Audio API for spectral analysis.
- SpeechSynthesis for owner cue.
- Vibration API where supported.
- localStorage for session log.
- Vercel static hosting.

## 3. Native stack target
- Kotlin.
- CameraX ImageAnalysis.
- EfficientDet-Lite0 candidate.
- YAMNet TFLite candidate.
- Coroutines/Executors.
- SQLite or Room for structured local logs.
- VibratorManager/VibrationEffect.

## 4. State machine
SEARCHING → TRACKED → APPROACHING → INTERVENTION_ELIGIBLE → INTERVENING → OBSERVING → VERIFIED / RETRYING → STOPPED.

UNCERTAIN can be entered from any ambiguous evidence state. UNCERTAIN must not trigger intervention.

## 5. Confidence
Browser starting thresholds are configuration values, not scientific probabilities. Native thresholds must be calibrated on the target device.

## 6. Workspace geometry
Workspace is represented as normalized coordinates. Browser verification uses relative movement and workspace exit, not real-world metres.

## 7. Timing
The browser observes for approximately 2.6 seconds after intervention. Do not describe this as end-to-end inference latency.

## 8. Network/privacy
The ML loop must not require a remote inference API. The website may use Vercel hosting and optional Vercel Web Analytics separately from camera/microphone processing.

## 9. Security headers
Vercel configuration includes HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy and COOP. Adjust CSP only after testing all required CDN/model sources.

## 10. Performance strategy
- Deferred model scripts.
- Production JS bundling/minification.
- Minified CSS.
- No unnecessary runtime framework.
- No database/network calls for the core demo.
- LocalStorage is sufficient for a single-browser demo.

## 11. Failure handling
- CDN/model timeout should show a visible error.
- Camera/mic denial should preserve controlled demo functionality.
- Unsupported haptics should not break the demo.
- No dog + audio ambiguity = UNCERTAIN, no intervention.
