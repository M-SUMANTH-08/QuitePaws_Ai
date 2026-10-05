<!-- GSD:project-start source:PROJECT.md -->
## Project

**QuietPaws**

QuietPaws is an offline-first, on-device AI agent designed for remote workers with a dog at home. It prevents pet interruptions during live meetings by observing the workspace and intelligently redirecting the dog using a familiar owner-recorded auditory cue.

**Core Value:** Preventing pet interruptions during important meetings locally on-device, preserving privacy without relying on cloud AI.

### Constraints

- **Hardware Target**: iQOO 15 — Primary hackathon target, requires experimental verification of specific capabilities.
- **Privacy/Connectivity**: Offline-first — No cloud AI required; must work in airplane mode to prove privacy.
- **Intervention Limit**: Max two cues — Prevents repeatedly disturbing the dog if the first intervention (and one alternative) doesn't work.
- **Model Selection**: On-device models (e.g., TFLite EfficientDet-Lite, YAMNet) — Needed to fulfill the offline and latency requirements.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style & Architecture
- **Vanilla ES Modules (ESM):** The project relies on standard ES6 import/export syntax natively supported by browsers. No complex bundlers like Webpack or Vite are required for the development loop.
- **No Heavy UI Frameworks:** State is managed via plain JavaScript objects and direct DOM manipulation. React, Vue, or similar frameworks are intentionally avoided to keep the prototype lightweight, close to the metal, and focused on the ML pipeline.
- **Direct DOM Binding:** UI elements are fetched via `document.getElementById` or `querySelector` at initialization in `main.js` and updated imperatively.
## Naming Conventions
- **JavaScript:** Variable and function names strictly use `camelCase`. Constants exported from `config.js` may use `UPPER_SNAKE_CASE`. Classes (if any) use `PascalCase`.
- **Files:** File names are entirely lowercase and typically a single descriptive word reflecting the module's role (`vision.js`, `audio.js`, `fusion.js`).
- **CSS / HTML:** IDs and Classes use `kebab-case`. Classes often utilize a prefix or block name to namespace the styles (e.g., `btn-primary`, `nav-brand`, `status-dot`).
## Design Patterns
- **Separation of Concerns:** The pipeline is strictly divided into distinct phases (Vision, Audio, Fusion, Intervention), with each phase isolated in its corresponding module.
- **Event-Driven / Polling Loop:** The application typically uses `requestAnimationFrame` for continuous visual inference, while audio analysis might run on its own timer or event loop. Modules communicate state changes back to the main controller.
- **Offline-First Focus:** All logic must assume the network might be unavailable. External API calls are prohibited in the core intervention loop.
## Error Handling & Permissions
- **Graceful Degradation:** The application must explicitly handle scenarios where Camera or Microphone permissions are denied by the user. Clear UI feedback must be provided.
- **Asynchronous Loading:** Loading TensorFlow models is asynchronous and can be slow. The UI must represent this loading state clearly (e.g., a "Loading Model..." indicator) and disable the Start button until the pipeline is fully initialized.
- **Try/Catch:** Critical initialization blocks (like accessing media devices or loading models) must be wrapped in try/catch blocks, with errors logged to the console and reflected in the UI telemetry.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Design Pattern
## Core Pipeline: `SEE → HEAR → THINK → ACT → VERIFY → INFORM`
### 1. Perception Layer (SEE & HEAR)
- **Vision (`vision.js`):** 
- **Audio (`audio.js`):**
### 2. Fusion Layer (THINK)
- **Fusion Logic (`fusion.js`):**
### 3. Action Layer (ACT, VERIFY, INFORM)
- **Intervention (`intervention.js`):**
## Abstractions & Data Flow
- `index.html` serves as the entry point, defining the UI layout, video container, and telemetry readouts.
- `main.js` boots the pipeline, requests permissions, and manages the UI state updates (e.g., updating the telemetry DOM elements, switching states between Idle, Detecting, and Intervening).
- The architecture is stateless on the backend; all state is ephemeral and held in the browser's memory during the session.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
