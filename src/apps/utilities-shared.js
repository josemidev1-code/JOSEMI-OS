// src/apps/utilities-shared.js: fuente de JOSEMI-OS.
const read = OSStorage.readJSON;
const write = OSStorage.writeJSON;
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
function spriteIcon(kind) {
  const pixels = {
    gallery: [
      [3, 5, 26, 23, "#b9cbd7"],
      [5, 7, 22, 18, "#172b37"],
      [7, 19, 8, 4, "#608f89"],
      [10, 15, 7, 8, "#608f89"],
      [16, 17, 9, 6, "#80b49a"],
      [21, 10, 4, 4, "#f3cc80"],
    ],
    notes: [
      [6, 3, 21, 27, "#e9d9a7"],
      [4, 5, 3, 25, "#a89066"],
      [11, 9, 12, 2, "#897b60"],
      [11, 14, 12, 2, "#897b60"],
      [11, 19, 8, 2, "#897b60"],
      [21, 23, 9, 3, "#789d7f"],
      [25, 19, 3, 10, "#789d7f"],
    ],
    calculator: [
      [6, 2, 21, 28, "#a3b4b1"],
      [9, 5, 15, 7, "#213d35"],
      [11, 8, 11, 2, "#b5e4b5"],
      ...[0, 1, 2].flatMap((y) =>
        [0, 1, 2].map((x) => [9 + x * 5, 15 + y * 4, 3, 2, x === 2 ? "#ddb083" : "#394d4b"]),
      ),
    ],
    focus: [
      [11, 2, 10, 3, "#e4c49c"],
      [14, 5, 4, 3, "#a0b4b3"],
      [7, 8, 18, 2, "#a0b4b3"],
      [5, 10, 22, 15, "#a0b4b3"],
      [7, 25, 18, 3, "#a0b4b3"],
      [8, 11, 16, 13, "#253f37"],
      [15, 12, 2, 8, "#bde7aa"],
      [16, 18, 6, 2, "#bde7aa"],
    ],
    launchpad: [...Array(9)].map((_, i) => [
      4 + (i % 3) * 9,
      4 + Math.floor(i / 3) * 9,
      6,
      6,
      ["#8cbe9f", "#dcbf83", "#8aa9c6"][i % 3],
    ]),
  };
  return `<svg class="os-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shape-rendering="crispEdges">${pixels[kind].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join("")}</svg>`;
}
