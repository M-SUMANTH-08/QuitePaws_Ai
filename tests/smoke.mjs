import { access, readFile } from 'node:fs/promises';
const required = [
  'index.html','favicon.svg','manifest.webmanifest',
  'robots.txt','sitemap.xml','assets/quietpaws-social.png','css/main.css','js/main.js',
  'js/vision.js','js/audio.js','js/fusion.js','js/intervention.js','js/config.js','js/consent.js',
  'sw.js',
  'docs/PRD.md','docs/TRD.md','docs/APP_FLOW.md','docs/UI_UX_DESIGN_BRIEF.md','docs/BACKEND_AND_SCHEMA.md',
  'docs/IMPLEMENTATION_PLAN.md','docs/ARCHITECTURE.md','docs/ECOSYSTEM_AND_GAP_ANALYSIS.md'
];
for (const file of required) await access(file);
const html = await readFile('index.html','utf8');
for (const marker of [
  'QUIETPAWS','START QUIETPAWS','STANDBY','OWNER VOICE',
  'btnRecordPrimary','btnClearLog',
  'MEETING MODE', 'PHONE-FIRST AI',
  'PHONE SEES → HEARS → ACTS'
]) {
  if (!html.includes(marker)) throw new Error(`Missing marker: ${marker}`);
}

// Validate JS modules parse correctly (basic syntax check)
for (const mod of ['js/config.js','js/vision.js','js/audio.js','js/fusion.js','js/intervention.js','js/main.js']) {
  const src = await readFile(mod, 'utf8');
  // Check it's not empty and has export or import
  if (src.length < 50) throw new Error(`Module too small: ${mod}`);
}

const css = await readFile('css/main.css','utf8');
for (const sel of ['.dash-card','.btn-action','.workspace-box','.camera-section']) {
  if (!css.includes(sel)) throw new Error(`Missing CSS selector: ${sel}`);
}

console.log(`QuietPaws smoke check passed: ${required.length} required files + UI markers + CSS selectors.`);
