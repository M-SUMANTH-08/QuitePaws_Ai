# Roadmap: QuietPaws

**Project Mode:** mvp

### Phase 1: Working Core Loop
**Goal:** Meeting Mode + dog detection + workspace/approach detection + basic behavioral decision + visible intervention outcome.
**Mode:** mvp

**Requirements:**
- SYS-01: User can toggle Meeting Mode on and off.
- SYS-04: System operates fully offline (must work in airplane mode).
- AIP-01: System detects dogs in the camera feed using an on-device model (e.g., EfficientDet-Lite).
- AIP-02: System detects when a dog is approaching the workspace.

**Success Criteria:**
1. App installs and runs completely offline in Airplane Mode without crashing.
2. User can seamlessly toggle Meeting Mode on and off via the UI.
3. System accurately detects the presence of a dog approaching the workspace using on-device vision.
4. Visible intervention outcome is triggered based on a basic behavioral decision.

### Phase 2: Multimodal Intelligence
**Goal:** Add audio features and multimodal fusion to improve behavioral-state estimation and confidence.
**Mode:** mvp

**Requirements:**
- AIP-03: System extracts audio features (e.g., YAMNet) to inform behavioral estimation.
- AIP-04: System categorizes observable behavioral states (NO_DOG, CALM, ATTENTION_SEEKING, ACTIVE/PLAYFUL, HIGH_AROUSAL, UNCERTAIN) using multimodal fusion.

**Success Criteria:**
1. System captures raw audio and extracts relevant features without dropping frames.
2. Behavioral state is accurately categorized by fusing audio and vision inferences.
3. Inference loops execute continuously on-device with stable thermal and battery impact.

### Phase 3: Adaptive Intervention
**Goal:** Owner-recorded voice intervention + response observation + success/failure verification + one controlled alternative response.
**Mode:** mvp

**Requirements:**
- INT-01: User can record and save custom voice interventions.
- INT-02: System plays the owner-recorded voice cue to redirect the dog when intervention is appropriate.
- INT-03: System observes the dog's response for a short period after an intervention (response verification).
- INT-04: System stops interventions after a maximum of 2 cues if the first fails, rather than repeatedly disturbing the dog.

**Success Criteria:**
1. User can successfully record, save, and manage a custom voice cue within the app.
2. System correctly triggers audio playback on the built-in speaker to redirect the dog.
3. System measures post-cue behavior and successfully halts further intervention if the dog's state does not improve after a maximum of 2 attempts.

### Phase 4: Owner Feedback & Local Memory
**Goal:** Haptic notification + local session logging + session history + offline/privacy hardening.
**Mode:** mvp

**Requirements:**
- SYS-02: System delivers a silent haptic notification to the owner when an event occurs.
- SYS-03: System logs interaction sessions locally on the device.

**Success Criteria:**
1. System seamlessly records behavioral events and interventions to a local Room database.
2. System delivers a haptic ping when the dog enters an intervention state.
3. UI displays a history of recent sessions and interactions while maintaining privacy and offline hardening.

### Phase 5: Reliability & Demo Readiness
**Goal:** False-positive testing, edge cases, performance validation, mobile UI polish, real-device validation, and final demo preparation.
**Mode:** mvp

**Requirements:**
- SYS-05: System supports a reliable live demonstration mode for hackathon presentation.

**Success Criteria:**
1. System is thoroughly tested against false-positives and edge cases.
2. Performance validation is successful with smooth and polished mobile UI interactions.
3. The live demonstration mode functions reliably, showcasing real-time detection and intervention loops without friction on a real device.
