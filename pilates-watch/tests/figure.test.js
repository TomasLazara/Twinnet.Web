import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, ik, BODY } from '../js/figure.js';
import { scene } from '../js/scene.js';
import { POSES, POSE_BY_ID, LEVELS } from '../js/poses.js';
import { R } from '../js/reformer.js';

const d = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

test('los ids de pose son únicos y los campos obligatorios existen', () => {
  assert.equal(POSE_BY_ID.size, POSES.length);
  for (const p of POSES) {
    assert.ok(p.name && p.es && p.group && p.orientation, p.id);
    assert.ok(LEVELS[p.level], `${p.id}: nivel inválido`);
    assert.ok(p.seconds >= 5 && p.seconds <= 600, `${p.id}: duración`);
    assert.ok(p.cues.length >= 2, `${p.id}: faltan indicaciones`);
    assert.ok(p.cues.every((c) => c.length <= 40), `${p.id}: indicación demasiado larga para el reloj`);
  }
});

test('la cinemática conserva el largo de cada segmento', () => {
  for (const p of POSES) {
    const j = solve(p);
    for (const arm of [j.arms.near, j.arms.far]) {
      assert.ok(Math.abs(d(arm[0], arm[1]) - BODY.upperArm) < 1e-6, `${p.id}: brazo`);
      assert.ok(Math.abs(d(arm[1], arm[2]) - BODY.forearm) < 1e-6, `${p.id}: antebrazo`);
    }
    for (const leg of [j.legs.near, j.legs.far]) {
      assert.ok(Math.abs(d(leg[0], leg[1]) - BODY.thigh) < 1e-6, `${p.id}: muslo`);
      assert.ok(Math.abs(d(leg[1], leg[2]) - BODY.shin) < 1e-6, `${p.id}: pierna`);
    }
  }
});

test('toda mano/pie con objetivo (IK) llega a la máquina', () => {
  for (const p of POSES) {
    const { issues } = solve(p);
    assert.deepEqual(issues, [], `${p.id}: ${issues.join('; ')}`);
  }
});

test('IK: dos segmentos alcanzan exactamente un objetivo alcanzable', () => {
  const root = { x: 0, y: 0 };
  for (const bend of [1, -1]) {
    const sol = ik(root, { x: 30, y: 20 }, 27, 25, bend);
    assert.equal(sol.reachable, true);
    const mid = { x: 27 * Math.cos((sol.a1 * Math.PI) / 180), y: 27 * Math.sin((sol.a1 * Math.PI) / 180) };
    const end = { x: mid.x + 25 * Math.cos((sol.a2 * Math.PI) / 180), y: mid.y + 25 * Math.sin((sol.a2 * Math.PI) / 180) };
    assert.ok(d(end, { x: 30, y: 20 }) < 1e-6);
  }
  assert.equal(ik(root, { x: 100, y: 0 }, 27, 25).reachable, false);
});

test('ningún cuerpo atraviesa el piso', () => {
  for (const p of POSES) {
    const j = solve(p);
    const pts = [j.hip, j.shoulder, ...j.arms.near, ...j.arms.far, ...j.legs.near, ...j.legs.far];
    for (const pt of pts) assert.ok(pt.y < R.floor, `${p.id}: punto bajo el piso (${pt.y.toFixed(1)})`);
  }
});

test('el carro queda sobre los rieles', () => {
  for (const p of POSES) {
    const x = p.setup?.carriage ?? R.carriage.home;
    assert.ok(x >= R.rail.x0 + 20 && x + R.carriage.width <= R.springAnchor.x, `${p.id}: carro fuera de rango`);
  }
});

test('la escena produce trazos SVG válidos y una caja no vacía', () => {
  for (const p of POSES) {
    const { segments, bbox } = scene(p);
    assert.ok(segments.length > 10);
    assert.ok(bbox.w > 50 && bbox.h > 50);
    for (const s of segments) assert.match(s.d, /^M[-\d.]+ [-\d.]+/, `${p.id}: path inválido`);
    for (const s of segments) assert.doesNotMatch(s.d, /NaN|Infinity/, `${p.id}: coordenada inválida`);
  }
});
