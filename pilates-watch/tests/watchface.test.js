import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layout, SCREEN_PRESETS, fileName } from '../js/watchface.js';
import { getPose } from '../js/poses.js';

const inside = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w + 1e-9 && a.y + a.h <= b.y + b.h + 1e-9;
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

test('la figura nunca se superpone con la zona de la hora', () => {
  for (const s of SCREEN_PRESETS) {
    for (const clock of ['top', 'bottom', 'none']) {
      const z = layout({ ...s, clock });
      assert.ok(inside(z.figure, z.inner), `${s.id}/${clock}: figura fuera de pantalla`);
      assert.ok(inside(z.text, z.inner), `${s.id}/${clock}: texto fuera de pantalla`);
      if (clock !== 'none') {
        assert.ok(!overlap(z.figure, z.clockZone), `${s.id}/${clock}: figura tapa la hora`);
        assert.ok(!overlap(z.text, z.clockZone), `${s.id}/${clock}: texto tapa la hora`);
      }
      assert.ok(z.figure.h > s.h * 0.25, `${s.id}/${clock}: figura muy chica`);
    }
  }
});

test('en pantallas redondas el contenido queda dentro del círculo', () => {
  for (const s of SCREEN_PRESETS.filter((p) => p.round)) {
    const { inner } = layout({ ...s, clock: 'top' });
    const r = s.w / 2;
    for (const [x, y] of [[inner.x, inner.y + inner.h / 2], [inner.x + inner.w / 2, inner.y]]) {
      assert.ok(Math.hypot(x - r, y - r) <= r, `${s.id}: borde fuera del círculo`);
    }
  }
});

test('nombre de archivo estable y seguro', () => {
  assert.equal(fileName(getPose('hundred'), { w: 368, h: 448 }), 'reformer-hundred-368x448.png');
});
