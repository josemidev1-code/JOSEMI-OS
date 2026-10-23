// src/pixel/art.js: fuente de JOSEMI-OS.
"use strict";
const q = (s, r = document) => r.querySelector(s),
  qa = (s, r = document) => [...r.querySelectorAll(s)];
const norm = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const svg = (parts, cls = "") =>
  `<svg class="os-icon ${cls}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">${parts}</svg>`;
const palettes = {
  ink: "#101e24",
  light: "#e9f1d7",
  mint: "#8ce6ac",
  gold: "#ffce74",
  blue: "#78cbe2",
  pink: "#f49ac1",
};
const art = {
  computer: svg(
    rect(3, 3, 26, 20, "#172b30") +
      rect(4, 4, 24, 17, "#87adad") +
      rect(6, 6, 20, 13, "#0a2026") +
      rect(8, 8, 3, 7, "#8ce6ac") +
      rect(9, 13, 8, 2, "#8ce6ac") +
      rect(18, 9, 5, 1, "#539b92") +
      rect(18, 12, 5, 1, "#539b92") +
      rect(13, 23, 6, 3, "#78969b") +
      rect(9, 26, 14, 2, "#b4d6ca") +
      rect(4, 29, 24, 2, "#596f79"),
  ),
  temple: svg(
    rect(3, 25, 26, 4, "#b99c6c") +
      rect(2, 29, 28, 2, "#e8cca0") +
      rect(5, 10, 22, 3, "#f1ddae") +
      rect(7, 7, 18, 3, "#d6bd8c") +
      rect(10, 5, 12, 2, "#efd8aa") +
      rect(14, 3, 4, 2, "#f8e8bf") +
      [7, 14, 21]
        .map(
          (x) =>
            rect(x, 14, 4, 11, "#ddc498") +
            rect(x, 14, 1, 11, "#fff0cb") +
            rect(x - 1, 23, 6, 2, "#b99c6c"),
        )
        .join(""),
  ),
  code: svg(
    rect(2, 4, 28, 24, "#213a42") +
      rect(4, 6, 24, 20, "#0b1a22") +
      rect(5, 7, 22, 2, "#4c6e78") +
      [0, 1, 2]
        .map(
          (i) =>
            rect(10 - i * 2, 12 + i * 2, 2, 2, "#8ce6ac") +
            rect(8 + i * 2, 18 + i * 2, 2, 2, "#8ce6ac") +
            rect(20 + i * 2, 12 + i * 2, 2, 2, "#f5c476") +
            rect(22 - i * 2, 18 + i * 2, 2, 2, "#f5c476"),
        )
        .join("") +
      rect(16, 12, 1, 10, "#a2b7f2"),
  ),
  ai: svg(
    rect(8, 5, 16, 21, "#7fa4b7") +
      rect(10, 7, 12, 17, "#273f51") +
      rect(12, 10, 3, 3, "#8ce6ac") +
      rect(18, 10, 3, 3, "#8ce6ac") +
      rect(12, 18, 9, 2, "#f49ac1") +
      rect(15, 2, 2, 4, "#f3d184") +
      rect(14, 1, 4, 2, "#f3d184") +
      [6, 12, 18, 24]
        .map((y) => rect(5, y, 3, 2, "#b8d7d9") + rect(24, y, 3, 2, "#b8d7d9"))
        .join("") +
      rect(12, 27, 2, 4, "#698b9c") +
      rect(20, 27, 2, 4, "#698b9c"),
  ),
  pacman: svg(
    [
      [10, 3, 12, 2],
      [6, 5, 20, 3],
      [4, 8, 20, 3],
      [2, 11, 17, 3],
      [2, 14, 13, 4],
      [2, 18, 17, 3],
      [4, 21, 20, 3],
      [6, 24, 20, 3],
      [10, 27, 12, 2],
    ]
      .map((a) => rect(...a, "#ffdc59"))
      .join("") +
      rect(14, 7, 3, 3, "#1b2635") +
      rect(26, 15, 3, 3, "#f8edca"),
  ),
  tetris: svg(
    [
      [3, 18, "#62d8df"],
      [11, 18, "#ab88ed"],
      [19, 18, "#ab88ed"],
      [11, 10, "#ab88ed"],
      [19, 26, "#f8cf66"],
      [27, 26, "#f8cf66"],
      [3, 26, "#62d8df"],
      [11, 26, "#62d8df"],
    ]
      .map(
        ([x, y, c]) =>
          rect(x, y - 3, 7, 7, "#122730") +
          rect(x + 1, y - 2, 5, 5, c) +
          rect(x + 1, y - 2, 4, 1, "#e4eddf"),
      )
      .join(""),
  ),
  minesweeper: svg(
    rect(13, 3, 6, 26, "#87a4ad") +
      rect(3, 13, 26, 6, "#87a4ad") +
      rect(7, 7, 18, 18, "#2c4653") +
      rect(10, 10, 12, 12, "#142b35") +
      rect(11, 10, 4, 4, "#e3f2dc") +
      rect(25, 3, 2, 7, "#ffb6a0") +
      rect(22, 6, 8, 2, "#ffb6a0"),
  ),
  coin: svg(
    rect(10, 2, 12, 2, "#ffe9a2") +
      rect(6, 4, 20, 3, "#ffdf75") +
      rect(4, 7, 24, 18, "#eaa83c") +
      rect(6, 25, 20, 3, "#ad6324") +
      rect(10, 28, 12, 2, "#8a4920") +
      rect(7, 7, 18, 17, "#ffd363") +
      rect(10, 8, 12, 2, "#fff1ad") +
      rect(14, 11, 4, 10, "#b9782f") +
      rect(12, 12, 2, 3, "#b9782f"),
  ),
  lock: svg(
    '<g class="pixel-lock-shackle">' +
      rect(8, 3, 16, 3, "#b7dbe0") +
      rect(6, 6, 5, 10, "#648d9a") +
      rect(21, 6, 5, 10, "#a4c9cc") +
      "</g>" +
      rect(4, 14, 24, 16, "#d29a45") +
      rect(6, 16, 20, 11, "#f0c16a") +
      rect(14, 18, 4, 4, "#3f4541") +
      rect(15, 22, 2, 4, "#3f4541"),
  ),
};
window.PixelArt = art;
for (const id of ["tetris", "pacman", "minesweeper"]) Apps[id].icon = art[id];
Apps.welcome.icon = art.computer;
Apps.motivation.icon = art.ai;
