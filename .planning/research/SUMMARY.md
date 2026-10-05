# Project Research Summary

**Project:** QuietPaws
**Domain:** Offline-first, on-device AI (Native Android)
**Researched:** 2026-10-05
**Confidence:** HIGH

## Executive Summary

The project is a native Android application designed to prevent pets from interrupting users during meetings via offline-first, on-device AI processing. The system must operate without cloud dependencies to ensure privacy, and relies on real-time visual and audio ML inference.

The recommended approach centers on using Jetpack Compose for the UI layer, Kotlin Coroutines (Flow) for synchronizing multimodal ML streams, and LiteRT (TFLite) with MediaPipe Tasks for executing quantized models (EfficientDet-Lite0 for vision, YAMNet for audio). The core architecture leverages a Finite State Machine (FSM) to map observed behaviors into strict intervention sequences, adhering to a "max two cues" constraint.

Key risks include thermal throttling from continuous model execution, background processing exclusivity rules in Android 11+, and audio routing hijacking by Bluetooth devices. These are mitigated by heavy duty cycling, explicit foreground service declarations, and explicit audio focus management.

## Key Findings

### Recommended Stack

The stack prioritizes efficiency and privacy. It revolves around Kotlin and Jetpack Compose on the UI side, with LiteRT serving as the primary inference engine. MediaPipe Tasks simplify the extraction of bounding boxes and audio classification without needing low-level custom delegates, though Qualcomm QNN delegates via raw LiteRT may be necessary on target hardware (iQOO 15).

**Core technologies:**
- **Kotlin & Jetpack Compose:** Primary language & UI Framework — Declarative UI handles asynchronous ML state changes effortlessly.
- **LiteRT (TFLite) & MediaPipe Tasks:** Core Inference Engine — Standard for on-device inference; operates fully offline and handles camera frame/audio processing efficiently.
- **CameraX & AudioRecord:** Sensor Input — Essential for real-time extraction of image frames and streaming audio buffers.

### Expected Features

The MVP requires strict privacy and core functionality to prove the concept before adding enhancements.

**Must have (table stakes & differentiators for launch):**
- Reliable Pet Detection (Visual bounding boxes)
- Owner-recorded Voice Cues
- Offline & Private Operation (Works in Airplane Mode)
- Meeting Mode Toggle
- Workspace Approach Detection
- Capped Interventions (Max 2 cues)

**Should have (competitive):**
- Multimodal Behavioral Estimation (Vision + Audio cues)
- Response Verification
- Silent Haptic Owner Alerts

**Defer (v2+):**
- Automatic Meeting Detection (Calendar hooks)
- Advanced Audio Localization
- Treat Dispenser Integration

### Architecture Approach

The system is built via a bottom-up producer-consumer pattern driven by Kotlin Coroutines, culminating in a robust Finite State Machine.

**Major components:**
1. **Sensor Input & ML Executors:** Captures continuous frames/audio and runs them through lightweight models to extract classes and bounding boxes.
2. **ML Orchestrator & State Machine:** Fuses vision + audio streams into behavioral states, deciding when to trigger interventions (max 2 cues).
3. **Actuators & Logger:** Plays owner-recorded cues, triggers haptics, and silently records session histories to a local Room DB.

### Critical Pitfalls

1. **Thermal Throttling & Battery Drain** — Avoid by implementing a cascaded trigger system/duty cycling (1-3 FPS) and offloading to NPU.
2. **Android Background Execution Limits** — Avoid by using a Foreground Service with explicit `camera` and `microphone` types.
3. **Audio Routing Hijacking** — Avoid by explicitly requesting audio focus and routing playback through the device's built-in speaker, bypassing Bluetooth headsets.
4. **Over-Intervention and False Positives** — Avoid by relying on a strict FSM (NO_DOG -> CALM -> ACTIVE -> ATTENTION_SEEKING) rather than just bounding box presence.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Infrastructure & Sensors
**Rationale:** Fundamental layer. Needed before any ML can be tested on real data.
**Delivers:** CameraX integration, AudioRecord, Foreground Services setup.
**Addresses:** Offline & Private Operation, Meeting Mode Toggle.
**Avoids:** Android Background Exclusivity limits.

### Phase 2: ML Executors (On-Device)
**Rationale:** Relies on Phase 1. Crucial to verify NPU/CPU latency and prove the offline concept.
**Delivers:** LiteRT/MediaPipe models (EfficientDet-Lite, YAMNet) integration.
**Uses:** LiteRT, MediaPipe Tasks, Qualcomm QNN Delegate.
**Implements:** ML Executors component.

### Phase 3: Domain Engine (Fusion & State)
**Rationale:** Bridges raw ML inference and product requirements.
**Delivers:** ML Orchestrator and Finite State Machine.
**Uses:** Kotlin Coroutines/Flow.
**Addresses:** Workspace Approach Detection, Capped Interventions, Multimodal Behavioral Estimation.
**Avoids:** Over-Intervention and False Positives.

### Phase 4: Actuators & Feedback
**Rationale:** Driven by the state machine's output.
**Delivers:** Audio playback and haptic integrations.
**Addresses:** Owner-recorded Voice Cues, Response Verification, Silent Haptic Owner Alerts.
**Avoids:** Audio Routing Hijacking.

### Phase 5: UI & Session Logging
**Rationale:** Wraps all previous layers into a usable, privacy-preserving interface.
**Delivers:** Jetpack Compose screens, Room Database.
**Uses:** Jetpack Compose, Android Studio Koala+.

### Phase Ordering Rationale

- **Bottom-up Dependencies:** Sensors must exist to feed Models, Models must exist to feed State, State must exist to drive Actuators.
- **Early Risk Mitigation:** Proving the iQOO 15 NPU latency and Android background execution rules in Phase 1 & 2 prevents downstream architecture refactoring.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (ML Executors):** Need to verify specific Qualcomm QNN delegate compatibility with EfficientDet-Lite0 to ensure it doesn't fall back to CPU.
- **Phase 4 (Actuators & Feedback):** Specifics around Android AudioManager overrides to guarantee playback on built-in speakers while Bluetooth is active.

Phases with standard patterns (skip research-phase):
- **Phase 1 & 5:** Standard Android lifecycle, CameraX, and Room DB implementations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Established patterns via MediaPipe and Google AI Edge Docs. |
| Features | HIGH | Clear mapping of MVP vs differentiation. |
| Architecture | HIGH | Standard producer-consumer and FSM patterns fit well. |
| Pitfalls | HIGH | Deeply understood Android ecosystem quirks (audio routing, background limits). |

**Overall confidence:** HIGH

### Gaps to Address

- **NPU Compatibility:** Need to validate that the requested LiteRT Qualcomm QNN Delegate effectively hardware-accelerates EfficientDet-Lite0 without silently falling back to CPU execution.

## Sources

### Primary (HIGH confidence)
- **Google AI Edge Docs** — Verified MediaPipe Tasks Audio/Vision capabilities and migration to LiteRT.
- **Qualcomm Documentation** — Verified transition to QNN Delegate for modern Snapdragon NPUs.
- **Android Developers** — Background Execution Limits & Foreground Services, CameraX.

### Secondary (MEDIUM confidence)
- **Community discussions** — Android AudioManager routing quirks for speaker overrides.

---
*Research completed: 2026-10-05*
*Ready for roadmap: yes*
