import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeQuietWav, ACTION_MAP } from '../js/remote.js';

test('el audio de control es un WAV PCM válido de más de 5 s', () => {
  const buf = makeQuietWav(10, 8000, 32);
  const v = new DataView(buf);
  const str = (o) => String.fromCharCode(...new Uint8Array(buf, o, 4));
  assert.equal(str(0), 'RIFF');
  assert.equal(str(8), 'WAVE');
  assert.equal(str(36), 'data');
  assert.equal(v.getUint16(20, true), 1, 'PCM');
  const rate = v.getUint32(24, true);
  const bytes = v.getUint32(40, true);
  assert.ok(bytes / 2 / rate > 5, 'Chrome no muestra controles multimedia para audios < 5 s');
  assert.equal(buf.byteLength, 44 + bytes);
  let peak = 0;
  let nonZero = 0;
  for (let i = 44; i < buf.byteLength; i += 2) {
    const x = Math.abs(v.getInt16(i, true));
    peak = Math.max(peak, x);
    if (x) nonZero++;
  }
  assert.ok(peak <= 32, 'debe ser prácticamente inaudible');
  assert.ok(nonZero > bytes / 4, 'no debe ser silencio digital');
});

test('los botones de música del reloj mapean a los comandos de la sesión', () => {
  assert.equal(ACTION_MAP.nexttrack, 'next');
  assert.equal(ACTION_MAP.previoustrack, 'prev');
  assert.equal(ACTION_MAP.play, 'resume');
  assert.equal(ACTION_MAP.pause, 'pause');
});
