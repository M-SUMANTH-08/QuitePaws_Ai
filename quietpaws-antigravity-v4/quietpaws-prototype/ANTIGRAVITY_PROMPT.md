# Antigravity Master Prompt — QuietPaws

You are implementing the QuietPaws browser prototype for an iQOO × Reskill Grand Finale submission.

Read `AGENTS.md` and every document in `docs/` before editing.

## Non-negotiable truth
- Target product: iQOO 15.
- Available development/demo phone: POCO X6 Pro.
- Never label POCO measurements as iQOO measurements.
- Browser audio is spectral heuristic analysis, not YAMNet.
- Native Android target is the heavier EfficientDet-Lite0 + YAMNet architecture.

## Product loop
SEE → HEAR → THINK → ACT → VERIFY → INFORM.

Meeting Mode → dog approaches workspace → multimodal evidence → intervention → 2–3 s observation → verify → one alternate cue if needed → stop + haptic/log.

## Build requirements
1. Preserve the existing working browser prototype.
2. Make the website production-ready for Vercel.
3. Keep the ML loop local.
4. Add privacy, terms, 404, favicon, social preview, sitemap, robots, responsive UI and security headers.
5. Add consent handling for optional website analytics.
6. Bundle/minify application JS and CSS for production.
7. Keep controlled demo scenarios deterministic and visibly labeled simulated.
8. Keep legal language honest.
9. Do not add a database or cloud backend unless a real requirement exists.
10. Run build and smoke tests before finishing.

## Acceptance test
- `npm install` succeeds.
- `npm run build` succeeds.
- `npm start` serves the built site.
- Scenario A works.
- Scenario B works.
- Scenario C works.
- Live camera can start and stop cleanly.
- Portrait layout does not misalign detection overlay.
- Privacy/terms/404 routes work.
- No placeholder APK link remains.
- No secret is present in frontend source.
- Vercel deployment is HTTPS.

Do not redesign the product concept. Improve implementation, reliability, accessibility, security and demo clarity only.
