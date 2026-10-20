import { build } from 'esbuild';
import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve('.');
const out = resolve('dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

// Copy static pages/assets first.
for (const item of ['index.html','privacy.html','terms.html','404.html','robots.txt','sitemap.xml','manifest.webmanifest','favicon.svg','site-config.js','sw.js','public','assets','css']) {
  const src = join(root, item);
  try { await cp(src, join(out, item), { recursive: true }); } catch (_) {}
}

// Minify/bundle the application modules for production while keeping CDN models external.
await build({
  entryPoints: [join(root, 'js/main.js')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  outfile: join(out, 'app.js'),
});

const css = await readFile(join(out, 'css/main.css'), 'utf8');
await writeFile(join(out, 'css/main.css'), css.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').trim());

const htmlPath = join(out, 'index.html');
let html = await readFile(htmlPath, 'utf8');
html = html.replace(/<script type="module" src="js\/main\.js"><\/script>/, '<script type="module" src="/app.js"></script>');
await writeFile(htmlPath, html);

// Generate robots/sitemap from the configured production URL when provided.
const siteUrl = (process.env.SITE_URL || 'https://quietpaws.vercel.app').replace(/\/$/, '');
await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url><url><loc>${siteUrl}/privacy.html</loc></url><url><loc>${siteUrl}/terms.html</loc></url></urlset>`);

console.log(`QuietPaws production build written to ${out}`);
