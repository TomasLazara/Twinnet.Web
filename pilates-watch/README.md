# Reformer Watch

PWA para practicar **Pilates Reformer** con un smartwatch de firmware cerrado
(Gadnic y otros que usan FitCloudPro): repertorio clásico ilustrado, sesiones
con avisos en la muñeca y generador de fondos de esfera con cada pose.

## Por qué está hecha así

Estos relojes **no instalan apps de terceros**. Los dos canales abiertos son:

| Canal | Cómo lo usa la app |
|---|---|
| Notificaciones espejadas del celular | Cada fase de la sesión publica una notificación (mismo `tag` + `renotify`), el reloj la muestra y vibra. |
| Esfera personalizada con foto | Se genera un PNG con la pose a la **resolución exacta** de la pantalla, fondo negro (AMOLED) y zona libre para la hora. |

## Qué incluye

- **62 ejercicios** del orden clásico de Reformer (Footwork → Russian Splits,
  más Feet in Straps), agrupados por serie y nivel. Los marcados ⚠ son
  representaciones aproximadas de ejercicios avanzados: validar con instructor/a.
  *Russian Squat* y *Headstand con correas* todavía no están dibujados.
- **Ilustraciones vectoriales propias y paramétricas**: la figura se calcula con
  cinemática directa/inversa (`js/figure.js`) sobre un reformer paramétrico
  (`js/reformer.js`: carro, footbar, resortes, correas, long box y short box).
  Agregar una pose = una entrada de datos en `js/poses.js`.
- **Rutinas** predefinidas + "Mi rutina" editable, con preparación y transiciones.
- **Sesión** con temporizador por reloj de pared (no deriva aunque el navegador
  frene los timers), pausa/salto, Wake Lock, vibración y voz opcional.
- **Esferas**: 240×280, 368×448, 410×502, 360×360 y 466×466 redondas, o
  resolución personalizada; hora arriba/abajo; 4 paletas; zoom a la figura o
  reformer completo. Se guardan en la galería vía Web Share o se descargan.
- Funciona **offline** (Service Worker).

## Usar

```bash
npm start          # sirve en http://localhost:5173
npm test           # tests con node:test (sin dependencias)
npm run sheet      # contact-sheet.html con todas las poses (revisión visual)
```

Las notificaciones y el Service Worker requieren **HTTPS** (o `localhost`).
Para usarla desde el celular, publicá la carpeta en cualquier hosting estático
con HTTPS (por ejemplo GitHub Pages) e instalala en la pantalla de inicio.

La sección **Reloj** de la app explica cómo habilitar las notificaciones de
Chrome en la app del reloj y cómo cargar la esfera.

## Limitaciones conocidas

- **Pantalla encendida**: si el celular apaga la pantalla, el navegador congela
  los timers y los avisos llegan tarde. La app pide Wake Lock; el estado se
  resincroniza al volver. Para avisos con la pantalla apagada hace falta una
  app nativa (siguiente iteración: Capacitor + notificaciones locales programadas).
- **Resolución del CHSD20**: no está publicada; verificala en la caja/ficha y
  usá "Personalizada" si no coincide con un preset.
- La vista es lateral: ejercicios de rotación o inclinación lateral mirando al
  footbar (Short Box Side/Twist) se representan con una sola pose de referencia.

## Estructura

```
js/figure.js     figura paramétrica (FK/IK, vista lateral y frontal)
js/reformer.js   máquina paramétrica
js/scene.js      composición + SVG + Canvas
js/poses.js      repertorio (datos)
js/routines.js   rutinas y persistencia de "Mi rutina"
js/session.js    máquina de estados de la sesión (pura, testeada)
js/device.js     notificaciones, Wake Lock, voz, vibración
js/watchface.js  generador de esferas
js/app.js        UI
```
