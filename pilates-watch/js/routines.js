import { POSE_BY_ID } from './poses.js';

const seq = (...pairs) => pairs.map(([poseId, seconds]) => ({ poseId, seconds }));

export const ROUTINES = [
  {
    id: 'basic',
    name: 'Básico clásico',
    description: 'El orden básico del Reformer clásico.',
    items: seq(
      ['footwork-toes', 60], ['footwork-heels', 60], ['footwork-tendon', 45], ['hundred', 60],
      ['frog', 60], ['leg-circles', 60], ['stomach-massage-round', 45], ['short-box-round', 45],
      ['short-box-flat', 45], ['elephant', 45], ['knee-stretch-round', 40], ['running', 45], ['pelvic-lift', 45],
    ),
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    description: 'Suma rowing, long box, long stretch y trabajo de rodillas.',
    items: seq(
      ['footwork-toes', 45], ['footwork-heels', 45], ['footwork-tendon', 45], ['hundred', 60], ['coordination', 45],
      ['rowing-back', 45], ['rowing-front', 45], ['swan-box', 40], ['pull-straps', 45], ['backstroke', 45],
      ['long-stretch', 40], ['down-stretch', 40], ['up-stretch', 40], ['elephant', 40],
      ['stomach-massage-round', 40], ['stomach-massage-hands-back', 40], ['stomach-massage-reach', 40],
      ['short-box-round', 40], ['short-box-flat', 40], ['short-box-twist', 45], ['short-spine', 45],
      ['chest-expansion', 40], ['thigh-stretch', 40], ['arm-circles', 40], ['mermaid', 45],
      ['knee-stretch-round', 40], ['knee-stretch-arched', 40], ['running', 45], ['pelvic-lift', 45], ['side-splits', 40],
    ),
  },
  {
    id: 'express',
    name: 'Express 6 min',
    description: 'Pies, core, elefante y sirena.',
    items: seq(['footwork-toes', 45], ['hundred', 60], ['elephant', 40], ['knee-stretch-round', 40], ['mermaid', 40], ['running', 40]),
  },
  {
    id: 'long-box',
    name: 'Serie Long Box',
    description: 'Extensión y correas sobre la caja larga.',
    items: seq(['swan-box', 40], ['pull-straps', 45], ['backstroke', 45], ['teaser-box', 30], ['breaststroke', 40]),
  },
];

const STORAGE_KEY = 'pilates-reformer:custom-routine';

export function clampSeconds(n) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(600, Math.max(5, v)) : 30;
}

/** Valida y normaliza una rutina (descarta poses desconocidas y duraciones inválidas). */
export function sanitizeRoutine(raw) {
  const items = Array.isArray(raw?.items)
    ? raw.items
        .filter((it) => it && POSE_BY_ID.has(it.poseId))
        .map((it) => ({ poseId: it.poseId, seconds: clampSeconds(it.seconds) }))
    : [];
  return { id: 'custom', name: 'Mi rutina', description: 'Armada por vos.', items };
}

export function loadCustomRoutine(storage = globalThis.localStorage) {
  try {
    return sanitizeRoutine(JSON.parse(storage.getItem(STORAGE_KEY)));
  } catch {
    return sanitizeRoutine(null);
  }
}

export function saveCustomRoutine(routine, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ items: routine.items }));
    return true;
  } catch {
    return false;
  }
}
