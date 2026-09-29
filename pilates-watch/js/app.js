import { POSES, GROUPS, LEVELS, getPose } from './poses.js';
import { toSVG } from './scene.js';
import { ROUTINES, loadCustomRoutine, saveCustomRoutine, clampSeconds } from './routines.js';
import * as S from './session.js';
import * as D from './device.js';
import { SCREEN_PRESETS, THEMES, renderWatchFace, fileName, canvasToBlob } from './watchface.js';

// ---------- utilidades DOM (todo texto de usuario va por textContent) ----------

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v; // sólo SVG generado desde datos propios
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const view = document.getElementById('view');
const dialog = document.getElementById('pose-dialog');

const store = {
  get(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(`pilates-reformer:${key}`));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`pilates-reformer:${key}`, JSON.stringify(value));
    } catch {
      /* modo privado: sólo memoria */
    }
  },
};

const settings = {
  prep: 5,
  transition: 8,
  notifications: true,
  voice: false,
  vibrate: true,
  ...store.get('settings', {}),
};
const saveSettings = () => store.set('settings', settings);

let custom = loadCustomRoutine();
const allRoutines = () => [...ROUTINES, custom];
const findRoutine = (id) => allRoutines().find((r) => r.id === id);

const fmtDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m} min${s ? ` ${s} s` : ''}` : `${s} s`;
};

const levelBadge = (level) => h('span', { class: `badge lvl-${level}` }, LEVELS[level]);

// ---------- router ----------

const routes = {
  poses: renderPoses,
  rutinas: renderRoutines,
  sesion: renderSession,
  esferas: renderWatchFaces,
  reloj: renderWatchGuide,
};

function currentRoute() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { name: routes[path] ? path : 'poses', params: new URLSearchParams(query) };
}

function render() {
  const { name, params } = currentRoute();
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.toggleAttribute('aria-current', a.getAttribute('href') === `#/${name}`);
  });
  if (name !== 'sesion') stopSessionView();
  view.replaceChildren();
  routes[name](params);
  view.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);

// ---------- Poses ----------

const poseFilter = { level: 'all', q: '' };

function renderPoses() {
  const search = h('input', {
    type: 'search', placeholder: 'Buscar ejercicio…', value: poseFilter.q, 'aria-label': 'Buscar ejercicio',
    oninput: (e) => { poseFilter.q = e.target.value; drawList(); },
  });
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Nivel' },
    [['all', 'Todos'], ...Object.entries(LEVELS)].map(([id, label]) =>
      h('button', {
        class: 'chip', 'aria-pressed': String(poseFilter.level === id),
        onclick: (e) => {
          poseFilter.level = id;
          e.currentTarget.parentElement.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
          e.currentTarget.setAttribute('aria-pressed', 'true');
          drawList();
        },
      }, label)),
  );
  const list = h('div');
  view.append(
    h('section', { class: 'intro' },
      h('h2', {}, 'Repertorio Reformer'),
      h('p', { class: 'muted' }, `${POSES.length} ejercicios del orden clásico. Tocá uno para ver indicaciones, sumarlo a tu rutina o generar la esfera.`),
      search, chips),
    list,
  );

  function drawList() {
    const q = poseFilter.q.trim().toLowerCase();
    const match = (p) =>
      (poseFilter.level === 'all' || p.level === poseFilter.level) &&
      (!q || `${p.name} ${p.es} ${p.group}`.toLowerCase().includes(q));
    list.replaceChildren(
      ...GROUPS.map((g) => {
        const items = POSES.filter((p) => p.group === g && match(p));
        if (!items.length) return null;
        return h('section', { class: 'group' },
          h('h3', {}, g),
          h('div', { class: 'grid' }, items.map(poseCard)));
      }).filter(Boolean),
    );
    if (!list.children.length) list.append(h('p', { class: 'muted empty' }, 'Sin resultados.'));
  }
  drawList();
}

function poseCard(p) {
  return h('button', { class: 'card pose-card', onclick: () => openPose(p.id) },
    h('div', { class: 'art', html: toSVG(p) }),
    h('span', { class: 'name' }, p.name),
    h('span', { class: 'sub' }, p.es),
    h('span', { class: 'meta' }, levelBadge(p.level), p.review ? h('span', { class: 'badge warn', title: 'Ilustración aproximada: validar con instructor/a' }, '⚠ revisar') : null),
  );
}

function openPose(id) {
  const p = getPose(id);
  const secs = h('input', { type: 'number', min: 5, max: 600, step: 5, value: p.seconds, 'aria-label': 'Segundos', class: 'secs' });
  dialog.replaceChildren(
    h('form', { method: 'dialog', class: 'pose-detail' },
      h('div', { class: 'art big', html: toSVG(p) }),
      h('h2', {}, p.name),
      h('p', { class: 'sub' }, p.es, ' · ', p.group),
      h('p', {}, levelBadge(p.level), ' ', h('span', { class: 'muted' }, p.orientation)),
      p.review ? h('p', { class: 'warn-text' }, '⚠ Ilustración aproximada de un ejercicio avanzado. Validá la forma con tu instructor/a.') : null,
      h('ul', { class: 'cues' }, p.cues.map((c) => h('li', {}, c))),
      h('div', { class: 'row' },
        h('label', {}, 'Duración ', secs, ' s'),
        h('button', {
          type: 'button', class: 'btn',
          onclick: () => {
            custom.items.push({ poseId: p.id, seconds: clampSeconds(secs.value) });
            saveCustomRoutine(custom);
            toast(`${p.name} agregado a Mi rutina`);
          },
        }, '+ Mi rutina'),
        h('a', { class: 'btn ghost', href: `#/esferas?pose=${encodeURIComponent(p.id)}`, onclick: () => dialog.close() }, 'Crear esfera'),
      ),
      h('button', { class: 'btn ghost close', value: 'close' }, 'Cerrar'),
    ),
  );
  dialog.showModal();
}

// ---------- Rutinas ----------

function routinePhases(r) {
  return S.buildPhases(r, { prep: settings.prep, transition: settings.transition });
}

function renderRoutines() {
  view.append(h('h2', {}, 'Rutinas'));
  for (const r of ROUTINES) view.append(routineCard(r));
  view.append(customEditor(), settingsPanel());
}

function routineCard(r) {
  const total = S.totalSeconds(routinePhases(r));
  return h('article', { class: 'card routine' },
    h('div', { class: 'thumbs' }, r.items.slice(0, 4).map((it) => h('div', { class: 'art mini', html: toSVG(getPose(it.poseId)) }))),
    h('h3', {}, r.name),
    h('p', { class: 'muted' }, r.description),
    h('p', { class: 'meta' }, `${r.items.length} ejercicios · ${fmtDuration(total)}`),
    h('div', { class: 'row' },
      h('button', { class: 'btn', disabled: !r.items.length, onclick: () => startSession(r.id) }, '▶ Empezar'),
      h('a', { class: 'btn ghost', href: `#/esferas?routine=${r.id}` }, 'Esferas'),
    ),
  );
}

function customEditor() {
  const wrap = h('article', { class: 'card routine custom' });
  const draw = () => {
    const total = S.totalSeconds(routinePhases(custom));
    const add = h('select', { 'aria-label': 'Agregar ejercicio' },
      h('option', { value: '' }, '+ Agregar ejercicio…'),
      GROUPS.map((g) => h('optgroup', { label: g },
        POSES.filter((p) => p.group === g).map((p) => h('option', { value: p.id }, p.name)))));
    add.addEventListener('change', () => {
      if (!add.value) return;
      custom.items.push({ poseId: add.value, seconds: getPose(add.value).seconds });
      commit();
    });
    wrap.replaceChildren(
      h('h3', {}, 'Mi rutina'),
      h('p', { class: 'meta' }, custom.items.length ? `${custom.items.length} ejercicios · ${fmtDuration(total)}` : 'Vacía: agregá ejercicios desde acá o desde la biblioteca.'),
      h('ol', { class: 'editor' }, custom.items.map((it, i) => {
        const p = getPose(it.poseId);
        return h('li', {},
          h('div', { class: 'art tiny', html: toSVG(p) }),
          h('span', { class: 'name' }, p.name),
          h('input', {
            type: 'number', min: 5, max: 600, step: 5, value: it.seconds, class: 'secs', 'aria-label': `Segundos de ${p.name}`,
            onchange: (e) => { it.seconds = clampSeconds(e.target.value); commit(); },
          }),
          h('button', { class: 'icon', 'aria-label': 'Subir', disabled: i === 0, onclick: () => move(i, -1) }, '↑'),
          h('button', { class: 'icon', 'aria-label': 'Bajar', disabled: i === custom.items.length - 1, onclick: () => move(i, 1) }, '↓'),
          h('button', { class: 'icon', 'aria-label': 'Quitar', onclick: () => { custom.items.splice(i, 1); commit(); } }, '✕'),
        );
      })),
      add,
      h('div', { class: 'row' },
        h('button', { class: 'btn', disabled: !custom.items.length, onclick: () => startSession('custom') }, '▶ Empezar'),
        h('a', { class: 'btn ghost', href: '#/esferas?routine=custom' }, 'Esferas'),
        h('button', { class: 'btn ghost', disabled: !custom.items.length, onclick: () => { if (confirm('¿Vaciar Mi rutina?')) { custom.items = []; commit(); } } }, 'Vaciar'),
      ),
    );
  };
  const move = (i, d) => {
    const [it] = custom.items.splice(i, 1);
    custom.items.splice(i + d, 0, it);
    commit();
  };
  const commit = () => { saveCustomRoutine(custom); draw(); };
  draw();
  return wrap;
}

function settingsPanel() {
  const num = (key, label) => h('label', {}, label, ' ',
    h('input', {
      type: 'number', min: 0, max: 60, value: settings[key], class: 'secs',
      onchange: (e) => { settings[key] = Math.max(0, Math.min(60, Math.round(+e.target.value || 0))); saveSettings(); },
    }), ' s');
  const check = (key, label, onOn) => h('label', { class: 'check' },
    h('input', {
      type: 'checkbox', checked: settings[key],
      onchange: async (e) => { settings[key] = e.target.checked; saveSettings(); if (e.target.checked && onOn) await onOn(); },
    }), ' ', label);
  const perm = h('span', { class: 'muted' });
  const refreshPerm = () => {
    const p = D.notificationPermission();
    perm.textContent = { granted: 'permiso otorgado', denied: 'permiso bloqueado en el navegador', default: 'falta dar permiso', unsupported: 'no soportado en este navegador' }[p];
  };
  refreshPerm();
  return h('article', { class: 'card settings' },
    h('h3', {}, 'Ajustes de sesión'),
    h('div', { class: 'row' }, num('prep', 'Preparación'), num('transition', 'Transición')),
    check('notifications', 'Notificaciones al reloj', async () => { await D.requestNotifications(); refreshPerm(); }),
    h('p', {}, perm),
    check('vibrate', 'Vibrar el teléfono'),
    check('voice', 'Anunciar por voz'),
    h('button', {
      class: 'btn ghost',
      onclick: async () => {
        await D.requestNotifications();
        refreshPerm();
        const ok = await D.notify({ title: 'Prueba: Hundred · 60s', body: 'Si ves esto en el reloj, está todo listo.' });
        toast(ok ? 'Notificación enviada: mirá el reloj' : 'No se pudo notificar (revisá permisos)');
      },
    }, 'Probar notificación'),
  );
}

// ---------- Sesión ----------

let session = null; // { routine, state }
let loop = null;
const screenLock = new D.ScreenLock();

async function startSession(routineId) {
  const routine = findRoutine(routineId);
  if (!routine?.items.length) return;
  if (settings.notifications) await D.requestNotifications();
  const phases = routinePhases(routine);
  session = { routine, state: S.start(phases, Date.now()) };
  await screenLock.enable();
  announce(0);
  location.hash = '#/sesion';
}

function announce(index) {
  const { phases } = session.state;
  const msg = S.notificationFor(phases, index, getPose);
  if (settings.notifications) D.notify(msg);
  if (settings.vibrate) D.vibrate(phases[index].kind === 'pose' ? [300, 120, 300] : [120]);
  if (settings.voice) D.speak(msg.title.replace(/·/g, ','));
}

function stopSessionView() {
  clearInterval(loop);
  loop = null;
}

function endSession() {
  session = null;
  screenLock.disable();
  stopSessionView();
  render();
}

function renderSession() {
  if (!session) {
    view.append(h('section', { class: 'intro' },
      h('h2', {}, 'Sesión'),
      h('p', { class: 'muted' }, 'No hay una sesión en curso.'),
      h('a', { class: 'btn', href: '#/rutinas' }, 'Elegir rutina')));
    return;
  }
  const art = h('div', { class: 'art session-art' });
  const label = h('p', { class: 'phase' });
  const name = h('h2', { class: 'pose-name' });
  const sub = h('p', { class: 'sub' });
  const clock = h('p', { class: 'countdown', 'aria-live': 'off' });
  const bar = h('progress', { max: 1, value: 0 });
  const cues = h('ul', { class: 'cues' });
  const next = h('p', { class: 'muted' });
  const status = h('p', { class: 'muted small' });
  const pauseBtn = h('button', { class: 'btn', onclick: () => {
    const now = Date.now();
    session.state = session.state.status === 'paused' ? S.resume(session.state, now) : S.pause(session.state, now);
    update();
  } });
  view.append(h('section', { class: 'session' },
    label, art, name, sub, clock, bar, cues, next,
    h('div', { class: 'row center' },
      pauseBtn,
      h('button', { class: 'btn ghost', onclick: () => {
        const r = S.skip(session.state, Date.now());
        session.state = r.state;
        r.entered.forEach(announce);
        update();
      } }, 'Saltar ⏭'),
      h('button', { class: 'btn ghost', onclick: () => { if (confirm('¿Terminar la sesión?')) endSession(); } }, 'Terminar'),
    ),
    status));

  let shownIndex = -1;
  function update() {
    if (!session) return;
    const now = Date.now();
    const r = S.tick(session.state, now);
    session.state = r.state;
    // Si el teléfono estuvo dormido y se saltearon fases, avisar sólo la actual.
    if (r.entered.length) announce(r.entered.at(-1));
    const st = session.state;
    if (st.status === 'done') {
      view.replaceChildren(h('section', { class: 'intro' },
        h('h2', {}, '¡Sesión completa! 🎉'),
        h('p', { class: 'muted' }, `${session.routine.name} · ${fmtDuration(S.totalSeconds(st.phases))}`),
        h('a', { class: 'btn', href: '#/rutinas' }, 'Volver a rutinas')));
      if (settings.notifications) D.notify({ title: 'Sesión completa', body: session.routine.name });
      session = null;
      screenLock.disable();
      stopSessionView();
      return;
    }
    const phase = st.phases[st.index];
    const pose = getPose(phase.poseId);
    const poseCount = st.phases.filter((p) => p.kind === 'pose').length;
    if (shownIndex !== st.index) {
      shownIndex = st.index;
      art.innerHTML = toSVG(pose);
      name.textContent = pose.name;
      sub.textContent = `${pose.es} · ${pose.orientation}`;
      cues.replaceChildren(...pose.cues.map((c) => h('li', {}, c)));
      label.textContent = phase.kind === 'pose' ? `Ejercicio ${phase.item + 1} de ${poseCount}` : phase.kind === 'prep' ? 'Preparate' : 'Siguiente';
      label.dataset.kind = phase.kind;
      const upcoming = st.phases.find((p) => p.kind === 'pose' && p.item > phase.item);
      next.textContent = upcoming ? `Después: ${getPose(upcoming.poseId).name}` : 'Último ejercicio';
    }
    const left = S.remainingMs(st, now);
    clock.textContent = S.formatClock(left);
    bar.value = 1 - left / (phase.duration * 1000);
    pauseBtn.textContent = st.status === 'paused' ? '▶ Seguir' : '⏸ Pausa';
    status.textContent = [
      screenLock.active ? 'Pantalla activa' : 'Dejá la pantalla encendida',
      settings.notifications ? `Notificaciones: ${D.notificationPermission() === 'granted' ? 'sí' : 'sin permiso'}` : 'Notificaciones: no',
    ].join(' · ');
  }
  update();
  loop = setInterval(update, 250);
}


// ---------- Esferas ----------

const faceOpts = {
  preset: '368x448',
  w: 368,
  h: 448,
  round: false,
  clock: 'top',
  theme: 'mint',
  showText: true,
  crop: 'figure',
  ...store.get('face', {}),
};

function renderWatchFaces(params) {
  const poseParam = params.get('pose');
  const routineParam = params.get('routine');
  const source = h('select', { 'aria-label': 'Qué generar' },
    h('option', { value: 'all' }, `Todas las poses (${POSES.length})`),
    allRoutines().map((r) => h('option', { value: `routine:${r.id}` }, `Rutina: ${r.name} (${r.items.length})`)),
    h('optgroup', { label: 'Una pose' }, POSES.map((p) => h('option', { value: `pose:${p.id}` }, p.name))),
  );
  source.value = poseParam ? `pose:${poseParam}` : routineParam ? `routine:${routineParam}` : `pose:${POSES[0].id}`;

  const preset = h('select', { 'aria-label': 'Pantalla' },
    SCREEN_PRESETS.map((s) => h('option', { value: s.id }, s.label)),
    h('option', { value: 'custom' }, 'Personalizada…'));
  preset.value = faceOpts.preset;
  const cw = h('input', { type: 'number', min: 120, max: 1024, value: faceOpts.w, class: 'secs', 'aria-label': 'Ancho' });
  const ch = h('input', { type: 'number', min: 120, max: 1024, value: faceOpts.h, class: 'secs', 'aria-label': 'Alto' });
  const cround = h('input', { type: 'checkbox', checked: faceOpts.round });
  const customRow = h('div', { class: 'row' }, 'Ancho ', cw, ' Alto ', ch, h('label', { class: 'check' }, cround, ' Redonda'));

  const clock = h('select', { 'aria-label': 'Espacio para la hora' },
    h('option', { value: 'top' }, 'Hora arriba'),
    h('option', { value: 'bottom' }, 'Hora abajo'),
    h('option', { value: 'none' }, 'Sin espacio para la hora'));
  clock.value = faceOpts.clock;
  const theme = h('select', { 'aria-label': 'Color' },
    Object.entries(THEMES).map(([id, t]) => h('option', { value: id }, t.label)));
  theme.value = faceOpts.theme;
  const showText = h('input', { type: 'checkbox', checked: faceOpts.showText });
  const crop = h('select', { 'aria-label': 'Encuadre' },
    h('option', { value: 'figure' }, 'Zoom a la figura'),
    h('option', { value: 'full' }, 'Reformer completo'));
  crop.value = faceOpts.crop;

  const previews = h('div', { class: 'faces' });
  const actions = h('div', { class: 'row' });

  const selectedPoses = () => {
    const v = source.value;
    if (v === 'all') return POSES;
    if (v.startsWith('pose:')) return [getPose(v.slice(5))];
    const r = findRoutine(v.slice(8));
    return [...new Map((r?.items ?? []).map((it) => [it.poseId, getPose(it.poseId)])).values()];
  };

  const readOpts = () => {
    const p = SCREEN_PRESETS.find((s) => s.id === preset.value);
    Object.assign(faceOpts, {
      preset: preset.value,
      w: p ? p.w : Math.max(120, Math.min(1024, +cw.value || 240)),
      h: p ? p.h : Math.max(120, Math.min(1024, +ch.value || 280)),
      round: p ? p.round : cround.checked,
      clock: clock.value,
      theme: theme.value,
      showText: showText.checked,
      crop: crop.value,
    });
    store.set('face', faceOpts);
    customRow.hidden = Boolean(p);
  };

  const draw = () => {
    readOpts();
    const poses = selectedPoses();
    previews.replaceChildren(...poses.map((pose) => {
      const canvas = h('canvas', { class: faceOpts.round ? 'round' : '', 'aria-label': `Esfera ${pose.name}` });
      renderWatchFace(canvas, pose, faceOpts);
      return h('figure', { class: 'face' },
        canvas,
        h('figcaption', {}, h('button', { class: 'btn small ghost', onclick: () => download(canvas, pose) }, '⬇ PNG')));
    }));
    actions.replaceChildren(
      h('span', { class: 'muted' }, `${poses.length} esfera${poses.length === 1 ? '' : 's'} · ${faceOpts.w}×${faceOpts.h}`),
      poses.length > 1 && D.support.share
        ? h('button', { class: 'btn', onclick: () => shareAll(previews, poses) }, 'Guardar en galería')
        : null,
      poses.length > 1 ? h('button', { class: 'btn ghost', onclick: () => downloadAll(previews, poses) }, 'Descargar todas') : null,
    );
  };

  for (const el of [source, preset, cw, ch, cround, clock, theme, showText, crop]) el.addEventListener('change', draw);

  view.append(
    h('section', { class: 'intro' },
      h('h2', {}, 'Esferas para el reloj'),
      h('p', { class: 'muted' }, 'Fondo negro (ahorra batería en AMOLED) al tamaño exacto de la pantalla. Cargalas como esfera personalizada desde la app del reloj.')),
    h('div', { class: 'card controls' },
      h('label', {}, 'Qué generar ', source),
      h('label', {}, 'Pantalla ', preset),
      customRow,
      h('div', { class: 'row' }, h('label', {}, 'Hora ', clock), h('label', {}, 'Encuadre ', crop)),
      h('div', { class: 'row' }, h('label', {}, 'Color ', theme), h('label', { class: 'check' }, showText, ' Nombre')),
    ),
    actions,
    previews,
  );
  draw();
}

async function download(canvas, pose) {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: fileName(pose, faceOpts) });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function downloadAll(previews, poses) {
  const canvases = previews.querySelectorAll('canvas');
  for (let i = 0; i < poses.length; i++) {
    await download(canvases[i], poses[i]);
    await new Promise((r) => setTimeout(r, 250)); // los navegadores limitan descargas en ráfaga
  }
}

async function shareAll(previews, poses) {
  const canvases = previews.querySelectorAll('canvas');
  const files = await Promise.all(poses.map(async (p, i) =>
    new File([await canvasToBlob(canvases[i])], fileName(p, faceOpts), { type: 'image/png' })));
  if (!navigator.canShare({ files })) {
    toast('Este navegador no permite compartir tantas imágenes: usá "Descargar todas".');
    return;
  }
  try {
    await navigator.share({ files, title: 'Esferas Reformer' });
  } catch {
    /* cancelado por el usuario */
  }
}

// ---------- Guía del reloj ----------

function renderWatchGuide() {
  const steps = (items) => h('ol', { class: 'steps' }, items.map((t) => h('li', {}, t)));
  view.append(
    h('h2', {}, 'Configurar el reloj'),
    h('article', { class: 'card' },
      h('h3', {}, 'Qué se puede y qué no'),
      h('p', {}, 'Los Gadnic (y la mayoría de los relojes que usan FitCloudPro) tienen firmware cerrado: no instalan apps de terceros. Por eso esta app usa los dos canales que sí existen:'),
      h('ul', {},
        h('li', {}, h('strong', {}, 'Notificaciones: '), 'el celular publica una notificación por cada ejercicio y el reloj la muestra y vibra.'),
        h('li', {}, h('strong', {}, 'Esferas personalizadas: '), 'una imagen de fondo con la pose, generada a la resolución exacta de tu pantalla.')),
    ),
    h('article', { class: 'card' },
      h('h3', {}, '1 · Notificaciones durante la sesión'),
      steps([
        'Abrí esta app en Chrome (Android) o instalala en la pantalla de inicio (Safari en iPhone, iOS 16.4 o superior).',
        'En Rutinas → Ajustes, activá "Notificaciones al reloj" y aceptá el permiso. Tocá "Probar notificación".',
        'En la app del reloj (FitCloudPro u otra), entrá a notificaciones de apps y habilitá Chrome (o la app instalada).',
        'Durante la sesión dejá la pantalla del celular encendida: la app la mantiene activa sola, porque si se apaga el navegador frena los temporizadores.',
      ]),
    ),
    h('article', { class: 'card' },
      h('h3', {}, '2 · Esfera con la pose'),
      steps([
        'Averiguá la resolución de tu pantalla (en la caja, el manual o la ficha del modelo) y elegila en Esferas. Si no figura, usá "Personalizada".',
        'Generá la pose o la rutina y tocá "Guardar en galería" (o descargá el PNG).',
        'En la app del reloj: esferas → personalizada → elegí la foto de la galería y la posición de la hora (que coincida con la zona que dejaste libre).',
        'Sincronizá. La mayoría de estos relojes guarda una sola esfera con foto por vez: cambiala antes de cada serie.',
      ]),
    ),
  );
}

// ---------- varios ----------

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

D.registerServiceWorker();
render();
