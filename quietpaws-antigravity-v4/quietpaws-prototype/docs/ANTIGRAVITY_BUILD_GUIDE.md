# QuietPaws — Antigravity Step-by-Step Build Guide

## Step 1 — Extract the project
Extract the supplied `quietpaws-antigravity-v4.zip`.
Open the folder **`quietpaws-prototype`** in Antigravity.

Do not open a nested duplicate folder.

## Step 2 — Let Antigravity understand the rules
The root contains `AGENTS.md`. Tell the agent:

> Read AGENTS.md and all files in docs/ before changing code. Do not redesign the product. Implement only within the frozen QuietPaws architecture. Preserve the distinction between POCO X6 Pro development hardware and iQOO 15 target hardware.

## Step 3 — Install dependencies
Open Antigravity's terminal:

```bash
npm install
```

## Step 4 — Build once

```bash
npm run build
```

Expected: a new `dist/` folder containing production HTML/CSS/JS.

## Step 5 — Run locally

```bash
npm start
```

Open the local URL printed by the terminal.

## Step 6 — Test controlled demo first
Click:
1. Meeting Mode ON.
2. Scenario A.
3. Scenario B.
4. Scenario C.

Confirm the response state and session log update.

## Step 7 — Test live camera
Click Start Live Detection.
Grant camera + microphone permission.
Confirm:
- CAMERA ✓
- MIC ✓
- MODEL ✓
- workspace box visible;
- dog box aligns with the video;
- approach telemetry changes;
- no intervention happens when Meeting Mode is OFF.

## Step 8 — Run negative tests
Say normal human speech.
Play TV audio.
Use fan/vacuum/doorbell audio.
Show a non-dog object.
Keep the dog outside the workspace.
Record any false intervention.

## Step 9 — Test mobile
Open the local site on the POCO X6 Pro in Chrome.
Test portrait orientation.
Test camera overlay alignment.
Test vibration.
Test model loading.

## Step 10 — Test privacy/legal
Open:
- `/privacy.html`
- `/terms.html`
- a deliberately invalid route for 404.

Reject analytics and confirm no analytics script is added. Accept only if you want Vercel Web Analytics.

## Step 11 — Configure production URL
Before deployment, set the real URL in `public/site-config.js` and `SITE_URL` in Vercel/project environment if needed.
Then run:

```bash
SITE_URL=https://YOUR-REAL-DOMAIN.vercel.app npm run build
```

On Windows PowerShell:

```powershell
$env:SITE_URL="https://YOUR-REAL-DOMAIN.vercel.app"; npm run build
```

## Step 12 — Deploy
From the project root:

```bash
npx vercel --prod
```

Use the Vercel project name you want. Do not assume `quietpaws.vercel.app` exists until Vercel confirms it.

## Step 13 — Enable analytics if desired
In Vercel Dashboard → Project → Analytics → Enable Web Analytics.
Redeploy if Vercel asks you to.
Then test the browser Network panel for the Vercel analytics request.

## Step 14 — Final production test
Check:
- HTTPS.
- `/`.
- `/privacy.html`.
- `/terms.html`.
- `/404.html`.
- camera permission.
- microphone permission.
- controlled demo.
- mobile layout.
- no broken links.
- no console errors.
- model load.
- offline/no-network inference after assets are available.

## Step 15 — Do not touch the product story after validation
The video should say:

> “QuietPaws is designed for the iQOO 15. This prototype is running on my POCO X6 Pro because that is my available development device.”

Then demonstrate:
SEE → HEAR → THINK → ACT → VERIFY → INFORM.
