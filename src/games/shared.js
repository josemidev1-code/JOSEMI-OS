// src/games/shared.js: fuente de JOSEMI-OS.
"use strict";

/* ========================================================= UTILIDADES */
// ALMACÉN: lee y guarda JSON en localStorage sin romper el juego si el navegador lo bloquea.
const read = OSStorage.readJSON;
const write = OSStorage.writeJSON;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const shuffle = (list) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};
// TIEMPO: 83456 ms → «1:23.45». Los segundos enteros sirven para el Buscaminas.
const clock = (ms, decimals = 2) => {
  const total = Math.max(0, ms) / 1000,
    minutes = Math.floor(total / 60),
    seconds = (total % 60).toFixed(decimals);
  return `${minutes}:${seconds.padStart(decimals ? 3 + decimals : 2, "0")}`;
};
const focusGame = (win) => win.focus({ preventScroll: true });

// SONIDO: osciladores de Web Audio; el arcade tiene su propio interruptor, independiente del sistema.
const SOUND_KEY = "josemi-arcade-sound";
const soundOn = () => read(SOUND_KEY, true) !== false;
let audio = null;
function tone(freq, duration, { type = "square", volume = 0.04, slide = 0, delay = 0 } = {}) {
  if (!soundOn()) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const start = audio.currentTime + delay,
      osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slide)
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch {}
}
const melody = (notes, step = 0.09, options = {}) =>
  notes.forEach((freq, i) => freq && tone(freq, step * 0.9, { ...options, delay: i * step }));

function bindSound(button) {
  const sync = () => {
    button.textContent = soundOn() ? "♪ SONIDO" : "♪ MUDO";
    button.setAttribute("aria-pressed", String(soundOn()));
  };
  button.addEventListener("click", () => {
    write(SOUND_KEY, !soundOn());
    if (audio) {
      if (soundOn()) audio.resume();
      else audio.suspend();
    }
    sync();
    tone(660, 0.06);
  });
  sync();
}

// CANVAS: resolución interna doble para texto nítido; el CSS lo escala sin suavizar.
function setupCanvas(canvas, width, height, scale = 2) {
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.aspectRatio = `${width} / ${height}`;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return ctx;
}
function label(ctx, str, x, y, size = 16, color = "#dbe9e0", align = "left", shadow = false) {
  ctx.font = `${size}px JetBrains Mono, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  if (shadow) {
    ctx.fillStyle = "#020806";
    ctx.fillText(str, x + 2, y + 2);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// BUCLE: requestAnimationFrame con delta limitado; se detiene al cerrar la ventana.
function gameLoop(win, step) {
  let raf = 0,
    last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!win.classList.contains("minimized")) step(dt);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

// BOTONES TÁCTILES: mantener pulsado funciona igual que mantener una tecla.
function bindPad(pad, win, press, release) {
  const up = (e) => {
    const button = e.target.closest("[data-pad]");
    if (!button || !button.classList.contains("is-down")) return;
    button.classList.remove("is-down");
    release?.(button.dataset.pad);
  };
  pad.addEventListener("pointerdown", (e) => {
    const button = e.target.closest("[data-pad]");
    if (!button) return;
    e.preventDefault();
    focusGame(win);
    button.setPointerCapture?.(e.pointerId);
    button.classList.add("is-down");
    press(button.dataset.pad);
  });
  pad.addEventListener("pointerup", up);
  pad.addEventListener("pointercancel", up);
  pad.addEventListener("lostpointercapture", up);
  pad.addEventListener("contextmenu", (e) => e.preventDefault());
}

// ICONOS: rejilla de 32 píxeles, igual que el resto del sistema.
const pixelSVG = (rects, size = 32) =>
  `<svg class="os-icon" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shape-rendering="crispEdges">${rects
    .map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)
    .join("")}</svg>`;
