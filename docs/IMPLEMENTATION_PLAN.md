# QuietPaws — Implementation Plan

## Phase 0 — Baseline
- Open the project in Antigravity.
- Run `npm install`.
- Run `npm run build`.
- Run `npm start` and test on Chrome/Edge.
- Confirm controlled demo works before touching ML.

## Phase 1 — Web hardening
- Verify all routes.
- Test camera/mic permissions.
- Test portrait mobile layout.
- Test model loading failure.
- Test offline/no-network inference behavior after assets are loaded.
- Test localStorage persistence.
- Test cookie consent.
- Test privacy/terms/404.

## Phase 2 — Perception validation
Run positive tests:
- real dog in frame;
- dog moving toward workspace;
- bark/whimper/growl samples.

Run negative tests:
- human speech;
- TV audio;
- doorbell;
- vacuum/fan;
- cat/non-dog;
- plush toy;
- dog far from workspace.

Record false triggers instead of claiming zero.

## Phase 3 — Closed loop
- Confirm approach eligibility.
- Confirm first cue.
- Confirm 2.6 s observation.
- Confirm success verification.
- Confirm one retry.
- Confirm stop after retry.
- Confirm haptic/log.

## Phase 4 — Deployment
1. Set `SITE_URL` to the actual Vercel production URL.
2. Enable Vercel Web Analytics in the project dashboard if desired.
3. Confirm the analytics script route exists after deployment.
4. Deploy with `vercel --prod`.
5. Test the production URL on desktop and POCO.
6. Run Lighthouse.
7. Check every link.
8. Test 404.
9. Verify HTTPS redirect.

## Phase 5 — Walkthrough video
- Use POCO X6 Pro.
- Explicitly label it as the development/demo device.
- Do not call POCO benchmarks iQOO 15 benchmarks.
- Scenario A.
- Scenario B.
- Airplane mode.
- Target-device positioning.
- Final killer line.

## Phase 6 — Native iQOO 15 validation
When an iQOO 15 is available:
- camera inference timing;
- audio inference timing;
- sustained FPS;
- temperature/battery behavior;
- haptics;
- speaker behavior;
- airplane mode;
- background/foreground recovery.
Only then add measured iQOO numbers to the submission.
