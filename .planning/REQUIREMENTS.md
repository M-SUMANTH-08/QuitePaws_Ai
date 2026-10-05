# Requirements: QuietPaws

**Defined:** 2026-10-05
**Core Value:** Preventing pet interruptions during important meetings locally on-device, preserving privacy without relying on cloud AI.

## v1 Requirements

### AI Perception

- [ ] **AIP-01**: System detects dogs in the camera feed using an on-device model (e.g., EfficientDet-Lite).
- [ ] **AIP-02**: System detects when a dog is approaching the workspace.
- [ ] **AIP-03**: System extracts audio features (e.g., YAMNet) to inform behavioral estimation.
- [ ] **AIP-04**: System categorizes observable behavioral states (NO_DOG, CALM, ATTENTION_SEEKING, ACTIVE/PLAYFUL, HIGH_AROUSAL, UNCERTAIN) using multimodal fusion.

### Core Interaction

- [ ] **INT-01**: User can record and save custom voice interventions.
- [ ] **INT-02**: System plays the owner-recorded voice cue to redirect the dog when intervention is appropriate.
- [ ] **INT-03**: System observes the dog's response for a short period after an intervention (response verification).
- [ ] **INT-04**: System stops interventions after a maximum of 2 cues if the first fails, rather than repeatedly disturbing the dog.

### System Settings & Feedback

- [ ] **SYS-01**: User can toggle Meeting Mode on and off.
- [ ] **SYS-02**: System delivers a silent haptic notification to the owner when an event occurs.
- [ ] **SYS-03**: System logs interaction sessions locally on the device.
- [ ] **SYS-04**: System operates fully offline (must work in airplane mode).
- [ ] **SYS-05**: System supports a reliable live demonstration mode for hackathon presentation.

## v2 Requirements

### Enhancements

- **ENH-01**: Automatic meeting detection via calendar or microphone state.
- **ENH-02**: Advanced TDOA/audio localization to pinpoint the dog's location.
- **ENH-03**: Animal pose estimation for richer analytics.
- **ENH-04**: Treat dispenser integration (Bluetooth/Zigbee).
- **ENH-05**: Directional or advanced haptics.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Generic pet monitor | Focus is strictly on workplace interruption prevention during meetings. |
| Emotion detection / diagnosis | Unreliable and unnecessary; sticking to observable behavioral states only. |
| Cloud AI services | Violates offline-first and privacy constraints. |
| Live video streaming | Breaks offline-first privacy; out of scope for a dedicated meeting assistant. |
| Aversive deterrents (ultrasonic) | Unethical, causes anxiety, can worsen behavior long-term. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AIP-01 | Phase 1 | Pending |
| AIP-02 | Phase 1 | Pending |
| AIP-03 | Phase 2 | Pending |
| AIP-04 | Phase 2 | Pending |
| INT-01 | Phase 3 | Pending |
| INT-02 | Phase 3 | Pending |
| INT-03 | Phase 3 | Pending |
| INT-04 | Phase 3 | Pending |
| SYS-01 | Phase 1 | Pending |
| SYS-02 | Phase 4 | Pending |
| SYS-03 | Phase 4 | Pending |
| SYS-04 | Phase 1 | Pending |
| SYS-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-10-05*
*Last updated: 2026-10-05 after initial definition*
