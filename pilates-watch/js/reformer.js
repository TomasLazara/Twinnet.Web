// Reformer paramétrico en vista lateral (1 unidad ≈ 1 cm).
// Izquierda = cabecera (poleas de las correas), derecha = footbar y plataforma.
// El carro se desliza sobre los rieles; `carriage` es la x de su borde izquierdo
// (home = pegado a los resortes).

import { polyline, circlePath } from './figure.js';

export const R = {
  floor: 146,
  rail: { x0: 8, x1: 272, top: 110, bottom: 117 },
  pulley: { x: 14, y: 60, r: 3 },
  footbar: { hinge: { x: 250, y: 110 }, up: { x: 242, y: 74 }, down: { x: 224, y: 104 }, r: 3.5 },
  platform: { x0: 252, x1: 272, top: 101 },
  carriage: { home: 104, width: 96, top: 98, bottom: 107 },
  springAnchor: { x: 252, y: 113 },
  headrest: 16,
  shoulderBlock: { dx: 17, w: 6, h: 14 },
  box: {
    long: { dx: 24, w: 74, h: 26 },
    short: { dx: 26, w: 34, h: 26 },
  },
  footStrapAnchor: { x: 246, y: 108 },
};

/** Puntos de apoyo útiles para componer poses (dependen de la posición del carro). */
export function anchors(carriage = R.carriage.home) {
  const c = R.carriage;
  const box = (k) => ({ x0: carriage + R.box[k].dx, x1: carriage + R.box[k].dx + R.box[k].w, top: c.top - R.box[k].h });
  return {
    carriageTop: c.top,
    carriageLeft: carriage,
    carriageRight: carriage + c.width,
    shoulderBlockX: carriage + R.shoulderBlock.dx,
    footbar: R.footbar.up,
    platformTop: R.platform.top,
    longBox: box('long'),
    shortBox: box('short'),
  };
}

const rect = (x, y, w, h) => `M${x} ${y} h${w} v${h} h${-w} Z`;

function zigzag(a, b, teeth = 9, amp = 2.2) {
  const pts = [a];
  const dx = (b.x - a.x) / (teeth * 2);
  const dy = (b.y - a.y) / (teeth * 2);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = (-(b.y - a.y) / len) * amp;
  const ny = ((b.x - a.x) / len) * amp;
  for (let i = 1; i < teeth * 2; i++) {
    const s = i % 2 ? 1 : -1;
    pts.push({ x: a.x + dx * i + nx * s, y: a.y + dy * i + ny * s });
  }
  pts.push(b);
  return polyline(pts);
}

/**
 * Trazos del aparato. `setup`:
 *   carriage: x del borde izquierdo del carro
 *   footbar: 'up' | 'down'
 *   box: null | 'long' | 'short'
 */
export function apparatusSegments(setup = {}) {
  const cx = setup.carriage ?? R.carriage.home;
  const c = R.carriage;
  const { rail, pulley, footbar, platform } = R;
  const segs = [];
  const frame = (d, width = 2) => segs.push({ d, width, role: 'apparatus' });
  const solid = (d, opacity = 1) => segs.push({ d, fill: true, role: 'apparatus', opacity });

  // Piso, patas y rieles.
  frame(`M0 ${R.floor} H280`, 1.5);
  solid(rect(rail.x0 + 4, rail.bottom, 5, R.floor - rail.bottom));
  solid(rect(rail.x1 - 9, rail.bottom, 5, R.floor - rail.bottom));
  solid(rect(rail.x0, rail.top, rail.x1 - rail.x0, rail.bottom - rail.top), 0.55);

  // Cabecera con polea.
  frame(polyline([{ x: pulley.x, y: rail.top }, pulley]), 3);
  solid(circlePath(pulley, pulley.r));

  // Plataforma.
  solid(rect(platform.x0, platform.top, platform.x1 - platform.x0, rail.top - platform.top), 0.8);

  // Resortes (del carro al anclaje).
  for (let i = 0; i < 3; i++) {
    const y = c.top + 3 + i * 2.2;
    segs.push({ d: zigzag({ x: cx + c.width, y }, { x: R.springAnchor.x, y: R.springAnchor.y - 2 + i }), width: 1, role: 'spring' });
  }

  // Carro, apoyacabeza y hombreras.
  solid(rect(cx, c.top, c.width, c.bottom - c.top), 0.85);
  solid(`M${cx} ${c.top} L${cx} ${c.top - 5} L${cx + R.headrest} ${c.top - 2} L${cx + R.headrest} ${c.top} Z`, 0.85);
  const sb = R.shoulderBlock;
  solid(rect(cx + sb.dx, c.top - sb.h, sb.w, sb.h), 0.9);

  // Cajas.
  if (setup.box) {
    const b = R.box[setup.box];
    solid(rect(cx + b.dx, c.top - b.h, b.w, b.h), 0.7);
  }

  // Footbar.
  const bar = setup.footbar === 'down' ? footbar.down : footbar.up;
  frame(polyline([footbar.hinge, bar]), 3.5);
  solid(circlePath(bar, footbar.r));
  return segs;
}

/** Correas: desde la polea (o el anclaje del foot strap) hasta manos/pies. */
export function strapSegments(setup, joints) {
  if (!setup.straps) return [];
  const targets = {
    hands: [joints.arms.near.at(-1), joints.arms.far.at(-1)],
    feet: [joints.legs.near[2], joints.legs.far[2]],
    'hand-near': [joints.arms.near.at(-1)],
    'foot-near': [joints.legs.near[2]],
  };
  const footstrap = setup.straps.startsWith('footstrap');
  const from = footstrap ? R.footStrapAnchor : R.pulley;
  const pts = {
    footstrap: targets.feet,
    'footstrap-far': [joints.legs.far[2]],
  }[setup.straps] ?? targets[setup.straps];
  return pts.map((p, i) => ({ d: polyline([from, p]), width: 1.6, role: 'strap', opacity: i ? 0.55 : 1 }));
}

/** Puntos de la silueta del aparato (para la caja envolvente). */
export function apparatusPoints() {
  return [
    { x: 0, y: R.floor + 1 },
    { x: 280, y: R.floor + 1 },
    { x: R.pulley.x, y: R.pulley.y - R.pulley.r },
    { x: R.footbar.up.x, y: R.footbar.up.y - R.footbar.r },
  ];
}
