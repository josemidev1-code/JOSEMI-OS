// src/desktop/preferences.js: fuente de JOSEMI-OS.
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
state.weatherDensity = Math.max(15, Math.min(90, Number(state.weatherDensity) || 55));
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
state.cursorSize = [20, 24, 32].includes(Number(state.cursorSize)) ? Number(state.cursorSize) : 24;
if (!["full", "calm"].includes(state.intensity)) state.intensity = "full";
state.idle = [0, 60, 180].includes(Number(state.idle)) ? Number(state.idle) : 0;
