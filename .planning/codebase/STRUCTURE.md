# Directory Structure

**Date:** 2026-10-05

**Root Directory:** `quietpaws-antigravity-v4/quietpaws-prototype/`

## Key Locations

### Root Files
- `index.html`: The main entry point containing the UI, telemetry dashboard, video elements, and script tags for loading the ES modules and ML libraries.
- `privacy.html`, `terms.html`, `404.html`: Standard static pages for the web deployment.
- `package.json`: Defines the project metadata, NPM scripts (`dev`, `build`, `start`, `test`), and dev dependencies.
- `vercel.json`: Configuration for deployment on Vercel.
- `site-config.js`: Global configuration variables injected into the window object.
- `manifest.webmanifest`: PWA manifest for defining app icons and theme colors.

### `js/` (Application Logic)
Contains the core ES modules that make up the pipeline.
- `main.js`: The orchestrator. Binds UI events, requests permissions, and drives the processing loop.
- `vision.js`: Encapsulates camera access, COCO-SSD model loading, and frame-by-frame object detection.
- `audio.js`: Encapsulates microphone access and spectral analysis heuristics.
- `fusion.js`: Contains the rules engine that decides when to intervene based on combined audio/visual data.
- `intervention.js`: Handles the playback of audio cues, the verification observation window, and outcome logging.
- `config.js`: Centralized constants, thresholds (e.g., confidence minimums, timing windows), and settings.
- `consent.js`: Manages the cookie banner and analytics consent logic.

### `css/` (Styles)
- `main.css`: The primary stylesheet. Uses native CSS variables for theming and standard CSS layout techniques (Flexbox/Grid).

### `assets/` (Static Media)
- Contains images (`quietpaws-social.png`) and the audio files used for the intervention cues (e.g., the owner's voice recordings).

### `scripts/` & `tests/`
- `scripts/build.mjs`: A lightweight build script leveraging `esbuild` for any necessary bundling before deployment.
- `tests/smoke.mjs`: Node.js based smoke tests to verify module integrity and basic logic without needing a browser environment.

## Naming Conventions
- Directories and HTML files use `kebab-case`.
- JavaScript files use `lowercase` descriptive names.
- JavaScript variables and functions use `camelCase`.
- CSS classes use `kebab-case` and often follow a block-element structure.
