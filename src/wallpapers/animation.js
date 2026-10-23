// src/wallpapers/animation.js: fuente de JOSEMI-OS.
const matrixPixels = {};
for (const id of ["matrixCity", "matrixCode"]) {
  const source = decodeURIComponent(PIXEL_WALLPAPERS[id].url.split(",").slice(1).join(","));
  matrixPixels[id] = [];
  for (const path of source.matchAll(/<path fill="(#[a-fA-F0-9]+)" d="([^"]+)"/g)) {
    if (!["#a1efc1", "#164c57", "#18523b"].includes(path[1])) continue;
    for (const p of path[2].matchAll(/M(-?[\d.]+) (-?[\d.]+)h([\d.]+)v([\d.]+)/g))
      matrixPixels[id].push({ x: +p[1], y: +p[2], w: +p[3], h: +p[4] });
  }
}

// Una única capa animada, pequeña y sin interacción. Se pausa al ocultar la pestaña.
const canvas = document.createElement("canvas");
canvas.id = "pixel-scene";
canvas.setAttribute("aria-hidden", "true");
canvas.width = 960;
canvas.height = 540;
q("#bg").append(canvas);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
let raf = 0,
  last = 0,
  sceneTime = 0;
const particles = Array.from({ length: 54 }, (_, i) => ({
  x: (i * 173 + 37) % 960,
  y: (i * 97 + 71) % 540,
  s: 1 + (i % 3),
  v: 8 + (i % 15),
}));
function drawScene(t) {
  ctx.clearRect(0, 0, 960, 540);
  const id = state.wallpaper;
  if (matrixPixels[id]) {
    for (const p of matrixPixels[id]) {
      if (
        (id === "matrixCity" && p.y >= 130) ||
        (id === "matrixCode" && p.x >= 150 && p.x <= 330 && p.y >= 46)
      )
        continue;
      const head = (t * 18 + Math.floor(p.x / 12) * 17) % 170,
        delta = (head - p.y + 170) % 170;
      ctx.globalAlpha = delta < 9 ? 0.75 : delta < 28 ? 0.3 : 0;
      if (!ctx.globalAlpha) continue;
      ctx.fillStyle = "#a1efc1";
      ctx.fillRect(p.x * 2, p.y * 2, p.w * 2, p.h * 2);
    }
    ctx.globalAlpha = 1;
    return;
  }
  const petals = id === "sakura",
    underwater = id === "reef",
    snow = ["cabin", "auroraLake", "godOfWar", "godOfWarPixel"].includes(id),
    embers = ["volcano", "arcadeRoom"].includes(id),
    digital = space.has(id) || id === "matrix",
    rain = id === "lighthouse" || id === "library";
  for (const [i, p] of particles
    .slice(0, Math.max(9, Math.round(state.weatherDensity * 0.6)))
    .entries()) {
    let x = (p.x + t * (underwater ? 4 : petals ? 12 : rain ? 25 : 3)) % 960,
      y = (p.y + t * p.v * (underwater || embers ? -1 : 1) + 1080) % 540;
    ctx.globalAlpha = 0.25 + (Math.sin(t * 1.6 + i) + 1) * 0.23;
    ctx.fillStyle = petals
      ? "#ffc8dc"
      : underwater
        ? "#b6ecf5"
        : snow
          ? "#d4effb"
          : embers
            ? "#ffc16e"
            : digital
              ? "#8cebc0"
              : rain
                ? "#b3d5e9"
                : "#d3e5a5";
    if (petals) {
      x += Math.sin(t + i) * 14;
      ctx.fillRect(x, y, p.s * 2, p.s);
      ctx.fillRect(x + 1, y - 1, p.s, p.s);
    } else if (underwater) {
      ctx.strokeStyle = "#b6ecf5";
      ctx.strokeRect(x, y, p.s * 2, p.s * 2);
    } else if (rain) ctx.fillRect(x, y, 1, 7 + p.s * 3);
    else if (digital) {
      ctx.fillRect(x, y, 2, p.s * 2);
      if (i % 4 === 0) ctx.fillRect(x + 3, y + 3, 2, 2);
    } else ctx.fillRect(x, y, p.s, p.s);
  }
  ctx.globalAlpha = 1;
  if (wet.has(id) || ["sonic", "godOfWar"].includes(id))
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 ? "#b6d8db33" : "#dce9e533";
      ctx.fillRect((i * 67 + t * 5) % 960, 440 + ((i * 11) % 90), 10 + Math.sin(t + i) * 7, 1);
    }
  if (id === "reef") {
    for (let i = 0; i < 5; i++) {
      const x = ((i * 210 + t * (12 + i * 2)) % 1080) - 60,
        y = 150 + i * 45 + Math.sin(t + i) * 9;
      ctx.fillStyle = ["#f9cf61", "#ef926d", "#99dcce"][i % 3];
      ctx.fillRect(x, y, 18, 8);
      ctx.fillRect(x - 6, y - 2, 6, 12);
      ctx.fillStyle = "#163046";
      ctx.fillRect(x + 12, y + 1, 2, 2);
    }
  }
  if (id === "volcano") {
    ctx.globalAlpha = 0.15 + Math.sin(t * 2) * 0.06;
    ctx.fillStyle = "#ff8844";
    ctx.fillRect(430, 120, 100, 12);
    ctx.globalAlpha = 1;
  }
  if (["minecraft", "sonicCoast", "floating"].includes(id))
    for (let i = 0; i < 3; i++) {
      const x = ((i * 317 + t * 7) % 1050) - 45,
        y = 60 + i * 23 + Math.sin(t * 0.7 + i) * 6;
      ctx.fillStyle = "#e4ecde77";
      ctx.fillRect(x, y, 18, 1);
      ctx.fillRect(x + 7, y - 2, 4, 2);
    }
}
function sceneFrame(now) {
  raf = 0;
  if (document.hidden || canvas.hidden) return;
  if (now - last > 65) {
    const dt = last ? Math.min(0.15, (now - last) / 1000) : 0;
    last = now;
    if (!state.motion) sceneTime += dt * state.weatherSpeed;
    drawScene(sceneTime);
  }
  if (!state.motion) raf = requestAnimationFrame(sceneFrame);
}
function syncScene() {
  cancelAnimationFrame(raf);
  raf = 0;
  last = 0;
  canvas.hidden = !Object.hasOwn(PIXEL_WALLPAPERS, state.wallpaper);
  if (canvas.hidden) {
    ctx.clearRect(0, 0, 960, 540);
    return;
  }
  drawScene(sceneTime);
  if (!state.motion && !document.hidden) raf = requestAnimationFrame(sceneFrame);
}
const applyBefore = applyTheme;
applyTheme = function () {
  if (Object.hasOwn(PIXEL_WALLPAPERS, state.wallpaper) || state.wallpaper === "godOfWar")
    state.atmosphere = "none";
  applyBefore();
  document.body.classList.toggle("universe-photo", state.wallpaper === "godOfWar");
  syncScene();
};
document.addEventListener("visibilitychange", syncScene);
