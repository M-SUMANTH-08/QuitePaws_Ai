# QuietPaws — Ecosystem, Risks, Overkill & Missing Pieces

## What is strong
- Clear meeting-specific context.
- Phone-native system story.
- Closed-loop action + verification.
- Offline-first positioning.
- Owner voice is emotionally understandable.
- Controlled demo fallback makes the presentation deterministic.

## What is weak
- Browser audio is heuristic rather than learned audio classification.
- Browser and native pipelines are not identical.
- Target iQOO 15 is not the current physical development device.
- Animal behavior labels can be over-interpreted if presented as emotions.
- Live animal behavior is inherently variable.

## What breaks first
1. Camera permission denial.
2. Model/CDN load failure.
3. Audio false positives from speech/TV.
4. Dog outside the workspace being incorrectly treated as an interruption.
5. Unreliable dog response to a cue.
6. Browser vibration unsupported.
7. Target-device performance assumptions.

## Overkill to avoid
- Database for the browser demo.
- Load balancer.
- Connection pooling.
- Cloud inference.
- Custom training in the hackathon MVP.
- Breed recognition.
- Thermal/GSR/Bluetooth.
- TDOA as a core dependency.
- Automatic meeting detection as a core dependency.

## Missing pieces to validate
- Negative audio tests.
- False-intervention count across repeated trials.
- Real latency measured from stimulus to cue.
- Target iQOO 15 hardware measurements.
- Production Vercel URL confirmation.
- Final privacy/terms contact details.
- Analytics configuration after deployment.

## The key product distinction
Do not sell QuietPaws as “dog emotion AI.” Sell it as **workplace interruption prevention**: detect a potential interruption, intervene conservatively, verify the result, and keep the owner informed.
