// src/wallpapers/atmosphere.js: fuente de JOSEMI-OS.
let atmosphereCanvas = null,
  atmosphereContext = null,
  atmosphereRAF = 0,
  atmosphereTime = 0,
  atmosphereLast = null,
  atmosphereDrawn = -Infinity,
  atmosphereSize = "",
  atmosphereColors = [];
// RENDIMIENTO: el fondo solo se anima si el escritorio es visible y no hay un juego o salvapantallas delante.
function atmosphereActive() {
  return (
    !document.hidden &&
    !state.motion &&
    state.atmosphere !== "none" &&
    !document.body.classList.contains("has-pixel-wallpaper") &&
    !document.body.classList.contains("has-god-of-war") &&
    !$("#desktop").classList.contains("hidden") &&
    $("#shutdown").classList.contains("hidden") &&
    $("#os-screensaver")?.hidden &&
    !$$(".window").some((w) => !w.classList.contains("minimized") && w.querySelector(".game"))
  );
}
// LIENZO: limita resolución y número de celdas, obtiene la matriz y dibuja cada carácter con Canvas 2D.
function drawAtmosphere() {
  if (!atmosphereContext) return;
  const width = innerWidth,
    height = innerHeight,
    cell = Math.max(innerWidth < 600 ? 13 : 15, width / 180),
    line = Math.max(19, height / 65),
    cols = Math.ceil(width / cell),
    rows = Math.ceil(height / line),
    dpr = Math.min(devicePixelRatio || 1, 1.5),
    size = `${width}:${height}:${dpr}`;
  if (size !== atmosphereSize) {
    atmosphereSize = size;
    atmosphereCanvas.width = Math.round(width * dpr);
    atmosphereCanvas.height = Math.round(height * dpr);
    atmosphereContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  atmosphereContext.clearRect(0, 0, width, height);
  atmosphereContext.font = state.atmosphere.startsWith("matrix")
    ? "18px JetBrains Mono"
    : "16px JetBrains Mono";
  atmosphereContext.textBaseline = "top";
  const frame = atmosphereFrame(
    state.atmosphere,
    Math.min(cols, 180),
    Math.min(rows, 65),
    state.motion ? 3.5 : atmosphereTime,
    state.weatherDensity,
  );
  const calm = state.intensity === "calm" ? 0.65 : 1,
    inks = { head: "#defff3", cyan: "#52d8ec", green: "#36dd87" };
  let lastFill = "";
  for (const i of frame.used) {
    const x = i % frame.w,
      y = (i - x) / frame.w,
      fill = inks[frame.ink[i]] || atmosphereColors[Math.floor((x / cols) * 3) % 3];
    atmosphereContext.globalAlpha = frame.light[i] * calm;
    if (fill !== lastFill) atmosphereContext.fillStyle = lastFill = fill;
    atmosphereContext.fillText(frame.ch[i], x * cell, y * line);
  }
  atmosphereContext.globalAlpha = 1;
}
// TIEMPO DEL FONDO: limita los fotogramas y evita saltos al volver de otra pestaña.
function atmosphereTick(now) {
  atmosphereRAF = 0;
  if (!atmosphereActive()) {
    atmosphereLast = null;
    return;
  }
  if (atmosphereLast !== null)
    atmosphereTime += Math.min(0.1, (now - atmosphereLast) / 1000) * state.weatherSpeed;
  atmosphereLast = now;
  if (now - atmosphereDrawn > (state.intensity === "calm" ? 83 : 42)) {
    drawAtmosphere();
    atmosphereDrawn = now;
  }
  atmosphereRAF = requestAnimationFrame(atmosphereTick);
}
// SINCRONIZACIÓN: crea un único Canvas, aplica colores y decide iniciar o cancelar su bucle.
function syncAtmosphere() {
  if (!atmosphereCanvas) {
    atmosphereCanvas = document.createElement("canvas");
    atmosphereCanvas.id = "ascii-wall";
    atmosphereCanvas.setAttribute("aria-hidden", "true");
    $("#bg").append(atmosphereCanvas);
    atmosphereContext = atmosphereCanvas.getContext("2d");
  }
  atmosphereCanvas.hidden = state.atmosphere === "none";
  atmosphereColors = [
    state.accent,
    THEMES[state.theme].accent,
    ["paper", "glacier"].includes(state.theme) ? "#647f95" : "#b7a7ec",
  ];
  document.body.dataset.atmosphere = state.atmosphere;
  drawAtmosphere();
  if (!atmosphereActive()) {
    cancelAnimationFrame(atmosphereRAF);
    atmosphereRAF = 0;
    atmosphereLast = null;
  } else if (!atmosphereRAF) atmosphereRAF = requestAnimationFrame(atmosphereTick);
}
