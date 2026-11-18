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
// Iconos grandes del universo pixel: mismos mapas y paleta que el resto del escritorio.
const art = Object.fromEntries(
  [
    "computer",
    "temple",
    "code",
    "ai",
    "pacman",
    "tetris",
    "minesweeper",
    "coin",
    "lock",
    "terminal",
    "controller",
    "fog",
    "factory",
    "scales",
  ].map((id) => [id, mapIcon(id)]),
);
window.PixelArt = art;
for (const id of ["tetris", "pacman", "minesweeper"]) Apps[id].icon = art[id];
Apps.welcome.icon = art.computer;
