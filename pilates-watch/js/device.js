// Integraciones con el navegador: notificaciones (que la app del reloj espeja),
// pantalla siempre encendida, voz y vibración. Todo degrada sin romper.

export const support = {
  notifications: typeof window !== 'undefined' && 'Notification' in window,
  serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  wakeLock: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
  speech: typeof window !== 'undefined' && 'speechSynthesis' in window,
  vibrate: typeof navigator !== 'undefined' && 'vibrate' in navigator,
  share: typeof navigator !== 'undefined' && 'canShare' in navigator,
};

export async function registerServiceWorker() {
  if (!support.serviceWorker) return null;
  try {
    return await navigator.serviceWorker.register('./sw.js');
  } catch {
    return null;
  }
}

export function notificationPermission() {
  return support.notifications ? Notification.permission : 'unsupported';
}

export async function requestNotifications() {
  if (!support.notifications) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

/**
 * Publica una notificación. En Android Chrome sólo funciona vía Service Worker
 * (`new Notification()` está prohibido); el mismo `tag` + `renotify` reemplaza
 * la anterior en el teléfono pero vuelve a vibrar y a llegar al reloj.
 */
export async function notify({ title, body }) {
  if (notificationPermission() !== 'granted') return false;
  const options = {
    body,
    tag: 'reformer-session',
    renotify: true,
    silent: false,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [180, 80, 180],
  };
  try {
    const reg = support.serviceWorker ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) {
      await reg.showNotification(title, options);
    } else {
      new Notification(title, options); // escritorio sin SW
    }
    return true;
  } catch {
    return false;
  }
}

/** Mantiene la pantalla encendida: sin esto el navegador congela los timers. */
export class ScreenLock {
  #sentinel = null;
  #wanted = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.#wanted && document.visibilityState === 'visible') this.#acquire();
      });
    }
  }

  get active() {
    return Boolean(this.#sentinel && !this.#sentinel.released);
  }

  async enable() {
    this.#wanted = true;
    return this.#acquire();
  }

  async disable() {
    this.#wanted = false;
    try {
      await this.#sentinel?.release();
    } catch {
      /* ya liberado */
    }
    this.#sentinel = null;
  }

  async #acquire() {
    if (!support.wakeLock || this.active) return this.active;
    try {
      this.#sentinel = await navigator.wakeLock.request('screen');
    } catch {
      this.#sentinel = null;
    }
    return this.active;
  }
}

export function speak(text, lang = 'es-AR') {
  if (!support.speech) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  } catch {
    /* sin voz */
  }
}

export function vibrate(pattern = [200, 100, 200]) {
  if (support.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* sin vibración */
    }
  }
}
