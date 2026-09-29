// Genera fondos de esfera (PNG) al tamaño exacto de la pantalla del reloj,
// para cargarlos como "esfera personalizada" desde la app del reloj
// (FitCloudPro y similares). Al usar la resolución nativa, la app no recorta.

import { drawScene } from './scene.js';
import { LEVELS } from './poses.js';

export const SCREEN_PRESETS = [
  { id: '240x280', w: 240, h: 280, round: false, label: '1.69" rectangular · 240×280' },
  { id: '368x448', w: 368, h: 448, round: false, label: '1.96"–2.04" AMOLED · 368×448' },
  { id: '410x502', w: 410, h: 502, round: false, label: '2.01" AMOLED · 410×502' },
  { id: '360x360', w: 360, h: 360, round: true, label: '1.3"–1.39" redondo · 360×360' },
  { id: '466x466', w: 466, h: 466, round: true, label: '1.43" AMOLED redondo · 466×466' },
];

export const THEMES = {
  mint: { label: 'Menta', body: '#7fe0c4', apparatus: '#4a5563', spring: '#6b7584', strap: '#f2b84b', text: '#ffffff', sub: '#9aa4b2' },
  coral: { label: 'Coral', body: '#ff8a7a', apparatus: '#4f4a55', spring: '#736b78', strap: '#ffd27a', text: '#ffffff', sub: '#b4a9b8' },
  lilac: { label: 'Lila', body: '#c7a6ff', apparatus: '#47475c', spring: '#6c6c84', strap: '#7fe0c4', text: '#ffffff', sub: '#a7a7c0' },
  white: { label: 'Blanco', body: '#ffffff', apparatus: '#4b4b4b', spring: '#707070', strap: '#ffb020', text: '#ffffff', sub: '#9a9a9a' },
};

/**
 * Calcula las zonas de la esfera. Separado del dibujo para poder testearlo.
 * clock: 'top' | 'bottom' | 'none' → espacio reservado para la hora que
 * superpone la app del reloj.
 */
export function layout({ w, h, round = false, clock = 'top', showText = true }) {
  const inset = round ? Math.round(w * 0.14) : Math.round(w * 0.05);
  const inner = { x: inset, y: inset, w: w - inset * 2, h: h - inset * 2 };
  const clockH = clock === 'none' ? 0 : Math.round(inner.h * 0.3);
  const textH = showText ? Math.round(inner.h * 0.2) : 0;
  const clockZone = clock === 'bottom'
    ? { x: inner.x, y: inner.y + inner.h - clockH, w: inner.w, h: clockH }
    : { x: inner.x, y: inner.y, w: inner.w, h: clockH };
  const top = clock === 'top' ? inner.y + clockH : inner.y;
  const available = inner.h - clockH;
  const figure = { x: inner.x, y: top, w: inner.w, h: available - textH };
  const text = { x: inner.x, y: top + figure.h, w: inner.w, h: textH };
  return { inner, clockZone, figure, text };
}

function fitText(ctx, text, maxW, size, weight) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 1;
  } while (s > 8);
  return s;
}

/** Dibuja una esfera completa en el canvas (redimensiona el canvas). */
export function renderWatchFace(canvas, pose, opts) {
  const { w, h, round = false, clock = 'top', theme = 'mint', showText = true, crop = 'figure' } = opts;
  const t = THEMES[theme] ?? THEMES.mint;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  if (round) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    ctx.clip();
  }
  const zones = layout({ w, h, round, clock, showText });
  drawScene(ctx, pose, zones.figure, t, { crop });

  if (showText) {
    const { text } = zones;
    const nameSize = fitText(ctx, pose.name, text.w, Math.round(text.h * 0.42), 700);
    ctx.fillStyle = t.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(pose.name, text.x + text.w / 2, text.y + text.h * 0.5);
    const sub = `${pose.es} · ${LEVELS[pose.level]}`;
    fitText(ctx, sub, text.w, Math.min(Math.round(text.h * 0.26), nameSize - 2), 500);
    ctx.fillStyle = t.sub;
    ctx.fillText(sub, text.x + text.w / 2, text.y + text.h * 0.88);
  }
  ctx.restore();
  return zones;
}

export function fileName(pose, { w, h }) {
  return `reformer-${pose.id}-${w}x${h}.png`;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar el PNG'))), 'image/png');
  });
}
