# Architecture

**Date:** 2026-10-05

## System Design Pattern
The codebase follows a **Modular Pipeline / Event-driven** pattern. The application is built out of plain ES Modules that represent different stages of the processing pipeline, connected by a central state manager or event loop in `main.js`.

## Core Pipeline: `SEE → HEAR → THINK → ACT → VERIFY → INFORM`

### 1. Perception Layer (SEE & HEAR)
- **Vision (`vision.js`):** 
  - Responsible for grabbing the camera feed and running inference using TensorFlow.js (COCO-SSD).
  - It continuously scans for the "dog" class, calculating bounding boxes and confidence scores.
  - Passes visual telemetry back to the main loop.
- **Audio (`audio.js`):**
  - Captures microphone input and uses the Web Audio API's `AnalyserNode`.
  - Applies spectral heuristics (frequency binning) to detect sudden loud noises or barks.
  - This is a browser-friendly stand-in for a native YAMNet ML model.

### 2. Fusion Layer (THINK)
- **Fusion Logic (`fusion.js`):**
  - Takes the raw telemetry from the Perception Layer and applies temporal and spatial rules.
  - **Workspace Proximity:** Checks if the detected dog is approaching the designated "workspace" bounding box on the screen.
  - **Temporal Awareness:** Requires sustained detection (e.g., dog in frame for X frames + audio spike) rather than firing on a single noisy frame.

### 3. Action Layer (ACT, VERIFY, INFORM)
- **Intervention (`intervention.js`):**
  - **ACT:** Once fusion criteria are met, it triggers a predefined audio cue (e.g., the owner's voice saying "stay").
  - **VERIFY:** Enters an observation window (e.g., 2.6 seconds) to see if the pet responded (e.g., stopped barking, moved away). If verification fails, it may trigger an alternate cue.
  - **INFORM:** Logs the event to the local session log and provides silent haptic feedback to the user.

## Abstractions & Data Flow
- `index.html` serves as the entry point, defining the UI layout, video container, and telemetry readouts.
- `main.js` boots the pipeline, requests permissions, and manages the UI state updates (e.g., updating the telemetry DOM elements, switching states between Idle, Detecting, and Intervening).
- The architecture is stateless on the backend; all state is ephemeral and held in the browser's memory during the session.
