# External Integrations

**Date:** 2026-10-05

## External APIs & Cloud Services
- **No Cloud Inference:** The application is strictly designed to be offline-first for privacy and speed. There are no external API calls made for processing audio or video.
- **Model CDNs:** While inference runs locally, the initial load fetches the TensorFlow.js library and the COCO-SSD model weights from `jsdelivr`. In a full offline PWA, these would be cached locally via a Service Worker.
- **Vercel Web Analytics:** Used for basic traffic monitoring. It respects user privacy choices and is loaded conditionally based on the cookie banner consent.

## Hardware & OS Integrations
- **Camera (Video Input):** 
  - Uses `navigator.mediaDevices.getUserMedia({ video: true })` to capture the live feed.
  - The feed is rendered to a hidden `<video>` element and processed frame-by-frame by the `vision.js` module.
- **Microphone (Audio Input):**
  - Uses `navigator.mediaDevices.getUserMedia({ audio: true })` to capture ambient sound.
  - The audio stream is connected to an `AudioContext` and an `AnalyserNode` in `audio.js` to extract frequency data for the heuristic noise detection.
- **Audio Playback:**
  - Standard HTML5 `<audio>` or Web Audio API is used to play the owner's voice cue when an intervention is triggered by `intervention.js`.
- **Haptics:**
  - Uses `navigator.vibrate()` (where supported by the browser) to silently inform the user of a resolved intervention.
