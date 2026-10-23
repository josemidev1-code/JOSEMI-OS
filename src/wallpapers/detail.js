// src/wallpapers/detail.js: fuente de JOSEMI-OS.
const wet = new Set([
  "reef",
  "lighthouse",
  "auroraLake",
  "godOfWarPixel",
  "floating",
  "minecraft",
  "sonicCoast",
]);
const space = new Set(["orbital", "matrixCity", "matrixCode", "cyberpunk"]);
const detailLayer = (id) => {
  let seed = [...id].reduce((n, c) => n + c.charCodeAt(0), 17);
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let out = "";
  for (let i = 0; i < 110; i++) {
    const x = Math.floor(rand() * 480),
      y = Math.floor(225 + rand() * 45);
    out += rect(x, y, 1 + Math.floor(rand() * 3), 1, id === "reef" ? "#f7dfaf66" : "#b6d7c322");
  }
  if (!["reef", "library", "arcadeRoom", "matrixCode"].includes(id))
    for (let i = 0; i < 55; i++) {
      const x = Math.floor(rand() * 480),
        y = Math.floor(rand() * 85);
      out += rect(x, y, 1, 1, space.has(id) ? "#b4f5e0" : "#e6e3df66");
    }
  if (wet.has(id))
    for (let i = 0; i < 20; i++)
      out += rect(
        Math.floor(rand() * 480),
        Math.floor(212 + rand() * 54),
        Math.floor(4 + rand() * 14),
        1,
        "#c0e7ee45",
      );
  if (["library", "cabin", "sunsetCity", "cyberpunk", "matrixCity", "arcadeRoom"].includes(id))
    for (let i = 0; i < 24; i++)
      out += rect(Math.floor(rand() * 480), Math.floor(100 + rand() * 100), 2, 3, "#ffd48a55");
  const r = (x, y, w, h, c) => {
    out += rect(x, y, w, h, c);
  };
  const flower = (x, y, c) => {
    r(x, y, 1, 6, "#4c9566");
    r(x - 1, y - 2, 3, 3, c);
    r(x, y - 1, 1, 1, "#f6e6a2");
  };
  const lantern = (x, y) => {
    r(x, y, 3, 13, "#455667");
    r(x - 4, y - 7, 11, 2, "#79918e");
    r(x - 3, y - 5, 9, 5, "#e6c779");
    r(x - 4, y, 11, 2, "#506976");
    r(x - 2, y + 13, 7, 2, "#7e9a99");
  };
  const crate = (x, y) => {
    r(x, y, 16, 14, "#765643");
    r(x + 1, y + 1, 14, 2, "#caa371");
    r(x + 1, y + 10, 14, 2, "#caa371");
    r(x + 3, y + 3, 2, 7, "#b49365");
    r(x + 11, y + 3, 2, 7, "#b49365");
  };
  const lamp = (x, y) => {
    r(x, y, 2, 38, "#233e4c");
    r(x - 7, y, 9, 2, "#487882");
    r(x - 8, y + 2, 5, 3, "#e6d58a");
    r(x - 5, y + 36, 11, 2, "#193646");
  };
  if (["minecraft", "zeldaForest", "sonicCoast", "floating", "sakura"].includes(id))
    for (let i = 0; i < 20; i++)
      flower(
        Math.floor(rand() * 480),
        Math.floor(222 + rand() * 40),
        i % 3 ? "#e6b4ce" : "#f3cf8b",
      );
  if (id === "minecraft") {
    crate(54, 222);
    r(318, 207, 13, 8, "#ead9bf");
    r(328, 210, 6, 6, "#a18f81");
    r(319, 215, 2, 5, "#574d47");
    r(327, 215, 2, 5, "#574d47");
    for (let i = 0; i < 5; i++) r(290 + i * 8, 235, 2, 16, "#9c7651");
    r(290, 239, 36, 2, "#bb9363");
  }
  if (id === "matrixCity" || id === "cyberpunk") {
    lamp(54, 184);
    lamp(414, 195);
    r(80, 213, 42, 10, "#182a3c");
    r(89, 206, 22, 7, "#29475a");
    r(84, 214, 4, 2, "#f9c28a");
    r(115, 214, 4, 2, "#f48aaf");
    r(89, 223, 6, 3, "#10222f");
    r(109, 223, 6, 3, "#10222f");
    r(336, 180, 37, 22, "#172533");
    for (let i = 0; i < 5; i++) {
      r(339 + i * 6, 184, 3, 2, "#d490cb");
      r(339 + i * 6, 190, 3, 2, "#79cfca");
    }
  }
  if (id === "matrixCode")
    for (let j = 0; j < 7; j++)
      for (let i = 0; i < 12; i++) r(42 + j * 61, 30 + i * 18, 1 + (i % 3), 3, "#8ae6b033");
  if (id === "jetpack") {
    crate(22, 230);
    crate(40, 230);
    r(332, 88, 22, 11, "#6c94a1");
    r(336, 91, 4, 4, "#f0c76a");
    r(348, 91, 4, 4, "#f0c76a");
    r(327, 85, 32, 2, "#b8d6d5");
    r(24, 200, 59, 3, "#bda661");
    for (let i = 0; i < 9; i++) r(26 + i * 6, 201, 3, 3, "#283e49");
  }
  if (id === "platformWorld") {
    for (let i = 0; i < 7; i++) {
      r(168 + i * 18, 128, 5, 9, "#ffe08a");
      r(170 + i * 18, 130, 1, 5, "#ab732c");
    }
    r(368, 195, 3, 36, "#d1e5da");
    r(371, 196, 16, 10, "#86c28b");
  }
  if (id === "zeldaForest") {
    lantern(57, 211);
    lantern(412, 210);
    for (let i = 0; i < 24; i++)
      r(102 + ((i * 23) % 290), 172 + ((i * 13) % 74), 2, 1, "#b7d7a24a");
  }
  if (id === "sonicCoast") {
    for (let i = 0; i < 7; i++) {
      r(39 + i * 17, 203, 8, 2, "#f8d374");
      r(39 + i * 17, 211, 8, 2, "#c7973b");
      r(38 + i * 17, 205, 2, 6, "#f8d374");
      r(45 + i * 17, 205, 2, 6, "#f8d374");
    }
  }
  if (id === "hollowCavern") {
    lantern(76, 211);
    lantern(405, 214);
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(rand() * 480),
        y = 235 + Math.floor(rand() * 30);
      r(x, y, 6, 2, "#416d7d");
      r(x + 2, y - 5, 2, 5, "#7aa3aa");
    }
  }
  if (id === "godOfWarPixel") {
    r(64, 220, 25, 19, "#435b69");
    r(68, 224, 2, 9, "#8fcecf");
    r(70, 226, 5, 2, "#8fcecf");
    r(75, 224, 2, 9, "#8fcecf");
    crate(359, 232);
  }
  if (id === "orbital") {
    r(361, 62, 14, 11, "#a9bdc7");
    r(344, 63, 16, 9, "#447b9c");
    r(376, 63, 17, 9, "#447b9c");
    for (let i = 0; i < 3; i++) {
      r(347 + i * 4, 63, 1, 9, "#94ced8");
      r(379 + i * 4, 63, 1, 9, "#94ced8");
    }
    r(367, 57, 1, 5, "#c2d8d7");
    r(366, 55, 3, 2, "#f1ce97");
  }
  if (id === "floating") {
    for (let i = 0; i < 12; i++) {
      r(168 + i * 5, 194 + Math.floor(Math.sin((i / 11) * Math.PI) * 9), 3, 2, "#bc986c");
    }
    r(167, 184, 2, 12, "#89633f");
    r(227, 184, 2, 12, "#89633f");
    for (let i = 0; i < 9; i++)
      r(174 + i * 6, 193 + Math.floor(Math.sin((i / 8) * Math.PI) * 7), 1, 6, "#806855");
  }
  if (id === "desert") {
    for (let i = 0; i < 12; i++) {
      r(37 + i * 3, 229 + Math.floor(Math.sin(i) * 2), 3, 1, "#e0b87f");
    }
    crate(349, 236);
    r(72, 191, 4, 28, "#9f7e54");
    r(67, 191, 14, 3, "#d7b582");
    r(70, 214, 8, 3, "#b59463");
  }
  if (id === "library") {
    r(163, 228, 112, 18, "#6a4950");
    for (let i = 0; i < 16; i++) r(167 + i * 6, 231, 3, 2, "#b79a77");
    r(321, 174, 11, 2, "#a97855");
    r(323, 166, 6, 8, "#e0cda0");
    r(329, 168, 4, 4, "#b6a47e");
    r(325, 162, 1, 3, "#e0d8bf88");
    r(82, 210, 14, 9, "#39333c");
    r(80, 208, 5, 5, "#39333c");
    r(89, 210, 2, 2, "#daca8a");
  }
  if (id === "cabin") {
    for (let i = 0; i < 5; i++) {
      r(150 + i * 7, 235, 6, 7, "#816450");
      r(151 + i * 7, 236, 3, 5, "#bd9b71");
    }
    r(381, 214, 14, 3, "#f7f0de");
    r(383, 217, 10, 7, "#c9d9db");
    r(387, 224, 2, 8, "#c9d9db");
  }
  if (id === "sunsetCity") {
    r(391, 138, 2, 30, "#563847");
    r(384, 143, 17, 1, "#563847");
    r(380, 148, 26, 1, "#563847");
    r(382, 153, 21, 1, "#563847");
    r(50, 215, 30, 3, "#75505c");
    for (let i = 0; i < 4; i++) r(52 + i * 7, 218, 2, 12, "#75505c");
  }
  if (id === "sakura") {
    lantern(124, 221);
    lantern(371, 228);
    r(222, 236, 66, 3, "#a27789");
    r(220, 230, 3, 13, "#72556d");
    r(287, 230, 3, 13, "#72556d");
    for (let i = 0; i < 11; i++) r(225 + i * 5, 228, 2, 10, "#b28c9d");
  }
  if (id === "lighthouse") {
    for (let i = 0; i < 15; i++) {
      const x = Math.floor(rand() * 260);
      r(x, 235 + Math.floor(rand() * 25), 8 + Math.floor(rand() * 20), 4, "#3a4e62");
      r(x + 2, 234 + Math.floor(rand() * 25), 5, 1, "#8ea8b3");
    }
  }
  if (id === "reef") {
    for (let i = 0; i < 18; i++) {
      const x = 13 + i * 26,
        y = 235 + Math.floor(rand() * 24);
      r(x, y, 2, 7, "#e99caa");
      r(x - 2, y + 2, 6, 2, "#e99caa");
    }
    r(290, 205, 3, 3, "#ffeeb8");
    r(298, 214, 3, 3, "#ffeeb8");
  }
  if (id === "volcano") {
    for (let i = 0; i < 9; i++) {
      const x = 54 + i * 47;
      r(x, 246, 16, 6, "#402c32");
      r(x + 3, 244, 8, 2, "#67433a");
      r(x + 7, 247, 3, 1, "#eb7647");
    }
  }
  if (id === "arcadeRoom") {
    for (let i = 0; i < 12; i++) {
      const x = Math.floor(rand() * 480),
        y = 241 + Math.floor(rand() * 26);
      r(x, y, 3, 2, i % 2 ? "#c9a861" : "#a25d99");
    }
    r(9, 23, 49, 39, "#372346");
    r(13, 27, 41, 31, "#171528");
    r(19, 34, 28, 3, "#74cbbb");
    r(24, 43, 18, 3, "#e8b776");
  }
  if (id === "auroraLake") {
    r(63, 239, 50, 2, "#496b7e");
    r(72, 246, 43, 1, "#638394");
    r(325, 247, 19, 1, "#d3b98288");
    r(316, 257, 37, 1, "#b5a98755");
  }
  return out;
};
for (const [id, wall] of Object.entries(PIXEL_WALLPAPERS)) {
  if (!wall.url.startsWith("data:image/svg+xml,")) continue;
  const source = decodeURIComponent(wall.url.split(",").slice(1).join(","));
  wall.url =
    "data:image/svg+xml," +
    encodeURIComponent(
      source.replace("</svg>", `<g class="universe-details">${detailLayer(id)}</g></svg>`),
    );
}
