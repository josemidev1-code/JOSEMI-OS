// src/wallpapers/extra-scenes.js: fuente de JOSEMI-OS.
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
      r(x - w, y - 30 * size + j * 9 * size, w * 2, 10 * size, j % 2 ? "#375453" : "#45655e");
    }
  };
  if (kind === "cyberpunk") {
    r(0, 0, 480, 270, "#30263e");
    ["#0b0f24", "#151631", "#212340", "#30263e"].forEach((c, i) => r(0, i * 54, 480, 54, c));
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
          if (rand() > 0.35) r(wx, wy, 3, 4, rand() > 0.5 ? "#3e7c9b" : "#78536a");
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
  } else if (kind === "platformWorld") {
    r(0, 0, 480, 270, "#91a19a");
    ["#38495c", "#4b6570", "#657d7c", "#91a19a"].forEach((c, i) => r(0, i * 47, 480, 47, c));
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
    for (let x = -20; x < 480; x += 51) canopy(x, 23 + Math.floor(rand() * 28), 2);
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
    ["#29435c", "#3d6076", "#5a8191", "#83a6aa"].forEach((c, i) => r(0, i * 45, 480, 45, c));
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
      for (let x = 0; x < 480; x += 10) if ((x + y) % 20 < 10) r(x, y, 10, 10, "#a4764b");
    r(0, 221, 480, 7, "#436747");
    r(0, 221, 480, 2, "#8ba461");
    for (let x = 0; x < 480; x += 8) r(x, 226, 4, 4, "#557c4e");
    // Bucle central: contorno escalonado construido con rectángulos.
    const ring = (cx, cy, rx, ry, c, thick) => {
      for (let y = -ry; y <= ry; y++) {
        const x = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
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
    ["#25313c", "#3a4a55", "#506671", "#789098"].forEach((c, i) => r(0, i * 43, 480, 43, c));
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
