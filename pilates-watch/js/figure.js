// Figura humana paramétrica calculada por cinemática directa/inversa.
// Ángulos absolutos por segmento en grados, eje SVG: 0 = derecha, 90 = abajo,
// -90 = arriba. Un mismo conjunto de trazos sirve para SVG (UI) y Canvas (esferas).
//
// Extremidades:
//   [a1, a2, pie?]            → ángulos del segmento proximal, distal y pie.
//   { to: [x, y], bend, foot } → cinemática inversa: la mano/tobillo termina en
//                                (x, y); `bend` (1 | -1) elige hacia qué lado
//                                se dobla el codo/rodilla.
// Vistas:
//   'side'  (default) → extremidades cercana/lejana, la lejana atenuada.
//   'front' → hombros y caderas con ancho; cercana = lado derecho del tronco.

export const BODY = {
  torso: 52,
  neck: 14,
  headR: 9,
  upperArm: 27,
  forearm: 25,
  thigh: 42,
  shin: 40,
  foot: 9,
  shoulderHalf: 12,
  hipHalf: 8,
};

export const STROKE = { torso: 13, thigh: 9, limb: 8, girdle: 8 };

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const round = (n) => Math.round(n * 10) / 10;

export function step(p, angle, len) {
  return { x: p.x + len * Math.cos(rad(angle)), y: p.y + len * Math.sin(rad(angle)) };
}

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/** Cinemática inversa de dos segmentos (ley del coseno). */
export function ik(root, target, l1, l2, bend = 1) {
  const d = dist(root, target);
  const base = Math.atan2(target.y - root.y, target.x - root.x);
  const reach = Math.min(d, l1 + l2 - 1e-6);
  const cosA = (l1 * l1 + reach * reach - l2 * l2) / (2 * l1 * reach || 1);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const a1 = deg(base - bend * a);
  const mid = step(root, a1, l1);
  const a2 = deg(Math.atan2(target.y - mid.y, target.x - mid.x));
  return { a1, a2, reachable: d <= l1 + l2 + 0.5, gap: Math.max(0, d - (l1 + l2)) };
}

function limb(root, spec, l1, l2, footLen, issues, label) {
  let a1;
  let a2;
  let foot;
  if (Array.isArray(spec)) {
    [a1, a2, foot] = spec;
  } else {
    const sol = ik(root, { x: spec.to[0], y: spec.to[1] }, l1, l2, spec.bend ?? 1);
    if (!sol.reachable) issues.push(`${label}: no alcanza el objetivo (faltan ${sol.gap.toFixed(1)})`);
    ({ a1, a2 } = sol);
    foot = spec.foot;
  }
  const mid = step(root, a1, l1);
  const end = step(mid, a2, l2);
  const pts = [root, mid, end];
  if (footLen && foot !== undefined) pts.push(step(end, foot, footLen));
  return pts;
}

/** Resuelve todas las articulaciones de una pose. */
export function solve(pose) {
  const issues = [];
  const front = pose.view === 'front';
  const pelvis = { x: pose.hip[0], y: pose.hip[1] };
  // En flexión (espalda en C) la cuerda cadera→hombro es más corta: `torsoLen`.
  const neck = step(pelvis, pose.torso, pose.torsoLen ?? BODY.torso);
  const head = step(neck, pose.head, BODY.neck);
  const sideA = pose.torso + 90;
  const sideB = pose.torso - 90;
  const shoulders = front
    ? { near: step(neck, sideA, BODY.shoulderHalf), far: step(neck, sideB, BODY.shoulderHalf) }
    : { near: neck, far: neck };
  const hips = front
    ? { near: step(pelvis, sideA, BODY.hipHalf), far: step(pelvis, sideB, BODY.hipHalf) }
    : { near: pelvis, far: pelvis };
  const farArm = pose.arms.far ?? pose.arms.near;
  const farLeg = pose.legs.far ?? pose.legs.near;
  const arm = (root, s, label) => limb(root, s, BODY.upperArm, BODY.forearm, 0, issues, label);
  const leg = (root, s, label) => limb(root, s, BODY.thigh, BODY.shin, BODY.foot, issues, label);
  const mid = { x: (pelvis.x + neck.x) / 2, y: (pelvis.y + neck.y) / 2 };
  return {
    view: front ? 'front' : 'side',
    hip: pelvis,
    shoulder: neck,
    head,
    shoulders,
    hips,
    spine: step(mid, pose.torso - 90, pose.spine ?? 0),
    arms: { near: arm(shoulders.near, pose.arms.near, 'brazo'), far: arm(shoulders.far, farArm, 'brazo lejano') },
    legs: { near: leg(hips.near, pose.legs.near, 'pierna'), far: leg(hips.far, farLeg, 'pierna lejana') },
    issues,
  };
}

export const polyline = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${round(p.x)} ${round(p.y)}`).join(' ');

export function circlePath(c, r) {
  return `M${round(c.x - r)} ${round(c.y)} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
}

/** Trazos de la figura (de atrás hacia adelante). */
export function figureSegments(pose, joints = solve(pose)) {
  const j = joints;
  const back = j.view === 'side' ? 'far' : 'near';
  const torso = `M${round(j.hip.x)} ${round(j.hip.y)} Q${round(j.spine.x)} ${round(j.spine.y)} ${round(j.shoulder.x)} ${round(j.shoulder.y)}`;
  const legPath = (pts, role) => [
    { d: polyline(pts.slice(0, 2)), width: STROKE.thigh, role },
    { d: polyline(pts.slice(1)), width: STROKE.limb, role },
  ];
  const segs = [
    { d: polyline(j.arms.far), width: STROKE.limb, role: back },
    ...legPath(j.legs.far, back),
    { d: torso, width: STROKE.torso, role: 'near' },
  ];
  if (j.view === 'front') {
    segs.push(
      { d: polyline([j.shoulders.far, j.shoulders.near]), width: STROKE.girdle, role: 'near' },
      { d: polyline([j.hips.far, j.hips.near]), width: STROKE.girdle, role: 'near' },
    );
  }
  segs.push(...legPath(j.legs.near, 'near'));
  segs.push({ d: circlePath(j.head, BODY.headR), fill: true, role: 'near' });
  if (pose.face !== undefined) {
    // "Nariz": indica hacia dónde mira la cara (boca arriba / boca abajo).
    const a = step(j.head, pose.face, BODY.headR - 1);
    const b = step(j.head, pose.face, BODY.headR + 3.5);
    segs.push({ d: polyline([a, b]), width: 4.5, role: 'near' });
  }
  segs.push({ d: polyline(j.arms.near), width: STROKE.limb, role: 'near' });
  return segs;
}

/** Puntos relevantes de la figura para calcular la caja envolvente. */
export function figurePoints(joints) {
  const j = joints;
  const r = BODY.headR;
  return [
    j.hip, j.shoulder, j.spine,
    ...j.arms.near, ...j.arms.far, ...j.legs.near, ...j.legs.far,
    { x: j.head.x - r, y: j.head.y - r }, { x: j.head.x + r, y: j.head.y + r },
  ];
}
