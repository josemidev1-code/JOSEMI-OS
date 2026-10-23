// src/wallpapers/scenes.js: fuente de JOSEMI-OS.
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
      r(Math.floor(rand() * 480), Math.floor(rand() * 130), 1, 1, i % 4 ? "#435766" : "#9ea99b");
  };
  if (drawExtraPixelWallpaper(kind, r, rand, stars)) {
    // La escena nueva ya está dibujada.
  } else if (kind.startsWith("matrix")) {
    r(0, 0, 480, 270, "#041012");
    // Cada signo se dibuja en una matriz de 3 × 5, en verde y cian.
    const glyphs = ["111101101101111", "010110010010111", "111001111100111", "101101111001001"];
    for (let x = 4; x < 480; x += 12) {
      const head = Math.floor(rand() * 160),
        length = 5 + Math.floor(rand() * 11);
      for (let j = 0; j < length; j++) {
        const bits = glyphs[Math.floor(rand() * glyphs.length)],
          y = head - j * 8;
        const c = j === 0 ? "#a1efc1" : x % 36 === 4 ? "#164c57" : "#18523b";
        for (let k = 0; k < 15; k++)
          if (bits[k] === "1" && y >= 0) r(x + (k % 3), y + Math.floor(k / 3), 1, 1, c);
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
          for (let wx = x + 3; wx < x + 16; wx += 5) if (rand() > 0.48) r(wx, wy, 2, 3, "#22725e");
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
          r(dx, y + 9 + Math.floor(rand() * 12), 3, 3, k % 2 ? "#63513d" : "#332f28");
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
  const paths = [...layers].map(([color, d]) => `<path fill="${color}" d="${d}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" shape-rendering="crispEdges">${paths}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
