# Architecture Research

**Domain:** Offline-first On-Device AI (Native Android)
**Researched:** 2026-10-05
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                          UI Layer                           │
│  (Jetpack Compose: Meeting Mode, Settings, Dashboard)       │
├─────────────────────────────────────────────────────────────┤
│                    Presentation Layer                       │
│      (ViewModels: State Management, User Feedback)          │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ ML Orchestrator│  │ State Machine  │  │ Session Logger │ │
│  │ (Fusion Logic) │  │ (Intervention) │  │ (History)      │ │
│  └───────┬────────┘  └────────┬───────┘  └────────┬───────┘ │
│          │                    │                   │         │
├──────────┴────────────────────┴───────────────────┴─────────┤
│                     Infrastructure Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Sensor Input │  │ ML Executors │  │  Actuators   │       │
│  │ (Camera/Mic) │  │ (TFLite/NPU) │  │ (Speaker/Vib)│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Sensor Input | Capturing continuous video frames and audio buffers safely in the background. | CameraX (ImageAnalysis), AudioRecord |
| ML Executors | Running inference locally using quantized models (EfficientDet-Lite, YAMNet). | TensorFlow Lite Task Library (NPU/GPU delegates) |
| ML Orchestrator | Fusing multimodal streams (vision + audio) into observable behavioral states. | Kotlin Coroutines (Flow) for synchronizing |
| State Machine | Deciding when to trigger intervention (max 2 cues) and verifying the dog's reaction. | Kotlin StateFlow / FSM pattern |
| Actuators | Playing recorded audio cues and triggering silent haptic notifications to the user. | MediaPlayer, Android VibratorManager |
| Session Logger | Recording interactions and interventions locally for privacy-preserving review. | Room Database (SQLite) |

## Component Boundaries (What talks to what)

- **Sensor Input → ML Executors:** CameraX pushes `ImageProxy` frames to the VisionExecutor. AudioRecord pushes byte arrays to the AudioExecutor.
- **ML Executors → ML Orchestrator:** Executors emit bounding boxes, class probabilities, and audio classifications as continuous streams.
- **ML Orchestrator → State Machine:** Emits the categorized behavioral state (e.g., `ATTENTION_SEEKING`, `NO_DOG`).
- **State Machine → Actuators:** When conditions are met (e.g., meeting mode ON + `ATTENTION_SEEKING`), it commands the Actuators to play a specific audio file and vibrate the device.
- **State Machine → Session Logger:** Logs intervention events, triggers, and outcomes for local review.

## Recommended Project Structure

```text
app/src/main/java/com/quietpaws/
├── ui/                 # UI components and ViewModels
│   ├── screens/        # Compose screens (MeetingMode, Settings, Logs)
│   └── components/     # Reusable UI widgets
├── domain/             # Core logic and ML orchestration
│   ├── models/         # Data classes (BehavioralState, InferenceResult)
│   ├── engine/         # ML Fusion logic and State Machine
│   └── usecases/       # High-level actions (e.g., StartMeetingMode)
├── data/               # Local storage and repositories
│   ├── local/          # Room DB entities and DAOs
│   └── repository/     # Repository implementations
└── infrastructure/     # Hardware and ML framework boundaries
    ├── ml/             # TFLite wrappers (Vision/Audio)
    ├── sensors/        # CameraX and AudioRecord wrappers
    └── actuators/      # MediaPlayer and Haptic wrappers
```

### Structure Rationale

- **infrastructure/:** Isolates hardware-specific implementation (Camera, Mic, TFLite) from the core logic, which is crucial for testing the state machine reliably on host machines without physical hardware.
- **domain/engine/:** Houses the core business value: interpreting raw ML outputs into behavioral states and enforcing project constraints (like max 2 interventions).

## Architectural Patterns

### Pattern 1: Producer-Consumer with Kotlin Flows
**What:** Using Coroutines and Kotlin `Flow` to manage the continuous stream of data from sensors to ML models to the fusion engine.
**When to use:** For real-time ML pipelines where frames/audio chunks are produced rapidly.
**Trade-offs:** Can lead to memory leaks or backpressure issues if frames are processed slower than produced.

**Example:**
```kotlin
cameraSource.frames()
    .conflate() // Drop old frames if ML is slow to prioritize low latency
    .map { frame -> visionML.analyze(frame) }
    .collect { result -> fusionEngine.onVisionResult(result) }
```

### Pattern 2: Finite State Machine (FSM) for Interventions
**What:** A strict state machine for dog behavior and system intervention status (e.g., `IDLE` -> `OBSERVING` -> `INTERVENING_1` -> `OBSERVING_VERIFICATION` -> `INTERVENING_2` -> `GIVEN_UP`).
**When to use:** To enforce the constraint "Max two cues - prevents repeatedly disturbing the dog".
**Trade-offs:** Requires careful state transition mapping, but guarantees predictable, strictly-bounded behavior.

## Data Flow

### Request Flow (Event Loop)

```text
[Dog Approaches]
    ↓
[CameraX/AudioRecord] → [TFLite Executors] → [Bounding Box / Audio Classes]
    ↓                                                    ↓
[State Machine] ← [ML Orchestrator (Behavior Classification)]
    ↓
[Action Required: Play Cue] → [MediaPlayer]
    ↓
[Observe verification window] → [Log to Room DB]
```

### Key Data Flows

1. **Inference Pipeline Flow:** High-frequency, unbuffered data flow. Camera frames and audio buffers are continuously pushed through ML models. Latency is critical here; older data should be dropped rather than queued.
2. **State Transition Flow:** Low-frequency, stateful data flow. The ML orchestrator debounces raw inference results (e.g., requiring 3 consecutive frames of a dog to transition state) before alerting the state machine.

## Suggested Build Order (Dependencies)

Building an on-device AI app requires a bottom-up approach to de-risk ML performance early:

1. **Phase 1: Infrastructure & Sensors**
   - Implement CameraX integration (preview + frame extraction) and AudioRecord.
   - *Dependency:* Needed before any ML can be tested on real data.
2. **Phase 2: ML Executors (On-Device)**
   - Integrate TFLite Task Library.
   - Load EfficientDet-Lite for dog detection and YAMNet for audio classification.
   - *Dependency:* Relies on Phase 1 for input data. Crucial to verify iQOO 15 NPU/CPU latency.
3. **Phase 3: Domain Engine (Fusion & State)**
   - Build the ML Orchestrator to combine vision/audio into `Observable Behavioral States`.
   - Build the State Machine to enforce the "max two cues" rule and handle Meeting Mode logic.
   - *Dependency:* Relies on Phase 2 outputs.
4. **Phase 4: Actuators & Feedback**
   - Implement audio recording/playback for owner cues and haptic feedback.
   - *Dependency:* Driven by Phase 3 state machine.
5. **Phase 5: UI & Session Logging**
   - Build Jetpack Compose screens (Dashboard, Settings) and Room DB for logging.
   - *Dependency:* Relies on everything above to display accurate state and configure the app.

## Scaling & Performance Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Thermal Throttling | Throttle camera frame rate (e.g., to 10 FPS instead of 30) or lower resolution. |
| Battery Drain | Suspend ML inference when the workspace is completely empty for extended periods. |
| Model Latency | Utilize NNAPI/Hexagon delegates for the iQOO 15's NPU to offload ML tasks from the CPU. |

## Anti-Patterns

### Anti-Pattern 1: Blocking the Main Thread with ML
**What people do:** Running TFLite inference synchronously in a UI observer or camera callback on the main thread.
**Why it's wrong:** Causes UI stuttering, dropped frames, and potential ANR crashes.
**Do this instead:** Use dedicated background Coroutine Dispatchers (`Dispatchers.Default`) for all ML inference and state calculations.

### Anti-Pattern 2: Tight Coupling of ML Models
**What people do:** Hardcoding model inputs/outputs directly into the UI layer.
**Why it's wrong:** Makes it impossible to swap models (e.g., upgrading from EfficientDet-Lite0 to Lite1) without rewriting the UI.
**Do this instead:** Define clean domain interfaces (e.g., `DogDetector`, `AudioClassifier`) that the UI and State Machine consume.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Sensor ↔ ML Model | Direct Buffer / ImageProxy passing | Must handle memory management properly (e.g., closing `ImageProxy` after use to free the buffer). |
| ML Model ↔ State Machine | Kotlin `StateFlow` | Use debouncing/sliding windows to prevent flickering states from noisy ML predictions. |

## Sources

- Android CameraX Documentation
- TensorFlow Lite for Android Guides
- Google ML Kit / YAMNet implementation details
- Modern App Architecture guidelines for Android
