import { access, readFile } from 'node:fs/promises';
const required = [
  'index.html','privacy.html','terms.html','404.html','favicon.svg','manifest.webmanifest',
  'robots.txt','sitemap.xml','assets/quietpaws-social.png','css/main.css','js/main.js',
  'js/vision.js','js/audio.js','js/fusion.js','js/intervention.js','js/config.js','js/consent.js',
  'docs/PRD.md','docs/TRD.md','docs/APP_FLOW.md','docs/UI_UX_DESIGN_BRIEF.md','docs/BACKEND_AND_SCHEMA.md',
  'docs/IMPLEMENTATION_PLAN.md','docs/ARCHITECTURE.md','docs/ECOSYSTEM_AND_GAP_ANALYSIS.md'
];
for (const file of required) await access(file);
const html = await readFile('index.html','utf8');
for (const marker of ['Start Live Detection','Scenario A','Scenario B','privacy.html','terms.html','cookieBanner']) {
  if (!html.includes(marker)) throw new Error(`Missing marker: ${marker}`);
}
console.log(`QuietPaws smoke check passed: ${required.length} required files + UI markers.`);
