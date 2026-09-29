// Compone reformer + figura + correas en una sola lista de trazos,
// y la renderiza a SVG (UI) o Canvas (esferas del reloj).

import { solve, figureSegments, figurePoints } from './figure.js';
import { apparatusSegments, strapSegments, apparatusPoints } from './reformer.js';

export function scene(pose) {
  const joints = solve(pose);
  const setup = pose.setup ?? {};
  const segments = [
    ...apparatusSegments(setup),
    ...strapSegments(setup, joints),
    ...figureSegments(pose, joints),
  ];
  const body = figurePoints(joints);
  return {
    joints,
    segments,
    bbox: box([...apparatusPoints(), ...body], 8, 2),
    // Encuadre ajustado a la figura (con margen para ver el carro/footbar cercanos).
    figureBox: box(body, 16, 14),
  };
}

function box(pts, pad, padBottom) {
  const minX = Math.min(...pts.map((p) => p.x)) - pad;
  const maxX = Math.max(...pts.map((p) => p.x)) + pad;
  const minY = Math.min(...pts.map((p) => p.y)) - pad;
  const maxY = Math.max(...pts.map((p) => p.y)) + padBottom;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const r1 = (n) => Math.round(n * 10) / 10;

/** SVG autocontenido; colores por clase → variables CSS (ver styles.css). */
export function toSVG(pose, { className = 'figure' } = {}) {
  const { segments, bbox } = scene(pose);
  const body = segments.map((s) => {
    const cls = s.role === 'far' ? 'body far' : s.role === 'near' ? 'body' : s.role;
    const op = s.opacity !== undefined && s.opacity !== 1 ? ` opacity="${s.opacity}"` : '';
    return s.fill
      ? `<path class="${cls} fill" d="${s.d}"${op}/>`
      : `<path class="${cls}" d="${s.d}" stroke-width="${s.width}"${op}/>`;
  });
  const vb = `${r1(bbox.x)} ${r1(bbox.y)} ${r1(bbox.w)} ${r1(bbox.h)}`;
  return `<svg class="${esc(className)}" viewBox="${vb}" role="img" aria-label="${esc(pose.name)}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${body.join('')}</g></svg>`;
}

export const DEFAULT_PALETTE = {
  body: '#ffffff',
  apparatus: '#5b6472',
  spring: '#8a93a3',
  strap: '#f2b84b',
};

/**
 * Dibuja la escena en un Canvas 2D ajustada (contain) al rectángulo destino.
 * crop: 'full' = máquina entera · 'figure' = zoom a la figura (recorta el resto).
 */
export function drawScene(ctx, pose, rect, palette = DEFAULT_PALETTE, { crop = 'full' } = {}) {
  const { segments, bbox: full, figureBox } = scene(pose);
  const bbox = crop === 'figure' ? figureBox : full;
  const scale = Math.min(rect.w / bbox.w, rect.h / bbox.h);
  const ox = rect.x + (rect.w - bbox.w * scale) / 2 - bbox.x * scale;
  const oy = rect.y + (rect.h - bbox.h * scale) / 2 - bbox.y * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of segments) {
    const color = s.role === 'near' || s.role === 'far' ? palette.body : palette[s.role];
    const path = new Path2D(s.d);
    ctx.globalAlpha = (s.role === 'far' ? 0.45 : 1) * (s.opacity ?? 1);
    if (s.fill) {
      ctx.fillStyle = color;
      ctx.fill(path);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = s.width;
      ctx.stroke(path);
    }
  }
  ctx.restore();
  return { scale };
}
