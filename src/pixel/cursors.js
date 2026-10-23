// src/pixel/cursors.js: fuente de JOSEMI-OS.
Object.assign(CURSORS, {
  sword: "Espada",
  axe: "Hacha nórdica",
  coin: "Moneda",
  ghost: "Fantasma",
  leaf: "Hoja",
  circuit: "Circuito",
  star: "Estrella",
  axolotl: "Ajolote",
});
const cursorBase = cursorSVG;
const cursorDraw = {
  sword:
    rect(5, 2, 4, 18, "#e5e8d8") +
    rect(4, 3, 1, 15, "#79b4bd") +
    rect(2, 19, 12, 3, "#f6cc73") +
    rect(6, 22, 3, 8, "#935e44"),
  axe:
    rect(13, 4, 4, 27, "#9d6848") +
    rect(6, 4, 16, 3, "#acd4d7") +
    rect(3, 7, 10, 9, "#d1e5db") +
    rect(3, 16, 6, 3, "#7baebc") +
    rect(17, 8, 9, 6, "#acd4d7"),
  ghost:
    rect(7, 3, 18, 4, "#a3c8fd") +
    rect(4, 7, 24, 19, "#a3c8fd") +
    rect(4, 26, 5, 4, "#a3c8fd") +
    rect(14, 26, 4, 4, "#a3c8fd") +
    rect(23, 26, 5, 4, "#a3c8fd") +
    rect(8, 11, 5, 6, "#f7f4e4") +
    rect(20, 11, 5, 6, "#f7f4e4") +
    rect(9, 13, 3, 4, "#213d65") +
    rect(21, 13, 3, 4, "#213d65"),
  leaf:
    rect(18, 3, 10, 7, "#b1ed91") +
    rect(10, 10, 17, 8, "#79c77c") +
    rect(5, 18, 17, 7, "#539865") +
    rect(3, 25, 5, 5, "#d3b77d") +
    rect(12, 15, 3, 3, "#def1b3") +
    rect(18, 9, 3, 3, "#def1b3"),
  circuit:
    rect(12, 8, 12, 16, "#9ce2bb") +
    rect(15, 11, 6, 10, "#1e4c49") +
    [4, 10, 16, 22]
      .map((y) => rect(6, y + 2, 6, 2, "#c8e9cf") + rect(24, y + 2, 6, 2, "#c8e9cf"))
      .join(""),
  star:
    rect(14, 2, 4, 10, "#fff0ab") +
    rect(3, 12, 26, 5, "#ffd073") +
    rect(8, 17, 16, 6, "#ffd073") +
    rect(5, 23, 8, 6, "#e6a44e") +
    rect(19, 23, 8, 6, "#e6a44e") +
    rect(12, 12, 8, 7, "#fff0ab"),
  axolotl:
    rect(7, 9, 19, 16, "#ffc7df") +
    rect(3, 6, 4, 6, "#e88caf") +
    rect(1, 13, 6, 4, "#e88caf") +
    rect(26, 6, 4, 6, "#e88caf") +
    rect(26, 13, 6, 4, "#e88caf") +
    rect(10, 14, 3, 3, "#513b53") +
    rect(21, 14, 3, 3, "#513b53") +
    rect(15, 20, 4, 2, "#a96c91"),
};
cursorSVG = function (kind, size) {
  if (kind === "coin") return art.coin.replace("<svg ", `<svg width="${size}" height="${size}" `);
  return cursorDraw[kind]
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges">${cursorDraw[kind]}</svg>`
    : cursorBase(kind, size);
};
