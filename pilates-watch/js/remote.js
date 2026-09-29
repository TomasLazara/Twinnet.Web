// Control desde el reloj vía los botones de música (⏮ ⏯ ⏭).
//
// Los relojes con firmware cerrado (FitCloudPro y similares) no aceptan apps,
// pero su pantalla de "música" envía comandos de medios al teléfono. Android/iOS
// los entregan a la sesión multimedia activa: si esta página reproduce audio,
// esa sesión es la nuestra y la Media Session API recibe los comandos.
// Además, el título de la "canción" (el ejercicio) aparece en el reloj.
//
// Reproducir audio también evita que el navegador congele la página con la
// pantalla apagada, así el temporizador sigue corriendo.

/**
 * WAV mono PCM 16 bit con ruido muy bajo (≈ -60 dBFS): inaudible a volumen
 * normal pero no "silencio digital", que algunos navegadores ignoran como
 * reproducción activa. Dura > 5 s porque Chrome no crea controles multimedia
 * para audios más cortos.
 */
export function makeQuietWav(seconds = 10, rate = 8000, amplitude = 32) {
  const samples = Math.round(seconds * rate);
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + samples * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true); // tamaño del bloque fmt
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); // byte rate
  v.setUint16(32, 2, true); // block align
  v.setUint16(34, 16, true); // bits por muestra
  str(36, 'data');
  v.setUint32(40, samples * 2, true);
  let seed = 1;
  for (let i = 0; i < samples; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff; // LCG determinístico
    v.setInt16(44 + i * 2, Math.round(((seed / 0x7fffffff) * 2 - 1) * amplitude), true);
  }
  return buf;
}

/** Mapeo de acciones multimedia → comandos de la sesión. */
export const ACTION_MAP = {
  nexttrack: 'next',
  seekforward: 'next',
  previoustrack: 'prev',
  seekbackward: 'prev',
  play: 'resume',
  pause: 'pause',
};

export class WatchRemote {
  #audio = null;
  #url = null;
  #artwork = new Map();

  /** @param {{next: Function, prev: Function, resume: Function, pause: Function}} commands */
  constructor(commands) {
    this.commands = commands;
  }

  get supported() {
    return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
  }

  get active() {
    return Boolean(this.#audio && !this.#audio.paused);
  }

  /** Llamar dentro de un gesto del usuario (click), si no el navegador bloquea el audio. */
  start() {
    if (!this.supported) return Promise.resolve(false);
    if (!this.#audio) {
      this.#url = URL.createObjectURL(new Blob([makeQuietWav()], { type: 'audio/wav' }));
      this.#audio = new Audio(this.#url);
      this.#audio.loop = true;
      this.#audio.volume = 1;
    }
    for (const [action, cmd] of Object.entries(ACTION_MAP)) {
      try {
        navigator.mediaSession.setActionHandler(action, () => this.commands[cmd]());
      } catch {
        /* acción no soportada en este navegador */
      }
    }
    return this.#audio.play().then(() => true, () => false);
  }

  /**
   * Actualiza lo que muestra el reloj / la pantalla bloqueada.
   * Mantiene el audio sonando aun en pausa: si se pausa el audio, el sistema
   * puede cerrar la sesión multimedia y el reloj pierde el control.
   */
  update({ title, artist, album, artwork, duration, position, playing }) {
    if (!this.supported) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: artwork ? [{ src: artwork, sizes: '256x256', type: 'image/png' }] : [],
      });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
      if (duration > 0 && 'setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration,
          position: Math.max(0, Math.min(duration, position)),
          playbackRate: 1,
        });
      }
    } catch {
      /* metadatos no soportados */
    }
  }

  /** Imagen (blob URL) de la pose para la carátula; se genera una vez por pose. */
  async artworkFor(id, draw) {
    if (this.#artwork.has(id)) return this.#artwork.get(id);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    draw(canvas);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const url = blob ? URL.createObjectURL(blob) : null;
    this.#artwork.set(id, url);
    return url;
  }

  stop() {
    if (!this.supported) return;
    this.#audio?.pause();
    for (const action of Object.keys(ACTION_MAP)) {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        /* nada */
      }
    }
    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    } catch {
      /* nada */
    }
  }
}
