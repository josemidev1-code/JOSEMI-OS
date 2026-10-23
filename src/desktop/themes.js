// src/desktop/themes.js: fuente de JOSEMI-OS.
function cursorSVG(kind, size) {
  const color = THEMES[state.theme].accent;
  const paths = {
    pixel: `<path d="M3 2h4v4h4v4h4v4h4v4h-8v8H7V14H3z" fill="${color}" stroke="#17251f" stroke-width="2"/>`,
    terminal: `<path d="M10 3h12M16 3v26M10 29h12" stroke="${color}" stroke-width="3"/><path d="M11 5h10M18 5v22" stroke="#07100b"/>`,
    crosshair: `<path d="M16 1v10M16 21v10M1 16h10M21 16h10" stroke="${color}" stroke-width="2"/><rect x="13" y="13" width="6" height="6" fill="${color}"/>`,
    arrow:
      '<path d="M5 2v25l7-7 6 10 5-3-6-10h10z" fill="#f4f0df" stroke="#17241e" stroke-width="2"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${paths[kind]}</svg>`;
}
// APARIENCIA: aplica tema, textura, cursor y fondo al DOM. Los atributos data-* activan reglas CSS.
function applyShell() {
  document.body.dataset.theme = state.theme;
  document.body.dataset.intensity = state.intensity;
  document.body.classList.toggle("with-grain", !!state.grain);
  document.body.classList.toggle("immersive-desktop", !state.welcomeVisible);
  const value =
    state.cursor === "system"
      ? "auto"
      : `url("data:image/svg+xml,${encodeURIComponent(cursorSVG(state.cursor, state.cursorSize))}") ${state.cursor === "crosshair" || state.cursor === "terminal" ? Math.round(state.cursorSize / 2) : 2} ${state.cursor === "crosshair" ? Math.round(state.cursorSize / 2) : 2}, auto`;
  document.documentElement.style.setProperty("--os-cursor", value);
  document.documentElement.style.setProperty(
    "--os-pointer",
    state.cursor === "system" ? "pointer" : value,
  );
  document.documentElement.style.setProperty(
    "--motion-ms",
    state.intensity === "calm" ? "180ms" : "400ms",
  );
  $("#shell-theme-name")?.replaceChildren(document.createTextNode(THEMES[state.theme].name));
  syncAtmosphere();
}
const baseApplyTheme = applyTheme;
applyTheme = function () {
  baseApplyTheme();
  applyShell();
};
function chooseTheme(id) {
  if (!THEMES[id]) return;
  state.theme = id;
  state.accent = THEMES[id].accent;
  state.bg = THEMES[id].bg;
  applyTheme();
  save();
}
