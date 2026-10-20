# QuietPaws — Product Requirements Document (PRD)

## 1. Product
**QuietPaws** is a phone-native, offline-first, meeting-aware agent for preventing pet interruptions during live meetings.

**Category:** Workplace Interruption Prevention.

**Backbone:** SEE → HEAR → THINK → ACT → VERIFY → INFORM.

## 2. Target user
Remote/hybrid workers who need to stay in a live meeting while a dog may approach their workspace and demand attention.

## 3. Core user problem
The user cannot always leave a meeting, mute, or physically redirect a dog. QuietPaws attempts to handle the first interruption autonomously and quietly inform the owner.

## 4. MVP promise
When Meeting Mode is active and the system has sufficient evidence that a dog is approaching/entering the workspace with an attention-seeking behavioral signal, QuietPaws can:
1. play the owner's predefined voice cue;
2. observe for about 2–3 seconds;
3. verify whether the dog moved away from the workspace;
4. try one alternate cue if the first cue was not verified;
5. stop and silently alert the owner if still unresolved;
6. store a local session record.

## 5. Non-goals
- Dog emotion diagnosis.
- Veterinary or medical advice.
- Guaranteed behavior modification.
- Continuous remote pet care.
- Cloud video/audio processing.
- Breed recognition.
- Thermal/GSR/Bluetooth hardware in the MVP.
- Automatic meeting detection as a core dependency.

## 6. Demo device truth
- **Product target:** iQOO 15.
- **Current physical development/demo device:** POCO X6 Pro.
- POCO measurements are development evidence only.
- iQOO 15 performance claims are made only after target-device measurement.

## 7. Browser prototype scope
- Vision: TensorFlow.js COCO-SSD.
- Audio: local spectral heuristic analysis; explicitly not YAMNet.
- Fusion: temporal evidence + workspace context.
- Intervention: SpeechSynthesis + Vibration API where supported.
- Verification: relative movement/workspace exit.
- Persistence: localStorage.
- Controlled scenarios: deterministic demonstration fallback.

## 8. Native target scope
- CameraX.
- EfficientDet-Lite0 candidate for dog detection.
- YAMNet TFLite candidate for audio events.
- Native haptics.
- SQLite/local storage.
- Target-device validation on iQOO 15.

## 9. Success criteria
A successful prototype must demonstrate:
- real dog detection in live mode;
- workspace-aware intervention eligibility;
- multimodal evidence processing;
- owner voice cue;
- response verification;
- adaptive retry;
- silent owner feedback;
- local session history;
- offline inference path;
- clear distinction between measured facts and target-device plans.

## 10. Product metrics to measure, not invent
- Detection stability.
- False interventions across controlled negative tests.
- Response verification success rate across controlled trials.
- Median and p95 decision latency on each tested device.
- FPS/inference timing.
- Model load time.
- Battery/thermal behavior during sustained tests.

## 11. Primary CTA
**Start Live Detection.**

## 12. Safety principle
**If the system is uncertain, it does nothing.**
