# Codebase Conventions

**Date:** 2026-10-05

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
