// Hoja de contacto de todas las poses (revisión visual) + reporte de IK.
// Uso: node scripts/contact-sheet.mjs [salida.html] [desde] [hasta]
import { writeFileSync } from 'node:fs';
import { POSES } from '../js/poses.js';
import { toSVG, scene } from '../js/scene.js';

const [out = 'contact-sheet.html', from = 0, to = POSES.length] = process.argv.slice(2);
const list = POSES.slice(+from, +to);
for (const p of list) {
  const { joints } = scene(p);
  if (joints.issues.length) console.warn(`${p.id}: ${joints.issues.join('; ')}`);
}
const cards = list
  .map((p, i) => `<figure>${toSVG(p)}<figcaption>${+from + i}. ${p.name}${p.review ? ' ⚠' : ''}</figcaption></figure>`)
  .join('');
writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#111;color:#eee;font:13px system-ui;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px}
figure{margin:0;background:#1d1d1d;border-radius:8px;padding:4px}svg{width:100%;height:170px;color:#7fe0c4}
.body{stroke:#7fe0c4}.body.fill{fill:#7fe0c4;stroke:none}.far{opacity:.45}.apparatus{stroke:#5b6472}.apparatus.fill{fill:#5b6472;stroke:none}
.spring{stroke:#8a93a3}.strap{stroke:#f2b84b}figcaption{text-align:center}</style>${cards}`,
);
console.log(`Escrito ${out} (${list.length} poses)`);
