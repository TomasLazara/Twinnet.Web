// Genera icons/icon.svg a partir de una pose (y opcionalmente los PNG con Playwright).
// Uso: node scripts/make-icons.mjs [ruta-a-playwright]
import { writeFileSync } from 'node:fs';
import { getPose } from '../js/poses.js';
import { scene } from '../js/scene.js';

const pose = getPose('elephant');
const { segments, bbox } = scene(pose);
const colors = { near: '#7fe0c4', far: '#7fe0c4', apparatus: '#4f5866', spring: '#6b7584', strap: '#f2b84b' };
const paths = segments
  .filter((s) => s.role !== 'apparatus' || !s.d.startsWith('M0 '))
  .map((s) => {
    const c = colors[s.role];
    const op = (s.role === 'far' ? 0.45 : 1) * (s.opacity ?? 1);
    return s.fill
      ? `<path d="${s.d}" fill="${c}" opacity="${op}"/>`
      : `<path d="${s.d}" stroke="${c}" stroke-width="${s.width}" opacity="${op}"/>`;
  })
  .join('');
const size = Math.max(bbox.w, bbox.h) * 1.18;
const vx = bbox.x - (size - bbox.w) / 2;
const vy = bbox.y - (size - bbox.h) / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0f1115"/><svg x="0" y="0" width="512" height="512" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg></svg>`;
writeFileSync('icons/icon.svg', svg);
console.log('icons/icon.svg');

const pw = process.argv[2];
if (pw) {
  const { chromium } = await import(pw);
  const browser = await chromium.launch();
  for (const px of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: px, height: px } });
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${px}" height="${px}">`);
    await page.screenshot({ path: `icons/icon-${px}.png`, omitBackground: true });
    console.log(`icons/icon-${px}.png`);
  }
  await browser.close();
}
