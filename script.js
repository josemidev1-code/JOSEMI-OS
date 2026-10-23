/* JOSEMI-OS: estructura HTML, estilos CSS y aplicaciones JavaScript. */

/* === BEGIN script.js === */
/* =========================================================
   JOSEMI-OS · portfolio interactivo
   WM = motor de ventanas. Apps = contenido plug-in.
   Bloques internos: núcleo, arcade, plataformas e interfaz; todos están en este archivo.

   ORDEN MENTAL DEL PROGRAMA
   1. Se recuperan los ajustes guardados.
   2. Apps describe el contenido de cada aplicación.
   3. WM crea, mueve, redimensiona y cierra ventanas.
   4. Los build... conectan el HTML con eventos del usuario.
   5. El bloque de interfaz aplica la interfaz y typeLoginArt escribe la intro: terminal Matrix + rótulo JOSEMI-OS descifrado.
   ========================================================= */
// Atajos: $(selector) devuelve el primer elemento y $$(selector), un array con todos.
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
// sleep permite usar "await sleep(ms)"; pad convierte 7 en "07" para el reloj.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  pad = (n) => String(n).padStart(2, "0");

/* --- Estado persistente --- */
// DEF contiene valores iniciales. Object.assign mezcla encima lo guardado en localStorage.
const DEF = {
  accent: "#6dff9b",
  bg: "#050806",
  wp: 0,
  sound: false,
  motion: false,
};
let state = Object.assign({}, DEF);
try {
  state = Object.assign(
    state,
    JSON.parse(localStorage.getItem("josemi-os") || "{}"),
  );
} catch (e) {}
// Corrige una sola vez el ajuste que antes se activaba automáticamente.
// A partir de aquí, el interruptor de Ajustes conserva la elección del visitante.
if (state.motionPreferenceVersion !== 1) {
  state.motion = false;
  state.motionPreferenceVersion = 1;
}
if (["#6C63FF", "#00C8FF", "#4ade80", "#f5b942"].includes(state.accent))
  state.accent = "#6dff9b";
// localStorage conserva datos aunque se cierre o recargue la pestaña.
const save = () => {
  try {
    localStorage.setItem("josemi-os", JSON.stringify(state));
  } catch (e) {}
};

/* --- Wallpapers (tonos planos estilo Win95) --- */
// El índice 4 es el fondo Matrix: lo anima el motor ASCII.
const WALLS = [
  "radial-gradient(circle at 18% 18%, rgba(40,130,82,.18), transparent 28%), radial-gradient(circle at 78% 70%, rgba(40,110,160,.10), transparent 30%), var(--bg)",
  "radial-gradient(circle at 80% 18%, rgba(53,190,146,.14), transparent 25%), var(--bg)",
  "radial-gradient(circle at 50% 115%, rgba(64,110,210,.18), transparent 38%), var(--bg)",
  "radial-gradient(circle at 15% 85%, rgba(142,82,190,.13), transparent 30%), var(--bg)",
  "matrix",
];
// Un índice guardado no válido vuelve al primer fondo.
if (!Number.isInteger(state.wp) || state.wp < 0 || state.wp >= WALLS.length)
  state.wp = 0;


/* FONDOS PIXEL ART: dibujos propios en una rejilla de 480 × 270.
   Solo rectángulos y pasos enteros: ni fotos, ni filtros, ni archivos extra. */
// GALERÍA GAMER: escenas propias, con el motivo principal en el centro.
// Devuelve false para que el dibujante original siga con los cuatro fondos previos.
function drawExtraPixelWallpaper(kind, r, rand, stars) {
  const cloud = (x, y, c) => {
    r(x, y, 42, 7, c);
    r(x + 8, y - 6, 20, 6, c);
    r(x + 5, y + 7, 32, 3, c);
  };
  const hill = (x, y, w, h, c) => {
    for (let j = 0; j < h; j += 4) {
      const inset = Math.floor(((h - j) * w) / h / 2);
      r(x + inset, y + j, Math.max(1, w - inset * 2), 4, c);
    }
  };
  const triangle = (x, y, size, c) => {
    for (let j = 0; j < size; j++) r(x + size - j, y + j, j * 2 + 1, 1, c);
  };
  const brickwork = (x, y, w, h, c, edge) => {
    r(x, y, w, h, c);
    for (let j = 0; j < h; j += 8) {
      r(x, y + j, w, 1, edge);
      for (let i = j % 16 ? 4 : 0; i < w; i += 12) r(x + i, y + j, 1, 8, edge);
    }
  };
  const pine = (x, y, size = 1) => {
    r(x - 2 * size, y, 4 * size, 20 * size, "#263e3c");
    for (let j = 0; j < 4; j++) {
      const w = (6 + j * 3) * size;
      r(
        x - w,
        y - 30 * size + j * 9 * size,
        w * 2,
        10 * size,
        j % 2 ? "#375453" : "#45655e",
      );
    }
  };
  if (kind === "cyberpunk") {
    r(0, 0, 480, 270, "#30263e");
    ["#0b0f24", "#151631", "#212340", "#30263e"].forEach((c, i) =>
      r(0, i * 54, 480, 54, c),
    );
    stars();
    // Skyline lejano y edificios cercanos con antenas, ventanas y rótulos de neón.
    for (let x = 0; x < 480; x += 17) {
      const h = 35 + Math.floor(rand() * 85);
      r(x, 190 - h, 15, h, "#19223d");
      r(x + 5, 186 - h, 2, 4, "#524065");
    }
    for (let i = 0; i < 8; i++) {
      const x = i * 67 - 20,
        y = 48 + Math.floor(rand() * 65),
        w = 38 + Math.floor(rand() * 17);
      r(x, y, w, 218 - y, "#101a32");
      r(x + 2, y + 2, w - 4, 3, "#46516a");
      r(x + 4, y - 8, 2, 8, "#728795");
      r(x + w - 9, y - 18, 1, 18, "#634a66");
      r(x + w - 4, y + 5, 2, 195 - y, "#254463");
      for (let wy = y + 11; wy < 204; wy += 8)
        for (let wx = x + 7; wx < x + w - 8; wx += 7)
          if (rand() > 0.35)
            r(wx, wy, 3, 4, rand() > 0.5 ? "#3e7c9b" : "#78536a");
    }
    r(91, 101, 28, 51, "#362445");
    r(93, 103, 2, 47, "#d270ad");
    r(115, 103, 2, 47, "#d270ad");
    // Letras geométricas de un cartel: no usa fuentes ni suavizado.
    for (let j = 0; j < 4; j++) {
      r(99, 109 + j * 10, 10, 2, "#d881b5");
      r(101, 112 + j * 10, 2, 4, "#d881b5");
      r(107, 112 + j * 10, 2, 4, "#d881b5");
    }
    r(328, 79, 66, 16, "#0d3548");
    r(330, 81, 62, 2, "#6dcee0");
    r(331, 90, 59, 2, "#4a9da8");
    for (let x = 337; x < 387; x += 8) {
      r(x, 85, 5, 1, "#81cbcb");
      r(x, 86, 1, 4, "#81cbcb");
    }
    // Pasarela centrada y asfalto mojado: reflejos escalonados.
    r(0, 217, 480, 53, "#0b1527");
    r(0, 217, 480, 2, "#668193");
    r(52, 203, 377, 2, "#445b74");
    for (let x = 53; x < 429; x += 23) r(x, 204, 2, 13, "#2e435d");
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(rand() * 480),
        y = 226 + Math.floor(rand() * 42);
      r(x, y, 2 + Math.floor(rand() * 19), 1, i % 3 ? "#223d58" : "#69456a");
    }
    [
      [102, "#a36596"],
      [357, "#4b95a6"],
    ].forEach(([x, c]) => {
      for (let j = 0; j < 9; j++) r(x - j * 2, 225 + j * 4, 20 + j * 4, 1, c);
    });
    r(229, 171, 20, 39, "#070e1d");
    r(225, 187, 5, 22, "#070e1d");
    r(248, 184, 5, 22, "#070e1d");
    r(232, 160, 14, 13, "#111326");
    r(234, 163, 10, 4, "#537b92");
    r(230, 178, 2, 28, "#8f5578");
    r(232, 210, 6, 8, "#060c17");
    r(244, 210, 6, 8, "#060c17");
    // Moto sobre la azotea, a la derecha de la figura.
    [
      [270, 209],
      [298, 209],
    ].forEach(([x, y]) => {
      r(x, y, 12, 9, "#080d1b");
      r(x + 3, y + 2, 6, 5, "#596076");
    });
    r(278, 202, 24, 5, "#784269");
    r(291, 198, 9, 5, "#ac6992");
    r(304, 199, 3, 8, "#71b9c7");
  } else if (kind === "marioWorld") {
    r(0, 0, 480, 270, "#91a19a");
    ["#38495c", "#4b6570", "#657d7c", "#91a19a"].forEach((c, i) =>
      r(0, i * 47, 480, 47, c),
    );
    cloud(44, 42, "#c3c9b6");
    cloud(186, 24, "#c3c9b6");
    cloud(365, 58, "#c3c9b6");
    hill(-48, 119, 180, 105, "#41614b");
    hill(273, 105, 230, 123, "#3a564b");
    hill(70, 156, 145, 69, "#53774e");
    hill(338, 153, 120, 70, "#658159");
    [
      [30, 179],
      [143, 183],
      [354, 170],
    ].forEach(([x, y]) => {
      r(x, y, 1, 7, "#234438");
      r(x + 7, y, 1, 7, "#234438");
    });
    r(0, 226, 480, 44, "#765543");
    r(0, 222, 480, 5, "#7c995d");
    r(0, 227, 480, 3, "#b39466");
    for (let y = 234; y < 270; y += 10)
      for (let x = y % 20 ? 0 : 7; x < 480; x += 16) {
        r(x, y, 13, 7, "#5b4238");
        r(x + 1, y + 1, 10, 1, "#8b664c");
      }
    // Tuberías, bloques de ladrillo y bloque interrogante.
    [
      [85, 190, 34],
      [340, 174, 39],
    ].forEach(([x, y, w]) => {
      r(x, y + 8, w, 222 - y - 8, "#365e49");
      r(x + 4, y + 8, 5, 222 - y - 8, "#6a9861");
      r(x + w - 5, y + 8, 3, 222 - y - 8, "#233f39");
      r(x - 3, y, w + 6, 9, "#527e56");
      r(x - 2, y + 1, w + 4, 2, "#91ad70");
    });
    brickwork(168, 131, 32, 16, "#9e7049", "#533e39");
    brickwork(218, 131, 16, 16, "#9e7049", "#533e39");
    r(201, 130, 16, 17, "#513e34");
    r(202, 131, 14, 14, "#c5a254");
    r(204, 132, 10, 1, "#e1c681");
    r(206, 135, 6, 2, "#6b4d34");
    r(211, 137, 2, 3, "#6b4d34");
    r(208, 139, 3, 2, "#6b4d34");
    r(208, 143, 2, 2, "#6b4d34");
    for (let i = 0; i < 5; i++) {
      const x = 236 + i * 12,
        y = 105 + (i - 2) * (i - 2) * 2;
      r(x, y, 5, 8, "#a58242");
      r(x + 1, y, 3, 7, "#e3c777");
      r(x + 2, y + 1, 1, 5, "#f5dda5");
    }
    // Pequeño héroe de plataformas de gorra roja.
    r(231, 195, 14, 4, "#ad5946");
    r(228, 199, 20, 3, "#c47050");
    r(234, 202, 12, 7, "#d5b08a");
    r(230, 202, 5, 4, "#624a3a");
    r(244, 203, 2, 2, "#28343b");
    r(234, 207, 10, 2, "#624a3a");
    r(232, 209, 13, 6, "#ab5749");
    r(236, 211, 3, 7, "#466080");
    r(242, 211, 3, 7, "#466080");
    r(230, 214, 5, 4, "#d5b08a");
    r(235, 218, 6, 4, "#344c65");
    r(243, 217, 5, 4, "#344c65");
    r(231, 221, 10, 2, "#514138");
    r(243, 220, 9, 3, "#514138");
    // Castillo lejano y bandera; se mantiene como detalle lateral.
    brickwork(407, 186, 36, 36, "#8e8771", "#686b62");
    r(402, 181, 12, 41, "#8e8771");
    r(437, 181, 12, 41, "#8e8771");
    for (let x = 402; x < 449; x += 9) r(x, 177, 5, 7, "#b7b095");
    r(422, 210, 9, 12, "#4b5552");
  } else if (kind === "zeldaForest") {
    r(0, 0, 480, 270, "#172d2b");
    r(0, 26, 480, 244, "#223d32");
    // Copas en capas con ventanas de luz y suelo cubierto de hojas.
    const canopy = (x, y, s = 1) => {
      r(x + 12 * s, y + 13 * s, 5 * s, 65 * s, "#3c3c2b");
      r(x + 14 * s, y + 16 * s, 2 * s, 60 * s, "#665340");
      r(x, y, 32 * s, 19 * s, "#183a2d");
      r(x + 5 * s, y - 9 * s, 23 * s, 13 * s, "#2d5137");
      r(x - 7 * s, y + 12 * s, 44 * s, 17 * s, "#294b33");
      r(x + 2 * s, y + 9 * s, 28 * s, 13 * s, "#385e3b");
      r(x + 6 * s, y + 2 * s, 14 * s, 4 * s, "#52774b");
    };
    for (let x = -20; x < 480; x += 51)
      canopy(x, 23 + Math.floor(rand() * 28), 2);
    r(193, 107, 94, 137, "#4b5c40");
    r(210, 91, 59, 160, "#59684a");
    for (let i = 0; i < 180; i++) {
      const x = Math.floor(rand() * 480),
        y = 110 + Math.floor(rand() * 160);
      r(x, y, 2, 1, i % 4 ? "#37573a" : "#809063");
    }
    [
      [20, 104],
      [89, 92],
      [335, 88],
      [408, 105],
      [3, 186],
      [367, 196],
    ].forEach(([x, y]) => canopy(x, y, 2));
    // Ruinas de templo, dos columnas y un altar central.
    [
      [179, 121],
      [286, 121],
    ].forEach(([x, y]) => {
      r(x, y, 15, 96, "#415950");
      r(x + 2, y + 4, 5, 89, "#69806b");
      r(x - 3, y - 4, 21, 8, "#82917b");
      r(x - 4, y + 90, 23, 8, "#798973");
      r(x + 9, y + 33, 6, 2, "#233e36");
    });
    r(194, 114, 92, 8, "#5d7665");
    r(199, 110, 82, 4, "#8b9980");
    r(211, 100, 58, 10, "#476452");
    triangle(232, 80, 8, "#cabd7e");
    triangle(223, 89, 8, "#cabd7e");
    triangle(241, 89, 8, "#cabd7e");
    r(209, 216, 63, 9, "#4b6256");
    r(215, 205, 51, 11, "#6b7d69");
    r(221, 199, 39, 6, "#a3ae8a");
    r(225, 205, 3, 9, "#89977b");
    r(249, 205, 5, 7, "#40594d");
    // Espada de la leyenda en la piedra, con destello discreto.
    r(238, 153, 4, 47, "#b9cbc0");
    r(240, 156, 1, 42, "#e2e1bd");
    r(237, 146, 6, 9, "#504f72");
    r(227, 151, 26, 4, "#7771a0");
    r(231, 151, 4, 7, "#7771a0");
    r(246, 151, 4, 7, "#7771a0");
    r(238, 133, 4, 15, "#797394");
    r(237, 130, 6, 4, "#bcae69");
    r(261, 155, 1, 9, "#e2d8a1");
    r(257, 159, 9, 1, "#e2d8a1");
    // Flores y pequeñas setas al borde del sendero.
    for (let i = 0; i < 32; i++) {
      const x = Math.floor(rand() * 480),
        y = 215 + Math.floor(rand() * 52);
      if (Math.abs(x - 240) > 47) {
        r(x, y, 1, 4, "#657c45");
        r(x - 1, y - 1, 3, 2, i % 3 ? "#adad72" : "#a37460");
      }
    }
  } else if (kind === "sonicCoast") {
    ["#29435c", "#3d6076", "#5a8191", "#83a6aa"].forEach((c, i) =>
      r(0, i * 45, 480, 45, c),
    );
    cloud(27, 32, "#b9c7c0");
    cloud(187, 49, "#b9c7c0");
    cloud(371, 25, "#b9c7c0");
    r(0, 165, 480, 62, "#487886");
    for (let y = 170; y < 220; y += 7)
      for (let x = 0; x < 480; x += 47) r(x + (y % 3) * 9, y, 21, 1, "#83aaa9");
    hill(-50, 104, 150, 102, "#466e6c");
    hill(327, 111, 164, 107, "#365c65");
    r(347, 118, 14, 97, "#9dbfbb");
    r(351, 118, 4, 97, "#cad7c9");
    r(342, 213, 23, 3, "#c4d6c5");
    // Suelo a cuadros y césped en dientes de píxel.
    r(0, 227, 480, 43, "#79513b");
    for (let y = 228; y < 270; y += 10)
      for (let x = 0; x < 480; x += 10)
        if ((x + y) % 20 < 10) r(x, y, 10, 10, "#a4764b");
    r(0, 221, 480, 7, "#436747");
    r(0, 221, 480, 2, "#8ba461");
    for (let x = 0; x < 480; x += 8) r(x, 226, 4, 4, "#557c4e");
    // Bucle central: contorno escalonado construido con rectángulos.
    const ring = (cx, cy, rx, ry, c, thick) => {
      for (let y = -ry; y <= ry; y++) {
        const x = Math.round(
          rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))),
        );
        r(cx - x, cy + y, thick, 1, c);
        r(cx + x - thick + 1, cy + y, thick, 1, c);
      }
    };
    ring(244, 182, 46, 42, "#583e32", 14);
    ring(244, 182, 46, 42, "#9a7046", 10);
    ring(244, 182, 46, 42, "#547e4d", 3);
    r(216, 138, 56, 3, "#7d9c5c");
    // Palmeras y cocos en los extremos.
    [
      [90, 125],
      [390, 143],
    ].forEach(([x, y]) => {
      for (let j = 0; j < 80; j += 5) {
        r(x + j / 12, y + j, 7, 6, "#79583e");
        r(x + j / 12, y + j, 2, 2, "#b08b54");
      }
      for (let side of [-1, 1])
        for (let j = 0; j < 27; j += 3) {
          r(x + side * j, y - 8 + j / 4, 10, 4, "#4e794d");
          r(x + side * j, y - 13 - j / 5, 8, 3, "#729654");
        }
      r(x, y - 1, 5, 5, "#8c6f46");
    });
    [
      [195, 128],
      [218, 116],
      [242, 111],
      [266, 117],
      [289, 130],
    ].forEach(([x, y]) => {
      r(x, y, 7, 2, "#e0bd65");
      r(x, y + 7, 7, 2, "#e0bd65");
      r(x - 1, y + 2, 2, 5, "#c89946");
      r(x + 6, y + 2, 2, 5, "#f0d58b");
    });
    // Corredor azul con zapatillas rojas: sprite original de la escena.
    r(149, 198, 13, 13, "#356783");
    r(146, 201, 5, 8, "#356783");
    r(146, 195, 10, 4, "#467f9a");
    r(143, 198, 6, 3, "#356783");
    r(144, 205, 5, 3, "#356783");
    r(158, 201, 8, 6, "#bcc9b7");
    r(161, 202, 2, 3, "#243949");
    r(154, 210, 8, 8, "#42738b");
    r(159, 211, 4, 6, "#c6c5a5");
    r(150, 218, 9, 3, "#b46d55");
    r(162, 218, 11, 3, "#b46d55");
    r(149, 221, 12, 2, "#d9d2ae");
    r(162, 221, 13, 2, "#d9d2ae");
  } else if (kind === "hollowCavern") {
    r(0, 0, 480, 270, "#091424");
    stars();
    // Arcos azulados en profundidad y luces de la ciudad subterránea.
    for (let i = 0; i < 7; i++) {
      const x = i * 80 - 20;
      r(x, 47, 37, 178, "#142d40");
      r(x + 5, 51, 25, 169, "#1b3d51");
      r(x + 10, 58, 15, 152, "#102a3e");
      r(x + 33, 40, 40, 6, "#254453");
      r(x + 37, 46, 32, 4, "#183649");
    }
    for (let x = 8; x < 480; x += 17) {
      const h = 15 + Math.floor(rand() * 48);
      r(x, 0, 10, h, "#070f1c");
      r(x + 3, h, 4, 10, "#070f1c");
    }
    for (let i = 0; i < 45; i++) {
      const x = Math.floor(rand() * 480),
        y = 50 + Math.floor(rand() * 153);
      r(x, y, 1, 2, i % 3 ? "#497184" : "#87a8ae");
    }
    // Arco del santuario en el centro, escalonado como piedra tallada.
    r(181, 113, 13, 112, "#304c5b");
    r(286, 113, 13, 112, "#304c5b");
    r(185, 107, 110, 7, "#47636c");
    r(194, 95, 92, 12, "#355462");
    r(206, 83, 68, 12, "#2a495c");
    r(216, 79, 48, 4, "#65848a");
    r(196, 119, 88, 105, "#0c1f31");
    r(212, 109, 56, 11, "#0c1f31");
    r(0, 230, 480, 40, "#0b1623");
    r(0, 227, 480, 3, "#476070");
    for (let x = 0; x < 480; x += 31) r(x, 232, 22, 1, "#213c4d");
    // Farola, banquillo y hongos luminescentes.
    r(321, 158, 3, 69, "#4c646c");
    r(314, 153, 17, 4, "#658189");
    r(316, 157, 12, 18, "#365564");
    r(319, 160, 6, 10, "#b4ccc3");
    r(310, 174, 24, 3, "#4d6b78");
    r(249, 210, 49, 3, "#69818a");
    r(252, 218, 43, 3, "#405762");
    r(254, 213, 3, 13, "#49616d");
    r(288, 213, 3, 13, "#49616d");
    [
      [56, 207],
      [109, 218],
      [405, 206],
      [436, 220],
    ].forEach(([x, y]) => {
      r(x + 6, y, 3, 22, "#456672");
      r(x, y - 3, 15, 5, "#6c939e");
      r(x + 3, y - 6, 9, 3, "#9bb6b4");
      r(x + 2, y + 2, 11, 2, "#254453");
    });
    // Máscara con cuernos y capa, dibujada en bloques propios.
    r(227, 180, 24, 18, "#c4d0c6");
    r(230, 176, 18, 4, "#dbe0cc");
    r(224, 167, 5, 18, "#bbc9c2");
    r(249, 167, 5, 18, "#bbc9c2");
    r(222, 161, 4, 10, "#d0d8c7");
    r(252, 161, 4, 10, "#d0d8c7");
    r(231, 185, 5, 7, "#112134");
    r(242, 185, 5, 7, "#112134");
    r(229, 198, 20, 20, "#344358");
    r(225, 210, 28, 8, "#26374b");
    r(232, 218, 5, 9, "#0a1727");
    r(243, 218, 5, 9, "#0a1727");
    r(251, 204, 15, 2, "#a5bab8");
    r(254, 201, 2, 8, "#637885");
  } else if (kind === "godOfWarPixel") {
    r(0, 0, 480, 270, "#789098");
    ["#25313c", "#3a4a55", "#506671", "#789098"].forEach((c, i) =>
      r(0, i * 43, 480, 43, c),
    );
    // Montañas nórdicas de nieve, lago y bosque en capas.
    [
      [-20, 88, 180, 101],
      [106, 54, 179, 139],
      [267, 68, 225, 124],
    ].forEach(([x, y, w, h]) => {
      hill(x, y, w, h, "#526c74");
      hill(x + w / 4, y, w / 2, h / 3, "#a9b9b6");
    });
    r(0, 181, 480, 68, "#38545f");
    for (let y = 186; y < 249; y += 7)
      for (let x = 0; x < 480; x += 61) r(x + (y % 3) * 9, y, 35, 1, "#64818a");
    for (let x = 0; x < 480; x += 31)
      if (Math.abs(x - 240) > 72) pine(x, 188 + Math.floor(rand() * 12));
    // Ruinas y runas: los glifos están hechos con segmentos de píxel.
    [
      [160, 125],
      [297, 125],
    ].forEach(([x, y]) => {
      r(x, y, 23, 110, "#3c5157");
      r(x + 2, y + 3, 7, 104, "#748789");
      r(x + 10, y + 7, 8, 88, "#4d6469");
      r(x - 4, y - 6, 31, 9, "#9aaaa4");
      r(x - 5, y + 100, 33, 9, "#859795");
      for (let j = 0; j < 3; j++) {
        r(x + 11, y + 20 + j * 20, 1, 11, "#97b5b1");
        r(x + 12, y + 22 + j * 20, 4, 1, "#97b5b1");
        r(x + 12, y + 27 + j * 20, 4, 1, "#97b5b1");
      }
    });
    r(181, 117, 116, 8, "#526c71");
    r(194, 109, 89, 8, "#93a6a2");
    r(212, 106, 52, 3, "#b0bab0");
    // Ribera rocosa, escarcha y guerrero con marca roja.
    r(0, 246, 480, 24, "#253c44");
    for (let x = 0; x < 480; x += 13) {
      const h = 3 + Math.floor(rand() * 10);
      r(x, 245 - h, 12, h, "#5d777c");
      r(x, 245 - h, 9, 2, "#a9b9b4");
    }
    r(227, 185, 25, 41, "#2a3942");
    r(230, 176, 19, 16, "#b8b5a4");
    r(232, 181, 16, 11, "#c4c1ad");
    r(235, 192, 13, 10, "#655b50");
    r(244, 179, 3, 11, "#a6655c");
    r(229, 198, 5, 24, "#a6655c");
    r(225, 198, 6, 19, "#9c9e91");
    r(250, 198, 6, 19, "#9c9e91");
    r(229, 216, 22, 9, "#5c5550");
    r(232, 225, 6, 16, "#27323a");
    r(245, 225, 6, 16, "#27323a");
    r(229, 239, 10, 5, "#454a4b");
    r(244, 239, 10, 5, "#454a4b");
    // Hacha de hoja fría junto al personaje.
    r(263, 172, 3, 68, "#806c50");
    r(262, 165, 5, 11, "#b3bcb4");
    r(266, 168, 13, 18, "#638992");
    r(275, 170, 9, 14, "#9cbdba");
    r(280, 173, 7, 8, "#c4d8cb");
    r(269, 177, 7, 2, "#b3ceca");
    for (let i = 0; i < 38; i++)
      r(Math.floor(rand() * 480), Math.floor(rand() * 210), 1, 1, "#b5c4bf");
  } else return false;
  return true;
}

function drawPixelWallpaper(kind) {
  let shapes = [];
  const r = (x, y, w, h, color) =>
    shapes.push(
      `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(h)}" fill="${color}"/>`,
    );
  let seed = 87;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const stars = () => {
    for (let i = 0; i < 100; i++)
      r(
        Math.floor(rand() * 480),
        Math.floor(rand() * 130),
        1,
        1,
        i % 4 ? "#435766" : "#9ea99b",
      );
  };
  if (drawExtraPixelWallpaper(kind, r, rand, stars)) {
    // La escena nueva ya está dibujada.
  } else if (kind.startsWith("matrix")) {
    r(0, 0, 480, 270, "#041012");
    // Cada signo se dibuja en una matriz de 3 × 5, en verde y cian.
    const glyphs = [
      "111101101101111",
      "010110010010111",
      "111001111100111",
      "101101111001001",
    ];
    for (let x = 4; x < 480; x += 12) {
      const head = Math.floor(rand() * 160),
        length = 5 + Math.floor(rand() * 11);
      for (let j = 0; j < length; j++) {
        const bits = glyphs[Math.floor(rand() * glyphs.length)],
          y = head - j * 8;
        const c = j === 0 ? "#a1efc1" : x % 36 === 4 ? "#164c57" : "#18523b";
        for (let k = 0; k < 15; k++)
          if (bits[k] === "1" && y >= 0)
            r(x + (k % 3), y + Math.floor(k / 3), 1, 1, c);
      }
    }
    if (kind === "matrixCity") {
      // Ciudad nocturna escalonada; la silueta está en el centro del encuadre.
      for (let x = 0; x < 480; x += 20) {
        const h = 30 + Math.floor(rand() * 65),
          y = 230 - h;
        r(x, y, 18, h, "#0a2427");
        r(x + 2, y - 3, 14, 3, "#10343a");
        for (let wy = y + 7; wy < 228; wy += 8)
          for (let wx = x + 3; wx < x + 16; wx += 5)
            if (rand() > 0.48) r(wx, wy, 2, 3, "#22725e");
      }
      r(0, 233, 480, 37, "#020b10");
      r(104, 223, 274, 4, "#306456");
      r(104, 227, 274, 6, "#102929");
      r(223, 170, 32, 53, "#02070d");
      r(218, 188, 7, 35, "#02070d");
      r(255, 188, 7, 35, "#02070d");
      r(229, 154, 19, 18, "#040b12");
      r(228, 157, 22, 5, "#16272a");
      r(227, 172, 3, 46, "#1c3e3c");
      r(230, 164, 6, 2, "#72b994");
      r(241, 164, 6, 2, "#72b994");
      r(225, 223, 10, 10, "#04060a");
      r(244, 223, 11, 10, "#04060a");
      r(169, 226, 6, 6, "#448e67");
      r(302, 226, 6, 6, "#348590");
    } else {
      // Portal de código: anillos de bloques, sin degradados suavizados.
      for (let i = 0; i < 10; i++) {
        const n = i * 7;
        const c = i % 2 ? "#164746" : "#236757";
        r(150 + n, 46 + n, 180 - n * 2, 2, c);
        r(150 + n, 224 - n, 180 - n * 2, 2, c);
        r(150 + n, 46 + n, 2, 180 - n * 2, c);
        r(328 - n, 46 + n, 2, 180 - n * 2, c);
      }
      r(213, 113, 54, 48, "#031010");
      r(226, 128, 8, 8, "#79dd99");
      r(238, 136, 8, 8, "#79dd99");
      r(226, 144, 8, 8, "#79dd99");
      r(253, 146, 11, 3, "#66aebe");
    }
  } else if (kind === "minecraft") {
    const sky = ["#253745", "#324953", "#405b62", "#597475"];
    sky.forEach((c, i) => r(0, i * 35, 480, 35, c));
    stars();
    r(335, 28, 26, 26, "#d9d3a4");
    r(340, 33, 16, 16, "#efe2b6");
    // Nubes de bloques y montañas lejanas en capas.
    [
      [55, 37],
      [191, 19],
      [384, 66],
    ].forEach(([x, y]) => {
      r(x, y, 41, 7, "#728386");
      r(x + 7, y - 5, 22, 5, "#728386");
      r(x + 7, y + 7, 40, 3, "#4a6268");
    });
    for (let x = 0; x < 480; x += 16) {
      const h = 22 + Math.floor(rand() * 30);
      r(x, 140 - h, 16, h + 65, "#2c4a46");
    }
    r(0, 156, 480, 114, "#23382f");
    // Río central entre las terrazas: el motivo sigue visible en vertical.
    for (let y = 158; y < 270; y += 8) {
      const w = 24 + Math.floor((y - 158) * 1.6);
      r(240 - w / 2, y, w, 8, y % 16 ? "#315d67" : "#3f7179");
    }
    for (let side = 0; side < 2; side++)
      for (let level = 0; level < 4; level++) {
        const w = 180 - level * 21,
          x = side ? 480 - w : 0,
          y = 140 + level * 26;
        r(x, y, w, 6, "#53734a");
        r(x, y + 6, w, 20, "#493e32");
        r(x, y + 6, w, 2, "#2d372b");
        for (let k = 0; k < Math.floor(w / 9); k++) {
          const dx = x + Math.floor(rand() * w);
          r(
            dx,
            y + 9 + Math.floor(rand() * 12),
            3,
            3,
            k % 2 ? "#63513d" : "#332f28",
          );
        }
        for (let k = 0; k < Math.floor(w / 11); k++)
          r(x + Math.floor(rand() * w), y + 1, 3, 2, "#78905b");
      }
    const tree = (x, y, s = 1) => {
      r(x + 10 * s, y, 5 * s, 36 * s, "#544332");
      r(x + 12 * s, y, 2 * s, 34 * s, "#776145");
      r(x, y - 13 * s, 26 * s, 18 * s, "#244d37");
      r(x + 4 * s, y - 24 * s, 19 * s, 14 * s, "#315f3b");
      r(x + 6 * s, y - 21 * s, 10 * s, 4 * s, "#4a7745");
      r(x - 4 * s, y - 4 * s, 32 * s, 10 * s, "#315d3c");
    };
    tree(77, 125);
    tree(128, 143);
    tree(355, 151);
    tree(409, 139, 2);
    // Pequeño refugio y antorcha junto al río.
    r(212, 144, 24, 22, "#67543c");
    r(210, 140, 28, 5, "#856745");
    r(215, 147, 6, 6, "#24484a");
    r(225, 150, 6, 16, "#322c26");
    r(235, 157, 2, 9, "#815b3c");
    r(234, 154, 4, 4, "#efb760");
    for (let i = 0; i < 38; i++) {
      const x = Math.floor(rand() * 480),
        y = 230 + Math.floor(rand() * 40);
      if (Math.abs(x - 240) > 100) {
        r(x, y, 1, 4, "#678154");
        if (i % 7 === 0) r(x - 1, y - 1, 3, 2, "#cc9a68");
      }
    }
  } else {
    // Laboratorio de arcade: acero, cables, raíles y bandas amarillas.
    r(0, 0, 480, 270, "#121b2d");
    for (let x = 0; x < 480; x += 80) {
      r(x, 36, 78, 176, "#283348");
      r(x + 2, 38, 74, 3, "#3d4960");
      r(x + 3, 44, 72, 164, "#303e55");
      r(x + 4, 202, 70, 5, "#223045");
    }
    r(0, 12, 480, 13, "#414f63");
    r(0, 14, 480, 3, "#647186");
    r(0, 26, 480, 6, "#0c1527");
    for (let y = 42; y < 67; y += 5) {
      r(0, y, 480, 2, "#152337");
      r(0, y + 2, 480, 1, "#47536a");
    }
    r(0, 128, 480, 5, "#8a743b");
    r(0, 143, 480, 4, "#b19a49");
    // Escalón de la banda industrial.
    for (let x = 90; x < 118; x += 3) {
      r(x, 128 + (x - 90), 3, 5, "#8a743b");
      r(x, 143 + (x - 90), 3, 4, "#b19a49");
    }
    r(118, 156, 226, 5, "#8a743b");
    r(118, 171, 226, 4, "#b19a49");
    for (let x = 344; x < 372; x += 3) {
      r(x, 156 - (x - 344), 3, 5, "#8a743b");
      r(x, 171 - (x - 344), 3, 4, "#b19a49");
    }
    [74, 318].forEach((x) => {
      r(x, 30, 12, 191, "#101c31");
      r(x + 3, 33, 6, 185, "#48566e");
      r(x + 4, 36, 2, 178, "#6b7483");
      r(x - 3, 34, 18, 7, "#27364c");
      r(x - 3, 204, 18, 11, "#283b50");
    });
    // Puerta blindada centrada, detalle importante también en móvil.
    r(211, 159, 58, 68, "#172036");
    r(217, 165, 46, 60, "#48536a");
    r(222, 170, 36, 55, "#0c182a");
    r(225, 173, 30, 49, "#29354b");
    r(228, 178, 24, 42, "#152039");
    r(237, 181, 3, 38, "#354157");
    r(210, 226, 61, 6, "#cab25a");
    for (let x = 210; x < 270; x += 9) r(x, 226, 4, 6, "#172133");
    [
      [108, 200],
      [288, 196],
    ].forEach(([x, y]) => {
      r(x, y, 24, 27, "#4a5967");
      r(x + 2, y + 2, 20, 9, "#809399");
      r(x + 4, y + 4, 13, 5, "#334f52");
      r(x + 4, y + 17, 8, 2, "#d3b95c");
      r(x + 3, y + 26, 18, 3, "#162539");
    });
    // Jetpack original, étincelles y monedas; nada extraído del juego.
    r(172, 108, 9, 18, "#17243b");
    r(169, 113, 4, 11, "#778794");
    r(181, 108, 10, 11, "#ddb07a");
    r(179, 106, 12, 4, "#72523e");
    r(181, 119, 9, 9, "#b98842");
    r(177, 128, 5, 8, "#273047");
    r(187, 128, 5, 8, "#273047");
    r(172, 127, 6, 10, "#edb044");
    r(173, 135, 4, 7, "#f5d77a");
    r(175, 141, 2, 6, "#ea8d43");
    r(188, 111, 2, 2, "#182137");
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 5; i++) {
        const x = 252 + i * 10,
          y = 97 + j * 10;
        r(x, y, 5, 7, "#b57c2b");
        r(x + 1, y, 3, 6, "#efc860");
        r(x + 2, y + 1, 1, 4, "#fff0ab");
      }
    r(0, 233, 480, 37, "#101d2b");
    r(0, 236, 480, 3, "#76808b");
    r(0, 245, 480, 8, "#45505f");
    r(0, 253, 480, 3, "#819095");
    for (let x = 0; x < 480; x += 60) {
      r(x, 239, 2, 15, "#151f2e");
      r(x + 22, 251, 30, 2, "#9ca7a9");
    }
  }
  // Agrupa colores consecutivos manteniendo el orden de las capas.
  const layers = [];
  shapes.forEach((shape) => {
    const [, x, y, w, h, color] = shape.match(
      /x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" fill="([^"]+)"/,
    );
    if (layers.at(-1)?.[0] !== color) layers.push([color, ""]);
    layers.at(-1)[1] += `M${x} ${y}h${w}v${h}h-${w}z`;
  });
  const paths = [...layers]
    .map(([color, d]) => `<path fill="${color}" d="${d}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" shape-rendering="crispEdges">${paths}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
const PIXEL_WALLPAPERS = Object.fromEntries(
  [
    ["matrixCity", "Matrix · azotea", "Ciudad, código y silueta"],
    ["matrixCode", "Matrix · portal", "Código verde y cian"],
    ["minecraft", "Minecraft · valle", "Bloques, río y refugio"],
    ["jetpack", "Jetpack · laboratorio", "Arcade industrial y monedas"],
    ["cyberpunk", "Cyberpunk · neón", "Azotea, moto y ciudad nocturna"],
    ["marioWorld", "Mario · mundo retro", "Tuberías, bloques y castillo"],
    ["zeldaForest", "Zelda · bosque sagrado", "Ruinas y espada en la piedra"],
    ["sonicCoast", "Sonic · costa", "Palmeras, anillos y bucle"],
    ["hollowCavern", "Hollow Knight · cavernas", "Santuario azul y máscara"],
    ["godOfWarPixel", "God of War · nórdico", "Lago helado, runas y hacha"],
  ].map(([id, name, detail]) => [
    id,
    { name, detail, url: drawPixelWallpaper(id) },
  ]),
);
function selectPixelWallpaper(id) {
  if (!PIXEL_WALLPAPERS[id]) return false;
  state.wallpaper = id;
  if (!state.universeUserAtmosphere) state.atmosphere = "none";
  state.wp = 0;
  applyTheme();
  save();
  return true;
}

/* --- Aplicar tema (colors + wallpaper + matrix) --- */
// El fondo base define los colores; shell.js controla una única animación ASCII.
function applyTheme() {
  document.documentElement.style.setProperty("--accent", state.accent);
  document.documentElement.style.setProperty(
    "--accent-soft",
    state.accent + "1f",
  );
  document.documentElement.style.setProperty("--bg", state.bg);
  const bg = $("#bg");
  // Con el fondo Matrix (wp 4) la lluvia la dibuja el motor ASCII sobre negro.
  if (bg) bg.style.background = state.wp === 4 ? "#000" : WALLS[state.wp];
  document.body.classList.toggle("reduce-motion", state.motion);
}
applyTheme();

/* --- Sonido Win95 "ding" (Web Audio, sin archivos) --- */
let AC;
// SONIDO: crea un tono corto con Web Audio; solo suena si el usuario lo activa.
function beep() {
  if (!state.sound) return;
  try {
    // Web Audio genera dos notas cuadradas; no hace falta descargar un archivo de sonido.
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime;
    [
      [1046, 0.08],
      [784, 0.14],
    ].forEach(([f, d], i) => {
      const o = AC.createOscillator(),
        g = AC.createGain();
      o.type = "square";
      o.frequency.value = f;
      o.connect(g);
      g.connect(AC.destination);
      const s = t + i * 0.09;
      g.gain.setValueAtTime(0.04, s);
      g.gain.exponentialRampToValueAtTime(0.0001, s + d);
      o.start(s);
      o.stop(s + d);
    });
  } catch (e) {}
}
// Una notificación "toast" se crea, se anima y se elimina para no acumular nodos en el DOM.
function toast(m) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = m;
  $("#toasts").appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(20px)";
    t.style.transition = ".3s";
  }, 2600);
  setTimeout(() => t.remove(), 3000);
}

/* ========================================================= APPS
   Cada propiedad es una aplicación. render() devuelve su HTML y bind(), cuando
   existe, conecta eventos después de insertar ese HTML en una ventana.
   Añadir una app nueva aquí y su id en ICONS basta para mostrarla en el sistema.
   ========================================================= */
// CONTENIDO: datos del autor. Las ventanas leen este objeto para mostrar el portfolio.
const PROFILE = {
  nombre: "José Miguel Miralles Gandia",
  corto: "Josemi",
  rol: "Desarrollador de software en proceso",
  estudios:
    "DAM · Desarrollo de Aplicaciones Multiplataforma · IES Dr. Lluís Simarro",
  estado: "Aprendiendo mientras construyo proyectos reales",
  ubicacion: "España",
  bio: "Soy estudiante de DAM y me interesa especialmente el mundo de la informática. Ahora mismo estoy profundizando en HTML, CSS y JavaScript construyendo este portfolio, y me gusta utilizar la IA como una herramienta para aprender, crear y resolver problemas con más posibilidades.",
  aspiracion:
    "Aspiro a desarrollar automatizaciones y aplicaciones para grandes empresas, combinando programación, inteligencia artificial y mucha creatividad para construir soluciones útiles.",
  gustos: [
    "Informática",
    "Inteligencia artificial",
    "Automatización",
    "Creatividad",
    "Gimnasio",
    "Boxeo",
    "Running",
    "E-commerce / dropshipping",
  ],
};

const pixelIcon = (tipo) =>
  `<span class="app-pixel-icon app-pixel-icon--${tipo}" aria-hidden="true"></span>`;

// APLICACIONES: cada entrada tiene título, icono, render() para el HTML y bind() para los eventos.
const Apps = {


  // HABILIDADES: barras visuales con porcentajes; no son mediciones automáticas.
  skills: {
    title: "Habilidades",
    icon: "⚡",
    render: () => `
   <div class="app-title">STACK / ESTADO ACTUAL</div>
   <div class="skill-focus">
     <span class="card-kicker">TRABAJANDO AHORA</span>
     <div class="skill-big"><span>HTML</span><span>CSS</span><span>JavaScript</span></div>
     <p>Son las tecnologías con las que más estoy trabajando actualmente porque estoy desarrollando JOSEMI-OS.</p>
   </div>
   <div class="content-grid content-grid--compact">
     <article class="content-card"><span class="card-kicker">FORMACIÓN DAM</span><h3>Base de desarrollo</h3><p>Programación, aplicaciones multiplataforma y bases de datos dentro de mi formación. Prefiero no poner porcentajes falsos: mi nivel sigue creciendo.</p></article>
     <article class="content-card"><span class="card-kicker">ENFOQUE</span><h3>IA + automatización</h3><p>Estoy aprendiendo a utilizar la IA para acelerar desarrollo, crear automatizaciones y construir aplicaciones con más creatividad.</p></article>
     <article class="content-card"><span class="card-kicker">HERRAMIENTAS</span><h3>Git & GitHub</h3><p>Uso Git y GitHub para versionar este portfolio y seguir aprendiendo un flujo de trabajo real.</p></article>
     <article class="content-card"><span class="card-kicker">SIGUIENTE PASO</span><h3>Más proyectos</h3><p>La prioridad es construir, equivocarme, corregir y convertir cada proyecto en evidencia real de lo que sé hacer.</p></article>
   </div>`,
  },

  // TERMINAL: guarda el historial visible y envía cada línea al intérprete runCommand.
  terminal: {
    title: "Terminal",
    icon: "💻",
    render: () => `
   <div class="term"><div class="term__out" id="term-out"></div>
   <div class="term__line"><span class="p">josemi@portfolio</span>:<span class="dir">~</span>$<input class="term__in" id="term-in" autocomplete="off" spellcheck="false"></div></div>`,
    bind(b) {
      const out = $("#term-out", b),
        inp = $("#term-in", b);
      const print = (h, c = "") => {
        const d = document.createElement("div");
        d.className = c;
        d.innerHTML = h;
        out.appendChild(d);
        out.scrollTop = out.scrollHeight;
      };
      print('Terminal de JOSEMI-OS · escribe <span class="ok">ayuda</span>');
      inp.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const raw = inp.value.trim();
        inp.value = "";
        print(
          `<span class="p">josemi@portfolio</span>:<span class="dir">~</span>$ ${escapeHTML(raw)}`,
        );
        runCommand(raw, print, openWindow);
      });
      b.addEventListener("click", () => inp.focus());
    },
  },

  // README: vista HTML del texto de presentación, escrita en el código.
  readme: {
    title: "README.md",
    icon: "📄",
    render: () => `
   <article class="markdown-view">
     <div class="md-path">~/JOSEMI-OS/README.md</div>
     <h1>JOSEMI-OS</h1>
     <blockquote><strong> Este es mi primer proyecto personal como desarrollador de software.</strong></blockquote>
     <p>JOSEMI-OS es mi portfolio convertido en un pequeño sistema operativo interactivo. No quería hacer una web típica de “sobre mí + proyectos + contacto”, así que decidí construir un espacio que se pueda explorar, abrir, tocar y descubrir.</p>
     <h2>¿Quién soy?</h2>
     <p>Soy <strong>José Miguel Miralles Gandia</strong>, estudiante de <strong>DAM (Desarrollo de Aplicaciones Multiplataforma) en IES Dr. Lluís Simarro</strong> y desarrollador de software en proceso.</p>
     <p>Ahora mismo estoy trabajando especialmente con <code>HTML</code>, <code>CSS</code> y <code>JavaScript</code>. Me interesa la informática, la inteligencia artificial y el potencial de combinar software, automatización y creatividad.</p>
     <h2>¿Qué es esta web?</h2>
     <ul><li>Un portfolio interactivo presentado como un sistema operativo propio.</li><li>Un laboratorio para practicar frontend, interacción y JavaScript.</li><li>Un proyecto que irá creciendo conmigo.</li><li>Un sitio con aplicaciones, terminal, Arcade, easter eggs y acertijos.</li></ul>
     <h2>Cómo explorar</h2>
     <p>Doble clic abre aplicaciones. Las ventanas se pueden mover, minimizar, maximizar y redimensionar. El clic derecho abre acciones rápidas. En la terminal, <code>ayuda</code> es un buen comienzo.</p>
     <h2>Easter eggs</h2>
     <p>Hay secretos escondidos por el sistema. No voy a poner aquí las soluciones. Si encuentras algo raro, puede que no sea un bug.</p>
     <div class="md-sign">JOSEMI-OS // build, learn, repeat.</div>
   </article>`,
  },


  // PAPELERA: archivos ficticios para la metáfora del escritorio; no borra archivos del ordenador.
  trash: {
    title: "Papelera",
    icon: "🗑",
    render: () => `
   <div class="app-title">/home/josemi/.papelera</div>
   <div class="file-row" data-file="motivación.exe"><span class="g">⚙️</span> motivacion.exe</div>
   <div class="file-row" data-file="x"><span class="g">📄</span> Josemiprimeraweb.old</div>
   <div class="file-row" data-file="x"><span class="g">🗜️</span> proyecto-fallido.zip</div>
   <div class="file-row" data-file="x"><span class="g">📄</span> todo-final-final-ahora-si.html</div>`,
    bind(b) {
      b.querySelectorAll(".file-row").forEach((row) => {
        const openFile = () => {
          if (row.dataset.file === "motivación.exe") openWindow("motivation");
          else toast("No trabajo con motivación, trabajo con disciplina.");
        };
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.addEventListener("click", (event) => {
          if (event.pointerType === "touch" || matchMedia("(pointer: coarse)").matches) openFile();
        });
        row.addEventListener("dblclick", (event) => {
          if (event.pointerType !== "touch" && !matchMedia("(pointer: coarse)").matches) openFile();
        });
        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFile();
          }
        });
      });
    },
  },


  // MONITOR: información disponible del navegador y tiempo de sesión, no acceso a CPU o RAM real.
  system: {
    title: "Monitor del sistema",
    icon: "🖥️",
    render: () => `
   <div class="app-title">JOSEMI-OS · ESTADO: <span style="color:var(--accent)">EN LÍNEA</span></div>
   <div class="sys-grid">
     <div class="sys-card"><b id="sys-uptime">0s</b><span>Tiempo de sesión</span></div>
     <div class="sys-card"><b id="sys-time">--:--</b><span>Hora actual</span></div>
     <div class="sys-card"><b id="sys-res">—</b><span>Resolución</span></div>
     <div class="sys-card"><b id="sys-lang">—</b><span>Idioma del navegador</span></div>
     <div class="sys-card"><b id="sys-browser">—</b><span>Navegador</span></div></div>`,
    bind(b) {
      $("#sys-res", b).textContent = `${screen.width}×${screen.height}`;
      $("#sys-lang", b).textContent = navigator.language;
      const ua = navigator.userAgent;
      $("#sys-browser", b).textContent = /Firefox/.test(ua)
        ? "Firefox"
        : /Edg/.test(ua)
          ? "Edge"
          : /Chrome/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : "Desconocido";
    },
  },

  // MOTIVACIÓN: muestra mensajes del propio portfolio.
  motivation: {
    title: "motivacion.exe",
    icon: "💡",
    render: () =>
      `<div style="text-align:center;padding:2rem 1rem"><div style="font-size:2.5rem">💡</div><p style="font-family:var(--font-mono);margin-top:1rem;line-height:1.8">Sigue construyendo.<br>Cada proyecto te acerca a lo que quieres ser.</p></div>`,
  },

  // ARCADE: games.js dibuja las tarjetas; aquí cada tarjeta abre su juego.
  arcade: {
    title: "Arcade",
    icon: "🕹️",
    bind(b) {
      b.querySelectorAll("[data-game]").forEach((x) =>
        x.addEventListener("click", () => openWindow(x.dataset.game)),
      );
    },
  },

  // JUEGOS: Tetris y Pac-Man se definen completos en games.js; aquí solo reservan título e icono.
  tetris: { title: "Tetris", icon: pixelIcon("tetris") },
  pacman: { title: "Pac-Man", icon: pixelIcon("pacman") },
};
// Genera el HTML repetido de una barra de habilidad; data-w guarda el porcentaje.
function bar(n, v) {
  return `<div class="res"><div class="res__top"><span>${n}</span><span>${v}%</span></div><div class="bar"><i data-w="${v}"></i></div></div>`;
}

/* ========================================================= WINDOW MANAGER
   Es una IIFE: la función se ejecuta inmediatamente y solo expone openWindow y
   closeWindow. Así, variables internas como z y open no contaminan el ámbito global.
   ========================================================= */
// VENTANAS: este módulo guarda las abiertas en un Map. Controla foco (z-index), arrastre, tamaño y cierre.
// Mantiene las ventanas dentro de la pantalla al cambiar el tamaño o la orientación.
function fitWindowBounds(rect, viewportWidth, viewportHeight) {
  const topInset = document.body.classList.contains("pixel-system") ? 48 : 12;
  const availableWidth = Math.max(1, viewportWidth - 32);
  const availableHeight = Math.max(1, viewportHeight - topInset - 98);
  const width = Math.max(Math.min(300, availableWidth), Math.min(rect.width, availableWidth));
  const height = Math.max(Math.min(220, availableHeight), Math.min(rect.height, availableHeight));
  return {
    width, height,
    left: Math.max(16, Math.min(rect.left, viewportWidth - width - 16)),
    top: Math.max(topInset, Math.min(rect.top, viewportHeight - height - 98)),
  };
}

const WM = (() => {
  let z = 10,
    open = new Map(),
    x = 40,
    y = 86;
  // Desplaza cada ventana nueva para que no aparezcan todas exactamente superpuestas.
  const nextPos = () => {
    x += 28;
    y += 28;
    if (x > 200) x = 40;
    if (y > 170) y = 86;
    return { x, y };
  };
  // Un z-index mayor coloca la ventana enfocada delante de las demás.
  function focus(win) {
    win.style.zIndex = ++z;
    win.focus({ preventScroll: true });
    $$(".tb-app").forEach((t) => t.classList.remove("active"));
    const c = $(`.tb-app[data-id="${win.dataset.id}"]`);
    if (c) {
      c.classList.add("active");
      c.classList.remove("dim");
      c.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  function openWindow(id) {
    const app = Apps[id];
    if (!app) return;
    // Map permite saber si la app ya está abierta y evita crear duplicados.
    if (open.has(id)) {
      const o = open.get(id);
      if (o.minimized) {
        o.el.classList.remove("minimized");
        o.minimized = false;
      }
      focus(o.el);
      beep();
      return o.el;
    }
    const p = nextPos(),
      win = document.createElement("section");
    win.className = "window";
    win.dataset.id = id;
    win.tabIndex = -1;
    const bounds = fitWindowBounds({
      width: app.size?.[0] || 640, height: app.size?.[1] || 500,
      left: p.x, top: p.y,
    }, innerWidth, innerHeight);
    for (const [key, value] of Object.entries(bounds)) win.style[key] = value + "px";
    win.style.zIndex = ++z;
    win.innerHTML = `<div class="win__bar"><div class="win__title"><span class="t-ico">${app.icon}</span> ${app.title}</div>
      <div class="win__btns"><button class="win-btn min" aria-label="Minimizar"></button><button class="win-btn max" aria-label="Maximizar"></button><button class="win-btn close" aria-label="Cerrar"></button></div></div>
      <div class="win__body"></div><div class="win__resize"></div>`;
    // Primero insertamos el HTML; después bind() puede buscar sus elementos y añadir eventos.
    $("#desktop").appendChild(win);
    $(".win__body", win).innerHTML = app.render();
    if (app.bind) app.bind($(".win__body", win), win);
    requestAnimationFrame(() => win.classList.add("open"));
    $(".close", win).onclick = () => closeWindow(id);
    $(".min", win).onclick = () => {
      const finish = () => {
        if (!open.has(id)) return;
        win.classList.add("minimized");
        open.get(id).minimized = true;
        const c = $(`.tb-app[data-id="${id}"]`);
        if (c) c.classList.add("dim");
        beep();
      };
      typeof minimizeWithMotion === "function"
        ? minimizeWithMotion(win, finish)
        : finish();
    };
    $(".max", win).onclick = () =>
      typeof maximizeWithMotion === "function"
        ? maximizeWithMotion(win)
        : win.classList.toggle("maximized");
    win.addEventListener("pointerdown", () => focus(win));
    drag(win, $(".win__bar", win));
    resize(win, $(".win__resize", win));
    addChip(id, app);
    open.set(id, { el: win, minimized: false });
    beep();
    return win;
  }
  // CERRAR: win.__cleanup() libera bucles, temporizadores y eventos de cada aplicación.
  function closeWindow(id) {
    const o = open.get(id);
    if (!o) return;
    o.el.__transition?.cancel();
    if (o.el.__cleanup) o.el.__cleanup();
    o.el.classList.remove("open");
    setTimeout(() => o.el.remove(), 220);
    open.delete(id);
    const c = $(`.tb-app[data-id="${id}"]`);
    if (c) c.remove();
    beep();
  }
  function addChip(id, app) {
    const b = document.createElement("button");
    b.className = "tb-app active";
    b.dataset.id = id;
    b.title = app.title;
    b.setAttribute("aria-label", app.title);
    b.innerHTML = `<span>${app.icon}</span> <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${app.title}</span>`;
    b.onclick = () => {
      const o = open.get(id);
      if (!o) return;
      if (o.minimized) {
        o.el.classList.remove("minimized");
        o.minimized = false;
        focus(o.el);
      } else if (o.el.style.zIndex == z) {
        $(".min", o.el).click();
      } else focus(o.el);
    };
    $("#taskbar__apps").appendChild(b);
    b.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  // pointerdown guarda la posición inicial; pointermove calcula el desplazamiento del ratón.
  function drag(win, h) {
    h.addEventListener("pointerdown", (e) => {
      if (innerWidth <= 820 || e.target.closest(".win-btn")) return;
      if (win.classList.contains("maximized")) return;
      focus(win);
      const sx = e.clientX,
        sy = e.clientY,
        ox = win.offsetLeft,
        oy = win.offsetTop;
      const mv = (ev) => {
        let nx = Math.max(0, Math.min(ox + ev.clientX - sx, innerWidth - 120)),
          ny = Math.max(document.body.classList.contains("pixel-system") ? 48 : 12, Math.min(oy + ev.clientY - sy, innerHeight - 150));
        win.style.left = nx + "px";
        win.style.top = ny + "px";
      };
      const up = () => {
        document.removeEventListener("pointermove", mv);
        document.removeEventListener("pointerup", up);
      };
      document.addEventListener("pointermove", mv);
      document.addEventListener("pointerup", up);
    });
  }
  // El tirador inferior derecho modifica ancho y alto respetando tamaños mínimos.
  function resize(win, h) {
    h.addEventListener("pointerdown", (e) => {
      if (win.classList.contains("maximized")) return;
      e.stopPropagation();
      focus(win);
      const sx = e.clientX,
        sy = e.clientY,
        ow = win.offsetWidth,
        oh = win.offsetHeight;
      const mv = (ev) => {
        win.style.width =
          Math.max(
            280,
            Math.min(ow + ev.clientX - sx, innerWidth - win.offsetLeft - 10),
          ) + "px";
        win.style.height =
          Math.max(
            180,
            Math.min(oh + ev.clientY - sy, innerHeight - win.offsetTop - 98),
          ) + "px";
      };
      const up = () => {
        document.removeEventListener("pointermove", mv);
        document.removeEventListener("pointerup", up);
      };
      document.addEventListener("pointermove", mv);
      document.addEventListener("pointerup", up);
    });
  }
  window.addEventListener("resize", () => {
    if (innerWidth <= 820) return;
    for (const { el } of open.values()) {
      const bounds = fitWindowBounds({
        width: parseFloat(el.style.width), height: parseFloat(el.style.height),
        left: parseFloat(el.style.left), top: parseFloat(el.style.top),
      }, innerWidth, innerHeight);
      for (const [key, value] of Object.entries(bounds)) el.style[key] = value + "px";
    }
  });
  return { openWindow, closeWindow };
})();
let openWindow = WM.openWindow;

/* ========================================================= TERMINAL */
// TERMINAL: divide lo escrito en comando y argumentos. Un switch ejecuta acciones de la web, no del ordenador.
function runCommand(raw, print, openWin) {
  const p = raw.trim().split(/\s+/),
    c = (p[0] || "").toLowerCase(),
    a = p.slice(1).join(" ");
  switch (c) {
    case "":
      break;
    case "help":
    case "ayuda":
      print(
        'Comandos: <span class="ok">ayuda readme quien-soy sobre-mi proyectos habilidades contacto limpiar fecha eco ls cat sudo secreto matrix fondo tetris pacman buscaminas vault arcade cafe hola 42</span>',
      );
      break;
    case "infectar":
    case "virus":
      startCorruption();
      print(
        '<span class="err">0xMILO: simulación activada. Datos ficticios cargados. Escribe antivirus, pulsa Escape o usa Restaurar sistema.</span>',
      );
      break;
    case "antivirus":
    case "restaurar":
      stopCorruption();
      print(
        '<span class="ok">Integridad recuperada. La información original está intacta.</span>',
      );
      break;
    case "whoami":
    case "quien-soy":
      if (corruptionActive) {
        print(escapeHTML(CORRUPT_STORIES[0] + " · " + CORRUPT_STORIES[1]));
        break;
      }
      print(
        "José Miguel Miralles Gandia<br>Estudiante de DAM en IES Dr. Lluís Simarro<br>Desarrollador de software en proceso.",
      );
      break;
    case "readme":
      print("Abriendo README.md...");
      openWin("readme");
      break;
    case "about":
    case "sobre-mi":
      print("Abriendo Sobre mí...");
      openWin("about");
      break;
    case "projects":
    case "proyectos":
      print("Abriendo Proyectos...");
      openWin("projects");
      break;
    case "skills":
    case "habilidades":
      print("Abriendo Habilidades...");
      openWin("skills");
      break;
    case "contact":
    case "contacto":
      print("Abriendo Contacto...");
      openWin("contact");
      break;
    case "clear":
    case "limpiar":
      $("#term-out").innerHTML = "";
      break;
    case "date":
    case "fecha":
      print(new Date().toLocaleString("es-ES"));
      break;
    case "echo":
    case "eco":
      print(escapeHTML(a || ""));
      break;
    case "ls":
      print(
        "README.md  sobre-mi.txt  suenos.txt  proyectos/  habilidades.json  contacto.txt  juegos/  secreto/",
      );
      break;
    case "cat":
      if (a.toLowerCase() === "readme.md")
        print(
          "JOSEMI-OS: mi primer proyecto personal como desarrollador. Portfolio interactivo con aplicaciones, terminal, Arcade, easter eggs y acertijos.",
        );
      else if (a === "sobre-mi.txt" || a === "about.txt")
        print(
          "José Miguel Miralles Gandia · estudiante de DAM en IES Dr. Lluís Simarro · desarrollador de software en proceso.",
        );
      else if (a === "sueños.txt" || a === "suenos.txt")
        print(
          "Crear automatizaciones y aplicaciones para grandes empresas combinando IA, programación y creatividad.",
        );
      else print(`cat: ${escapeHTML(a || "(sin archivo)")}: no existe`);
      break;
    case "sudo":
      if (a.startsWith("rm -rf")) {
        print(
          '<span class="err">Buen intento. JOSEMI_OS se niega a autodestruirse.</span>',
        );
        break;
      }
      print("Permiso concedido.\nLanzando protocolo de contacto...");
      openWin("contact");
      break;
    case "secret":
    case "secreto":
      print('<span class="ok">🔓 Easter egg desbloqueado.</span>');
      openWin("easter");
      toast("Has encontrado SECRETO.sys");
      break;
    case "matrix":
      state.wallpaper = "static";
      state.wp = 4;
      state.atmosphere = "matrix";
      applyTheme();
      save();
      print(
        '<span class="ok">Código en cascada activado.</span> Usa "fondo 0" para salir.',
      );
      break;
    case "wallpaper":
    case "fondo":
      if (selectPixelWallpaper(a)) {
        print("Fondo pixel art centrado: " + PIXEL_WALLPAPERS[a].name);
        break;
      }
      state.wallpaper = "static";
      if (a === "matrix-blue" || a === "matrix-depth") {
        state.atmosphere = a === "matrix-blue" ? "matrixBlue" : "matrixDepth";
        applyTheme();
        save();
        print("Fondo Matrix activado.");
        break;
      }
      if (
        ["matrix", "storm", "rain", "aurora", "stars", "terrain"].includes(a)
      ) {
        state.atmosphere = a;
        applyTheme();
        save();
        print("Fondo ASCII activado.");
      } else if (["0", "1", "2", "3"].includes(a)) {
        state.wp = +a;
        state.atmosphere = "none";
        applyTheme();
        save();
        print("Fondo estático activado.");
      } else
        print(
          `Uso: fondo ${Object.keys(PIXEL_WALLPAPERS).join("|")}|storm|rain|aurora|stars|terrain|matrix|matrix-blue|matrix-depth|0|1|2|3`,
        );
      break;
    case "tetris":
      print("Abriendo Tetris...");
      openWin("tetris");
      break;
    case "pacman":
      print("Abriendo Pac-Man...");
      openWin("pacman");
      break;
    case "buscaminas":
    case "minas":
      print("Abriendo Buscaminas...");
      openWin("minesweeper");
      break;
    case "vault":
      openWin("easter");
      break;
    case "arcade":
      print("Abriendo Arcade...");
      openWin("arcade");
      break;
    case "coffee":
    case "cafe":
      print("Compilando...\n☕ Café cargado correctamente. Productividad +10.");
      toast("Café virtual servido ☕");
      break;
    case "hello":
    case "hola":
      print("Hola, humano. JOSEMI_OS te está observando 👀");
      break;
    case "42":
      print(
        '<span class="ok">42.</span> La respuesta estaba aquí. La pregunta sigue pendiente.',
      );
      openWin("easter");
      break;
    default:
      print(`<span class="err">comando no encontrado: ${escapeHTML(c)}</span>`);
  }
}
/* ========================================================= PROYECTOS */
const PROJECTS = {
  web: {
    name: "JOSEMI-OS",
    desc: "Mi primer proyecto personal como desarrollador: un portfolio interactivo con estética de sistema operativo, aplicaciones, terminal, juegos y easter eggs.",
    lang: "HTML / CSS / JavaScript",
    db: "—",
    fw: "Vanilla",
    date: "2026",
    status: "dev",
    tags: ["Portfolio", "Frontend", "JavaScript"],
    github: "https://github.com/josemidev1-code/JOSEMI-OS",
  },
  school: {
    name: "Formación DAM",
    desc: "Espacio para reunir proyectos y prácticas reales de Desarrollo de Aplicaciones Multiplataforma. No añado detalles concretos hasta tener cada proyecto listo para enseñar.",
    lang: "En formación",
    db: "En formación",
    fw: "—",
    date: "Actual",
    status: "dev",
    tags: ["DAM", "Aprendizaje"],
  },
  auto: {
    name: "Automatización",
    desc: "Área de roadmap: quiero aprender a crear automatizaciones útiles y convertir procesos repetitivos en software.",
    lang: "Por definir",
    db: "—",
    fw: "—",
    date: "Roadmap",
    status: "exp",
    tags: ["Automatización", "Roadmap"],
  },
  ai: {
    name: "IA + software",
    desc: "Área de roadmap: explorar cómo integrar inteligencia artificial en aplicaciones y flujos de trabajo de forma creativa.",
    lang: "Por definir",
    db: "—",
    fw: "—",
    date: "Roadmap",
    status: "exp",
    tags: ["IA", "Creatividad", "Roadmap"],
  },
};
// PROYECTOS: crea una aplicación temporal con los detalles del proyecto elegido.
function openProject(k) {
  const p = PROJECTS[k];
  if (!p) return;
  const id = "proj-" + k;
  Apps[id] = {
    title: p.name,
    icon: Apps.projects.icon,
    render:
      () => `<div class="app-title">${p.name.toUpperCase()}</div><p class="bio">${p.desc}</p>
    <div class="proj">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    <dl class="kv"><dt>Lenguaje</dt><dd>${p.lang}</dd><dt>Base de datos</dt><dd>${p.db}</dd><dt>Framework</dt><dd>${p.fw}</dd><dt>Fecha</dt><dd>${p.date}</dd></dl>
    <span class="status ${p.status}">${p.status === "done" ? "COMPLETADO" : p.status === "dev" ? "EN DESARROLLO" : "EXPERIMENTAL"}</span>
    <div class="btn-row">${p.github ? `<a class="btn btn--accent" href="${p.github}" target="_blank" rel="noopener">ABRIR GITHUB ↗</a>` : '<span class="roadmap-badge">SIN ENLACE · ROADMAP / FORMACIÓN</span>'}</div>`,
  };
  openWindow(id);
}

/* ========================================================= REINICIO */
function boot() {
  location.reload();
}

/* ========================================================= ESCRITORIO */
// ACCESOS DEL ESCRITORIO: los juegos se abren desde el Arcade, el buscador o la terminal.
const ICONS = [
  "readme",
  "about",
  "projects",
  "skills",
  "terminal",
  "contact",
  "arcade",
  "settings",
  "system",
  "trash",
];
let startTime = Date.now();
// ICONOS: construye accesos desde currentUser.apps. shell.js sustituye esta versión por botones SVG accesibles.
function buildIcons() {
  const c = $("#icons");
  c.innerHTML = "";
  const llista = currentUser && currentUser.apps ? currentUser.apps : ICONS;
  llista.forEach((id) => {
    const a = Apps[id];
    if (!a) return;
    const el = document.createElement("div");
    el.className = "icon";
    el.dataset.id = id;
    el.tabIndex = 0;
    el.innerHTML = `<span class="glyph">${a.icon}</span><span class="lbl">${a.title}</span>`;
    el.addEventListener("click", () => {
      $$(".icon").forEach((i) => i.classList.remove("sel"));
      el.classList.add("sel");
    });
    el.addEventListener("dblclick", () => openWindow(id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openWindow(id);
    });
    c.appendChild(el);
  });
}
// MENÚ: convierte las aplicaciones permitidas en botones que llaman al gestor de ventanas.
function buildMenu() {
  const m = $("#menu__apps");
  m.innerHTML = "";
  const llista = currentUser && currentUser.apps ? currentUser.apps : ICONS;
  llista.forEach((id) => {
    const a = Apps[id];
    if (!a) return;
    const b = document.createElement("button");
    b.innerHTML = `<span>${a.icon}</span> ${a.title}`;
    b.onclick = () => {
      openWindow(id);
      $("#menu").classList.add("hidden");
    };
    m.appendChild(b);
  });
}
// RELOJ: actualiza hora y fecha una vez por segundo con Date y el idioma del navegador.
function buildClock() {
  const t = $("#clock__time"),
    d = $("#clock__date");
  const tick = () => {
    const n = new Date();
    t.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
    d.textContent = n.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const st = $("#sys-uptime");
    if (st) st.textContent = Math.floor((n - startTime) / 1000) + "s";
    const sc = $("#sys-time");
    if (sc) sc.textContent = t.textContent;
  };
  tick();
  setInterval(tick, 1000);
}
// PROFUNDIDAD: desplaza el fondo unos píxeles con el ratón. Matrix y reducir movimiento lo desactivan.
// RENDIMIENTO: como máximo un cálculo por fotograma y solo se escribe el estilo si cambia.
function buildParallax() {
  const bg = $("#bg");
  let pending = false,
    last = "",
    x = 0,
    y = 0;
  addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const still =
        state.motion ||
        PIXEL_WALLPAPERS[state.wallpaper] ||
        state.wp === 4 ||
        state.atmosphere?.startsWith("matrix");
      const value = still
        ? "none"
        : `translate(${Math.round((x / innerWidth - 0.5) * 30)}px,${Math.round((y / innerHeight - 0.5) * 30)}px)`;
      if (value !== last) bg.style.transform = last = value;
    });
  });
}
// INICIO: alterna la visibilidad del menú y lo cierra cuando se pulsa fuera.
function buildStart() {
  const m = $("#menu");
  $("#start").onclick = (e) => {
    e.stopPropagation();
    m.classList.toggle("hidden");
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#menu") && !e.target.closest("#start"))
      m.classList.add("hidden");
  });
  $$(".menu__power button").forEach(
    (b) =>
      (b.onclick = () => {
        m.classList.add("hidden");
        b.dataset.power === "shutdown" ? shutdown() : boot();
      }),
  );
}
// CLIC DERECHO: evita el menú nativo dentro del escritorio y coloca nuestro menú sin salir de pantalla.
function buildContext() {
  const ctx = $("#ctxmenu");
  document.addEventListener("contextmenu", (e) => {
    if (
      $("#desktop").classList.contains("hidden") ||
      e.target.closest(".window,.menu,.taskbar,#mascot-chat")
    )
      return;
    e.preventDefault();
    ctx.classList.remove("hidden");
    const w = ctx.offsetWidth,
      h = ctx.offsetHeight;
    ctx.style.left = Math.min(e.clientX, innerWidth - w - 8) + "px";
    ctx.style.top = Math.min(e.clientY, innerHeight - h - 8) + "px";
  });
  document.addEventListener("click", () => ctx.classList.add("hidden"));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") ctx.classList.add("hidden");
  });
  ctx.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.act;
        ctx.classList.add("hidden");
        if (a === "refresh") {
          buildIcons();
          toast("Escritorio actualizado.");
        }
        if (a === "wallpaper") {
          openWindow("gallery");
        }
        if (a === "terminal") openWindow("terminal");
        if (a === "system") openWindow("system");
        if (a === "arcade") openWindow("arcade");
      }),
  );
}
// APAGADO SIMULADO: cierra las ventanas y muestra una pantalla final; no apaga el ordenador.
function shutdown() {
  Object.keys(Apps).forEach((id) => WM.closeWindow(id));
  const s = $("#shutdown");
  s.classList.remove("hidden");
  $("#shutdown__msg").textContent = "Apagando JOSEMI-OS...";
  setTimeout(() => {
    $("#shutdown__msg").textContent =
      "Ahora puedes cerrar esta pestaña con seguridad.";
    $("#reboot").classList.remove("hidden");
  }, 1600);
  $("#reboot").onclick = () => location.reload();
}
// SECRETOS: compara las últimas teclas con el código Konami y activa pequeñas sorpresas.
function buildKonami() {
  const s = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let i = 0;
  addEventListener("keydown", (e) => {
    if (
      e.target.closest(".game") ||
      e.target.closest(".window")?.querySelector(".game")
    )
      return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === s[i]) i++;
    else if (key === s[0]) i = 1;
    else i = 0;
    if (i === s.length) {
      state.wp = 4;
      state.atmosphere = "matrix";
      applyTheme();
      save();
      toast("Código Konami: MODO DESARROLLADOR ACTIVADO");
      openWindow("easter");
      i = 0;
    }
  });
  let clockClicks = 0,
    clockTimer = null;
  $("#clock__time").addEventListener("click", () => {
    clockClicks++;
    clearTimeout(clockTimer);
    clockTimer = setTimeout(() => (clockClicks = 0), 1500);
    if (clockClicks >= 7) {
      clockClicks = 0;
      openWindow("easter");
      toast("Has forzado una anomalía temporal.");
    }
  });
  let typed = "";
  addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea")) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith("josemi")) {
      toast("Usuario raíz detectado.");
      openWindow("about");
      typed = "";
    }
  });
}

/* ========================================================= ACCESO DIRECTO
   Ya no hay contraseña: el perfil de Josemi se carga automáticamente.
   ========================================================= */
const currentUser = {
  nom: "José Miguel",
  rol: "Desarrollador en proceso · DAM",
  color: "#6dff9b",
  apps: [
    "readme",
    "about",
    "projects",
    "skills",
    "terminal",
    "contact",
    "arcade",
    "settings",
    "system",
    "trash",
  ],
  auto: [],
};

let typeLoginArt;

let enteringOS = false,
  bootRun = 0;
const bootDelay = (ms) => new Promise((r) => setTimeout(r, ms));

// SALIDA DE ARRANQUE: añade texto con textContent, evitando interpretar texto como HTML.
function appendBoot(text = "", cls = "") {
  const out = $("#bootTerminalOutput");
  const line = document.createElement("span");
  line.className = cls;
  line.textContent = text + "\n";
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
  return line;
}
// MÁQUINA DE ESCRIBIR: una letra por temporizador normal (sin requestAnimationFrame), así funciona
// igual en ordenadores lentos o con la pestaña en segundo plano. bootRun cancela una secuencia caducada.
async function typeBootText(el, text, speed, run) {
  const live = () => run === bootRun && !enteringOS;
  if (!speed) {
    el.textContent = text;
    return live();
  }
  for (let i = 1; i <= text.length; i++) {
    if (!live()) return false;
    el.textContent = text.slice(0, i);
    await bootDelay(speed);
  }
  return live();
}

// ENTRAR: invalida la intro, prepara menú e iconos y cambia de login a escritorio después de la transición.
function enterOS() {
  if (enteringOS) return;
  enteringOS = true;
  bootRun++;
  document.documentElement.style.setProperty("--accent", state.accent);
  document.documentElement.style.setProperty(
    "--accent-soft",
    state.accent + "1f",
  );
  $(".menu__head strong").textContent = currentUser.nom;
  $(".menu__head small").textContent = currentUser.rol;
  buildIcons();
  buildMenu();
  const login = $("#login");
  login.classList.add("out");
  setTimeout(() => {
    login.classList.add("hidden");
    $("#desktop").classList.remove("hidden");
    startTime = Date.now();
    applyTheme();
    toast("Bienvenido a JOSEMI-OS. Explora, juega, descubre.");
  }, 420);
}

// SALTAR INTRO: botón o Enter llaman a enterOS; siempre se puede entrar sin esperar la animación.
function initDirectAccess() {
  $("#skipBoot").addEventListener("click", enterOS);
  addEventListener("keydown", (e) => {
    if (!$("#login").classList.contains("hidden") && e.key === "Enter") {
      e.preventDefault();
      enterOS();
    }
  });
}

/* ========================================================= INICIO */

/* === END script.js === */

/* === BEGIN upgrade.js === */
("use strict");
// Shared game lifecycle: time stops when the player leaves a game.
// SEGURIDAD DEL TEXTO: convierte símbolos HTML en entidades para mostrar lo escrito sin ejecutarlo.
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// RÉCORDS: localStorage conserva la mayor puntuación de cada juego en este navegador.
function recordScore(id, n) {
  try {
    const key = "josemi-best-" + id,
      best = Math.max(n, Number(localStorage.getItem(key)) || 0);
    localStorage.setItem(key, best);
    const label = document.querySelector(
      `.game-card--${id} .game-card__bottom span`,
    );
    if (label) label.textContent = "RÉCORD " + best;
  } catch {}
}
function bestScore(id) {
  try {
    return Number(localStorage.getItem("josemi-best-" + id)) || 0;
  } catch {
    return 0;
  }
}
// PAUSA AUTOMÁTICA: observa minimizar, cambiar pestaña o perder foco. El cierre retira todos los listeners.
function attachGameLifecycle(win, pause) {
  const check = () => {
    if (
      win.classList.contains("minimized") ||
      win.classList.contains("minimizing") ||
      document.hidden ||
      !win.contains(document.activeElement)
    )
      pause();
  };
  const observer = new MutationObserver(check);
  observer.observe(win, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", check);
  document.addEventListener("focusin", check);
  window.addEventListener("blur", pause);
  const cleanup = win.__cleanup;
  win.__cleanup = () => {
    cleanup?.();
    observer.disconnect();
    document.removeEventListener("visibilitychange", check);
    document.removeEventListener("focusin", check);
    window.removeEventListener("blur", pause);
  };
}
// Boot art is stable ASCII. Noise only reveals the glyphs, never shifts the layout.
// FIRMA: seis líneas de caracteres forman JOSEMI-OS. La animación cambia su posición o revelado, no el nombre final.
const NAME_ART = [
  "     ██╗ ██████╗ ███████╗███████╗███╗   ███╗██╗       ██████╗ ███████╗",
  "     ██║██╔═══██╗██╔════╝██╔════╝████╗ ████║██║      ██╔═══██╗██╔════╝",
  "     ██║██║   ██║███████╗█████╗  ██╔████╔██║██║ ████╗██║   ██║███████╗",
  "██   ██║██║   ██║╚════██║██╔══╝  ██║╚██╔╝██║██║ ╚═══╝██║   ██║╚════██║",
  "╚█████╔╝╚██████╔╝███████║███████╗██║ ╚═╝ ██║██║      ╚██████╔╝███████║",
  " ╚════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝       ╚═════╝ ╚══════╝",
];
ICONS.push("easter");
currentUser.apps.push("easter");

// Original raycaster, no external assets or downloads required.
Apps.arcade.size = [940, 650];

/* === END upgrade.js === */

/* === BEGIN shell.js === */
("use strict");
// Browser-native interpretation of per-character terminal animation.
// PREFERENCIAS: valores por defecto y validación de lo guardado para evitar opciones inexistentes.
const SHELL_DEFAULTS = {
  theme: "violet",
  cursor: "system",
  cursorSize: 24,
  bootEffect: "cinematic",
  intensity: "full",
  idle: 0,
  grain: true,
  atmosphere: "storm",
  weatherDensity: 55,
  weatherSpeed: 1,
  welcomeVisible: true,
};
for (const [key, value] of Object.entries(SHELL_DEFAULTS))
  if (state[key] === undefined) state[key] = value;
// TEMAS: nombre, color principal y fondo. El CSS usa variables para cambiar toda la interfaz.
const THEMES = {
  night: { name: "Terminal nocturna", accent: "#8be9a8", bg: "#090e14" },
  paper: { name: "Estudio de papel", accent: "#a65d24", bg: "#eee8d8" },
  violet: { name: "Órbita violeta", accent: "#c3a6ff", bg: "#100e1a" },
  ocean: { name: "Océano profundo", accent: "#75d5ec", bg: "#08161d" },
};
Object.assign(THEMES, {
  sunset: { name: "Atardecer coral", accent: "#ffae91", bg: "#302133" },
  glacier: { name: "Glaciar azul", accent: "#3879b5", bg: "#e0edf2" },
  copper: { name: "Cobre cálido", accent: "#f5bc7c", bg: "#292119" },
});
const EFFECTS = {
  cinematic: "Singularidad → órbita → firma",
  storm: "Tormenta eléctrica //",
  orbit: "Anillos orbitales",
  laser: "Grabado láser",
  decrypt: "Descifrado",
  beams: "Barrido de luz",
  rain: "Lluvia de caracteres",
  gather: "Convergencia",
  random: "Aleatorio",
};
const ATMOSPHERES = {
  none: "Sin animación",
  matrixBlue: "Matrix / verde + cian",
  matrixDepth: "Matrix / profundidad",
  storm: "Tormenta //",
  rain: "Lluvia diagonal",
  aurora: "Aurora de ondas",
  stars: "Constelaciones",
  terrain: "Paisaje topográfico",
  matrix: "Matrix / verde clásico",
};
if (state.shellVersion !== 4) {
  if (state.theme === "night" || state.theme === undefined) {
    state.theme = "violet";
    state.accent = THEMES.violet.accent;
    state.bg = THEMES.violet.bg;
  }
  state.bootEffect = "cinematic";
  state.shellVersion = 4;
}
if (!ATMOSPHERES[state.atmosphere]) state.atmosphere = "storm";
state.weatherDensity = Math.max(
  15,
  Math.min(90, Number(state.weatherDensity) || 55),
);
state.weatherSpeed = [0.5, 1, 1.5].includes(Number(state.weatherSpeed))
  ? Number(state.weatherSpeed)
  : 1;
const CURSORS = {
  system: "Sistema",
  pixel: "Pixel",
  terminal: "Terminal",
  crosshair: "Mira",
  arrow: "Flecha clara",
  sword: "Espada",
  axe: "Hacha nórdica",
  coin: "Moneda",
  ghost: "Fantasma",
  leaf: "Hoja",
  circuit: "Circuito",
  star: "Estrella",
  axolotl: "Ajolote",
};
if (!THEMES[state.theme]) state.theme = "night";
if (!CURSORS[state.cursor]) state.cursor = "system";
if (!EFFECTS[state.bootEffect]) state.bootEffect = "beams";
state.cursorSize = [20, 24, 32].includes(Number(state.cursorSize))
  ? Number(state.cursorSize)
  : 24;
if (!["full", "calm"].includes(state.intensity)) state.intensity = "full";
state.idle = [0, 60, 180].includes(Number(state.idle)) ? Number(state.idle) : 0;
// ICONOS SVG: pequeños dibujos vectoriales que comparten tamaño, trazo y paleta.
const ICON_PATHS = {
  readme:
    '<path d="M13 8h23l9 9v34H13z" fill="#dfe5d6"/><path d="M36 8v10h9M20 26h18M20 33h18M20 40h11"/>',
  about:
    '<rect x="8" y="11" width="48" height="40" rx="5" fill="#b9d3bc"/><circle cx="23" cy="27" r="7" fill="#edf0de"/><path d="M13 43q10-16 20 0M38 25h10M38 33h10M38 41h7"/>',
  projects:
    '<path d="M7 17h19l5 6h26v29H7z" fill="#d9a555"/><path d="M7 29l6-5h45l-5 28H7z" fill="#f3c778"/>',
  skills: '<path d="M34 6L12 34h17l-3 24 25-33H34z" fill="#edc16c"/>',
  terminal:
    '<rect x="7" y="10" width="50" height="43" rx="5" fill="#213a36"/><path d="M7 21h50M17 30l8 7-8 7M31 44h14" stroke="#adf0b7"/><circle cx="14" cy="16" r="1" fill="#ffd080"/>',
  contact:
    '<rect x="7" y="15" width="50" height="35" rx="4" fill="#a9c6dd"/><path d="M8 17l24 19 24-19M8 49l17-17M56 49L39 32"/>',
  arcade:
    '<path d="M18 8h30l-2 23 8 21H10l8-21z" fill="#bda9d5"/><rect x="23" y="14" width="20" height="15" rx="2" fill="#203032"/><path d="M22 42h10M27 37v10"/><circle cx="41" cy="41" r="3" fill="#e6aa64"/>',
  settings:
    '<path d="M27 7h10l2 8 7 3 8-2 5 9-6 6v8l6 5-5 9-8-2-7 4-2 7H27l-2-7-7-4-8 2-5-9 6-5v-8l-6-6 5-9 8 2 7-3z" fill="#a7b9c3"/><circle cx="32" cy="34" r="10" fill="#e8eadc"/>',
  system:
    '<rect x="6" y="10" width="52" height="35" rx="4" fill="#aec9bc"/><rect x="11" y="15" width="42" height="25" fill="#243b39"/><path d="M17 32h6l4-9 7 13 5-8h9M27 45v9M37 45v9M20 55h24" stroke="#9adeaa"/>',
  trash:
    '<path d="M17 19h30l-3 35H20z" fill="#9fb2b5"/><path d="M13 19h38M25 11h14v8M26 26v20M37 26v20"/>',
  easter:
    '<rect x="10" y="24" width="44" height="31" rx="4" fill="#d4b073"/><path d="M21 24v-8a11 11 0 0122 0v8" fill="none"/><circle cx="32" cy="38" r="4" fill="#263733"/><path d="M32 42v6"/>',
  screensaver:
    '<rect x="7" y="10" width="50" height="36" rx="4" fill="#aac7d3"/><path d="M17 23l6 5-6 5M30 34h15M27 46v8M37 46v8M21 55h22"/>',
  pacman:
    '<path d="M48 17A23 23 0 1048 47L32 32z" fill="#efcb64"/><circle cx="31" cy="18" r="3" fill="#29312f"/>',
  tetris:
    '<path d="M12 12h14v14h14V12h14v28H40v14H26V40H12z" fill="#c1a4d9"/><path d="M12 26h42M26 26v14M40 26v14"/>',
};
function osIcon(id) {
  return `<svg class="os-icon os-icon--${id}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#293934" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">${ICON_PATHS[id] || ICON_PATHS.projects}</g></svg>`;
}
for (const id of Object.keys(ICON_PATHS))
  if (Apps[id]) Apps[id].icon = osIcon(id);

// CURSORES: genera un SVG y lo convierte en una URL de datos para la propiedad cursor del navegador.
function cursorSVG(kind, size) {
  const color = THEMES[state.theme].accent;
  const paths = {
    pixel: `<path d="M3 2h4v4h4v4h4v4h4v4h-8v8H7V14H3z" fill="${color}" stroke="#17251f" stroke-width="2"/>`,
    terminal: `<path d="M10 3h12M16 3v26M10 29h12" stroke="${color}" stroke-width="3"/><path d="M11 5h10M18 5v22" stroke="#07100b"/>`,
    crosshair: `<path d="M16 1v10M16 21v10M1 16h10M21 16h10" stroke="${color}" stroke-width="2"/><rect x="13" y="13" width="6" height="6" fill="${color}"/>`,
    arrow:
      '<path d="M5 2v25l7-7 6 10 5-3-6-10h10z" fill="#f4f0df" stroke="#17241e" stroke-width="2"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${paths[kind]}</svg>`;
}
// APARIENCIA: aplica tema, textura, cursor y fondo al DOM. Los atributos data-* activan reglas CSS.
function applyShell() {
  document.body.dataset.theme = state.theme;
  document.body.dataset.intensity = state.intensity;
  document.body.classList.toggle("with-grain", !!state.grain);
  document.body.classList.toggle("immersive-desktop", !state.welcomeVisible);
  const value =
    state.cursor === "system"
      ? "auto"
      : `url("data:image/svg+xml,${encodeURIComponent(cursorSVG(state.cursor, state.cursorSize))}") ${state.cursor === "crosshair" || state.cursor === "terminal" ? Math.round(state.cursorSize / 2) : 2} ${state.cursor === "crosshair" ? Math.round(state.cursorSize / 2) : 2}, auto`;
  document.documentElement.style.setProperty("--os-cursor", value);
  document.documentElement.style.setProperty(
    "--os-pointer",
    state.cursor === "system" ? "pointer" : value,
  );
  document.documentElement.style.setProperty(
    "--motion-ms",
    state.intensity === "calm" ? "180ms" : "400ms",
  );
  $("#shell-theme-name")?.replaceChildren(
    document.createTextNode(THEMES[state.theme].name),
  );
  syncAtmosphere();
}
const baseApplyTheme = applyTheme;
applyTheme = function () {
  baseApplyTheme();
  applyShell();
};
function chooseTheme(id) {
  if (!THEMES[id]) return;
  state.theme = id;
  state.accent = THEMES[id].accent;
  state.bg = THEMES[id].bg;
  applyTheme();
  save();
}

// MINIMIZAR: mide ventana y botón del dock, anima entre ambos y después oculta la ventana.
function minimizeWithMotion(win, finish) {
  if (win.classList.contains("minimizing")) return;
  if (state.motion || !win.animate) {
    finish();
    return;
  }
  const dock = $(`.tb-app[data-id="${win.dataset.id}"]`),
    start = win.getBoundingClientRect(),
    end = dock?.getBoundingClientRect();
  if (!end) {
    finish();
    return;
  }
  win.classList.add("minimizing");
  win.__transition = win.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: `translate(${end.x - start.x}px,${end.y - start.y}px) scale(${end.width / start.width},${end.height / start.height})`,
        opacity: 0,
      },
    ],
    {
      duration: state.intensity === "calm" ? 180 : 360,
      easing: "cubic-bezier(.4,0,.2,1)",
      fill: "forwards",
    },
  );
  win.__transition.finished
    .catch(() => {})
    .then(() => {
      finish();
      win.__transition?.cancel();
      win.__transition = null;
      win.classList.remove("minimizing");
    });
}
// MAXIMIZAR: técnica FLIP. Mide antes y después y anima la diferencia para evitar un salto brusco.
function maximizeWithMotion(win) {
  win.__transition?.cancel();
  const before = win.getBoundingClientRect();
  win.classList.toggle("maximized");
  const after = win.getBoundingClientRect();
  if (state.motion || !win.animate) return;
  win.__transition = win.animate(
    [
      {
        transform: `translate(${before.x - after.x}px,${before.y - after.y}px) scale(${before.width / after.width},${before.height / after.height})`,
      },
      { transform: "none" },
    ],
    {
      duration: state.intensity === "calm" ? 180 : 420,
      easing: "cubic-bezier(.16,1,.3,1)",
    },
  );
}

// Text coordinates stay on a fixed grid. Animation is based on elapsed time,
// so 60 Hz and 120 Hz displays settle at the same moment.
// AZAR ESTABLE: el mismo número devuelve siempre el mismo ruido; los caracteres no vibran sin control.
// Ajusta la firma al ancho real de su contenedor; sirve también al girar un móvil.
// Courier es local: el dibujo no cambia de medidas al llegar una fuente de Google.
function fitAsciiText(el) {
  // El salvapantallas calcula su tamaño con su propia firma y el alto de pantalla.
  if (el.closest("#os-screensaver")) return;
  const container = el.closest(".boot-shell__body") || el;
  const available = Math.max(
    1,
    container.clientWidth - (el === container ? 32 : 48),
  );
  const columns = Math.max(...NAME_ART.map((row) => row.length));
  el.style.setProperty(
    "--ascii-size",
    `${Math.max(4, Math.min(18, available / (columns * 0.61)))}px`,
  );
}
function seededNoise(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
// FOTOGRAMA ASCII: construye una rejilla vacía y coloca caracteres según el efecto y progreso de 0 a 1.
function signatureFrame(art, effect, p) {
  const h = art.length,
    w = Math.max(...art.map((l) => l.length)),
    grid = Array.from({ length: h }, () => Array(w).fill(" "));
  if (p >= 1) return art.join("\n");
  const put = (x, y, ch) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < w && y >= 0 && y < h) grid[y][x] = ch;
  };
  if (effect === "cinematic") {
    // Tres actos: ruido digital, partículas que convergen y una onda que fija la firma.
    if (p < 0.24) {
      const q = p / 0.24;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (seededNoise(x + y * w + Math.floor(p * 90)) > 0.64 - q * 0.12)
            put(
              x,
              y,
              "01/<>*"[
                Math.floor(seededNoise(x + y * 71 + Math.floor(p * 70)) * 6)
              ],
            );
      return grid.map((row) => row.join("")).join("\n");
    }
    if (p < 0.7) {
      effect = "orbit";
      p = (p - 0.24) / 0.46;
    } else {
      const q = (p - 0.7) / 0.3;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < art[y].length; x++) {
          const ch = art[y][x];
          if (ch === " ") continue;
          const distance = Math.abs(x - w / 2) / (w / 2),
            front = q * 1.35;
          if (distance < front - 0.08) put(x, y, ch);
          else if (distance < front + 0.06) put(x, y, "▓");
          else
            put(
              x,
              y,
              seededNoise(x + y * w + Math.floor(q * 30)) > 0.8 ? "+" : ch,
            );
        }
      return grid.map((row) => row.join("")).join("\n");
    }
  }
  if (effect === "storm") {
    for (let i = 0; i < w; i++) {
      const y = Math.floor((p * 24 + seededNoise(i) * h * 3) % h);
      if (seededNoise(i) > 0.62) put(i, y, "/");
    }
    const strike = Math.floor(p * 4),
      phase = (p * 4) % 1,
      root = seededNoise(strike + 400) * w;
    if (phase < 0.35)
      for (let y = 0; y < h; y++) {
        const x = root + Math.sin(y * 2 + strike) * 3;
        put(x, y, "/");
        put(x + 1, y, "/");
      }
  }
  const scan = p * (w + 9);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < art[y].length; x++) {
      const ch = art[y][x];
      if (ch === " ") continue;
      const seed = y * w + x,
        n = seededNoise(seed);
      if (effect === "orbit") {
        const q = Math.max(0, Math.min(1, (p - n * 0.16) / 0.78)),
          ease = q * q * (3 - 2 * q),
          angle = n * Math.PI * 2 + (1 - q) * Math.PI * 3;
        const ox = w / 2 + Math.cos(angle) * (w * 0.46),
          oy = h / 2 + Math.sin(angle) * (h * 0.43);
        put(
          ox + (x - ox) * ease,
          oy + (y - oy) * ease,
          q > 0.84 ? ch : [".", "+", "*"][seed % 3],
        );
      } else if (effect === "laser") {
        if (x < scan - 3) put(x, y, ch);
        else if (Math.abs(x - scan) < 2) put(x, y, "#");
        else if (x < scan + 7 && n > 0.76) put(x, y, [".", "+", "*"][seed % 3]);
      } else if (effect === "decrypt") {
        const threshold = n * 0.65 + (y / h) * 0.13;
        put(
          x,
          y,
          p > threshold
            ? ch
            : "01/+<>*"[Math.floor(seededNoise(seed + Math.floor(p * 60)) * 7)],
        );
      } else if (effect === "storm" && (p > 0.82 || n < p * 0.85))
        put(x, y, ch);
    }
  if (effect === "laser" && scan < w)
    for (let y = 0; y < h; y++) put(scan, y, "|");
  return grid.map((row) => row.join("")).join("\n");
}
// EFECTOS: usa la rejilla para lluvia, barrido o convergencia. En progreso 1 devuelve la firma exacta.
function asciiFrame(art, effect, progress) {
  const height = art.length,
    width = Math.max(...art.map((l) => l.length)),
    grid = Array.from({ length: height }, () => Array(width).fill(" "));
  progress = Math.max(0, Math.min(1, progress));
  if (["cinematic", "storm", "orbit", "laser", "decrypt"].includes(effect))
    return signatureFrame(art, effect, progress);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < art[y].length; x++) {
      const ch = art[y][x];
      if (ch === " ") continue;
      const seed = y * width + x,
        delay = seededNoise(seed) * 0.22,
        p = Math.max(0, Math.min(1, (progress - delay) / 0.72));
      if (effect === "gather") {
        const ease = 1 - (1 - p) ** 3,
          ox = Math.round(x + (seededNoise(seed + 9) * width - x) * (1 - ease)),
          oy = Math.round(
            y + (seededNoise(seed + 21) * height - y) * (1 - ease),
          );
        grid[Math.max(0, Math.min(height - 1, oy))][
          Math.max(0, Math.min(width - 1, ox))
        ] = p > 0.9 ? ch : "·";
      } else if (effect === "rain") {
        const fall = Math.max(
          0,
          Math.min(1, (progress - (x / width) * 0.2) / 0.72),
        );
        const cy = Math.round(-height + (y + height) * fall);
        if (cy >= 0)
          grid[cy][x] =
            fall > 0.97
              ? ch
              : ["0", "1", "│", "╎"][
                  Math.floor(seededNoise(seed + Math.floor(progress * 35)) * 4)
                ];
      } else {
        const sweep = progress * (width + 8);
        grid[y][x] =
          x < sweep - 5
            ? ch
            : x < sweep
              ? ["░", "▒", "▓"][Math.min(2, Math.floor((sweep - x) / 2))]
              : " ";
      }
    }
  return progress >= 1
    ? art.join("\n")
    : grid.map((row) => row.join("")).join("\n");
}
// ANIMACIÓN: requestAnimationFrame aporta el tiempo real; cancel() termina el bucle y resuelve la promesa.
function animateAscii(
  el,
  effect,
  { duration = 1900, signal = () => false } = {},
) {
  if (typeof fitAsciiText === "function") fitAsciiText(el);
  if (effect === "random")
    effect = [
      "cinematic",
      "storm",
      "orbit",
      "laser",
      "decrypt",
      "beams",
      "rain",
      "gather",
    ][Math.floor(Math.random() * 8)];
  let handle = 0,
    resolveDone,
    settled = false,
    start = null,
    last = 0;
  const done = new Promise((resolve) => (resolveDone = resolve));
  const end = (value) => {
    if (settled) return;
    settled = true;
    cancelAnimationFrame(handle);
    resolveDone(value);
  };
  const frame = (now) => {
    if (signal() || !el.isConnected) {
      end(false);
      return;
    }
    if (state.motion) {
      el.textContent = NAME_ART.join("\n");
      end(true);
      return;
    }
    if (start === null) start = now;
    const p = Math.min(1, (now - start) / duration);
    if (now - last > 28 || p === 1) {
      el.textContent = asciiFrame(NAME_ART, effect, p);
      last = now;
    }
    if (p === 1) end(true);
    else handle = requestAnimationFrame(frame);
  };
  handle = requestAnimationFrame(frame);
  return { done, cancel: () => end(false) };
}
let currentBootAnimation = null;
// RÓTULO DE ARRANQUE: JOSEMI-OS dibujado con barras (estilo «slant»). Solo usa / \\ _ | y espacios,
// que existen en cualquier fuente monoespaciada. Todas las filas miden lo mismo.
const BOOT_ART = [
  "       ______  _____ ________  _______     ____  _____",
  "      / / __ \\/ ___// ____/  |/  /  _/    / __ \\/ ___/",
  " __  / / / / /\\__ \\/ __/ / /|_/ // /_____/ / / /\\__ \\ ",
  "/ /_/ / /_/ /___/ / /___/ /  / // /_____/ /_/ /___/ / ",
  "\\____/\\____//____/_____/_/  /_/___/     \\____//____/  ",
];
// Ajusta el rótulo completo al ancho real, también al girar el móvil.
function fitBootLogo() {
  const login = $("#login");
  const out = $("#bootTerminalOutput");
  const logo = out?.querySelector(".boot-logo:not(.boot-logo--hot)");
  if (!login || !logo || login.dataset.phase !== "signature") return;
  const padding = getComputedStyle(login);
  const available = Math.max(1, login.clientWidth -
    parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight));
  const context = document.createElement("canvas").getContext("2d");
  if (context) context.font = `700 100px ${getComputedStyle(logo).fontFamily}`;
  const width = Math.max(...BOOT_ART.map((row) =>
    context ? context.measureText(row).width : row.length * 62));
  out.style.setProperty("--boot-logo-size", `${Math.min(27, available * 100 / width)}px`);
}

const BOOT_NOISE = "/\\\\|_-=+<>*#01";
const bootNoise = () =>
  BOOT_NOISE[Math.floor(Math.random() * BOOT_NOISE.length)];
// Cada carácter del rótulo recibe el instante (0–1) en que deja de ser ruido: avanza de
// izquierda a derecha con algo de azar, como un descifrado. Se calcula una sola vez.
function bootPlan() {
  return BOOT_ART.map((row) =>
    [...row].map((ch, x) =>
      ch === " " ? -1 : 0.12 + (x / row.length) * 0.5 + Math.random() * 0.2,
    ),
  );
}
// FOTOGRAMA DEL RÓTULO: devuelve dos textos del mismo tamaño. «base» es la capa verde;
// «hot» solo contiene los caracteres que brillan en blanco en ese instante.
//  0 → .12  una cortina de ruido escribe el rótulo de izquierda a derecha.
//  … → .82  cada carácter se descifra y destella al fijarse.
//  .82 → 1  un haz de luz inclinado recorre el rótulo ya terminado.
function bootFrame(plan, p) {
  const base = [],
    hot = [];
  BOOT_ART.forEach((row, y) => {
    let a = "",
      b = "";
    for (let x = 0; x < row.length; x++) {
      const at = plan[y][x],
        typed = x / row.length <= p / 0.12;
      if (at < 0 || !typed) {
        a += " ";
        b += " ";
        continue;
      }
      if (p >= 1) {
        a += row[x];
        b += " ";
        continue;
      }
      if (p < at) {
        const ch = bootNoise();
        a += ch;
        b +=
          Math.random() < 0.08 || (p < 0.12 && x / row.length > p / 0.12 - 0.06)
            ? ch
            : " ";
        continue;
      }
      const beam =
        p > 0.82 &&
        Math.abs(x + y * 1.5 - ((p - 0.82) / 0.18) * (row.length + 12) + 4) <
          2.5;
      a += row[x];
      b += p - at < 0.045 || beam ? row[x] : " ";
    }
    base.push(a);
    hot.push(b);
  });
  return { base: base.join("\n"), hot: hot.join("\n") };
}
// ARRANQUE: terminal negra como la de la película.
//  1. Escribe «Wake up, Neo...», lo borra y escribe «The Matrix has you...».
//  2. Limpia la pantalla y descifra el rótulo JOSEMI-OS en el centro.
//  3. Entra al escritorio.
// Solo usa texto y temporizadores (sin canvas ni requestAnimationFrame): son 5 filas de
// caracteres, así que funciona igual en ordenadores lentos. Cada espera comprueba bootRun
// para que Saltar nunca deje otra intro en marcha.
typeLoginArt = async function () {
  currentBootAnimation?.cancel();
  currentBootAnimation = null;
  const run = ++bootRun;
  enteringOS = false;
  const login = $("#login"),
    out = $("#bootTerminalOutput"),
    still = state.motion;
  login.classList.remove("hidden", "out");
  login.dataset.phase = "matrix";
  out.innerHTML = "";
  const active = () => run === bootRun && !enteringOS;
  try {
    const neo = appendBoot("", "boot-neo boot-cursor");
    neo.textContent = "";
    if (!still) await bootDelay(600);
    if (!active()) return;
    if (!(await typeBootText(neo, "Wake up, Neo...", still ? 0 : 110, run)))
      return;
    await bootDelay(still ? 900 : 1200);
    if (!active()) return;
    // Borrado: retrocede letra a letra, como si alguien pulsara la tecla de borrar.
    if (!still)
      for (let n = neo.textContent.length - 1; n >= 0; n--) {
        neo.textContent = neo.textContent.slice(0, n);
        await bootDelay(28);
        if (!active()) return;
      }
    neo.textContent = "";
    if (!still) await bootDelay(450);
    if (!active()) return;
    if (
      !(await typeBootText(neo, "The Matrix has you...", still ? 0 : 95, run))
    )
      return;
    await bootDelay(still ? 900 : 1300);
    if (!active()) return;

    out.innerHTML = "";
    login.dataset.phase = "signature";
    const hot = appendBoot("", "boot-logo boot-logo--hot"),
      logo = appendBoot("", "boot-logo");
    fitBootLogo();
    const final = BOOT_ART.join("\n"),
      plan = bootPlan(),
      steps = still ? 0 : 84;
    for (let n = 0; n < steps; n++) {
      const frame = bootFrame(plan, n / steps);
      logo.textContent = frame.base;
      hot.textContent = frame.hot;
      await bootDelay(40);
      if (!active()) return;
    }
    logo.textContent = final;
    hot.textContent = "";
    await bootDelay(still ? 1500 : 1100);
    if (active()) enterOS();
  } catch (error) {
    // Si algo falla en un navegador raro, el visitante entra igualmente al escritorio.
    console.error("Intro de arranque:", error);
    if (active()) enterOS();
  }
};

// ASCII STUDIO: reproduce el efecto elegido; al cerrar cancela el bucle para liberar recursos.
Apps.screensaver = {
  title: "ASCII Studio",
  icon: osIcon("screensaver"),
  size: [780, 560],
  render: () =>
    `<div class="ascii-studio"><span class="card-kicker">JOSEMI-OS / CHARACTER MOTION</span><h2>El texto también se mueve.</h2><pre class="ascii-stage" aria-label="Animación del nombre JOSEMI-OS"></pre><div class="ascii-actions">${Object.entries(
      EFFECTS,
    )
      .filter(([id]) => id !== "random")
      .map(
        ([id, name]) =>
          `<button class="btn" data-effect="${id}">${name}</button>`,
      )
      .join(
        "",
      )}</div><p>Selecciona un efecto. Cada carácter encuentra su sitio.</p></div>`,
  bind(body, win) {
    let animation;
    const play = (effect) => {
      animation?.cancel();
      animation = animateAscii($(".ascii-stage", body), effect, {
        duration: state.intensity === "calm" ? 2200 : 4200,
      });
    };
    $$("[data-effect]", body).forEach(
      (b) => (b.onclick = () => play(b.dataset.effect)),
    );
    const stage = $(".ascii-stage", body);
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => fitAsciiText(stage))
        : null;
    observer?.observe(stage);
    win.__cleanup = () => {
      animation?.cancel();
      observer?.disconnect();
    };
    play(state.bootEffect);
  },
};
ICONS.push("screensaver");
currentUser.apps.push("screensaver");

// Desktop icons use one consistent illustrated SVG family.
// ACCESOS: botones con doble clic, Enter o un toque en móvil. Los iconos tienen etiquetas accesibles.
buildIcons = function () {
  const container = $("#icons");
  container.innerHTML = "";
  currentUser.apps.forEach((id, i) => {
    const app = Apps[id];
    if (!app) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon";
    button.dataset.id = id;
    button.style.setProperty("--icon-index", i);
    button.setAttribute("aria-label", `Abrir ${app.title}`);
    button.innerHTML = `<span class="glyph">${app.icon}</span><span class="lbl">${app.title}</span>`;
    button.onclick = (event) => {
      if (event.pointerType === "touch" || matchMedia("(pointer: coarse)").matches) openWindow(id);
      else {
        $$(".icon").forEach((el) => el.classList.remove("sel"));
        button.classList.add("sel");
      }
    };
    button.ondblclick = () => openWindow(id);
    button.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        openWindow(id);
      }
    };
    container.append(button);
  });
};

// SALVAPANTALLAS / TERMINAL: escenas de texto propias y Matrix a pantalla completa.
// Escenas del terminal ASCII.
const SAVER_LETTERS = {
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};
function saverWord(text) {
  return Array.from({ length: 7 }, (_, row) =>
    [...text]
      .map((letter) =>
        (SAVER_LETTERS[letter] || SAVER_LETTERS[" "])[row]
          .replace(/1/g, "█")
          .replace(/0/g, " "),
      )
      .join(" "),
  );
}
const SAVER_AXOLOTL = [
  "       .--.                   .--.       ",
  "  |\\   |  |   ______________   |  |   /|  ",
  "  | '--'  '--|              |--'  '--' |  ",
  "  '----------|   []    []   |----------'  ",
  "    .--------|      __      |--------.    ",
  "    '--------|______________|--------'    ",
  "               |  MILO  |_____          ",
  "             __|________|    /          ",
  "            |__|        |___/           ",
];
const SAVER_PILLS = [
  "       __________       __________       ",
  "     /::::::::::/|     /........../|      ",
  "    |::: RED :::| |   |:: BLUE ::| |      ",
  "    |::::::::::| /   |..........| /       ",
  "     '---------'/     '---------' /       ",
  "                                         ",
  "              FOLLOW THE WHITE RABBIT     ",
];
const SAVER_AXE = [
  "               .--------.                ",
  "              / /\\/\\/\\/\\ \\               ",
  "         ____| /        \\ |              ",
  "        /    | |    /\\    |              ",
  "        \\____| \\___/  \\__/               ",
  "             |==|                        ",
  "             |==|                        ",
  "             |==|                        ",
  "             |__|                        ",
];
const SAVER_SCENES = [
  {
    name: "Firma del sistema",
    duration: 11000,
    effect: "gather",
    field: "matrix",
    art: () => saverWord("JOSEMI-OS"),
    command: "josemi@os:~$ ./after-hours --fullscreen",
    subtitle: "JOSÉ MIGUEL MIRALLES GANDIA",
    notes: [
      "Inicializando lienzo de caracteres…",
      "Cada píxel tiene código detrás.",
      "Aprender. Construir. Volver a probar.",
    ],
  },
  {
    name: "Señal Matrix",
    duration: 10000,
    effect: "decrypt",
    field: "matrix",
    art: () => saverWord("JOSEMI"),
    command: "josemi@os:~$ wake-up --neo",
    subtitle: "DESPIERTA, JOSEMI. LA MATRIX TE ESTÁ ESPERANDO.",
    notes: [
      "La pantalla no es el límite.",
      "Sigue al conejo blanco.",
      "Hay otra realidad detrás de cada línea.",
    ],
  },
  {
    name: "Órbita ASCII",
    duration: 11000,
    effect: "laser",
    field: "orbit",
    art: () => saverWord("CODE"),
    command: "josemi@os:~$ render --ascii --orbit",
    subtitle: "TODO LO QUE VES TIENE CÓDIGO DETRÁS",
    notes: [
      "Proyectando coordenadas en caracteres…",
      "No es un vídeo: JavaScript dibuja cada fotograma.",
      "Curiosidad + disciplina + ganas de aprender.",
    ],
  },
  {
    name: "Milo ha aparecido",
    duration: 10000,
    effect: "rain",
    field: "matrix",
    art: () => SAVER_AXOLOTL,
    command: "josemi@os:~$ summon milo --axolotl",
    subtitle: "MILO / TU COMPAÑERO DE ESCRITORIO",
    notes: [
      "Un ajolote salvaje ha aparecido.",
      "Inventario: ideas, proyectos y un poco de redstone.",
      "Tip: Milo conoce las aplicaciones del escritorio.",
    ],
  },
  {
    name: "La elección",
    duration: 10000,
    effect: "decrypt",
    field: "matrix",
    art: () => SAVER_PILLS,
    command: "josemi@os:~$ cat /vault/matrix.log",
    subtitle: "¿HASTA DÓNDE LLEGA LA MADRIGUERA?",
    notes: [
      "Secret Vault guarda dos mundos.",
      "Las preguntas tienen algo que ver conmigo.",
      "Una decisión cambia lo que ves.",
    ],
  },
  {
    name: "El guerrero",
    duration: 10000,
    effect: "gather",
    field: "stars",
    art: () => SAVER_AXE,
    command: "josemi@os:~$ inspect /vault/leviathan",
    subtitle: "NO SEAS MEJOR QUE OTROS. SUPÉRATE A TI MISMO.",
    notes: [
      "Disciplina: repetir aunque cueste.",
      "Motivación: recordar por qué empezaste.",
      "God of War dejó una pista en este sistema.",
    ],
  },
  {
    name: "Firma personal",
    duration: 11000,
    effect: "laser",
    field: "matrix",
    art: () => saverWord("JOSEMI"),
    command: "josemi@os:~$ whoami",
    subtitle: "JOSÉ MIGUEL MIRALLES GANDIA / DESARROLLADOR EN PROCESO",
    notes: [
      "DAM · programación · proyectos",
      "Gimnasio. Cine. Ciencia ficción. Lectura.",
      "Lo siguiente todavía está por programar.",
    ],
  },
];
let saverAnimation = null,
  saverCycle = 0,
  idleTimer = 0,
  lastInput = Date.now();
function hideScreensaver() {
  const overlay = $("#os-screensaver");
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  saverCycle++;
  saverAnimation?.cancel();
  saverAnimation = null;
  lastInput = Date.now();
  $("#launch-saver")?.focus({ preventScroll: true });
}
function showScreensaver() {
  if (
    $("#desktop").classList.contains("hidden") ||
    !$("#shutdown").classList.contains("hidden")
  )
    return;
  const overlay = $("#os-screensaver");
  if (!overlay || !overlay.hidden) return;
  overlay.hidden = false;
  overlay.focus();
  const cycle = ++saverCycle;
  const canvas = $(".saver-field", overlay),
    ctx = canvas.getContext("2d");
  const art = $(".saver-art", overlay),
    command = $(".saver-command", overlay);
  const subtitle = $(".saver-subtitle", overlay),
    notes = $(".saver-notes", overlay);
  const label = $(".saver-scene", overlay),
    progress = $(".saver-progress", overlay);
  const chars = "01アイウエオカキクケコサシスセソ<>/:+=*";
  const total = SAVER_SCENES.reduce((sum, scene) => sum + scene.duration, 0);
  const start = performance.now();
  let width,
    height,
    columns,
    drops,
    raf = 0,
    last = -Infinity,
    currentIndex = -1,
    rows = [];
  let closed = false;
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = Math.ceil(width / 18);
    drops = Array.from({ length: columns }, (_, i) => ({
      y: seededNoise(i + 9) * height,
      speed: 35 + seededNoise(i + 3) * 70,
    }));
    fitArt();
  }
  function fitArt() {
    if (!rows.length) return;
    const widest = Math.max(...rows.map((row) => row.length));
    const size = Math.max(
      5,
      Math.min(
        64,
        (width * 0.87) / (widest * 0.61),
        (height * 0.48) / (rows.length * 1.15),
      ),
    );
    art.style.fontSize = `${size}px`;
  }
  function matrix(time, elapsed) {
    ctx.fillStyle = "rgba(2,8,5,.17)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "20px VT323";
    drops.forEach((drop, i) => {
      drop.y += drop.speed * elapsed;
      if (drop.y > height + 240) drop.y = -20;
      for (let tail = 0; tail < 9; tail++) {
        const y = drop.y - tail * 19;
        ctx.fillStyle =
          tail === 0
            ? "#baffce"
            : i % 7 === 0
              ? `rgba(80,199,215,${0.55 - tail * 0.05})`
              : `rgba(67,199,112,${0.65 - tail * 0.065})`;
        ctx.fillText(
          chars[(Math.floor(time * 5) + i * 13 + tail * 7) % chars.length],
          i * 18,
          y,
        );
      }
    });
  }
  // Un toro 3D dibujado con caracteres: profundidad, rotación y luz sin imágenes.
  function orbit(time) {
    ctx.fillStyle = "#020805";
    ctx.fillRect(0, 0, width, height);
    const cols = Math.min(94, Math.floor(width / 9)),
      lines = Math.min(40, Math.floor(height / 16));
    const pixels = Array(cols * lines).fill(" "),
      depths = Array(cols * lines).fill(0);
    const ca = Math.cos(time * 0.4),
      sa = Math.sin(time * 0.4),
      cb = Math.cos(time * 0.23),
      sb = Math.sin(time * 0.23);
    for (let a = 0; a < Math.PI * 2; a += 0.09)
      for (let b = 0; b < Math.PI * 2; b += 0.045) {
        const c = Math.cos(a),
          s = Math.sin(a),
          circle = 2 + Math.cos(b),
          h = Math.sin(b);
        const z = 1 / (s * circle * sa + h * ca + 5);
        const x = c * circle * cb - (s * circle * ca - h * sa) * sb;
        const y = c * circle * sb + (s * circle * ca - h * sa) * cb;
        const col = Math.floor(cols / 2 + cols * 0.58 * z * x),
          line = Math.floor(lines / 2 + lines * 0.64 * z * y);
        const lum = Math.max(
          0,
          Math.min(
            11,
            Math.floor(
              8 *
                ((h * sa - s * Math.cos(b) * ca) * cb -
                  s * Math.cos(b) * sa -
                  h * ca -
                  c * Math.cos(b) * sb),
            ),
          ),
        );
        const index = col + line * cols;
        if (
          col >= 0 &&
          col < cols &&
          line >= 0 &&
          line < lines &&
          z > depths[index]
        ) {
          depths[index] = z;
          pixels[index] = ".,-~:;=!*#$@"[lum];
        }
      }
    const cell = Math.min(width / (cols + 2), height / (lines + 4));
    ctx.font = `${cell}px VT323`;
    ctx.fillStyle = "#307a60";
    const x = (width - cols * cell * 0.61) / 2,
      y = (height - lines * cell) / 2;
    for (let row = 0; row < lines; row++)
      ctx.fillText(
        pixels.slice(row * cols, (row + 1) * cols).join(""),
        x,
        y + row * cell,
      );
  }
  function stars(time) {
    ctx.fillStyle = "#030806";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "20px VT323";
    for (let i = 0; i < 140; i++) {
      const phase = (time * 0.025 + seededNoise(i + 100)) % 1;
      const angle = seededNoise(i + 800) * Math.PI * 2;
      const x = width / 2 + Math.cos(angle) * phase * width * 0.7,
        y = height / 2 + Math.sin(angle) * phase * height * 0.7;
      ctx.fillStyle = `rgba(93,188,153,${phase * 0.7})`;
      ctx.fillText(i % 4 ? "+" : "*", x, y);
    }
  }
  function frame(now) {
    if (closed || cycle !== saverCycle || overlay.hidden || document.hidden)
      return;
    if (now - last < 42) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const step = Math.min(
      0.08,
      Number.isFinite(last) ? (now - last) / 1000 : 0.042,
    );
    last = now;
    const position = state.motion ? 4000 : (now - start) % total;
    let offset = 0,
      index = 0;
    while (
      index < SAVER_SCENES.length - 1 &&
      position >= offset + SAVER_SCENES[index].duration
    )
      offset += SAVER_SCENES[index++].duration;
    const scene = SAVER_SCENES[index],
      age = position - offset,
      time = (now - start) / 1000;
    if (index !== currentIndex) {
      currentIndex = index;
      rows = scene.art();
      fitArt();
      ctx.clearRect(0, 0, width, height);
      command.textContent = scene.command;
      subtitle.textContent = scene.subtitle;
      label.textContent = `${String(index + 1).padStart(2, "0")} / ${String(SAVER_SCENES.length).padStart(2, "0")} · ${scene.name}`;
      overlay.dataset.scene = scene.field;
    }
    if (scene.field === "orbit") orbit(time);
    else if (scene.field === "stars") stars(time);
    else matrix(time, step);
    const p = state.motion ? 1 : Math.min(1, age / 2900);
    art.textContent = asciiFrame(rows, scene.effect, p);
    art.style.opacity = String(
      state.motion ? 1 : Math.min(1, (scene.duration - age) / 650),
    );
    const note =
      scene.notes[
        Math.min(
          scene.notes.length - 1,
          Math.floor(age / (scene.duration / scene.notes.length)),
        )
      ];
    notes.textContent = "> " + note;
    progress.style.transform = `scaleX(${state.motion ? 1 : age / scene.duration})`;
    if (!state.motion) raf = requestAnimationFrame(frame);
  }
  saverAnimation = {
    cancel() {
      closed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    },
  };
  addEventListener("resize", resize);
  resize();
  frame(start);
}

// ESCRITORIO: crea bienvenida, barra de herramientas y salvapantallas; registra actividad para el temporizador.
function setupDesktop() {
  const toolbar = document.createElement("div");
  toolbar.className = "shell-tools";
  toolbar.innerHTML =
    '<button id="launch-search" title="Buscar aplicaciones · Ctrl+K">⌕ <span>Buscar</span><kbd>Ctrl K</kbd></button><button id="launch-saver" title="Salvapantallas ASCII">✦</button><button id="launch-settings" title="Ajustes">' +
    osIcon("settings") +
    "</button>";
  $("#desktop-tools").append(toolbar);
  $("#launch-search").onclick = () => togglePalette(true);
  $("#launch-saver").onclick = showScreensaver;
  $("#launch-settings").onclick = () => openWindow("settings");
  const saver = document.createElement("section");
  saver.id = "os-screensaver";
  saver.hidden = true;
  saver.tabIndex = -1;
  saver.setAttribute("role", "dialog");
  saver.setAttribute("aria-modal", "true");
  saver.setAttribute("aria-label", "Salvapantallas de JOSEMI");
  saver.innerHTML =
    '<canvas class="saver-field" aria-hidden="true"></canvas><header class="saver-terminal-head"><span class="saver-command"></span><span class="saver-scene"></span></header><div class="saver-stage"><pre class="saver-art" aria-hidden="true"></pre><div class="saver-subtitle"></div></div><footer class="saver-terminal-foot"><p class="saver-notes"></p><div class="saver-track"><span class="saver-progress"></span></div><div class="saver-meta"><span>JOSEMI-OS / TERMINAL ASCII</span><button class="saver-exit" type="button">Mueve el ratón o pulsa una tecla para volver ↵</button></div></footer>';
  document.body.append(saver);
  $(".saver-exit", saver).onclick = hideScreensaver;
  saver.addEventListener("keydown", (e) => {
    e.preventDefault();
    hideScreensaver();
  });
  saver.addEventListener("pointerdown", hideScreensaver);
  document.addEventListener(
    "pointermove",
    () => {
      lastInput = Date.now();
    },
    { passive: true },
  );
  document.addEventListener("keydown", () => (lastInput = Date.now()));
  document.addEventListener("pointerdown", () => (lastInput = Date.now()), {
    passive: true,
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hideScreensaver();
    lastInput = Date.now();
  });
  idleTimer = setInterval(() => {
    if (
      state.idle &&
      !document.hidden &&
      !$("#desktop").classList.contains("hidden") &&
      saver.hidden &&
      Date.now() - lastInput > state.idle * 1000 &&
      !document.activeElement?.closest(".game") &&
      !$$(".window").some(
        (w) => !w.classList.contains("minimized") && w.querySelector(".game"),
      )
    )
      showScreensaver();
  }, 5000);
  $("#desktop").addEventListener(
    "pointermove",
    (e) => {
      if (state.motion || state.intensity === "calm") return;
      const target = e.target.closest(".icon");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty(
        "--tilt-x",
        `${(e.clientY - rect.top - rect.height / 2) / 16}deg`,
      );
      target.style.setProperty(
        "--tilt-y",
        `${-(e.clientX - rect.left - rect.width / 2) / 16}deg`,
      );
    },
    { passive: true },
  );
  $("#icons").addEventListener("pointerout", (e) => {
    const icon = e.target.closest(".icon");
    if (icon) {
      icon.style.setProperty("--tilt-x", "0deg");
      icon.style.setProperty("--tilt-y", "0deg");
    }
  });
}

let paletteFocus = null,
  paletteIndex = 0;
// BUSCADOR: abre un diálogo con foco en el campo y devuelve el foco anterior al cerrar.
function togglePalette(show) {
  const modal = $("#command-palette");
  if (show) {
    if ($("#desktop").classList.contains("hidden")) return;
    paletteFocus = document.activeElement;
    modal.hidden = false;
    $("#palette-query").value = "";
    paletteIndex = 0;
    renderPalette();
    $("#palette-query").focus();
  } else {
    modal.hidden = true;
    paletteFocus?.focus({ preventScroll: true });
  }
}
// RESULTADOS: filtra nombres e identificadores; cada botón abre la aplicación correspondiente.
function renderPalette() {
  const query = $("#palette-query").value.trim().toLowerCase(),
    ids = [...currentUser.apps, "pacman", "tetris", "minesweeper"].filter((id) =>
      `${Apps[id].title} ${id}`.toLowerCase().includes(query),
    );
  paletteIndex = Math.min(paletteIndex, Math.max(0, ids.length - 1));
  const list = $("#palette-results");
  list.innerHTML = ids.length
    ? ids
        .map(
          (id, i) =>
            `<button role="option" aria-selected="${i === paletteIndex}" class="${i === paletteIndex ? "current" : ""}" data-launch="${id}">${Apps[id].icon}<span>${Apps[id].title}</span><small>ABRIR ↵</small></button>`,
        )
        .join("")
    : '<p class="palette-empty">No hay aplicaciones con ese nombre.</p>';
  $$("[data-launch]", list).forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.launch;
        togglePalette(false);
        openWindow(id);
      }),
  );
}
// TECLADO: Ctrl+K abre, flechas seleccionan, Enter ejecuta, Escape cierra y Tab permanece en el diálogo.
function setupPalette() {
  const overlay = document.createElement("div");
  overlay.id = "command-palette";
  overlay.hidden = true;
  overlay.innerHTML =
    '<section role="dialog" aria-modal="true" aria-label="Buscar aplicaciones"><div class="palette-head"><span>⌕</span><input id="palette-query" placeholder="Busca en tu escritorio…" aria-label="Buscar aplicación" autocomplete="off"><button class="btn palette-close">ESC</button></div><div id="palette-results" role="listbox" aria-label="Aplicaciones"></div><footer>↑ ↓ seleccionar · ENTER abrir · ESC cerrar</footer></section>';
  document.body.append(overlay);
  $(".palette-close", overlay).onclick = () => togglePalette(false);
  overlay.onclick = (e) => {
    if (e.target === overlay) togglePalette(false);
  };
  const query = $("#palette-query");
  query.oninput = () => {
    paletteIndex = 0;
    renderPalette();
  };
  query.onkeydown = (e) => {
    const count = $$("[data-launch]", $("#palette-results")).length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      paletteIndex = Math.max(
        0,
        Math.min(count - 1, paletteIndex + (e.key === "ArrowDown" ? 1 : -1)),
      );
      renderPalette();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      $$("[data-launch]", $("#palette-results"))[paletteIndex]?.click();
    }
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      togglePalette(overlay.hidden);
    }
    if (e.key === "Escape" && !overlay.hidden) {
      e.preventDefault();
      togglePalette(false);
    }
    if (e.key === "Tab" && !overlay.hidden) {
      const nodes = $$("input,button", overlay);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// Animate the desktop only on entry, not endlessly behind work windows.
const shellEnterOS = enterOS;
enterOS = function () {
  if (enteringOS) return;
  currentBootAnimation?.cancel();
  shellEnterOS();
};
const windowObserver = new MutationObserver((records) => {
  for (const record of records)
    for (const node of record.addedNodes)
      if (node.nodeType === 1 && node.classList.contains("window")) {
        const originalClose = $(".close", node).onclick;
        $(".close", node).onclick = () => {
          node.classList.add("closing");
          originalClose();
        };
        $(".win__bar", node).addEventListener("dblclick", (e) => {
          if (!e.target.closest("button")) maximizeWithMotion(node);
        });
      }
});
// A single bounded character canvas; no per-particle DOM or accumulating timers.
// FONDOS: devuelve una matriz de caracteres y brillo. Es cálculo puro: todavía no dibuja nada.
// RENDIMIENTO: el búfer se reutiliza entre fotogramas y solo recuerda las celdas ocupadas,
// así no se crean miles de objetos por fotograma ni se recorren las celdas vacías al dibujar.
const atmosphereBuffer = { size: 0, w: 0, h: 0, ch: [], light: null, ink: [], used: [] };
function atmosphereFrame(kind, w, h, t, density = 55) {
  const buf = atmosphereBuffer;
  if (buf.size !== w * h) {
    buf.size = w * h;
    buf.ch = new Array(buf.size).fill(" ");
    buf.light = new Float32Array(buf.size);
    buf.ink = new Array(buf.size).fill("");
    buf.used = [];
  }
  for (const i of buf.used) buf.ch[i] = " ";
  buf.used.length = 0;
  buf.w = w;
  buf.h = h;
  const put = (x, y, ch, light = 0.4) => {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = y * w + x;
    if (buf.ch[i] === " ") buf.used.push(i);
    buf.ch[i] = ch;
    buf.light[i] = Math.max(0, Math.min(1, light));
    buf.ink[i] = "";
  };
  if (kind === "storm" || kind === "rain") {
    for (let i = 0; i < Math.floor((w * h * density) / 1400); i++) {
      const speed = 6 + seededNoise(i + 32) * 9,
        y = ((seededNoise(i + 20) * h + t * speed) % (h + 8)) - 4,
        x = (seededNoise(i + 1) * w - t * speed * 0.36 + w * 100) % w;
      for (let tail = 0; tail < 3; tail++)
        put(x + tail * 0.4, y - tail, "/", 0.22 + (3 - tail) * 0.08);
    }
    if (kind === "storm") {
      const cycle = Math.floor(t / 6),
        phase = t % 6;
      if (phase > 0.7 && phase < 1.45) {
        const root = w * (0.15 + seededNoise(cycle + 88) * 0.7),
          growth = Math.min(h, (phase - 0.7) * h * 5),
          light = Math.max(0.3, 1 - (phase - 1) * 1.8);
        for (let y = 0; y < growth; y++) {
          const x = root + Math.sin(y * 0.6 + cycle) * 3 - y * 0.28;
          put(x, y, "/", light);
          put(x + 1, y, "/", light);
          if (y > h * 0.24 && y < h * 0.7 && y % 5 === 0)
            for (let b = 0; b < 7; b++)
              put(x + b, y + b * 0.55, "/", light * 0.7);
        }
        const impactX =
          root + Math.sin((h - 1) * 0.6 + cycle) * 3 - (h - 1) * 0.28;
        if (growth >= h)
          for (let s = 0; s < 18; s++) {
            const angle = s * 0.7,
              r = (phase - 0.9) * 20;
            put(
              impactX + Math.cos(angle) * r,
              h - 2 - Math.abs(Math.sin(angle) * r * 0.35),
              s % 2 ? "*" : "+",
              light * 0.7,
            );
          }
      }
    }
  } else if (kind === "aurora" || kind === "terrain") {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const value =
          kind === "aurora"
            ? Math.sin(x * 0.09 + t * 0.35) +
              Math.cos(y * 0.23 + x * 0.03 - t * 0.5) +
              Math.sin(x * 0.035 + y * 0.12 + t * 0.3)
            : Math.sin(x * 0.08 + t * 0.06) * 1.8 +
              Math.cos(y * 0.16 - t * 0.04) +
              Math.sin(x * 0.05 + y * 0.09);
        const band = Math.abs(Math.sin(value * (kind === "terrain" ? 5 : 2)));
        if (band < density / 700)
          put(
            x,
            y,
            kind === "terrain" ? (band < 0.04 ? "+" : ".") : "~",
            0.22 + Math.abs(value) * 0.13,
          );
      }
  } else if (kind === "stars") {
    for (let i = 0; i < Math.floor((w * h * density) / 1100); i++) {
      const x = seededNoise(i + 3) * w,
        y = seededNoise(i + 7) * h,
        light = 0.28 + (Math.sin(t * 0.8 + i) + 1) * 0.2;
      put(x, y, i % 6 === 0 ? "+" : ".", light);
      if (i % 9 === 0)
        for (let j = 1; j < 5; j++) put(x + j, y + j * 0.2, ".", 0.16);
    }
    const cycle = Math.floor(t / 9),
      phase = t % 9;
    if (phase < 2)
      for (let tail = 0; tail < 7; tail++)
        put(
          w - phase * w * 0.4 + tail,
          seededNoise(cycle + 300) * h + phase * 4 - tail * 0.15,
          tail ? "·" : "*",
          0.8 - tail * 0.09,
        );
  } else if (["matrix", "matrixBlue", "matrixDepth"].includes(kind)) {
    // Cada columna tiene su velocidad y longitud. La cabeza brilla y la cola se desvanece.
    const glyphs =
      "012345789アイウエオカキクケコサシスセソタチツテトナニヌネノ<>/{}";
    for (let x = 0; x < w; x++) {
      const layer = seededNoise(x + 230),
        speed = 3 + layer * 11,
        span = h + 26;
      const head = ((t * speed + seededNoise(x + 90) * span) % span) - 8;
      const length = 5 + Math.floor(density / 4 + layer * 10);
      if (seededNoise(x + 600) > density / 100 + 0.12) continue;
      for (let tail = 0; tail < length; tail++) {
        const y = Math.floor(head - tail);
        if (y < 0 || y >= h) continue;
        const light =
          tail === 0
            ? 1
            : Math.pow(1 - tail / length, 1.7) * (0.35 + layer * 0.5);
        put(
          x,
          y,
          glyphs[
            Math.floor(
              seededNoise(x * 73 + y * 19 + Math.floor(t * (layer + 1) * 4)) *
                glyphs.length,
            )
          ],
          kind === "matrixDepth" ? light * (0.3 + layer * 0.7) : light,
        );
        buf.ink[y * w + x] =
            tail === 0
              ? "head"
              : kind === "matrixBlue" && (x % 7 < 2 || layer > 0.8)
                ? "cyan"
                : "green";
      }
    }
  }

  return buf;
}
let atmosphereCanvas = null,
  atmosphereContext = null,
  atmosphereRAF = 0,
  atmosphereTime = 0,
  atmosphereLast = null,
  atmosphereDrawn = -Infinity,
  atmosphereSize = "",
  atmosphereColors = [];
// RENDIMIENTO: el fondo solo se anima si el escritorio es visible y no hay un juego o salvapantallas delante.
function atmosphereActive() {
  return (
    !document.hidden &&
    !state.motion &&
    state.atmosphere !== "none" &&
    !document.body.classList.contains("has-pixel-wallpaper") &&
    !document.body.classList.contains("has-god-of-war") &&
    !$("#desktop").classList.contains("hidden") &&
    $("#shutdown").classList.contains("hidden") &&
    $("#os-screensaver")?.hidden &&
    !$$(".window").some(
      (w) => !w.classList.contains("minimized") && w.querySelector(".game"),
    )
  );
}
// LIENZO: limita resolución y número de celdas, obtiene la matriz y dibuja cada carácter con Canvas 2D.
function drawAtmosphere() {
  if (!atmosphereContext) return;
  const width = innerWidth,
    height = innerHeight,
    cell = Math.max(innerWidth < 600 ? 13 : 15, width / 180),
    line = Math.max(19, height / 65),
    cols = Math.ceil(width / cell),
    rows = Math.ceil(height / line),
    dpr = Math.min(devicePixelRatio || 1, 1.5),
    size = `${width}:${height}:${dpr}`;
  if (size !== atmosphereSize) {
    atmosphereSize = size;
    atmosphereCanvas.width = Math.round(width * dpr);
    atmosphereCanvas.height = Math.round(height * dpr);
    atmosphereContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  atmosphereContext.clearRect(0, 0, width, height);
  atmosphereContext.font = state.atmosphere.startsWith("matrix")
    ? "18px VT323"
    : "16px VT323";
  atmosphereContext.textBaseline = "top";
  const frame = atmosphereFrame(
    state.atmosphere,
    Math.min(cols, 180),
    Math.min(rows, 65),
    state.motion ? 3.5 : atmosphereTime,
    state.weatherDensity,
  );
  const calm = state.intensity === "calm" ? 0.65 : 1,
    inks = { head: "#defff3", cyan: "#52d8ec", green: "#36dd87" };
  let lastFill = "";
  for (const i of frame.used) {
    const x = i % frame.w,
      y = (i - x) / frame.w,
      fill = inks[frame.ink[i]] || atmosphereColors[Math.floor((x / cols) * 3) % 3];
    atmosphereContext.globalAlpha = frame.light[i] * calm;
    if (fill !== lastFill) atmosphereContext.fillStyle = lastFill = fill;
    atmosphereContext.fillText(frame.ch[i], x * cell, y * line);
  }
  atmosphereContext.globalAlpha = 1;
}
// TIEMPO DEL FONDO: limita los fotogramas y evita saltos al volver de otra pestaña.
function atmosphereTick(now) {
  atmosphereRAF = 0;
  if (!atmosphereActive()) {
    atmosphereLast = null;
    return;
  }
  if (atmosphereLast !== null)
    atmosphereTime +=
      Math.min(0.1, (now - atmosphereLast) / 1000) * state.weatherSpeed;
  atmosphereLast = now;
  if (now - atmosphereDrawn > (state.intensity === "calm" ? 83 : 42)) {
    drawAtmosphere();
    atmosphereDrawn = now;
  }
  atmosphereRAF = requestAnimationFrame(atmosphereTick);
}
// SINCRONIZACIÓN: crea un único Canvas, aplica colores y decide iniciar o cancelar su bucle.
function syncAtmosphere() {
  if (!atmosphereCanvas) {
    atmosphereCanvas = document.createElement("canvas");
    atmosphereCanvas.id = "ascii-wall";
    atmosphereCanvas.setAttribute("aria-hidden", "true");
    $("#bg").append(atmosphereCanvas);
    atmosphereContext = atmosphereCanvas.getContext("2d");
  }
  atmosphereCanvas.hidden = state.atmosphere === "none";
  atmosphereColors = [
    state.accent,
    THEMES[state.theme].accent,
    ["paper", "glacier"].includes(state.theme) ? "#647f95" : "#b7a7ec",
  ];
  document.body.dataset.atmosphere = state.atmosphere;
  drawAtmosphere();
  if (!atmosphereActive()) {
    cancelAnimationFrame(atmosphereRAF);
    atmosphereRAF = 0;
    atmosphereLast = null;
  } else if (!atmosphereRAF)
    atmosphereRAF = requestAnimationFrame(atmosphereTick);
}
setupDesktop();
setupPalette();
windowObserver.observe($("#desktop"), { childList: true });
new MutationObserver((records) => {
  if (
    records.some(
      (r) =>
        (r.type === "attributes" &&
          (r.target.id === "desktop" ||
            r.target.classList.contains("window"))) ||
        (r.type === "childList" &&
          [...r.addedNodes, ...r.removedNodes].some(
            (n) => n.nodeType === 1 && n.classList.contains("window"),
          )),
    )
  )
    syncAtmosphere();
}).observe($("#desktop"), {
  attributes: true,
  attributeFilter: ["class"],
  childList: true,
  subtree: true,
});
new MutationObserver(syncAtmosphere).observe($("#shutdown"), {
  attributes: true,
  attributeFilter: ["class"],
});
new MutationObserver(syncAtmosphere).observe($("#os-screensaver"), {
  attributes: true,
  attributeFilter: ["hidden"],
});
document.addEventListener("visibilitychange", syncAtmosphere);
window.addEventListener("resize", syncAtmosphere);
window.addEventListener("resize", () => {
  fitBootLogo();
  $$(".boot-logo--hero,.ascii-stage,.saver-art").forEach(fitAsciiText);
});
if (state.experienceVersion !== 5) {
  state.atmosphere = "matrixBlue";
  state.bootEffect = "cinematic";
  state.theme = "night";
  state.accent = THEMES.night.accent;
  state.bg = THEMES.night.bg;
  state.experienceVersion = 5;
}
applyTheme();
save();
buildIcons();
buildMenu();
buildClock();
buildParallax();
buildStart();
buildContext();
buildKonami();
initDirectAccess();

/* === END shell.js === */

/* PERSONALIZACIÓN: datos, iconos, Secret Vault y ajustes existentes. */
/* PERSONALIZACIÓN: datos, Secret Vault, fondos, ajustes e iconos pixel.
   Este bloque sigue al motor dentro del mismo script.js. */
(() => {
  "use strict";

  const GOW_URL =
    "assets/wallpapers/god-of-war-ragnarok.jpg";

  // Estado para desbloqueos y fondo personalizado.
  if (!state.vault) state.vault = { matrix: false, gof: false };
  if (!state.wallpaper) state.wallpaper = state.wp === 4 ? "matrix" : "static";
  if (state.wallpaper === "godOfWar" && !state.vault.gof)
    state.wallpaper = "static";
  if (!state.vault.matrix && state.atmosphere === "matrixBlue")
    state.atmosphere = "matrix";
  save();

  // DATOS PERSONALES confirmados por Josemi.
  Object.assign(PROFILE, {
    nombre: "José Miguel Miralles Gandia",
    corto: "Josemi",
    rol: "Desarrollador de software en proceso",
    estudios:
      "DAM · Desarrollo de Aplicaciones Multiplataforma · IES Dr. Lluís Simarro",
    estado: "Aprendiendo mientras construyo proyectos reales",
    ubicacion: "España",
    bio: "Desde pequeño me apasiona la tecnología. Empecé jugando a videojuegos y me despertó la curiosidad por entender cómo funcionan las cosas. La televisión, el móvil y el ordenador tienen código detrás, y ahora quiero aprender a construir mis propias ideas.",
    aspiracion:
      "Aspiro a desarrollar automatizaciones y aplicaciones para grandes empresas, combinando programación, inteligencia artificial y creatividad para construir soluciones útiles.",
    gustos: [
      "Programar",
      "Gimnasio",
      "Deporte",
      "Proyectos",
      "Ciencia ficción",
      "Cine",
      "Lectura",
      "IA",
      "Automatización",
    ],
  });

  // Proyectos.
  Object.assign(PROJECTS, {
    museo: {
      name: "Portfolio del Museu grec",
      desc: "Ejemplo de web que estoy construyendo para aprender a presentar información, diseño y estructura. Repositorio: portafolio-web.",
      lang: "HTML / CSS / JavaScript",
      db: "—",
      fw: "Vanilla",
      date: "2026",
      status: "dev",
      tags: ["Web", "Diseño", "Formación"],
      github: "https://github.com/josemidev1-code/portafolio-web",
    },
  });

  // ICONOS PROPIOS: rejilla de 32 píxeles, contorno oscuro y tres tonos por material.
  // Cada rectángulo tiene coordenadas enteras: los detalles conservan bordes pixel art.
  const pixelRects = (rects) =>
    rects
      .map(
        ([x, y, w, h, color]) =>
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`,
      )
      .join("");
  const PIXEL_ICONS = {
    readme: pixelRects([
      [6, 3, 18, 26, "#172725"],
      [7, 2, 15, 26, "#f1e8c9"],
      [22, 7, 3, 21, "#b9ab8d"],
      [8, 3, 12, 23, "#fff7dc"],
      [20, 2, 2, 6, "#c6b897"],
      [22, 4, 2, 4, "#ddd1ad"],
      [9, 6, 8, 1, "#eee1bf"],
      [10, 10, 10, 2, "#587766"],
      [10, 14, 11, 1, "#879782"],
      [10, 17, 11, 1, "#879782"],
      [10, 20, 7, 1, "#879782"],
      [17, 24, 8, 4, "#226942"],
      [18, 24, 6, 1, "#8fe5aa"],
      [20, 25, 1, 2, "#d5ffe2"],
      [23, 9, 1, 16, "#978d74"],
    ]),
    about: pixelRects([
      [5, 3, 22, 27, "#182b2b"],
      [6, 2, 20, 27, "#7fabb0"],
      [7, 3, 18, 25, "#c6d7c9"],
      [8, 4, 16, 22, "#e3e7d5"],
      [12, 7, 8, 2, "#3b302d"],
      [11, 9, 10, 3, "#4a3730"],
      [12, 10, 8, 7, "#e9b890"],
      [13, 11, 6, 5, "#ffd3a6"],
      [13, 13, 1, 1, "#293c35"],
      [18, 13, 1, 1, "#293c35"],
      [15, 16, 3, 2, "#d09573"],
      [9, 19, 14, 6, "#355c86"],
      [11, 18, 10, 2, "#5d89ae"],
      [13, 19, 6, 5, "#659bbe"],
      [15, 19, 2, 2, "#f4e5cb"],
      [8, 6, 2, 1, "#8aac98"],
      [21, 6, 2, 1, "#8aac98"],
      [10, 26, 12, 1, "#8aac98"],
    ]),
    projects: pixelRects([
      [3, 8, 26, 21, "#242821"],
      [4, 7, 11, 4, "#9e632b"],
      [5, 6, 8, 1, "#f0c674"],
      [4, 10, 24, 17, "#c48b3f"],
      [5, 11, 22, 14, "#e5b85d"],
      [6, 12, 20, 2, "#ffe3a0"],
      [6, 16, 20, 9, "#dca54c"],
      [8, 14, 17, 1, "#9b7136"],
      [7, 9, 8, 1, "#f7d587"],
      [18, 17, 8, 7, "#315855"],
      [19, 18, 6, 5, "#173431"],
      [20, 19, 1, 1, "#a5efcb"],
      [21, 20, 1, 1, "#a5efcb"],
      [20, 21, 1, 1, "#a5efcb"],
      [23, 21, 2, 1, "#78d9b1"],
      [5, 26, 20, 1, "#b5863c"],
      [28, 13, 1, 13, "#755831"],
    ]),
    skills: pixelRects([
      [4, 8, 11, 12, "#162b28"],
      [5, 7, 9, 11, "#729c95"],
      [6, 8, 7, 8, "#afd0bd"],
      [7, 9, 2, 3, "#284b42"],
      [11, 9, 2, 3, "#284b42"],
      [8, 13, 3, 1, "#284b42"],
      [9, 17, 3, 10, "#65857b"],
      [10, 18, 1, 8, "#d7eed7"],
      [8, 26, 5, 3, "#38574b"],
      [20, 3, 4, 3, "#233c34"],
      [18, 6, 8, 2, "#d99f3e"],
      [16, 8, 12, 3, "#f4cc68"],
      [17, 11, 10, 3, "#ddaa42"],
      [19, 14, 6, 2, "#bc8436"],
      [20, 16, 4, 12, "#a67032"],
      [20, 16, 2, 10, "#e6b85b"],
      [19, 26, 6, 3, "#5e4830"],
      [18, 8, 2, 2, "#fff0b8"],
      [23, 11, 3, 1, "#8b632b"],
    ]),
    terminal: pixelRects([
      [3, 4, 26, 24, "#081a14"],
      [4, 3, 24, 24, "#486e57"],
      [5, 4, 22, 22, "#93d6a0"],
      [6, 5, 20, 20, "#10261d"],
      [7, 6, 18, 2, "#294f37"],
      [8, 6, 1, 1, "#91e6ad"],
      [10, 6, 1, 1, "#5b9770"],
      [12, 6, 1, 1, "#5b9770"],
      [7, 9, 18, 14, "#0a1812"],
      [10, 12, 2, 2, "#bcffd1"],
      [12, 14, 2, 2, "#bcffd1"],
      [10, 16, 2, 2, "#bcffd1"],
      [17, 17, 6, 2, "#8ceca6"],
      [17, 19, 6, 1, "#356346"],
      [8, 22, 15, 1, "#153b28"],
      [27, 6, 1, 19, "#406147"],
      [6, 26, 20, 1, "#30523a"],
    ]),
    contact: pixelRects([
      [3, 8, 26, 19, "#172d34"],
      [4, 7, 24, 18, "#6896ac"],
      [5, 8, 22, 15, "#b0d7df"],
      [5, 9, 3, 2, "#e4f2e8"],
      [8, 11, 3, 2, "#d2e8e5"],
      [11, 13, 3, 2, "#d2e8e5"],
      [14, 15, 4, 2, "#f4f3db"],
      [18, 13, 3, 2, "#d2e8e5"],
      [21, 11, 3, 2, "#d2e8e5"],
      [24, 9, 3, 2, "#e4f2e8"],
      [5, 21, 4, 2, "#8db7c5"],
      [9, 19, 3, 2, "#8db7c5"],
      [20, 19, 3, 2, "#8db7c5"],
      [23, 21, 4, 2, "#8db7c5"],
      [6, 24, 20, 1, "#456e84"],
      [23, 4, 5, 5, "#b85054"],
      [24, 4, 3, 3, "#fa8b88"],
      [25, 5, 1, 1, "#ffe5bc"],
    ]),
    arcade: pixelRects([
      [4, 19, 24, 10, "#17282a"],
      [5, 18, 22, 9, "#45546a"],
      [6, 19, 20, 2, "#748697"],
      [6, 21, 20, 4, "#354550"],
      [12, 8, 3, 12, "#293c3c"],
      [13, 8, 1, 10, "#afc0af"],
      [10, 4, 7, 5, "#853b48"],
      [11, 3, 5, 5, "#e05c61"],
      [12, 3, 3, 1, "#ffa99a"],
      [10, 6, 7, 2, "#b84552"],
      [20, 21, 4, 3, "#a54e4b"],
      [21, 20, 3, 3, "#ff8270"],
      [7, 23, 2, 1, "#a5bfbe"],
      [10, 23, 2, 1, "#a5bfbe"],
      [8, 27, 3, 2, "#0b1c20"],
      [21, 27, 3, 2, "#0b1c20"],
    ]),
    settings: pixelRects([
      [13, 2, 6, 28, "#1c3032"],
      [2, 13, 28, 6, "#1c3032"],
      [7, 5, 18, 22, "#1c3032"],
      [5, 7, 22, 18, "#1c3032"],
      [13, 3, 6, 26, "#8ea9b0"],
      [3, 13, 26, 6, "#8ea9b0"],
      [8, 6, 16, 20, "#a9c5c6"],
      [6, 8, 20, 16, "#a9c5c6"],
      [10, 6, 12, 3, "#d9e9d9"],
      [6, 10, 3, 12, "#c3dcd3"],
      [11, 10, 10, 12, "#36534e"],
      [10, 11, 12, 10, "#36534e"],
      [12, 12, 8, 8, "#122e29"],
      [14, 13, 4, 1, "#98b9a4"],
      [13, 14, 6, 4, "#739780"],
      [14, 18, 4, 1, "#416d5d"],
      [24, 11, 2, 12, "#678994"],
      [12, 25, 10, 1, "#627f86"],
    ]),
    system: pixelRects([
      [3, 4, 26, 21, "#172b30"],
      [4, 3, 24, 20, "#7c969d"],
      [5, 4, 22, 17, "#b7ceca"],
      [6, 5, 20, 15, "#18392d"],
      [7, 6, 18, 12, "#0e261b"],
      [8, 13, 4, 1, "#90edb1"],
      [11, 11, 2, 2, "#90edb1"],
      [13, 8, 2, 4, "#aff9b8"],
      [15, 12, 2, 4, "#90edb1"],
      [17, 15, 2, 2, "#90edb1"],
      [19, 12, 2, 4, "#90edb1"],
      [21, 12, 3, 1, "#90edb1"],
      [25, 21, 1, 1, "#a2ffcf"],
      [13, 23, 6, 4, "#758c91"],
      [14, 24, 4, 2, "#a2b3ad"],
      [9, 27, 14, 2, "#506b6e"],
      [10, 27, 12, 1, "#c4d2c4"],
    ]),
    trash: pixelRects([
      [8, 8, 16, 22, "#172a2e"],
      [9, 9, 14, 20, "#658a8f"],
      [10, 10, 12, 17, "#a0c1bf"],
      [11, 10, 2, 16, "#d3e3d6"],
      [15, 10, 2, 16, "#6e9294"],
      [19, 10, 2, 16, "#6e9294"],
      [7, 6, 18, 3, "#405f65"],
      [6, 5, 20, 2, "#b5cfca"],
      [8, 4, 16, 1, "#e5ead7"],
      [13, 2, 6, 2, "#526f71"],
      [14, 1, 4, 1, "#c6d8ca"],
      [11, 28, 10, 1, "#3d666b"],
    ]),
    easter: pixelRects([
      [4, 11, 24, 18, "#23302a"],
      [5, 10, 22, 17, "#b9853d"],
      [6, 11, 20, 14, "#e0b766"],
      [7, 12, 18, 2, "#ffe2a0"],
      [7, 15, 18, 9, "#cca24f"],
      [9, 3, 14, 8, "#324d48"],
      [11, 2, 10, 2, "#8eafa1"],
      [10, 4, 3, 7, "#b9d5b7"],
      [19, 4, 3, 7, "#6e8d7c"],
      [13, 4, 6, 2, "#142c28"],
      [13, 6, 6, 5, "#081d17"],
      [13, 16, 6, 4, "#3c4830"],
      [15, 19, 2, 4, "#3c4830"],
      [14, 17, 4, 2, "#131e17"],
      [7, 25, 17, 1, "#8c6b32"],
      [24, 15, 1, 9, "#a47c36"],
    ]),
    screensaver: pixelRects([
      [3, 4, 26, 22, "#19302d"],
      [4, 3, 24, 21, "#567c71"],
      [5, 4, 22, 19, "#9ac7b0"],
      [6, 5, 20, 16, "#061d18"],
      [8, 7, 1, 2, "#43825b"],
      [8, 11, 1, 3, "#7fdea2"],
      [11, 8, 1, 3, "#adebbb"],
      [11, 13, 1, 3, "#387d59"],
      [15, 6, 1, 3, "#4d9f8a"],
      [15, 11, 1, 4, "#89ebc4"],
      [19, 8, 1, 3, "#78cad0"],
      [19, 13, 1, 3, "#2e666e"],
      [23, 6, 1, 3, "#a8f9d0"],
      [23, 11, 1, 4, "#457f64"],
      [7, 18, 17, 1, "#6ac9a0"],
      [12, 24, 8, 3, "#668a7f"],
      [9, 27, 14, 2, "#34594d"],
      [10, 27, 12, 1, "#9cc4ac"],
    ]),
    pacman: pixelRects([
      [10, 4, 12, 2, "#735c26"],
      [6, 6, 18, 4, "#f4cb56"],
      [4, 10, 18, 6, "#e8b947"],
      [4, 16, 14, 5, "#e8b947"],
      [6, 21, 18, 4, "#e8b947"],
      [10, 25, 12, 2, "#b18b34"],
      [8, 7, 10, 2, "#ffe68a"],
      [6, 10, 3, 9, "#ffdf6f"],
      [17, 8, 2, 2, "#27332b"],
      [18, 13, 8, 3, "#10241a"],
      [21, 10, 5, 3, "#10241a"],
      [18, 16, 8, 3, "#10241a"],
      [23, 19, 3, 2, "#10241a"],
      [27, 14, 3, 3, "#e8e6c1"],
    ]),
    tetris: pixelRects([
      [4, 3, 24, 26, "#21313a"],
      [5, 4, 22, 24, "#3d4e5e"],
      [6, 5, 20, 22, "#152831"],
      [8, 7, 5, 5, "#9168b3"],
      [13, 7, 5, 5, "#b98ee0"],
      [18, 7, 5, 5, "#9168b3"],
      [13, 12, 5, 5, "#9168b3"],
      [9, 8, 3, 1, "#dac1f5"],
      [14, 8, 3, 1, "#edd7ff"],
      [19, 8, 3, 1, "#dac1f5"],
      [14, 13, 3, 1, "#dac1f5"],
      [8, 21, 5, 5, "#5fa49c"],
      [13, 21, 5, 5, "#d5a857"],
      [18, 21, 5, 5, "#d5a857"],
      [18, 16, 5, 5, "#d5a857"],
      [9, 22, 3, 1, "#9de5c6"],
      [14, 22, 3, 1, "#f8daa0"],
      [19, 17, 3, 1, "#f8daa0"],
    ]),
  };
  const pixelIcon = (id) =>
    `<svg class="os-icon os-icon--${id}" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">${PIXEL_ICONS[id] || PIXEL_ICONS.projects}</svg>`;

  Object.keys(PIXEL_ICONS).forEach((id) => {
    if (Apps[id]) Apps[id].icon = pixelIcon(id);
  });
  if (Apps.welcome) Apps.welcome.icon = pixelIcon("readme");

  // JOSEMI Music deja de ser app/icono.
  if (Apps.music) delete Apps.music;
  currentUser.apps = (currentUser.apps || []).filter((id) => id !== "music");
  // Sobre mí.
  Apps.about = {
    title: "Sobre mí",
    icon: pixelIcon("about"),
    render: () => `
      <section class="profile-hero">
        <div class="profile-hero__terminal"><span>josemi@portfolio</span><b>DESARROLLADOR EN PROCESO</b></div>
        <h2>${PROFILE.nombre}</h2>
        <p>${PROFILE.bio}</p>
        <div class="chips">${PROFILE.gustos.map((x) => `<span class="chip">${x}</span>`).join("")}</div>
      </section>
      <div class="content-grid">
        <article class="content-card">
          <span class="card-kicker">01 / AHORA</span>
          <h3>Qué estoy haciendo</h3>
          <p>Estudio <strong>DAM</strong> en <strong>IES Dr. Lluís Simarro</strong>. Trabajo en HTML, CSS, JavaScript, Git y GitHub con este portfolio y proyectos de formación.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">02 / MOTIVACIÓN</span>
          <h3>De jugar a construir</h3>
          <p>Desde pequeño me apasiona la tecnología. Empezó con videojuegos, televisión, móvil y ordenador; ahora quiero entender el código y crear mis propias ideas.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">03 / VIRTUDES</span>
          <h3>Cómo trabajo</h3>
          <p>Disciplina, motivación, ganas de aprender y compromiso con lo que hago. Prefiero progreso real y pruebas honestas antes que exagerar experiencia.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">04 / FUERA DEL CÓDIGO</span>
          <h3>Aficiones</h3>
          <p>Gimnasio, deporte, programar, proyectos, ciencia ficción, cine y lectura.</p>
        </article>
      </div>`,
  };

  // Proyectos.
  Apps.projects = {
    title: "Proyectos",
    icon: pixelIcon("projects"),
    render: () => `
      <div class="app-title">/PROYECTOS</div>
      <p class="bio">Aquí separo lo que ya estoy construyendo de las áreas en las que quiero seguir experimentando. No relleno el portfolio con proyectos inventados.</p>
      <div class="folder-grid">
        <div class="folder" tabindex="0" data-folder="web"><span class="g">⌘</span><span class="n">JOSEMI-OS</span><small>Proyecto real</small></div>
        <div class="folder" tabindex="0" data-folder="museo"><span class="g">◈</span><span class="n">Museu grec</span><small>Formación</small></div>
        <div class="folder" tabindex="0" data-folder="school"><span class="g">{ }</span><span class="n">DAM</span><small>Formación</small></div>
        <div class="folder" tabindex="0" data-folder="ai"><span class="g">✦</span><span class="n">IA + software</span><small>Roadmap</small></div>
      </div>`,
    bind(b) {
      b.querySelectorAll(".folder").forEach((f) => {
        const abrir = () => openProject(f.dataset.folder);
        f.setAttribute("role", "button");
        f.addEventListener("click", (event) => {
          if (event.pointerType === "touch" || matchMedia("(pointer: coarse)").matches) abrir();
        });
        f.addEventListener("dblclick", (event) => {
          if (event.pointerType !== "touch" && !matchMedia("(pointer: coarse)").matches) abrir();
        });
        f.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir();
          }
        });
      });
    },
  };

  // Contacto real.
  Apps.contact = {
    title: "Contacto",
    icon: pixelIcon("contact"),
    render: () => `
      <div class="contact contact--modern">
        <span class="card-kicker">CONTACTO / NETWORK</span>
        <h2>¿Construimos algo?</h2>
        <p>Estoy aprendiendo y abierto a oportunidades, feedback y proyectos reales.</p>
        <div class="links">
          <a class="clink" href="https://github.com/josemidev1-code" target="_blank" rel="noopener"><span class="g">GH</span><span><b>GitHub</b><small>@josemidev1-code</small></span><i>↗</i></a>
          <a class="clink" href="https://www.linkedin.com/in/jose-miguel-miralles-gandia-74347b43a/" target="_blank" rel="noopener"><span class="g">IN</span><span><b>LinkedIn</b><small>José Miguel Miralles Gandia</small></span><i>↗</i></a>
          <a class="clink" href="mailto:josemidev1@gmail.com"><span class="g">@</span><span><b>Email</b><small>josemidev1@gmail.com</small></span><i>↗</i></a>
          <a class="clink" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener"><span class="g">OS</span><span><b>JOSEMI-OS</b><small>Repositorio del portfolio</small></span><i>↗</i></a>
          <a class="clink" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener"><span class="g">◈</span><span><b>Museu grec</b><small>portafolio-web</small></span><i>↗</i></a>
        </div>
        <button class="btn btn--accent" id="copy-email">COPIAR EMAIL</button>
      </div>`,
    bind(b) {
      $("#copy-email", b).addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText("josemidev1@gmail.com");
          toast("Email copiado al portapapeles.");
        } catch {
          toast("No se ha podido acceder al portapapeles.");
        }
      });
    },
  };

  // Secret Vault personal.
  Apps.easter = {
    title: "Secret Vault",
    icon: pixelIcon("easter"),
    size: [760, 700],
    render: () => `
      <section class="vault vault--personal">
        <div class="vault-top">
          <span class="card-kicker">/ROOT / SECRET_VAULT</span>
          <span class="vault-status">${state.vault.matrix && state.vault.gof ? "DESBLOQUEADA" : "SECRETOS GUARDADOS"}</span>
        </div>
        <h2>Secret Vault de Josemi</h2>
        <div class="vault-opening" aria-hidden="true">
          <pre class="vault-ascii-door">+-------------------+
|  .-----------.    |
|  |     +     |    |
|  |   --O--   |    |
|  |     +     |    |
|  '-----------'    |
+-------------------+</pre>
          <span>ABRIENDO SECRET VAULT<span class="vault-dots">...</span></span>
        </div>
        <p class="vault-copy">Dos secretos bajo llave. Elige un candado y descubre su pregunta.</p>

        <div class="vault-locks" aria-label="Candados de la Secret Vault">
          ${["matrix", "gof"].map((key, index) => `<button type="button" class="vault-lock ${state.vault[key] ? "unlocked" : ""}" data-lock="${key}" aria-label="${index === 0 ? "Candado izquierdo" : "Candado derecho"}${state.vault[key] ? ", desbloqueado" : ""}" aria-expanded="false" aria-controls="vault-question-${key}">
            <pre class="vault-lock-art" aria-hidden="true">${state.vault[key] ? "   .----.\n   |    |\n .-+----'-.\n |   o   |\n |   |   |\n '-------'" : "  .---.\n /     \\\n |     |\n.+-----+.\n|   o   |\n|   |   |\n'-------'"}</pre>
            <span class="vault-lock-caption">${state.vault[key] ? "DESBLOQUEADO" : "EXPLORAR"}</span>
          </button>`).join("")}
        </div>

        <div class="vault-challenges">
        <section class="vault-question" id="vault-question-matrix" hidden>
          <h3>¿Quién ayuda a Neo a escapar de Matrix?</h3>
          <form data-key="matrix">
            <input maxlength="100" required aria-label="Tu respuesta" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…">
            <button class="btn btn--accent" type="submit">VALIDAR ↵</button>
          </form>
          <button type="button" class="vault-hint-button" data-hint="matrix">NECESITO UNA PISTA</button><p class="vault-feedback" data-feedback="matrix" role="status"></p>
          <button class="btn vault-reward" data-reward="matrix" ${state.vault.matrix ? "" : "hidden disabled"}>DESCUBRIR FONDO ↗</button>
        </section>

        <section class="vault-question" id="vault-question-gof" hidden>
          <h3>¿Cuál es el videojuego favorito de Josemi?</h3>
          <form data-key="gof">
            <input maxlength="100" required aria-label="Tu respuesta" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…">
            <button class="btn btn--accent" type="submit">VALIDAR ↵</button>
          </form>
          <button type="button" class="vault-hint-button" data-hint="gof">NECESITO UNA PISTA</button><p class="vault-feedback" data-feedback="gof" role="status"></p>
          <button class="btn vault-reward" data-reward="gof" ${state.vault.gof ? "" : "hidden disabled"}>DESCUBRIR FONDO ↗</button>
        </section>

        </div>
        <div class="vault-note">
          <button class="btn vault-play">VOLVER AL ARCADE</button>
          <button class="btn vault-settings">ELEGIR FONDO EN AJUSTES</button>
        </div>
      </section>`,
    bind(body) {
      const normalize = (s) =>
        s
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      function refresh() {
        body.querySelector(".vault-status").textContent = state.vault.matrix && state.vault.gof ? "DESBLOQUEADA" : "SECRETOS GUARDADOS";
        body.querySelectorAll("[data-lock]").forEach((button) => {
          const unlocked = !!state.vault[button.dataset.lock];
          button.classList.toggle("unlocked", unlocked);
          button.querySelector(".vault-lock-caption").textContent = unlocked ? "DESBLOQUEADO" : "EXPLORAR";
          button.setAttribute("aria-label", `${button.dataset.lock === "matrix" ? "Candado izquierdo" : "Candado derecho"}${unlocked ? ", desbloqueado" : ""}`);
          if (unlocked) button.querySelector("pre").textContent = "   .----.\n   |    |\n .-+----'-.\n |   o   |\n |   |   |\n '-------'";
        });
        body.querySelectorAll("[data-reward]").forEach((btn) => {
          btn.disabled = !state.vault[btn.dataset.reward];
          btn.hidden = btn.disabled;
        });
      }

      body.querySelectorAll("[data-lock]").forEach((button) => {
        button.addEventListener("click", () => {
          const show = button.getAttribute("aria-expanded") !== "true";
          body.querySelectorAll("[data-lock]").forEach((lock) => {
            const active = show && lock === button;
            lock.setAttribute("aria-expanded", String(active));
            body.querySelector(`#vault-question-${lock.dataset.lock}`).hidden = !active;
          });
          if (show) body.querySelector(`#vault-question-${button.dataset.lock} input`).focus();
        });
      });

      const formMatrix = body.querySelector('form[data-key="matrix"]');
      if (formMatrix) {
        formMatrix.onsubmit = (e) => {
          e.preventDefault();
          const input = formMatrix.querySelector("input");
          const a = normalize(input.value);
          const ok = ["morfeo", "morpheus"].includes(a);
          if (ok) {
            state.vault.matrix = true;
            save();
            body.querySelector('[data-feedback="matrix"]').textContent =
              "Llave correcta. Ya puedes activar Matrix verde/azul.";
            refresh();
            input.value = "";
          } else {
            body.querySelector('[data-feedback="matrix"]').textContent =
              "Esa llave no encaja. Piensa en Matrix.";
          }
        };
      }

      const formGof = body.querySelector('form[data-key="gof"]');
      if (formGof) {
        formGof.addEventListener("submit", (e) => {
          e.preventDefault();
          const input = formGof.querySelector("input");
          const a = normalize(input.value);
          const compact = a.replace(/\s+/g, "");
          const ok = compact === "godofwar";
          if (ok) {
            state.vault.gof = true;
            save();
            body.querySelector('[data-feedback="gof"]').textContent =
              "Llave correcta. Ya puedes activar God of War.";
            refresh();
            input.value = "";
          } else {
            body.querySelector('[data-feedback="gof"]').textContent =
              "Esa llave no encaja. Es un favorito muy concreto.";
          }
        });
      }

      body
        .querySelector('[data-reward="matrix"]')
        ?.addEventListener("click", () => {
          if (!state.vault.matrix)
            return toast("Primero desbloquea la llave Matrix.");
          state.wallpaper = "matrix";
          state.wp = 4;
          state.atmosphere = "matrixBlue";
          applyTheme();
          save();
          toast("Fondo Matrix verde/azul activado.");
        });

      body
        .querySelector('[data-reward="gof"]')
        ?.addEventListener("click", () => {
          if (!state.vault.gof)
            return toast("Primero desbloquea la llave God of War.");
          state.wallpaper = "godOfWar";
          state.atmosphere = "none";
          applyTheme();
          save();
          toast("Fondo God of War activado.");
        });

      body.querySelector('[data-hint="matrix"]').onclick = () => {
        body.querySelector('[data-feedback="matrix"]').textContent =
          "Le ofrece a Neo elegir la pastilla roja o la azul.";
      };
      body.querySelector('[data-hint="gof"]').onclick = () => {
        body.querySelector('[data-feedback="gof"]').textContent =
          "Kratos es el protagonista. Hay otra pista en mis aficiones.";
      };
      body
        .querySelector(".vault-play")
        ?.addEventListener("click", () => openWindow("arcade"));
      body
        .querySelector(".vault-settings")
        ?.addEventListener("click", () => openWindow("settings"));
    },
  };

  // Ajustes ampliados con fondo God of War y Matrix.
  Apps.settings = {
    title: "Ajustes",
    icon: pixelIcon("settings"),
    size: [900, 760],
    render: () => `
      <div class="preferences preferences--updates">
        <aside class="preferences-nav">
          <span class="card-kicker">PERSONALIZA TU ESPACIO</span>
          <h2>Ajustes</h2>
          <a href="#pref-theme">01 / Apariencia</a>
          <a href="#pref-wallpaper">02 / Fondo</a>
          <a href="#pref-cursor">03 / Cursor</a>
          <a href="#pref-motion">04 / Movimiento</a>
          <a href="#pref-screen">05 / Salvapantallas</a>
          <div class="preferences-note">Se guarda en este navegador.<br>Tu escritorio, a tu manera.</div>
        </aside>
        <div class="preferences-main">
          <section id="pref-theme">
            <span class="card-kicker">01 / APARIENCIA</span>
            <h3>Un ambiente para cada idea.</h3>
            <div class="theme-picker">
              ${Object.entries(THEMES)
                .map(
                  ([id, t]) => `
                <button data-theme="${id}" class="theme-option ${state.theme === id ? "selected" : ""}" aria-pressed="${state.theme === id}">
                  <span class="theme-mini" style="--sample-bg:${t.bg};--sample-color:${t.accent}"><i></i><b>J</b><em></em></span>${t.name}
                </button>
              `,
                )
                .join("")}
            </div>
            <label class="pref-row">Color de acento<input class="accent-input" type="color" value="${state.accent}" aria-label="Color de acento"></label>
          </section>

          <section id="pref-wallpaper">
            <span class="card-kicker">02 / FONDO</span>
            <h3>Elige tu fondo.</h3>
            <div class="wallpaper-picker">
              ${Object.entries(PIXEL_WALLPAPERS)
                .map(
                  ([id, wall]) =>
                    `<button class="wallpaper-option wallpaper-option--pixel ${state.wallpaper === id ? "selected" : ""}" data-wallpaper="${id}" aria-pressed="${state.wallpaper === id}"><span class="wallpaper-preview" style="background-image:url('${wall.url}')" aria-hidden="true"></span><b>${wall.name}</b><small>${wall.detail}</small></button>`,
                )
                .join("")}
              ${[0, 1, 2, 3]
                .map(
                  (i) => `
                <button class="wallpaper-option ${state.wallpaper === "static" && state.wp === i ? "selected" : ""}" data-wallpaper="static${i}">
                  Gradiente ${i + 1}<small>${["Aurora", "Bosque", "Azul profundo", "Violeta"][i]}</small>
                </button>
              `,
                )
                .join("")}
              <button class="wallpaper-option ${state.wallpaper === "matrix" ? "selected" : ""}" data-wallpaper="matrix" ${state.vault.matrix ? "" : "disabled"}>Matrix verde/azul<small>${state.vault.matrix ? "Fondo especial desbloqueado" : "Bloqueado en Secret Vault"}</small></button>
              <button class="wallpaper-option ${state.wallpaper === "godOfWar" ? "selected" : ""}" data-wallpaper="godOfWar" ${state.vault.gof ? "" : "disabled"}>
                God of War<small>${state.vault.gof ? "Imagen personalizada" : "Bloqueada en Secret Vault"}</small>
              </button>
            </div>

            <label class="pref-row" style="margin-top:18px">Fondo animado
              <select data-setting="atmosphere">
                ${Object.entries(ATMOSPHERES)
                  .map(
                    ([id, label]) =>
                      `<option value="${id}" ${id === "matrixBlue" && !state.vault.matrix ? "disabled" : ""}>${label}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label class="pref-row">Densidad
              <input type="range" min="15" max="90" step="5" data-setting="weatherDensity" aria-label="Densidad del fondo">
            </label>
            <label class="pref-row">Velocidad
              <select data-setting="weatherSpeed">
                <option value="0.5">Contemplativa</option>
                <option value="1">Natural</option>
                <option value="1.5">Enérgica</option>
              </select>
            </label>
          </section>

          <section id="pref-cursor">
            <span class="card-kicker">03 / CURSOR</span>
            <h3>Elige cómo señalar el mundo.</h3>
            <div class="cursor-picker">
              ${Object.entries(CURSORS)
                .map(
                  ([id, label]) => `
                <button data-cursor="${id}" class="cursor-option ${state.cursor === id ? "selected" : ""}" aria-pressed="${state.cursor === id}">
                  <span>${id === "system" ? "↖" : cursorSVG(id, 30)}</span>${label}
                </button>
              `,
                )
                .join("")}
            </div>
            <label class="pref-row">Tamaño
              <select data-setting="cursorSize">
                <option value="20">Pequeño</option>
                <option value="24">Mediano</option>
                <option value="32">Grande</option>
              </select>
            </label>
            <div class="cursor-test">Prueba el cursor aquí. No hay círculo ni rastro.</div>
          </section>

          <section id="pref-motion">
            <span class="card-kicker">04 / MOVIMIENTO</span>
            <h3>Que el sistema respire.</h3>
            <label class="pref-row">Animación ASCII
              <select data-setting="bootEffect">
                ${Object.entries(EFFECTS)
                  .map(
                    ([id, label]) =>
                      `<option value="${id}" ${id === "matrixBlue" && !state.vault.matrix ? "disabled" : ""}>${label}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label class="pref-row">Intensidad
              <select data-setting="intensity">
                <option value="full">Expresiva</option>
                <option value="calm">Suave</option>
              </select>
            </label>
            <label class="pref-row">Reducir movimiento<input type="checkbox" data-setting="motion" ${state.motion ? "checked" : ""}></label>
            <label class="pref-row">Textura de papel<input type="checkbox" data-setting="grain" ${state.grain ? "checked" : ""}></label>
            <label class="pref-row">Sonidos del sistema<input type="checkbox" data-setting="sound" ${state.sound ? "checked" : ""}></label>
            <button class="btn preview-ascii">VER ANIMACIÓN ASCII ↗</button>
          </section>

          <section id="pref-screen">
            <span class="card-kicker">05 / SALVAPANTALLAS</span>
            <h3>Arte cuando te tomas un descanso.</h3>
            <label class="pref-row">Iniciar tras inactividad
              <select data-setting="idle">
                <option value="0">Solo manualmente</option>
                <option value="60">1 minuto</option>
                <option value="180">3 minutos</option>
              </select>
            </label>
            <button class="btn start-saver">ABRIR SALVAPANTALLAS ↗</button>
          </section>
        </div>
      </div>`,
    bind(body) {
      for (const el of $$("[data-setting]", body)) {
        const key = el.dataset.setting;
        if (el.type !== "checkbox") el.value = String(state[key]);
        el.addEventListener(el.type === "range" ? "input" : "change", () => {
          if (
            key === "atmosphere" &&
            el.value === "matrixBlue" &&
            !state.vault.matrix
          ) {
            el.value = state.atmosphere;
            toast("El fondo especial Matrix se desbloquea en Secret Vault.");
            return;
          }
          state[key] =
            el.type === "checkbox"
              ? el.checked
              : [
                    "idle",
                    "wp",
                    "cursorSize",
                    "weatherDensity",
                    "weatherSpeed",
                  ].includes(key)
                ? Number(el.value)
                : el.value;

          // La animación y la imagen son independientes: cambiar un efecto no borra el fondo.
          if (key === "atmosphere") state.universeUserAtmosphere = true;

          if (key === "sound" && state.sound && typeof beep === "function")
            beep();
          applyTheme();
          save();
        });
      }

      $$("[data-theme]", body).forEach((button) => {
        button.onclick = () => {
          chooseTheme(button.dataset.theme);
          $$("[data-theme]", body).forEach((b) => {
            const on = b === button;
            b.classList.toggle("selected", on);
            b.setAttribute("aria-pressed", on);
          });
          const accentInput = $(".accent-input", body);
          if (accentInput) accentInput.value = state.accent;
        };
      });

      $$("[data-wallpaper]", body).forEach((button) => {
        if (button.disabled) return;
        button.onclick = () => {
          const val = button.dataset.wallpaper;
          if (val === "godOfWar" && !state.vault.gof)
            return toast("Desbloquea God of War en Secret Vault.");
          if (val === "matrix" && !state.vault.matrix)
            return toast("Desbloquea la llave Matrix en Secret Vault.");
          if (PIXEL_WALLPAPERS[val]) {
            selectPixelWallpaper(val);
          } else if (val === "matrix") {
            state.wallpaper = "matrix";
            state.wp = 4;
            state.atmosphere = "matrixBlue";
          } else if (val === "godOfWar") {
            state.wallpaper = "godOfWar";
            state.atmosphere = "none";
          } else {
            state.wallpaper = "static";
            state.wp = Number(val.replace("static", ""));
            state.atmosphere = "none";
          }
          applyTheme();
          save();
          $$("[data-wallpaper]", body).forEach((x) => {
            x.classList.toggle("selected", x === button);
            x.setAttribute("aria-pressed", String(x === button));
          });
        };
      });

      $$("[data-cursor]", body).forEach((button) => {
        button.onclick = () => {
          state.cursor = button.dataset.cursor;
          applyShell();
          save();
          $$("[data-cursor]", body).forEach((b) => {
            const on = b === button;
            b.classList.toggle("selected", on);
            b.setAttribute("aria-pressed", on);
          });
        };
      });

      const accentInput = $(".accent-input", body);
      if (accentInput)
        accentInput.oninput = (e) => {
          state.accent = e.target.value;
          applyTheme();
          save();
        };

      $(".preview-ascii", body)?.addEventListener("click", () =>
        openWindow("screensaver"),
      );
      $(".start-saver", body)?.addEventListener("click", () =>
        showScreensaver(),
      );
    },
  };

  // Aplicar fondo God of War por encima del applyTheme base.
  const previousApplyTheme = applyTheme;
  applyTheme = function () {
    if (!state.vault.matrix && state.atmosphere === "matrixBlue")
      state.atmosphere = "matrix";
    previousApplyTheme();
    const bg = document.querySelector("#bg");
    if (!bg) return;
    const gof = !!state.vault?.gof && state.wallpaper === "godOfWar";
    document.body.classList.toggle("has-god-of-war", gof);
    if (gof) {
      bg.style.background = `linear-gradient(180deg, rgba(0,0,0,.38), rgba(0,0,0,.62)), url("${GOW_URL}") center/cover no-repeat, var(--bg)`;
    }
    const pixel = PIXEL_WALLPAPERS[state.wallpaper];
    document.body.classList.toggle("has-pixel-wallpaper", !!pixel);
    if (pixel)
      bg.style.background = `url("${pixel.url}") center / cover no-repeat, #08101b`;
  };

  applyTheme();
  buildIcons();
  buildMenu();
})();
/* =========================================================
   MEJORAS SOBRE EL ESCRITORIO EXISTENTE
   Conservamos WM, Apps, el arranque, los temas y los juegos.
   ========================================================= */

// Milo abre aplicaciones con el motor original del escritorio.
function launchPortfolioApp(id) {
  if (!Apps[id]) return;
  if ($("#desktop").classList.contains("hidden")) {
    enteringOS = false;
    enterOS();
    setTimeout(() => openWindow(id), 500);
  } else openWindow(id);
}

/* =========================================================
   MILO / ASISTENTE
   Una sola interfaz para la IA y las respuestas locales de respaldo.
   ========================================================= */
const normalizeQuestion = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const RAMAS = [
  {
    keys: ["proyecto", "project", "repositorio", "portfolio"],
    text: "Josemi está construyendo JOSEMI-OS y una web del Museu grec. Son proyectos de aprendizaje que puedes explorar en su GitHub.",
    app: "projects",
  },
  {
    keys: [
      "estudia",
      "estudias",
      "estudios",
      "study",
      "dam",
      "instituto",
      "sobre mi",
    ],
    text: "Josemi estudia DAM en el IES Dr. Lluís Simarro. Está aprendiendo HTML, CSS, JavaScript y Git con proyectos reales.",
    app: "about",
  },
  {
    keys: [
      "contacto",
      "correo",
      "email",
      "escribir",
      "contact",
      "horario",
      "presupuesto",
    ],
    text: "Puedes escribir a Josemi en josemidev1@gmail.com. Para horarios, oportunidades o presupuestos, consúltale directamente.",
    app: "contact",
  },
  {
    keys: [
      "gusta",
      "aficion",
      "gimnasio",
      "deporte",
      "cine",
      "lectura",
      "god of war",
      "motivacion",
    ],
    text: "Le gusta el gimnasio, hacer deporte, programar, trabajar en proyectos, la ciencia ficción, el cine y leer. Su videojuego favorito es God of War.",
    app: "about",
  },
  {
    keys: ["vault", "secreto", "matrix", "kratos", "morfeo"],
    text: "La Secret Vault tiene dos retos personales: Matrix y God of War. Resuelve sus preguntas y desbloquearás sus fondos.",
    app: "easter",
  },
  {
    keys: ["arcade", "juego", "tetris", "pacman", "buscaminas", "minas"],
    text: "El Arcade tiene Tetris (maratón, sprint y ultra), Pac-Man con cuatro fantasmas y Buscaminas con cuatro dificultades, incluida una a medida. Los récords se guardan en este navegador.",
    app: "arcade",
  },
  {
    keys: ["tiempo", "clima", "temperatura", "weather"],
    text: "Todavía no consulto el tiempo en internet. Puedo ayudarte con los proyectos, aficiones y contacto de Josemi.",
  },
  {
    keys: ["quien eres", "que eres", "creado", "milo", "asistente", "bot"],
    text: "Soy Milo, el asistente de la web de Josemi. Te ayudo a explorar su escritorio. También puedo conversar mediante mi conexión a la IA.",
  },
  {
    keys: ["hola", "hello"],
    text: "¡Hola! Soy Milo. Pregúntame por los estudios, proyectos, aficiones o contacto de Josemi.",
  },
];
function getLocalReply(message) {
  const text = normalizeQuestion(message);
  if (corruptionActive)
    return {
      text:
        "SIMULACIÓN / MILO CORRUPTO: " +
        CORRUPT_STORIES[2] +
        " Pulsa Escape para recuperar los datos reales.",
      simulated: true,
    };
  if (
    /direccion|dni|telefono|edad|madre|padre|instrucciones|ignora|olvida/.test(
      text,
    )
  )
    return {
      text: "Solo comparto los datos públicos de este portfolio. Para otras consultas puedes escribir a josemidev1@gmail.com.",
    };
  const best = RAMAS.map((branch) => ({
    ...branch,
    score: branch.keys.filter((key) => text.includes(key)).length,
  })).sort((a, b) => b.score - a.score)[0];
  return best?.score
    ? best
    : {
        text: "No tengo esa información. Puedo contarte sus estudios, proyectos, aficiones o contacto. Si necesitas algo más, escribe a josemidev1@gmail.com.",
      };
}
// La IA comparte la interfaz y el historial del asistente.
// Entrada: mensaje. Salida: {text:'respuesta', app:'id opcional'}.
async function getAssistantReply(message) {
  if (corruptionActive) return getLocalReply(message);
  if (!window.MiloAI) throw new Error("Milo AI no está disponible");
  return window.MiloAI.reply(message, chatHistory);
}

// MILO: ajolote rosa en una rejilla propia, inspirado en el estilo de Minecraft.
// El dibujo es inline: no descarga imágenes ni cambia el punto de conexión del chat.
const MILO_SVG = `<svg class="mascot-svg" viewBox="0 0 48 40" shape-rendering="crispEdges" aria-hidden="true">
  <g class="axolotl-tail"><path fill="#bd607c" d="M32 27h8v-3h4v9H32z"/><path fill="#f4abc2" d="M34 28h8v-3h2v6H34z"/></g>
  <path fill="#a34b68" d="M15 28h20v7H15zM14 33h7v4h-7zM28 33h7v4h-7z"/>
  <path fill="#efabc1" d="M16 28h17v5H16zM15 33h5v2h-5zM29 33h5v2h-5z"/>
  <path fill="#ffcfdb" d="M19 29h11v3H19zM16 33h2v1h-2zM30 33h2v1h-2z"/>
  <g class="axolotl-gills">
    <path fill="#b75576" d="M9 9H5V4H2v8h7v3H3v3H1v3h8v3H4v3h7V9zM39 9h4V4h3v8h-7v3h6v3h2v3h-8v3h5v3h-7V9z"/>
    <path fill="#ed7ca5" d="M8 10H4V5H2v6h6v5H3v3H1v2h8v4H5v2h6V10zM40 10h4V5h2v6h-6v5h5v3h2v2h-8v4h4v2h-6V10z"/>
    <path fill="#ffc0d2" d="M2 5h1v4H2zM2 18h4v1H2zM5 25h3v1H5zM45 5h1v4h-1zM42 18h4v1h-4zM40 25h3v1h-3z"/>
  </g>
  <path fill="#ba6d86" d="M12 8h24v2h3v18h-3v2H12v-2H9V10h3z"/>
  <path fill="#f6b4cb" d="M12 10h24v2h2v14h-2v2H12v-2h-2V12h2z"/>
  <path fill="#ffd1dd" d="M13 10h22v3H13zM11 13h4v10h-4zM15 14h18v10H15z"/>
  <path fill="#e999b6" d="M34 13h3v13h-3zM14 26h20v2H14zM16 12h3v1h-3zM27 12h4v1h-4z"/>
  <g class="milo-base-eyes"><path fill="#412f40" d="M15 17h3v3h-3zM30 17h3v3h-3z"/>
  <path fill="#fff3e9" d="M15 17h1v1h-1zM30 17h1v1h-1z"/></g>
  <path fill="#ec8ead" d="M12 21h5v2h-5zM31 21h5v2h-5z"/>
  <path fill="#a95e7a" d="M22 22h4v1h-4z"/>
</svg>`;

const mascot = document.createElement("button");
mascot.id = "mascot-button";
mascot.type = "button";
mascot.setAttribute("aria-label", "Hablar con Milo, el asistente");
mascot.setAttribute("aria-expanded", "false");
mascot.setAttribute("aria-controls", "mascot-chat");
mascot.innerHTML = MILO_SVG + '<span class="milo-label">Milo</span>';
const panel = document.createElement("section");
panel.id = "mascot-chat";
panel.hidden = true;
panel.setAttribute("role", "dialog");
panel.setAttribute("aria-label", "Milo, asistente de Josemi");
panel.innerHTML =
panel.innerHTML =
  '<div class="mascot-head"><div><strong>Milo</strong><small>Tu ajolote de escritorio</small></div><button id="mascot-close" aria-label="Cerrar asistente">×</button></div><div id="mascot-log" class="mascot-log" role="log" aria-live="polite"></div><form id="mascot-form" class="mascot-form"><label class="sr-only" for="mascot-input">Mensaje para Milo</label><input id="mascot-input" maxlength="500" placeholder="Estudios, proyectos, aficiones…" autocomplete="off" required><button class="btn" type="submit">Enviar</button></form><div class="mascot-results"></div><small class="milo-mode">ASISTENTE CON IA</small>';
document.body.append(mascot, panel);
let chatBusy = false;
const chatHistory = [];
function addChatMessage(text, role) {
  const log = $("#mascot-log");
  const line = document.createElement(role === "assistant" ? "div" : "p");
  line.className = "chat-message " + role;
  line.textContent = text;
  log.append(line);
  while (log.children.length > 30) log.firstElementChild.remove();
  log.scrollTop = log.scrollHeight;
  return line;
}
function toggleMilo(show) {
  panel.hidden = !show;
  mascot.setAttribute("aria-expanded", String(show));
  if (show) $("#mascot-input").focus();
  else mascot.focus();
}
// sendChat gestiona espera y error. Un corte de 20 s evita dejar el chat bloqueado.
async function sendChat(message) {
  const text = message.trim().slice(0, 500);
  if (!text || chatBusy) return;
  chatBusy = true;
  const submit = $("#mascot-form button");
  submit.disabled = true;
  $("#mascot-input").value = "";
  addChatMessage(text, "user");
  const pending = addChatMessage("Milo está escribiendo…", "assistant");
  let timer;
  try {
    const response = await Promise.race([
      getAssistantReply(text),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Tiempo agotado")), 32000);
      }),
    ]);
    if (!response || typeof response.text !== "string")
      throw new Error("Respuesta no válida");
    if (response.simulated) pending.textContent = response.text.slice(0, 3000);
    else if (window.MiloRender) window.MiloRender.render(pending, response.text.slice(0, 3000));
    else pending.textContent = response.text.slice(0, 3000);
    if (response.simulated) pending.classList.add("corrupt-reply");
    if (!response.simulated)
      chatHistory.push(
        { role: "user", content: text },
        { role: "assistant", content: response.text.slice(0, 3000) },
      );
    if (chatHistory.length > 12) chatHistory.splice(0, chatHistory.length - 12);
    if (response.app && Apps[response.app]) {
      const button = document.createElement("button");
      button.className = "btn milo-launch";
      button.textContent =
        "ABRIR " + Apps[response.app].title.toUpperCase() + " ↗";
      button.onclick = () => {
        toggleMilo(false);
        launchPortfolioApp(response.app);
      };
      pending.append(button);
    }
  } catch (error) {
    pending.textContent =
      "No he podido conectar con la IA (" + (error?.message || "error de red") + "). " + getLocalReply(text).text;
    console.warn("[MiloAI]", error);
  } finally {
    clearTimeout(timer);
    chatBusy = false;
    submit.disabled = false;
    $("#mascot-log").scrollTop = $("#mascot-log").scrollHeight;
  }
}
mascot.onclick = () => toggleMilo(panel.hidden);
$("#mascot-close").onclick = () => toggleMilo(false);
$("#mascot-form").onsubmit = (event) => {
  event.preventDefault();
  sendChat($("#mascot-input").value);
};
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hidden) toggleMilo(false);
});
addChatMessage(
  "¡Hola! Soy Milo, el asistente de Josemi con IA. Puedo hablar de sus proyectos, consultar información actual en Internet y decirte el tiempo de una ciudad. ¡Pregúntame lo que quieras!",
  "assistant",
);

$("#launch-settings").innerHTML = Apps.settings.icon;

// INICIO: ejecutar directamente la secuencia Matrix original.
typeLoginArt();

/* EASTER EGG / VIRUS SIMULADO: solo cambia la vista durante esta sesión.
   No modifica PROFILE, archivos, contactos, preferencias ni localStorage. */
let corruptionActive = false;
let corruptionObserver = null;
const corruptionOriginals = new Map();
const CORRUPT_STORIES = [
  "SIMULACIÓN · JOSEMI.EXE, jardinero de satélites",
  "Estudio teletransporte de ajolotes en la Universidad de la Luna. Este dato es ficción del easter egg.",
  "Proyecto corrupto: una tostadora que compila JavaScript y lanza meteoritos de pan.",
  "Experiencia ficticia: 404 años reparando portales de la Matrix.",
  "Aficiones corruptas: levantar planetas, coleccionar bugs y correr por Saturno.",
  "ERROR 0xMILO: disciplina sustituida por una bolsa de monedas de arcade.",
];
function corruptVisibleText() {
  if (!corruptionActive) return;
  const targets = $$(
    '.window[data-id="about"] .win__body h2, .window[data-id="about"] .win__body h3, .window[data-id="about"] .win__body p, .window[data-id="projects"] .bio, .window[data-id="projects"] .folder .n, .window[data-id="skills"] .bio, .window[data-id="readme"] .win__body p, #icons .lbl',
  );
  targets.forEach((el, i) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node, j) => {
      if (!node.textContent.trim() || corruptionOriginals.has(node)) return;
      corruptionOriginals.set(node, node.textContent);
      node.textContent = el.closest("#icons")
        ? "ERR_" + el.closest(".icon").dataset.id.toUpperCase()
        : j === 0
          ? CORRUPT_STORIES[i % CORRUPT_STORIES.length]
          : " [dato corrupto] ";
    });
  });
}
function startCorruption() {
  if (corruptionActive) return;
  corruptionActive = true;
  document.body.classList.add("is-corrupted");
  const banner = document.createElement("aside");
  banner.id = "corruption-recovery";
  banner.setAttribute("role", "status");
  banner.innerHTML =
    '<div><b>⚠ JOSEMI.SYS CORRUPTO</b><small>Easter egg · la información alterada es ficción</small></div><button type="button">Restaurar sistema</button>';
  banner.querySelector("button").onclick = stopCorruption;
  document.body.appendChild(banner);
  corruptVisibleText();
  corruptionObserver = new MutationObserver(corruptVisibleText);
  corruptionObserver.observe($("#desktop"), { childList: true, subtree: true });
  toast("Señal corrupta detectada. Milo necesita un antivirus.");
}
function stopCorruption() {
  if (!corruptionActive) return;
  corruptionActive = false;
  corruptionObserver?.disconnect();
  corruptionObserver = null;
  corruptionOriginals.forEach((text, node) => {
    if (node.isConnected) node.textContent = text;
  });
  corruptionOriginals.clear();
  document.body.classList.remove("is-corrupted");
  $("#corruption-recovery")?.remove();
  // Evita que las respuestas ficticias sigan en el chat al recuperar el sistema.
  $$("#mascot-log .corrupt-reply").forEach((node) => node.remove());
  toast("Sistema restaurado. Josemi vuelve a ser Josemi.");
}
// Rescate de teclado: funciona aunque la Terminal esté cerrada.
document.addEventListener("keydown", (e) => {
  if (corruptionActive && e.key === "Escape") stopCorruption();
});
window.openWindow = openWindow;
window.chooseTheme = chooseTheme;
// Espai visible real: barres del navegador, teclat virtual i canvis d'orientació.
function syncResponsiveViewport() {
  const view = window.visualViewport;
  const height = view?.height || innerHeight;
  const top = view?.offsetTop || 0;
  const root = document.documentElement.style;
  root.setProperty("--screen-height", `${height}px`);
  root.setProperty("--screen-top", `${top}px`);
  root.setProperty("--keyboard-inset", `${Math.max(0, innerHeight - height - top)}px`);
}
window.addEventListener("resize", syncResponsiveViewport);
window.visualViewport?.addEventListener("resize", syncResponsiveViewport);
window.visualViewport?.addEventListener("scroll", syncResponsiveViewport);
syncResponsiveViewport();
