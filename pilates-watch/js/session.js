// Máquina de estados de la sesión, pura (sin DOM) para poder testearla.
// Usa tiempo de pared absoluto: cada fase termina en `endsAt` y la siguiente
// se encadena desde ahí (no desde "ahora"), así no hay deriva acumulada aunque
// el navegador frene los timers en segundo plano.

/**
 * @param {{items: {poseId: string, seconds: number}[]}} routine
 * @param {{prep?: number, transition?: number}} opts
 */
export function buildPhases(routine, { prep = 5, transition = 8 } = {}) {
  const phases = [];
  const items = routine.items;
  if (!items.length) return phases;
  if (prep > 0) phases.push({ kind: 'prep', poseId: items[0].poseId, item: 0, duration: prep });
  items.forEach((it, i) => {
    phases.push({ kind: 'pose', poseId: it.poseId, item: i, duration: it.seconds });
    if (transition > 0 && i < items.length - 1) {
      phases.push({ kind: 'transition', poseId: items[i + 1].poseId, item: i + 1, duration: transition });
    }
  });
  return phases;
}

export const totalSeconds = (phases) => phases.reduce((s, p) => s + p.duration, 0);

export function start(phases, now) {
  if (!phases.length) return { phases, index: 0, status: 'done', endsAt: now, remainingMs: 0 };
  return { phases, index: 0, status: 'running', endsAt: now + phases[0].duration * 1000, remainingMs: null };
}

/**
 * Avanza el estado hasta `now`. Devuelve las fases en las que se entró
 * (puede ser más de una si el dispositivo estuvo dormido).
 */
export function tick(state, now) {
  if (state.status !== 'running') return { state, entered: [] };
  let { index, endsAt } = state;
  const entered = [];
  while (now >= endsAt) {
    index += 1;
    if (index >= state.phases.length) {
      return { state: { ...state, index: state.phases.length - 1, status: 'done', endsAt }, entered };
    }
    entered.push(index);
    endsAt += state.phases[index].duration * 1000;
  }
  return { state: { ...state, index, endsAt }, entered };
}

export function remainingMs(state, now) {
  if (state.status === 'paused') return state.remainingMs;
  if (state.status === 'done') return 0;
  return Math.max(0, state.endsAt - now);
}

export function pause(state, now) {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', remainingMs: Math.max(0, state.endsAt - now) };
}

export function resume(state, now) {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'running', endsAt: now + state.remainingMs, remainingMs: null };
}

/** Va a la fase `index` con su tiempo completo (respeta la pausa). */
export function goTo(state, index, now) {
  const ms = state.phases[index].duration * 1000;
  const next = state.status === 'paused'
    ? { ...state, index, remainingMs: ms }
    : { ...state, index, status: 'running', endsAt: now + ms, remainingMs: null };
  return { state: next, entered: [index] };
}

/** Como una diapositiva: salta directo al próximo ejercicio (omite transiciones). */
export function next(state, now) {
  if (state.status === 'done') return { state, entered: [] };
  const i = state.phases.findIndex((p, k) => k > state.index && p.kind === 'pose');
  if (i < 0) return { state: { ...state, status: 'done' }, entered: [] };
  return goTo(state, i, now);
}

/**
 * Como "anterior" en un reproductor: si el ejercicio actual lleva más de
 * `restartAfterMs`, lo reinicia; si no, vuelve al ejercicio anterior.
 */
export function prev(state, now, restartAfterMs = 3000) {
  if (state.status === 'done') return { state, entered: [] };
  const cur = state.phases[state.index];
  const elapsed = cur.duration * 1000 - remainingMs(state, now);
  if (cur.kind === 'pose' && elapsed > restartAfterMs) return goTo(state, state.index, now);
  let i = -1;
  for (let k = state.index - 1; k >= 0; k--) {
    if (state.phases[k].kind === 'pose') { i = k; break; }
  }
  return goTo(state, i < 0 ? state.index : i, now);
}

/** Texto corto pensado para la pantalla chica del reloj. */
export function notificationFor(phases, index, poseLookup) {
  const phase = phases[index];
  const pose = poseLookup(phase.poseId);
  const poseCount = phases.filter((p) => p.kind === 'pose').length;
  const n = phase.item + 1;
  if (phase.kind === 'pose') {
    return {
      title: `${n}/${poseCount} ${pose.name} · ${phase.duration}s`,
      body: pose.cues.slice(0, 2).join('. '),
    };
  }
  const label = phase.kind === 'prep' ? 'Preparate' : 'Siguiente';
  return { title: `${label}: ${pose.name}`, body: `${pose.es} en ${phase.duration}s` };
}

export function formatClock(ms) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
