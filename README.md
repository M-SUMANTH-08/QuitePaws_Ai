# QuietPaws — V4 Antigravity / Vercel Prototype

QuietPaws is a phone-native, offline-first, meeting-aware pet interruption prevention prototype.

## Device positioning
- **Target hardware:** iQOO 15.
- **Development/demo hardware:** POCO X6 Pro.
- iQOO 15-specific performance claims are intentionally not included until the target device is measured.

## Browser architecture
`COCO-SSD vision → spectral audio → temporal/workspace fusion → owner voice → response verification → haptic/local log`

Browser audio is a spectral heuristic, not YAMNet.

## Project structure
```text
quietpaws-prototype/
├── index.html
├── privacy.html
├── terms.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── favicon.svg
├── manifest.webmanifest
├── assets/
├── css/
├── js/
├── public/
├── api/
├── docs/
├── scripts/
├── AGENTS.md
├── ANTIGRAVITY_PROMPT.md
├── package.json
├── vercel.json
└── .env.example
```

## Run
```bash
npm install
npm run build
npm start
```

## Deploy
```bash
npx vercel --prod
```

Set the actual production URL before final deployment so canonical/sitemap values are correct.

## Documentation
Start with:
1. `docs/PRD.md`
2. `docs/TRD.md`
3. `docs/ARCHITECTURE.md`
4. `docs/APP_FLOW.md`
5. `docs/UI_UX_DESIGN_BRIEF.md`
6. `docs/BACKEND_AND_SCHEMA.md`
7. `docs/IMPLEMENTATION_PLAN.md`
8. `docs/ECOSYSTEM_AND_GAP_ANALYSIS.md`
9. `docs/DEMO_WALKTHROUGH.md`
10. `ANTIGRAVITY_PROMPT.md`

## Product language
Use **workplace interruption prevention**, not “dog emotion AI”.

The killer line:
> **Your dog heard you leave. Your phone stayed to protect your meeting.**
