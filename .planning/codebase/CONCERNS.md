# Codebase Concerns & Technical Debt

**Date:** 2026-10-05

## Technical Debt & Limitations
- **Model Inference Performance:** The prototype uses TensorFlow.js (`coco-ssd`) running directly in the browser's JavaScript thread (or WebGL backend). This is a computationally heavy operation for mobile devices and may cause UI stuttering or battery drain. It is not representative of the target performance constraints of the native iQOO 15 hardware, which would utilize native ML accelerators.
- **Audio Heuristics Reliability:** The web implementation uses basic spectral heuristics (analyzing frequency bins via the Web Audio API) for audio detection (e.g., detecting barks). This is a brittle placeholder and is significantly less robust than the dedicated YAMNet model intended for the final native Android target. False positives from background noise are highly likely.
- **Offline Model Caching:** While the application logic is designed to be offline-first, the initial load still requires downloading the TensorFlow.js library and the COCO-SSD model weights from a CDN (`jsdelivr`). For a true offline Progressive Web App (PWA) experience, these assets must be cached locally via a Service Worker, which is currently unimplemented.

## Fragile Areas
- **Permissions Flow:** The application flow heavily relies on the user granting Camera and Microphone permissions. If denied, or if the browser blocks the request due to security policies (e.g., not running on HTTPS), the core functionality breaks entirely. Error handling around permission denial needs to be robust.
- **Browser & Device Inconsistencies:** Browser-based ML inference varies wildly in performance and capability between different devices and browsers. The prototype has been tested and tuned on a POCO X6 Pro (Android/Chrome). Behavior on other devices, particularly iOS/Safari (which has stricter autoplay and media access policies), might be inconsistent or completely non-functional.
- **Memory Management:** Continuous video processing and audio analysis can lead to memory leaks if streams and objects are not properly garbage collected, especially during prolonged "Meeting Mode" sessions.
