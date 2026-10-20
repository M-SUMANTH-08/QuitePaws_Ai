# QuietPaws Agent Build Rules

## Product truth
- Product target: iQOO 15.
- Current development/demo device: POCO X6 Pro.
- Never present POCO measurements as iQOO 15 measurements.
- Browser audio is spectral heuristic analysis, not YAMNet.
- Native Android target uses EfficientDet-Lite0 + YAMNet + CameraX.
- Never claim emotion detection, diagnosis, guaranteed response, first-ever status, or unmeasured latency/FPS.

## Product loop
SEE → HEAR → THINK → ACT → VERIFY → INFORM.
Meeting Mode → workspace approach → multimodal evidence → intervention → 2–3 s verification → one alternate cue if needed → stop + haptic/log.

## Safety
- Uncertain state = no intervention.
- No continuous audio bombardment.
- No indefinite escalation.
- No medical/emotional diagnosis.
- Controlled demo scenarios must be visibly labeled simulated.

## Web architecture
- Static-first Vercel deployment.
- Browser inference is local; no server is required for the ML loop.
- Do not add a database, load balancer, connection pool, or server cache unless a real backend requirement appears.
- Keep camera/microphone permissions scoped to the demo.
- No secrets in frontend code.

## UX
- One primary CTA: Start Live Detection / Open live demo.
- Mobile-first.
- Keyboard accessible.
- High contrast.
- Respect prefers-reduced-motion.
- Keep legal/privacy links visible.

## Performance
- Keep CDN model loading deferred.
- Bundle/minify application JS for production.
- Keep source modules readable for development.
- Avoid unnecessary dependencies and re-renders.
- Do not claim Lighthouse scores until measured.
