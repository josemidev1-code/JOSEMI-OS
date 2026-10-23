// src/core/state.js: fuente de JOSEMI-OS.
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
let state = Object.assign({}, DEF, OSStorage.readJSON("josemi-os", {}));
// Corrige una sola vez el ajuste que antes se activaba automáticamente.
// A partir de aquí, el interruptor de Ajustes conserva la elección del visitante.
if (state.motionPreferenceVersion !== 1) {
  state.motion = false;
  state.motionPreferenceVersion = 1;
}
if (["#6C63FF", "#00C8FF", "#4ade80", "#f5b942"].includes(state.accent)) state.accent = "#6dff9b";
// localStorage conserva datos aunque se cierre o recargue la pestaña.
const save = () => OSStorage.writeJSON("josemi-os", state);

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
if (!Number.isInteger(state.wp) || state.wp < 0 || state.wp >= WALLS.length) state.wp = 0;
