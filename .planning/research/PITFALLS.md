# Pitfalls Research

**Domain:** Offline-first, on-device AI for pet behavior intervention (Native Android)
**Researched:** 2026-10-05
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Thermal Throttling & Battery Drain from Continuous Inference

**What goes wrong:**
The device overheats within 15-30 minutes of "Meeting Mode", causing the OS to aggressively throttle the CPU/GPU, kill the background service, or drain the battery entirely before the meeting ends.

**Why it happens:**
Developers treat the camera feed as a standard video stream (30-60 FPS) and run heavy models (EfficientDet-Lite + YAMNet) on every frame using the CPU, ignoring the power constraints of mobile devices.

**How to avoid:**
Implement a cascaded trigger system and duty cycling. For example, run audio classification (YAMNet) at a low duty cycle or use basic motion detection (pixel diffing) to wake up the heavy visual dog detection model. Cap the inference frame rate to 1-3 FPS. Explicitly use TFLite delegates (NNAPI/Hexagon) to offload to the iQOO 15's NPU.

**Warning signs:**
The phone becomes physically hot to the touch during testing. Android system shows high battery consumption warnings. Inference latency spikes over time as thermal throttling kicks in.

**Phase to address:**
Core AI Integration Phase

---

### Pitfall 2: Android Background Execution & Sensor Exclusivity Rules

**What goes wrong:**
The app stops detecting the dog as soon as the screen turns off or the user switches apps. Alternatively, the app crashes because the camera/microphone is exclusively locked by another process.

**Why it happens:**
Android 11+ enforces strict background limitations for camera and microphone access to protect user privacy. A standard background service will be denied access to these sensors.

**How to avoid:**
Implement a Foreground Service with explicit `camera` and `microphone` service types, displaying a persistent notification while Meeting Mode is active. Handle `CameraDevice.StateCallback` properly to gracefully recover if the OS preempts the camera.

**Warning signs:**
Logs show `SecurityException` or `CameraAccessException` when the app goes to the background. Detection simply stops when the screen is locked.

**Phase to address:**
Meeting Mode Activation Phase

---

### Pitfall 3: Audio Routing & Bluetooth Headset Hijacking

**What goes wrong:**
When the system decides to play the owner-recorded intervention cue, it plays silently, or routes the audio into the owner's Bluetooth headset instead of the phone's loudspeaker, startling the owner and failing to reach the dog.

**Why it happens:**
Android's `AudioManager` automatically routes media streams to connected Bluetooth devices (earbuds/headphones). Developers often use default media player settings without overriding the routing.

**How to avoid:**
Explicitly request audio focus and route the playback through the phone's built-in speaker. Use `AudioAttributes` with `USAGE_ALARM` or `USAGE_ASSISTANCE_SONIFICATION`, or temporarily disable Bluetooth A2DP routing for the duration of the playback.

**Warning signs:**
The intervention triggers in logs, but no sound is heard in the room while the owner's headphones are connected.

**Phase to address:**
Intervention Execution Phase

---

### Pitfall 4: Over-Intervention and False Positives

**What goes wrong:**
The system constantly scolds the dog for just being in the room or sleeping nearby, leading to the dog becoming anxious or the owner disabling the app.

**Why it happens:**
Relying solely on "Dog Detected" (bounding box presence) as the trigger condition, rather than interpreting behavioral states and spatial proximity.

**How to avoid:**
Implement a strict state machine (NO_DOG -> CALM -> ACTIVE -> ATTENTION_SEEKING). Require sustained presence, proximity (bounding box size threshold), or specific audio cues (whining/barking) to transition to an intervention state. Enforce a cooldown period between detections and adhere strictly to the "max two cues" constraint.

**Warning signs:**
System triggers an intervention while the dog is lying down. High frequency of haptic notifications to the owner.

**Phase to address:**
Behavioral State Categorization Phase

---

### Pitfall 5: Silent Fallback to CPU for TFLite Models

**What goes wrong:**
The app runs successfully but drains battery and lags, despite having code to use the NPU or GPU delegates.

**Why it happens:**
If a TFLite model contains operations not supported by the specific hardware accelerator (e.g., Qualcomm Hexagon NPU on the iQOO 15), the TFLite runtime silently falls back to CPU execution for those layers, or the entire model, causing massive performance drops.

**How to avoid:**
Profile the models specifically on the iQOO 15 target hardware using TFLite benchmark tools. Ensure models are quantized properly (INT8) if required by the NPU. Monitor logs for TFLite delegate warnings (`INFO: Initialized TensorFlow Lite runtime...`).

**Warning signs:**
Inference times are > 100ms for lightweight models. Logcat shows warnings about unsupported ops falling back to CPU.

**Phase to address:**
Initial Setup / Tech Spike Phase

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Running inference on every frame (30fps) | Easy to implement, highly responsive | Massive battery drain, device overheating, CPU throttling | Never for continuous background monitoring |
| Storing raw camera frames for debugging | Easy to verify why a false positive occurred | Fills device storage rapidly; violates privacy constraints if left on | Only during internal developer builds (debug flavor) |
| Hardcoding bounding box thresholds | Quick way to estimate "dog is close" | Fails for different dog sizes (Chihuahua vs Great Dane) or camera angles | MVP only; requires calibration later |

## Integration Gotchas

Common mistakes when connecting to external services (or internal OS subsystems).

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| CameraX / Camera2 API | Not handling device rotation or keeping the camera open when unused | Bind camera lifecycle to the Meeting Mode Foreground Service; handle `ImageAnalysis.Analyzer` rotation metadata. |
| Android AudioRecord | Assuming exclusive access to the microphone | Handle `AudioManager.OnAudioFocusChangeListener` and gracefully pause/resume if interrupted. |
| TFLite Task Library | Loading the model on the main UI thread | Load models and run inference strictly on background threads/executors to prevent ANRs. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Memory leaks in ImageProxy | App crashes with OutOfMemoryError (OOM) after 10+ minutes | Always call `image.close()` inside the CameraX `ImageAnalysis.Analyzer` | After a few minutes of continuous frame processing |
| Excessive JSON logging | Disk I/O blocks the main thread; app gets sluggish | Batch local session logs and write asynchronously; use efficient binary formats (e.g., Protobuf) or SQLite for large data | Sessions lasting > 1 hour |
| Concurrent Model Execution | Unpredictable latency spikes | Serialize visual (EfficientDet) and audio (YAMNet) inference, or assign them to different hardware delegates (NPU vs DSP) | When both visual and audio events peak simultaneously |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Writing "debug" images to public external storage | Privacy violation; meeting contents exposed to other apps | Never write camera frames to disk in production. If needed for local logging, use internal app storage (`Context.getFilesDir()`). |
| Cloud fallback for model inference | Violates the core offline-first privacy promise | Strictly package models in the APK assets and remove all internet permissions from the Manifest. |
| Unencrypted session logs | Sensitive behavioral data or timestamps are accessible | Encrypt the local SQLite database (e.g., SQLCipher) if storing detailed timestamps of user meetings. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Loud or disruptive haptic feedback | Phone vibrating on the desk interrupts the meeting audio / distracts the user | Use subtle, customized vibration patterns (e.g., a single soft tap) or visual cues (dim screen pulse). |
| No feedback on intervention success | Owner wonders if the system actually did anything or if the dog ignored it | Provide a summarized post-meeting log showing interventions and the observed behavioral change. |
| Complex calibration process | User gives up before starting their first Meeting Mode session | Use sane defaults and auto-calibration (e.g., "place phone here, wait 5 seconds to learn background"). |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Camera Integration:** Often missing background lifecycle handling — verify by locking the screen and checking if detection continues.
- [ ] **Audio Playback:** Often missing speaker routing — verify by playing a cue while Bluetooth earbuds are actively connected to the phone.
- [ ] **Intervention Limit:** Often missing the state reset — verify that after 2 cues, the system stops, but also verify it *resets* for the next distinct meeting/session.
- [ ] **Offline Verification:** Often missing airplane mode tests — verify by turning on airplane mode, disabling Wi-Fi/Bluetooth, and ensuring the full pipeline works.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Thermal Throttling | HIGH | Implement an emergency thermal broadcast receiver (`ACTION_BATTERY_CHANGED` / temperature checks) to gracefully degrade (e.g., switch to audio-only monitoring) before the OS kills the app. |
| Camera Access Lost | MEDIUM | Automatically pause monitoring, send a prominent haptic/visual notification to the user, and attempt to reconnect when the blocking app releases it. |
| Habituation | LOW | Detect "NO_CHANGE" after interventions over multiple sessions, and prompt the owner to record a new, more varied voice cue. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Thermal Throttling & Battery Drain | Core AI Integration Phase | Run a 60-minute mock meeting and measure battery drop (< 10%) and thermal state. |
| Android Background Exclusivity | Meeting Mode Activation Phase | Start Meeting Mode, lock the screen for 10 minutes, and verify logs show continuous detection. |
| Audio Routing Hijacking | Audio Intervention Phase | Connect Bluetooth headphones, trigger an intervention, verify sound plays from the phone speaker. |
| Over-Intervention & False Positives | Behavioral State Categorization Phase | Test with a video of a sleeping dog; verify 0 interventions occur. |
| TFLite NPU Fallback | Tech Spike Phase | Check logcat for TFLite CPU fallback warnings; verify inference time < 50ms on iQOO 15. |

## Sources

- Android Developers: Background Execution Limits & Foreground Services
- TensorFlow Lite Android Performance Best Practices
- CameraX Architecture documentation
- Community discussions on Android AudioManager routing quirks
- Personal experience with on-device ML battery drain

---
*Pitfalls research for: Offline-first, on-device AI for pet interruption prevention (Native Android)*
*Researched: 2026-10-05*
