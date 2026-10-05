# QuietPaws

## What This Is

QuietPaws is an offline-first, on-device AI agent designed for remote workers with a dog at home. It prevents pet interruptions during live meetings by observing the workspace and intelligently redirecting the dog using a familiar owner-recorded auditory cue.

## Core Value

Preventing pet interruptions during important meetings locally on-device, preserving privacy without relying on cloud AI.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Dog detection using phone's camera (e.g., EfficientDet-Lite).
- [ ] Workspace/approach detection to know when intervention is needed.
- [ ] Multimodal behavioral estimation (visual movement/pose + audio using e.g., YAMNet features).
- [ ] Observable behavioral state categorization (NO_DOG, CALM, ATTENTION_SEEKING, ACTIVE/PLAYFUL, HIGH_AROUSAL, UNCERTAIN).
- [ ] Meeting Mode activation.
- [ ] Owner-recorded voice intervention (played via phone speaker).
- [ ] Response verification (observing if the dog moved away or situation improved).
- [ ] Haptic notification to silently communicate events to the owner.
- [ ] Local session logging.
- [ ] Offline operation (works in airplane mode for privacy proof).
- [ ] Reliable live demonstration capability.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Generic pet monitor, pet camera, pet sitter — Focus is strictly on workplace interruption prevention during meetings.
- Emotion detection or medical diagnosis — The system estimates observable behavioral states, not emotions.
- Cloud AI services — Must remain offline-first and privacy-focused for the core experience.
- Repeated disturbances — If the first intervention and one alternative cue fail, the system stops rather than repeatedly disturbing the dog.
- TDOA/audio localization, automatic meeting detection, animal pose estimation, richer analytics, directional/advanced haptics, additional actuator strategies — Treated as optional/stretch goals and must not become dependencies for the core demo.

## Context

Targeted as a hackathon prototype. The primary target hardware is the iQOO 15 (though development/testing is on POCO X6 Pro). The prototype is intended to be native Android. The browser prototype is merely a demonstration layer, and any browser audio classification using spectral heuristics must not be represented as equivalent to native YAMNet. Any iQOO 15 performance, NPU, latency, or hardware-specific capabilities must be experimentally verified.

## Constraints

- **Hardware Target**: iQOO 15 — Primary hackathon target, requires experimental verification of specific capabilities.
- **Privacy/Connectivity**: Offline-first — No cloud AI required; must work in airplane mode to prove privacy.
- **Intervention Limit**: Max two cues — Prevents repeatedly disturbing the dog if the first intervention (and one alternative) doesn't work.
- **Model Selection**: On-device models (e.g., TFLite EfficientDet-Lite, YAMNet) — Needed to fulfill the offline and latency requirements.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use observable behavioral states only | Avoids diagnosing emotions or medical conditions, keeping the focus objective. | — Pending |
| Cap interventions at 1 initial + 1 alternative | Avoids overly disturbing the animal if it isn't responding. | — Pending |
| Offline-first architecture | Ensures privacy and fulfills core product promise without cloud dependencies. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-05 after initialization*
