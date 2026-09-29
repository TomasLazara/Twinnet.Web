import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUTINES, sanitizeRoutine, clampSeconds, loadCustomRoutine, saveCustomRoutine } from '../js/routines.js';
import { POSE_BY_ID } from '../js/poses.js';

test('las rutinas predefinidas sólo usan poses existentes', () => {
  for (const r of ROUTINES) {
    assert.ok(r.items.length > 0, r.id);
    for (const it of r.items) assert.ok(POSE_BY_ID.has(it.poseId), `${r.id}: ${it.poseId}`);
  }
});

test('sanitizeRoutine descarta basura y acota duraciones', () => {
  const r = sanitizeRoutine({ items: [{ poseId: 'hundred', seconds: 9999 }, { poseId: 'nope', seconds: 30 }, null, { poseId: 'elephant', seconds: 'x' }] });
  assert.deepEqual(r.items, [{ poseId: 'hundred', seconds: 600 }, { poseId: 'elephant', seconds: 30 }]);
  assert.deepEqual(sanitizeRoutine('{"__proto__":1}').items, []);
  assert.equal(clampSeconds(1), 5);
});

test('persistencia tolera almacenamiento roto o ausente', () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.equal(saveCustomRoutine({ items: [{ poseId: 'mermaid', seconds: 40 }] }, storage), true);
  assert.deepEqual(loadCustomRoutine(storage).items, [{ poseId: 'mermaid', seconds: 40 }]);
  const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
  assert.deepEqual(loadCustomRoutine(broken).items, []);
  assert.equal(saveCustomRoutine({ items: [] }, broken), false);
  mem.set('pilates-reformer:custom-routine', '{no json');
  assert.deepEqual(loadCustomRoutine(storage).items, []);
});
