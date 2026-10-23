// src/desktop/theme-base.js: fuente de JOSEMI-OS.
function applyTheme() {
  document.documentElement.style.setProperty("--accent", state.accent);
  document.documentElement.style.setProperty("--accent-soft", state.accent + "1f");
  document.documentElement.style.setProperty("--bg", state.bg);
  const bg = $("#bg");
  // Con el fondo Matrix (wp 4) la lluvia la dibuja el motor ASCII sobre negro.
  if (bg) bg.style.background = state.wp === 4 ? "#000" : WALLS[state.wp];
  document.body.classList.toggle("reduce-motion", state.motion);
}
applyTheme();
