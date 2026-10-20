# Testing Practices

**Date:** 2026-10-05

## Framework and Structure
- **Lightweight Approach:** Given this is a rapid browser prototype focused on ML pipeline validation, a heavy automated browser testing framework (like Cypress or Playwright) is not currently implemented.
- **Node-based Smoke Tests:** Basic syntax, module resolution, and isolated logic testing are handled by Node.js scripts.
  - Location: `tests/smoke.mjs`
  - Execution: Run via `npm test` or `node tests/smoke.mjs`.
  - These tests ensure the build doesn't break and core utility functions operate correctly outside the browser environment.

## Interactive / Manual Testing
- The primary testing methodology for the intervention logic relies on the built-in "Controlled Demo" UI within `index.html`.
- **Simulated Scenarios:** The UI provides buttons to inject simulated events directly into the `fusion.js` and `intervention.js` pipeline without requiring live camera/microphone input or an actual dog.
  - **Scenario A (Single Success):** Simulates an approach, triggers the owner's voice cue, and simulates a verified movement away.
  - **Scenario B (Adaptive Retry):** Simulates a failed first cue, triggering an alternate cue, followed by a verified response.
  - **Scenario C (No Intervention):** Simulates background activity that does not meet the threshold for intervention.
- These controls allow developers to rapidly iterate on the state machine and UI feedback loop.

## Coverage Expectations
- Coverage is primarily manual. Developers are expected to verify changes by running the local dev server (`npm run dev`) and validating both the live camera/mic feed and the simulated scenarios before committing changes.
- The pipeline (`SEE → HEAR → THINK → ACT → VERIFY`) must be fully exercisable via the UI controls.
