# Tech Stack

**Date:** 2026-10-05

## Core Technologies
- **Languages:** HTML5, CSS3, JavaScript (Vanilla ES Modules). The project deliberately avoids TypeScript or heavy JS frameworks to remain a lightweight browser prototype.
- **Runtime Environment:** Standard modern web browsers. Emphasizes an offline-first architecture to simulate on-device processing.

## Machine Learning & AI
- **Framework:** TensorFlow.js (`@tensorflow/tfjs` v4.20.0). Runs entirely client-side, executing inference directly in the browser.
- **Vision Model:** COCO-SSD (`@tensorflow-models/coco-ssd` v2.2.3) is used for real-time object detection (specifically detecting dogs).
- **Audio Model:** Custom spectral heuristics implemented using the native Web Audio API, acting as a stand-in for the target YAMNet model.

## Build and Tooling
- **Bundler:** `esbuild` (^0.25.0) is used as a dev dependency for rapid building and bundling of any required assets.
- **Dev Server:** `serve` is invoked via `npx serve .` to host the application locally during development.
- **Testing:** Basic Node.js scripts (`tests/smoke.mjs`) are used instead of a heavy testing framework like Jest or Mocha.

## Deployment & Hosting
- **Platform:** Vercel (configured via `vercel.json`).
- **Analytics:** Optional Vercel Web Analytics is included, designed to be cookie-free and anonymized.

## Target Hardware
- **Target:** iQOO 15 (Native Android environment is the ultimate goal).
- **Development Device:** Tested and tuned on POCO X6 Pro to ensure performance constraints are understood before moving to native.
