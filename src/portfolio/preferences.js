// src/portfolio/preferences.js: fuente de JOSEMI-OS.
"use strict";

const GOW_URL = "assets/wallpapers/god-of-war-ragnarok.jpg";

// Estado para desbloqueos y fondo personalizado.
if (!state.vault) state.vault = { matrix: false, gof: false };
if (!state.wallpaper) state.wallpaper = state.wp === 4 ? "matrix" : "static";
if (state.wallpaper === "godOfWar" && !state.vault.gof) state.wallpaper = "static";
if (!state.vault.matrix && state.atmosphere === "matrixBlue") state.atmosphere = "matrix";
save();
