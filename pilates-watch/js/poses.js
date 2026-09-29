// Repertorio clásico de Pilates Reformer (orden clásico de referencia:
// "Complete Classical Reformer Order", A. Maida / pilatesbridge.com).
// Los nombres y secuencias de ejercicios son un método (no protegible);
// las ilustraciones y los textos de acá son propios.
//
// Coordenadas: ver js/figure.js (figura) y js/reformer.js (máquina).
//   setup.carriage = x del borde izquierdo del carro (home = 104)
//   setup.box      = 'long' | 'short'
//   setup.straps   = 'hands' | 'feet' | 'footstrap' | 'footstrap-far'
//   face           = hacia dónde mira la cara (boca arriba ≈ -90, abajo ≈ 90)
// Las posiciones marcadas `review: true` son representaciones aproximadas de
// ejercicios avanzados: validarlas con un/a instructor/a antes de usarlas.

export const LEVELS = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  super: 'Súper avanzado',
};

const TOWARD_BAR = 'mirando al footbar';
const TOWARD_STRAPS = 'mirando a las poleas';

const supineHead = { torso: 180, head: 180, face: -90 };

export const POSES = [
  // 1 · Footwork
  {
    id: 'footwork-toes', name: 'Footwork: Toes', es: 'Trabajo de pies: puntas', group: 'Footwork', level: 'basic', seconds: 60,
    setup: { carriage: 82 }, orientation: 'Boca arriba, pies en el footbar',
    cues: ['Talones juntos, V de Pilates', 'Estirá sin trabar rodillas', 'Volvé controlando el carro'],
    hip: [158, 92], ...supineHead, arms: { near: [2, 0] }, legs: { near: { to: [235, 66], foot: 60 } },
  },
  {
    id: 'footwork-heels', name: 'Footwork: Heels', es: 'Trabajo de pies: talones', group: 'Footwork', level: 'basic', seconds: 60,
    setup: { carriage: 86 }, orientation: 'Boca arriba, talones en el footbar',
    cues: ['Talones en la barra, pies flexionados', 'Pelvis neutra', 'Empujá desde los isquios'],
    hip: [161, 92], ...supineHead, arms: { near: [2, 0] }, legs: { near: { to: [239, 67], foot: -75 } },
  },
  {
    id: 'footwork-tendon', name: 'Footwork: Tendon Stretch', es: 'Trabajo de pies: elongación de tendón', group: 'Footwork', level: 'basic', seconds: 45,
    setup: { carriage: 82 }, orientation: 'Boca arriba, metatarsos en el footbar',
    cues: ['Piernas estiradas', 'Bajá talones bajo la barra', 'Subí a media punta'],
    hip: [158, 92], ...supineHead, arms: { near: [2, 0] }, legs: { near: { to: [236, 80], foot: -45 } },
  },
  // 2-4 · Supinos con correas
  {
    id: 'hundred', name: 'Hundred', es: 'El Cien', group: 'Correas en manos', level: 'basic', seconds: 60,
    setup: { carriage: 86, straps: 'hands' }, orientation: 'Boca arriba, correas en las manos',
    cues: ['Cabeza y hombros arriba', 'Brazos bombean: 5 inhal, 5 exhal', 'Piernas a 45°'],
    hip: [160, 92], torso: 196, head: 222, face: -40, spine: 3,
    arms: { near: [4, 2], far: [2, 0] }, legs: { near: [-40, -40, -40] },
  },
  {
    id: 'overhead', name: 'Overhead', es: 'Piernas sobre la cabeza', group: 'Correas en manos', level: 'advanced', seconds: 45,
    setup: { carriage: 84, straps: 'hands' }, orientation: 'Boca arriba, correas en las manos',
    cues: ['Piernas por encima de la cabeza', 'Brazos presionan hacia abajo', 'Bajá vértebra por vértebra'],
    hip: [118, 40], torso: 102, head: 180, face: -90, arms: { near: [0, 0] }, legs: { near: [190, 190, 190] },
  },
  {
    id: 'coordination', name: 'Coordination', es: 'Coordinación', group: 'Correas en manos', level: 'intermediate', seconds: 45,
    setup: { carriage: 86, straps: 'hands' }, orientation: 'Boca arriba, correas en las manos',
    cues: ['Estirá brazos y piernas juntos', 'Abrí y cerrá piernas', 'Rodillas adentro, brazos arriba'],
    hip: [160, 92], torso: 196, head: 222, face: -40, spine: 3,
    arms: { near: [6, 4], far: [4, 2] }, legs: { near: [-22, -22, -22] },
  },
  // 5 · Rowing
  {
    id: 'rowing-back', name: 'Rowing: Back', es: 'Remo hacia atrás', group: 'Rowing', level: 'intermediate', seconds: 45,
    setup: { straps: 'hands' }, orientation: `Sentado, ${TOWARD_BAR}`,
    cues: ['Redondeá la espalda hacia atrás', 'Brazos a la altura del pecho', 'Volvé creciendo'],
    hip: [118, 92], torso: -110, head: -70, face: 20, spine: 10,
    arms: { near: [0, 0], far: [-2, -2] }, legs: { near: [0, 0, -80] },
  },
  {
    id: 'rowing-front', name: 'Rowing: Front', es: 'Remo hacia adelante', group: 'Rowing', level: 'intermediate', seconds: 45,
    setup: { straps: 'hands' }, orientation: `Sentado, ${TOWARD_STRAPS}`,
    cues: ['Sentate alto sobre isquiones', 'Brazos empujan adelante y arriba', 'Hombros lejos de las orejas'],
    hip: [186, 92], torso: -90, head: -90, face: 180,
    arms: { near: [192, 188], far: [188, 184] }, legs: { near: [180, 180, 180] },
  },
  // 6 · Long Box (1ra serie)
  {
    id: 'swan-box', name: 'Swan (Long Box)', es: 'Cisne en long box', group: 'Long Box', level: 'intermediate', seconds: 40,
    setup: { box: 'long' }, orientation: `Boca abajo en la caja, ${TOWARD_BAR}`,
    cues: ['Manos en el footbar', 'Empujá y abrí el pecho', 'Piernas largas y juntas'],
    hip: [178, 66], torso: -35, head: -50, face: -20, spine: -6,
    arms: { near: { to: [240, 71], bend: -1 } }, legs: { near: [180, 180, 180] },
  },
  {
    id: 'pull-straps', name: 'Pull Straps / T', es: 'Tirar de las correas / T', group: 'Long Box', level: 'intermediate', seconds: 45,
    setup: { carriage: 90, box: 'long', straps: 'hands', footbar: 'down' }, orientation: `Boca abajo en la caja, ${TOWARD_STRAPS}`,
    cues: ['Brazos largos hacia las caderas', 'Pecho se eleva', 'En la T, brazos a los costados'],
    hip: [158, 66], torso: 195, head: 205, face: 135, spine: -4,
    arms: { near: [10, 5], far: [8, 3] }, legs: { near: [0, 0, 0] },
  },
  {
    id: 'backstroke', name: 'Backstroke', es: 'Espalda (natación)', group: 'Long Box', level: 'intermediate', seconds: 45,
    setup: { box: 'long', straps: 'hands', footbar: 'down' }, orientation: `Boca arriba en la caja, ${TOWARD_STRAPS}`,
    cues: ['Brazos y piernas al techo', 'Abrí en V y hacé el círculo', 'Mirada al ombligo'],
    hip: [140, 66], torso: -15, head: -45, face: -130, spine: 4,
    arms: { near: [-120, -120], far: [-116, -116] }, legs: { near: [-115, -115, -115] },
  },
  {
    id: 'teaser-box', name: 'Teaser (Long Box)', es: 'Teaser en long box', group: 'Long Box', level: 'advanced', seconds: 30,
    setup: { box: 'long', straps: 'hands', footbar: 'down' }, orientation: `Sentado en la caja, ${TOWARD_STRAPS}`,
    cues: ['V: brazos paralelos a piernas', 'Equilibrio en isquiones', 'Bajá y subí sin perder la forma'],
    hip: [160, 66], torso: -55, head: -75, face: 200, spine: 3,
    arms: { near: [-140, -140], far: [-137, -137] }, legs: { near: [-135, -135, -135] },
  },
  {
    id: 'breaststroke', name: 'Breaststroke', es: 'Pecho (natación)', group: 'Long Box', level: 'advanced', seconds: 40,
    setup: { box: 'long', straps: 'hands', footbar: 'down' }, orientation: `Boca abajo en la caja, ${TOWARD_BAR}`,
    cues: ['Brazos al frente, pecho arriba', 'Círculo de brazos a las caderas', 'Piernas activas y juntas'],
    hip: [150, 66], torso: -15, head: -25, face: 45, spine: -4,
    arms: { near: [-10, -10], far: [-6, -6] }, legs: { near: [180, 180, 180] },
  },
  {
    id: 'hamstring-curl', name: 'Hamstring Curl', es: 'Flexión de isquios', group: 'Long Box', level: 'advanced', seconds: 40,
    setup: { box: 'long', straps: 'feet' }, orientation: `Boca abajo, ${TOWARD_BAR}, correas en pies`,
    cues: ['Manos en el footbar', 'Talones hacia los glúteos', 'Pelvis pegada a la caja'],
    hip: [160, 66], torso: 0, head: 10, face: 90,
    arms: { near: { to: [240, 72], bend: -1 } }, legs: { near: [180, -55, -55], far: [180, -48, -48] },
  },
  {
    id: 'horseback', name: 'Horseback', es: 'A caballo', group: 'Long Box', level: 'advanced', seconds: 30,
    setup: { box: 'long', straps: 'hands', footbar: 'down' }, orientation: `A horcajadas en la caja, ${TOWARD_STRAPS}`,
    cues: ['Rodillas abrazan la caja', 'Elevá la pelvis', 'Brazos largos hacia abajo'],
    hip: [165, 66], torso: -92, head: -90, face: 180,
    arms: { near: [118, 106], far: [114, 102] }, legs: { near: [150, 125, 125] },
  },
  // 7-8 · Long Stretch series
  {
    id: 'long-stretch', name: 'Long Stretch', es: 'Plancha larga', group: 'Long Stretch', level: 'intermediate', seconds: 40,
    setup: { carriage: 97 }, orientation: `Plancha, ${TOWARD_BAR}`,
    cues: ['Talones contra las hombreras', 'Línea recta de cabeza a talón', 'Hombros sobre las manos'],
    hip: [192, 48.5], torso: -30, head: -30, face: 60,
    arms: { near: { to: [241, 71], bend: -1 } }, legs: { near: { to: [124, 88], foot: 60 } },
  },
  {
    id: 'down-stretch', name: 'Down Stretch', es: 'Estiramiento abajo', group: 'Long Stretch', level: 'intermediate', seconds: 40,
    setup: { carriage: 100 }, orientation: `De rodillas, ${TOWARD_BAR}`,
    cues: ['Pies contra las hombreras', 'Pecho abierto, cadera adelante', 'Empujá el carro con la espalda'],
    hip: [200.4, 69.9], torso: -60, head: -80, face: -20, spine: -8,
    arms: { near: { to: [241, 71], bend: -1 } }, legs: { near: [145, 180, -80] },
  },
  {
    id: 'up-stretch', name: 'Up Stretch', es: 'Estiramiento arriba', group: 'Long Stretch', level: 'intermediate', seconds: 40,
    setup: {}, orientation: `Pica (V invertida), ${TOWARD_BAR}`,
    cues: ['Caderas altas', 'Hombros sobre las manos', 'Llevá la plancha y volvé a la pica'],
    hip: [171, 19], torso: 4, head: 70, face: 160,
    arms: { near: { to: [240, 71], bend: -1 } }, legs: { near: { to: [130, 90], foot: 60 } },
  },
  {
    id: 'elephant', name: 'Elephant', es: 'Elefante', group: 'Long Stretch', level: 'basic', seconds: 45,
    setup: {}, orientation: `De pie sobre el carro, ${TOWARD_BAR}`,
    cues: ['Talones contra las hombreras', 'Espalda redonda, piernas rectas', 'Mové el carro desde el abdomen'],
    hip: [158, 14], torso: 45, head: 100, face: 170, spine: 10,
    arms: { near: { to: [240, 71], bend: -1 } }, legs: { near: { to: [130, 91], foot: 0 } },
  },
  {
    id: 'one-leg-elephant', name: 'One Leg Elephant', es: 'Elefante a una pierna', group: 'Long Stretch', level: 'intermediate', seconds: 40,
    setup: {}, orientation: `De pie sobre el carro, ${TOWARD_BAR}`,
    cues: ['Una pierna arriba y atrás', 'Cadera nivelada', 'Cambiá de pierna'],
    hip: [158, 14], torso: 45, head: 100, face: 170, spine: 10,
    arms: { near: { to: [240, 71], bend: -1 } }, legs: { near: { to: [130, 91], foot: 0 }, far: [200, 200, 200] },
  },
  {
    id: 'long-back-stretch', name: 'Long Back Stretch', es: 'Estiramiento largo de espalda', group: 'Long Stretch', level: 'advanced', seconds: 40,
    setup: {}, orientation: 'Plancha invertida, de espaldas al footbar',
    cues: ['Manos atrás en el footbar', 'Bajá con codos hacia atrás', 'Cadera arriba al volver'],
    hip: [191.7, 47.2], torso: -31.6, head: -40, face: -120,
    arms: { near: { to: [240, 70], bend: 1 } }, legs: { near: { to: [122, 90], foot: -120 } },
  },
  // 9 · Stomach Massage
  {
    id: 'stomach-massage-round', name: 'Stomach Massage: Round', es: 'Masaje abdominal: redondo', group: 'Stomach Massage', level: 'basic', seconds: 45,
    setup: { carriage: 76 }, orientation: `Sentado, ${TOWARD_BAR}`,
    cues: ['Espalda en C', 'Pies en V en el footbar', 'Estirá piernas, subí a media punta'],
    hip: [162, 92], torso: -72, torsoLen: 44, head: 35, face: 80, spine: 12,
    arms: { near: { to: [170, 97], bend: 1 } }, legs: { near: { to: [236, 66], bend: 1, foot: 60 } },
  },
  {
    id: 'stomach-massage-hands-back', name: 'Stomach Massage: Hands Back', es: 'Masaje abdominal: manos atrás', group: 'Stomach Massage', level: 'intermediate', seconds: 45,
    setup: {}, orientation: `Sentado, ${TOWARD_BAR}`,
    cues: ['Manos atrás en el carro', 'Pecho alto', 'Piernas empujan sin perder la postura'],
    hip: [190, 92], torso: -120, head: -95, face: -10, spine: -6,
    arms: { near: { to: [150, 96], bend: -1 } }, legs: { near: { to: [236, 66], bend: 1, foot: 60 } },
  },
  {
    id: 'stomach-massage-reach', name: 'Stomach Massage: Reach', es: 'Masaje abdominal: alcance', group: 'Stomach Massage', level: 'intermediate', seconds: 45,
    setup: {}, orientation: `Sentado, ${TOWARD_BAR}`,
    cues: ['Brazos al techo', 'Crecé desde la cintura', 'Piernas estiran, brazos quietos'],
    hip: [190, 92], torso: -85, head: -85, face: 5,
    arms: { near: [-80, -84], far: [-84, -88] }, legs: { near: { to: [236, 66], bend: 1, foot: 60 } },
  },
  {
    id: 'stomach-massage-twist', name: 'Stomach Massage: Twist', es: 'Masaje abdominal: torsión', group: 'Stomach Massage', level: 'advanced', seconds: 45,
    setup: {}, orientation: `Sentado, ${TOWARD_BAR}`,
    cues: ['Rotá el torso hacia un lado', 'Brazos en T siguen la rotación', 'Pelvis quieta'],
    hip: [190, 92], torso: -88, head: -88, face: 180,
    arms: { near: [-4, -4], far: [184, 184] }, legs: { near: { to: [236, 66], bend: 1, foot: 60 } },
  },
  // 10 · Tendon Stretch
  {
    id: 'tendon-stretch', name: 'Tendon Stretch', es: 'Elongación de tendón', group: 'Tendon Stretch', level: 'advanced', seconds: 40, review: true,
    setup: {}, orientation: 'Manos en footbar, pies en el borde del carro',
    cues: ['Caderas arriba, espalda redonda', 'Empujá el carro con los pies', 'Talones altos'],
    hip: [200, 10], torso: 20, head: 110, face: 170, spine: 6,
    arms: { near: { to: [241, 71], bend: 1 } }, legs: { near: { to: [192, 88], bend: -1, foot: 60 } },
  },
  // 11 · Short Box
  {
    id: 'short-box-round', name: 'Short Box: Round Back', es: 'Short box: espalda redonda', group: 'Short Box', level: 'basic', seconds: 45,
    setup: { box: 'short', footbar: 'down', straps: 'footstrap' }, orientation: `Sentado en la caja, ${TOWARD_BAR}`,
    cues: ['Pies bajo la correa', 'Redondeá hacia atrás en C', 'Volvé enrollando'],
    hip: [148, 66], torso: -115, head: -75, face: 10, spine: 10,
    arms: { near: [20, 200], far: [16, 196] }, legs: { near: [12, 12, -60] },
  },
  {
    id: 'short-box-flat', name: 'Short Box: Flat Back', es: 'Short box: espalda plana', group: 'Short Box', level: 'basic', seconds: 45,
    setup: { box: 'short', footbar: 'down', straps: 'footstrap' }, orientation: `Sentado en la caja, ${TOWARD_BAR}`,
    cues: ['Brazos arriba en línea con el torso', 'Inclinate como una tabla', 'Cuello largo'],
    hip: [148, 66], torso: -125, head: -125, face: -35,
    arms: { near: [-122, -122], far: [-126, -126] }, legs: { near: [12, 12, -60] },
  },
  {
    id: 'short-box-twist', name: 'Short Box: Side / Twist / Around the World', es: 'Short box: lateral, torsión, vuelta al mundo', group: 'Short Box', level: 'intermediate', seconds: 45,
    setup: { box: 'short', footbar: 'down', straps: 'footstrap' }, orientation: `Sentado en la caja, ${TOWARD_BAR}`,
    cues: ['Rotá y luego inclinate', 'Manos detrás de la cabeza', 'Crecé antes de cada movimiento'],
    hip: [148, 66], torso: -100, head: -95, face: -10,
    arms: { near: [-40, 200], far: [-150, 20] }, legs: { near: [12, 12, -60] },
  },
  {
    id: 'short-box-tree', name: 'Short Box: Tree', es: 'Short box: árbol', group: 'Short Box', level: 'advanced', seconds: 40,
    setup: { box: 'short', footbar: 'down', straps: 'footstrap-far' }, orientation: `Sentado en la caja, ${TOWARD_BAR}`,
    cues: ['Una pierna al techo', 'Caminá con las manos por la pierna', 'Bajá y subí la espalda'],
    hip: [148, 66], torso: -110, head: -100, face: -20,
    arms: { near: { to: [168, 12], bend: 1 } }, legs: { near: [-70, -70, -70], far: [12, 12, -60] },
  },
  // 12-14
  {
    id: 'short-spine', name: 'Short Spine Massage', es: 'Masaje corto de columna', group: 'Correas en pies', level: 'intermediate', seconds: 45,
    setup: { carriage: 84, straps: 'feet' }, orientation: 'Boca arriba, correas en los pies',
    cues: ['Piernas sobre la cabeza', 'Flexioná rodillas hacia los hombros', 'Bajá vértebra por vértebra'],
    hip: [118, 40], torso: 102, head: 180, face: -90, arms: { near: [0, 0] }, legs: { near: [200, 110, 110] },
  },
  {
    id: 'semi-circle', name: 'Semi Circle', es: 'Semicírculo', group: 'Puentes', level: 'advanced', seconds: 45,
    setup: { carriage: 90 }, orientation: 'Boca arriba, pies en el footbar',
    cues: ['Hombros contra las hombreras', 'Cadera alta, bajá por la columna', 'Carro afuera y adentro'],
    hip: [158.3, 64.8], torso: 148.5, head: 180, face: -90,
    arms: { near: { to: [110, 84], bend: 1 } }, legs: { near: { to: [234, 66], bend: 1, foot: 30 } },
  },
  {
    id: 'headstand', name: 'Headstand', es: 'Parada de cabeza', group: 'Invertidas', level: 'super', seconds: 30, review: true,
    setup: {}, orientation: 'Cabeza en el carro, pies en el footbar',
    cues: ['Coronilla contra el carro', 'Manos en las hombreras', 'Empujá con las piernas'],
    hip: [172, 40], torso: 133.5, head: 120, face: 30,
    arms: { near: { to: [122, 88], bend: 1 } }, legs: { near: { to: [236, 66], foot: 20 } },
  },
  // 15-18 · De rodillas con correas
  {
    id: 'chest-expansion', name: 'Chest Expansion', es: 'Expansión de pecho', group: 'De rodillas', level: 'intermediate', seconds: 40,
    setup: { straps: 'hands' }, orientation: `De rodillas, ${TOWARD_STRAPS}`,
    cues: ['Brazos atrás, largos', 'Girá la cabeza a un lado y al otro', 'Torso quieto'],
    hip: [138, 52], torso: -90, head: -90, face: 180,
    arms: { near: [80, 78], far: [84, 82] }, legs: { near: [95, 0, 0] },
  },
  {
    id: 'thigh-stretch', name: 'Thigh Stretch', es: 'Estiramiento de muslos', group: 'De rodillas', level: 'intermediate', seconds: 40,
    setup: { straps: 'hands' }, orientation: `De rodillas, ${TOWARD_STRAPS}`,
    cues: ['Línea recta de rodillas a cabeza', 'Inclinate hacia atrás', 'Glúteos activos'],
    hip: [151.7, 55.9], torso: -65, head: -65, face: 205,
    arms: { near: [182, 182], far: [178, 178] }, legs: { near: [115, 0, 0] },
  },
  {
    id: 'backbend', name: 'Backbend', es: 'Extensión atrás', group: 'De rodillas', level: 'super', seconds: 30, review: true,
    setup: { straps: 'hands' }, orientation: `De rodillas, ${TOWARD_STRAPS}`,
    cues: ['Arqueá desde la columna alta', 'Cadera adelante', 'Cuello largo'],
    hip: [152, 56], torso: -50, head: -10, face: -80, spine: -12,
    arms: { near: [-158, -168], far: [-154, -164] }, legs: { near: [115, 0, 0] },
  },
  {
    id: 'arm-circles', name: 'Arm Circles', es: 'Círculos de brazos', group: 'De rodillas', level: 'intermediate', seconds: 40,
    setup: { straps: 'hands' }, orientation: `De rodillas, ${TOWARD_STRAPS}`,
    cues: ['Brazos arriba y círculo', 'Costillas cerradas', 'Pelvis quieta'],
    hip: [138, 52], torso: -90, head: -90, face: 180,
    arms: { near: [-122, -112], far: [-118, -108] }, legs: { near: [95, 0, 0] },
  },
  // 19 · Snake / Twist
  {
    id: 'snake', name: 'Snake', es: 'Serpiente', group: 'Snake / Twist', level: 'advanced', seconds: 40, review: true,
    setup: {}, orientation: 'Manos en footbar, pies en las hombreras',
    cues: ['Pies apilados contra la hombrera', 'Arqueá el cuerpo como ola', 'Controlá el carro'],
    hip: [205, 70], torso: -55, head: -80, face: -10, spine: -10,
    arms: { near: { to: [241, 71], bend: -1 } }, legs: { near: { to: [131, 90], foot: 60 } },
  },
  {
    id: 'twist', name: 'Twist', es: 'Torsión', group: 'Snake / Twist', level: 'advanced', seconds: 40, review: true,
    setup: {}, orientation: 'Manos en footbar, pies en las hombreras',
    cues: ['Caderas altas', 'Rotá y abrí el brazo al techo', 'Mirá la mano'],
    hip: [170, 26], torso: 50, head: 80, face: 170,
    arms: { near: { to: [241, 71], bend: -1 }, far: [-80, -80] }, legs: { near: { to: [131, 90], foot: 60 } },
  },
  // 21-23
  {
    id: 'corkscrew', name: 'Corkscrew', es: 'Sacacorchos', group: 'Invertidas', level: 'advanced', seconds: 40,
    setup: { carriage: 86 }, orientation: 'Boca arriba, manos en las hombreras',
    cues: ['Piernas juntas al techo', 'Círculos con la pelvis', 'Hombros anclados'],
    hip: [149.8, 58.6], torso: 140, head: 180, face: -90,
    arms: { near: { to: [116, 84], bend: -1 } }, legs: { near: [-100, -100, -100] },
  },
  {
    id: 'tic-toc', name: 'Tic Toc', es: 'Tic tac', group: 'Invertidas', level: 'super', seconds: 30, review: true,
    setup: { carriage: 86 }, orientation: 'Boca arriba, manos en las hombreras',
    cues: ['Cadera alta, piernas al techo', 'Péndulo de lado a lado', 'Control total'],
    hip: [124, 42], torso: 105.6, head: 180, face: -90,
    arms: { near: { to: [116, 84], bend: -1 } }, legs: { near: [-95, -95, -95] },
  },
  {
    id: 'balance-control-off', name: 'Balance Control Off', es: 'Control de equilibrio', group: 'Invertidas', level: 'super', seconds: 30, review: true,
    setup: { carriage: 84 }, orientation: 'Boca arriba, piernas sobre la cabeza',
    cues: ['Una pierna al techo', 'La otra hacia la cabecera', 'Cambiá en el aire'],
    hip: [118, 40], torso: 102, head: 180, face: -90,
    arms: { near: [0, 0] }, legs: { near: [-88, -88, -88], far: [165, 165, 165] },
  },
  // 24 · Long Box (2da serie)
  {
    id: 'grasshopper', name: 'Grasshopper', es: 'Saltamontes', group: 'Long Box 2', level: 'advanced', seconds: 30, review: true,
    setup: { box: 'long' }, orientation: `Boca abajo en la caja, ${TOWARD_BAR}`,
    cues: ['Piernas arriba, rodillas flexionadas', 'Batí los talones', 'Pecho largo'],
    hip: [160, 66], torso: -10, head: -20, face: 60,
    arms: { near: { to: [240, 72], bend: -1 } }, legs: { near: [190, -60, -60] },
  },
  {
    id: 'rocking', name: 'Rocking', es: 'Balanceo', group: 'Long Box 2', level: 'advanced', seconds: 30,
    setup: { box: 'long', footbar: 'down' }, orientation: 'Boca abajo en la caja',
    cues: ['Tomá los tobillos', 'Arco con pecho y muslos arriba', 'Balanceá desde el abdomen'],
    hip: [160, 66], torso: -35, head: -50, face: 0, spine: -6,
    arms: { near: { to: [152, 31], bend: -1 } }, legs: { near: [195, -35, -35] },
  },
  {
    id: 'swimming-box', name: 'Swimming (Long Box)', es: 'Natación en long box', group: 'Long Box 2', level: 'advanced', seconds: 40,
    setup: { box: 'long', footbar: 'down' }, orientation: 'Boca abajo en la caja',
    cues: ['Brazo y pierna opuestos', 'Patadas cortas y rápidas', 'Abdomen activo'],
    hip: [164, 66], torso: -8, head: -15, face: 60,
    arms: { near: [-14, -10], far: [4, 4] }, legs: { near: [186, 186, 186], far: [175, 175, 175] },
  },
  // 25-26
  {
    id: 'long-spine', name: 'Long Spine Massage', es: 'Masaje largo de columna', group: 'Correas en pies', level: 'advanced', seconds: 45,
    setup: { carriage: 84, straps: 'feet' }, orientation: 'Boca arriba, correas en los pies',
    cues: ['Piernas al techo, cadera alta', 'Bajá la columna con piernas en V', 'Cerrá y repetí'],
    hip: [122, 40], torso: 104, head: 180, face: -90, arms: { near: [0, 0] }, legs: { near: [-85, -85, -85] },
  },
  {
    id: 'high-bridge', name: 'High Bridge', es: 'Puente alto', group: 'Puentes', level: 'super', seconds: 30, review: true,
    setup: {}, orientation: 'Arco completo, manos en el carro y pies en el footbar',
    cues: ['Manos junto a las hombreras', 'Cadera al techo', 'Empujá con las piernas'],
    hip: [188, 32], torso: 159.4, head: 110, face: 160, spine: -14,
    arms: { near: { to: [126, 94], bend: 1 } }, legs: { near: { to: [236, 66], bend: 1, foot: 30 } },
  },
  // 27 · Mermaid
  {
    id: 'mermaid', name: 'Mermaid', es: 'Sirena', group: 'Laterales', level: 'intermediate', seconds: 45, view: 'front',
    setup: {}, orientation: 'Sentado de costado sobre el carro',
    cues: ['Mano en el footbar', 'Inclinación lateral larga', 'El otro brazo por arriba'],
    hip: [184, 90], torso: -60, head: -45, spine: 8,
    arms: { near: { to: [241, 71], bend: -1 }, far: [-60, -25] },
    legs: { near: [175, 5, 5], far: [178, 2, 2] },
  },
  // 28 · Knee Stretches
  {
    id: 'knee-stretch-round', name: 'Knee Stretch: Round', es: 'Rodillas: espalda redonda', group: 'Knee Stretches', level: 'basic', seconds: 40,
    setup: {}, orientation: `De rodillas, ${TOWARD_BAR}`,
    cues: ['Espalda redonda', 'Pies contra las hombreras', 'Mové el carro desde la cadera'],
    hip: [164, 53], torso: -8, head: 40, face: 120, spine: 12,
    arms: { near: { to: [241, 71], bend: -1 } }, legs: { near: { to: [132, 86], bend: -1, foot: 150 } },
  },
  {
    id: 'knee-stretch-arched', name: 'Knee Stretch: Arched', es: 'Rodillas: espalda arqueada', group: 'Knee Stretches', level: 'intermediate', seconds: 40,
    setup: {}, orientation: `De rodillas, ${TOWARD_BAR}`,
    cues: ['Pecho abierto, cola arriba', 'Mirada al frente', 'Espalda quieta'],
    hip: [164, 56], torso: -12, head: -25, face: 30, spine: -8,
    arms: { near: { to: [241, 71], bend: -1 } }, legs: { near: { to: [132, 86], bend: -1, foot: 150 } },
  },
  {
    id: 'knee-stretch-knees-off', name: 'Knee Stretch: Knees Off', es: 'Rodillas: rodillas arriba', group: 'Knee Stretches', level: 'advanced', seconds: 30,
    setup: {}, orientation: `En cuclillas, ${TOWARD_BAR}`,
    cues: ['Rodillas flotando', 'Espalda redonda', 'Movimientos cortos y rápidos'],
    hip: [168, 44], torso: 2, head: 50, face: 140, spine: 10,
    arms: { near: { to: [241, 71], bend: -1 } }, legs: { near: { to: [132, 86], bend: -1, foot: 150 } },
  },
  // 29-30
  {
    id: 'running', name: 'Running', es: 'Correr', group: 'Footwork', level: 'basic', seconds: 45,
    setup: { carriage: 82 }, orientation: 'Boca arriba, metatarsos en el footbar',
    cues: ['Piernas estiradas', 'Alterná talones bajo la barra', 'Pelvis quieta'],
    hip: [158, 92], ...supineHead, arms: { near: [2, 0] },
    legs: { near: { to: [228, 60], bend: 1, foot: 60 }, far: { to: [236, 80], foot: -45 } },
  },
  {
    id: 'pelvic-lift', name: 'Pelvic Lift', es: 'Elevación de pelvis', group: 'Puentes', level: 'basic', seconds: 45,
    setup: { carriage: 98 }, orientation: 'Boca arriba, pies en el footbar',
    cues: ['Elevá cadera vértebra por vértebra', 'Empujá el carro sin bajar la cadera', 'Rodillas paralelas'],
    hip: [170, 73], torso: 158.4, head: 180, face: -90,
    arms: { near: [2, 0] }, legs: { near: { to: [236, 68], bend: 1, foot: 40 } },
  },
  // 31 · Control Push Ups
  {
    id: 'control-front', name: 'Control Push Up Front', es: 'Control frontal', group: 'Control', level: 'advanced', seconds: 30, review: true,
    setup: { carriage: 70 }, orientation: 'Plancha boca abajo, pies en el footbar',
    cues: ['Manos en el carro', 'Cuerpo en bloque', 'Empujá el carro con los brazos'],
    hip: [159.8, 56.8], torso: 192.2, head: 200, face: 100,
    arms: { near: { to: [100, 97], bend: 1 } }, legs: { near: { to: [234, 66], foot: 60 } },
  },
  {
    id: 'control-back', name: 'Control Push Up Back', es: 'Control dorsal', group: 'Control', level: 'advanced', seconds: 30, review: true,
    setup: { carriage: 70 }, orientation: 'Plancha boca arriba, talones en el footbar',
    cues: ['Pecho abierto', 'Cadera arriba', 'Brazos empujan el carro'],
    hip: [159.8, 56.8], torso: 192.2, head: 190, face: -80,
    arms: { near: { to: [100, 97], bend: -1 } }, legs: { near: { to: [239, 67], foot: -80 } },
  },
  // 32 · Star
  {
    id: 'star', name: 'Star', es: 'Estrella', group: 'Laterales', level: 'super', seconds: 30, view: 'front', review: true,
    setup: {}, orientation: 'Plancha lateral, mano en el footbar',
    cues: ['Pies contra la hombrera', 'Brazo y pierna de arriba se abren', 'Cadera alta'],
    hip: [185, 50], torso: -28, head: -28,
    arms: { near: { to: [241, 71], bend: -1 }, far: [-100, -100] },
    legs: { near: { to: [128, 92] }, far: [190, 190, 190] },
  },
  // 33-35 · Splits
  {
    id: 'side-splits', name: 'Side Splits', es: 'Apertura lateral', group: 'Splits', level: 'intermediate', seconds: 40, view: 'front',
    setup: { footbar: 'down' }, orientation: 'De pie, un pie en la plataforma y otro en el carro',
    cues: ['Brazos en T', 'Abrí y cerrá desde los aductores', 'Torso vertical'],
    hip: [226, 20], torso: -90, head: -90,
    arms: { near: [-8, 0], far: [188, 180] },
    legs: { near: { to: [262, 97], bend: -1 }, far: { to: [190, 94], bend: 1 } },
  },
  {
    id: 'front-splits', name: 'Front Splits', es: 'Apertura frontal', group: 'Splits', level: 'advanced', seconds: 40,
    setup: { footbar: 'down' }, orientation: 'Pie adelante en la plataforma, pie atrás en el carro',
    cues: ['Talón de atrás contra la hombrera', 'Flexioná la rodilla de adelante', 'Torso alto'],
    hip: [200, 50], torso: -90, head: -90, face: 0,
    arms: { near: [-80, -85], far: [-84, -88] },
    legs: { near: { to: [256, 96], bend: -1, foot: 0 }, far: { to: [133, 89], foot: 60 } },
  },
  {
    id: 'russian-splits', name: 'Russian Splits', es: 'Apertura rusa', group: 'Splits', level: 'super', seconds: 30, review: true,
    setup: { footbar: 'down' }, orientation: 'Pie adelante en el carro, pie atrás en la plataforma',
    cues: ['Bajá la cadera', 'Pierna de atrás larga', 'Brazos arriba'],
    hip: [205, 62], torso: -90, head: -90, face: 180,
    arms: { near: [-100, -95], far: [-96, -91] },
    legs: { near: { to: [150, 92], bend: 1, foot: 180 }, far: { to: [258, 94], foot: 30 } },
  },
  // Feet in straps (repertorio de uso habitual)
  {
    id: 'frog', name: 'Feet in Straps: Frog', es: 'Correas en pies: rana', group: 'Correas en pies', level: 'basic', seconds: 60,
    setup: { carriage: 90, straps: 'feet', footbar: 'down' }, orientation: 'Boca arriba, correas en los pies',
    cues: ['Talones juntos, rodillas abiertas', 'Estirá a 45°', 'Pelvis estable'],
    hip: [166, 92], ...supineHead, arms: { near: [2, 0] }, legs: { near: [-70, 10, 10] },
  },
  {
    id: 'leg-circles', name: 'Feet in Straps: Leg Circles', es: 'Correas en pies: círculos', group: 'Correas en pies', level: 'basic', seconds: 60,
    setup: { carriage: 90, straps: 'feet', footbar: 'down' }, orientation: 'Boca arriba, correas en los pies',
    cues: ['Piernas al techo', 'Círculos hacia afuera y adentro', 'Lumbar estable'],
    hip: [166, 92], ...supineHead, arms: { near: [2, 0] }, legs: { near: [-80, -80, -80] },
  },
  {
    id: 'side-sit-ups', name: 'Side Sit Ups', es: 'Abdominales laterales', group: 'Short Box', level: 'advanced', seconds: 30, view: 'front',
    setup: { box: 'short', footbar: 'down', straps: 'footstrap' }, orientation: 'Sentado de costado en la caja',
    cues: ['Pies bajo la correa', 'Inclinate de costado', 'Volvé largo'],
    hip: [146, 66], torso: -140, head: -145,
    arms: { near: [-150, -150], far: [-146, -146] }, legs: { near: [8, 8, 8], far: [12, 12, 12] },
  },
];

export const POSE_BY_ID = new Map(POSES.map((p) => [p.id, p]));

export function getPose(id) {
  const pose = POSE_BY_ID.get(id);
  if (!pose) throw new Error(`Pose desconocida: ${id}`);
  return pose;
}

export const GROUPS = [...new Set(POSES.map((p) => p.group))];
