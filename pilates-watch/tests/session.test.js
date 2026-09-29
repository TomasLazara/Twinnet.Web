import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../js/session.js';
import { getPose } from '../js/poses.js';

const routine = { items: [{ poseId: 'hundred', seconds: 60 }, { poseId: 'elephant', seconds: 45 }, { poseId: 'mermaid', seconds: 30 }] };

test('buildPhases intercala preparación y transiciones', () => {
  const phases = S.buildPhases(routine, { prep: 5, transition: 8 });
  assert.deepEqual(phases.map((p) => p.kind), ['prep', 'pose', 'transition', 'pose', 'transition', 'pose']);
  assert.equal(S.totalSeconds(phases), 5 + 60 + 8 + 45 + 8 + 30);
  assert.deepEqual(S.buildPhases(routine, { prep: 0, transition: 0 }).map((p) => p.kind), ['pose', 'pose', 'pose']);
  assert.deepEqual(S.buildPhases({ items: [] }), []);
});

test('tick avanza por tiempo de pared sin deriva', () => {
  const phases = S.buildPhases(routine, { prep: 5, transition: 8 });
  let st = S.start(phases, 0);
  let r = S.tick(st, 4_999);
  assert.deepEqual(r.entered, []);
  r = S.tick(r.state, 5_000);
  assert.deepEqual(r.entered, [1]);
  // La fase 1 termina en 65 000 aunque el tick haya llegado tarde.
  assert.equal(r.state.endsAt, 65_000);
  st = r.state;
  r = S.tick(st, 65_000 + 8_000 + 1);
  assert.deepEqual(r.entered, [2, 3], 'si el teléfono durmió, se reportan todas las fases salteadas');
  assert.equal(S.remainingMs(r.state, 73_001), 44_999);
});

test('la sesión termina después de la última fase', () => {
  const phases = S.buildPhases(routine, { prep: 0, transition: 0 });
  const r = S.tick(S.start(phases, 0), 1_000_000);
  assert.equal(r.state.status, 'done');
  assert.equal(S.remainingMs(r.state, 1_000_000), 0);
});

test('pausa y reanudación conservan el tiempo restante', () => {
  const phases = S.buildPhases(routine, { prep: 0, transition: 0 });
  let st = S.start(phases, 0);
  st = S.pause(st, 20_000);
  assert.equal(S.remainingMs(st, 999_999), 40_000);
  assert.deepEqual(S.tick(st, 999_999).entered, [], 'en pausa no avanza');
  st = S.resume(st, 100_000);
  assert.equal(st.endsAt, 140_000);
});

test('saltar avanza una fase, también en pausa', () => {
  const phases = S.buildPhases(routine, { prep: 0, transition: 0 });
  let st = S.start(phases, 0);
  let r = S.skip(st, 10_000);
  assert.deepEqual(r.entered, [1]);
  assert.equal(r.state.endsAt, 55_000);
  st = S.pause(r.state, 20_000);
  r = S.skip(st, 20_000);
  assert.equal(r.state.index, 2);
  assert.equal(S.remainingMs(r.state, 0), 30_000);
  r = S.skip(r.state, 30_000);
  assert.equal(r.state.status, 'done');
});

test('las notificaciones son cortas para la pantalla del reloj', () => {
  const phases = S.buildPhases(routine, { prep: 5, transition: 8 });
  phases.forEach((_, i) => {
    const n = S.notificationFor(phases, i, getPose);
    assert.ok(n.title.length <= 48, n.title);
    assert.ok(n.body.length <= 90, n.body);
  });
  assert.equal(S.notificationFor(phases, 1, getPose).title, '1/3 Hundred · 60s');
  assert.equal(S.notificationFor(phases, 2, getPose).title, 'Siguiente: Elephant');
});

test('formatClock redondea hacia arriba', () => {
  assert.equal(S.formatClock(59_001), '1:00');
  assert.equal(S.formatClock(9_000), '0:09');
  assert.equal(S.formatClock(0), '0:00');
});
