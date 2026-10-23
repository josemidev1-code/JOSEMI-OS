// src/games/lifecycle.js: fuente de JOSEMI-OS.
("use strict");
// Shared game lifecycle: time stops when the player leaves a game.
// SEGURIDAD DEL TEXTO: convierte símbolos HTML en entidades para mostrar lo escrito sin ejecutarlo.
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
// RÉCORDS: localStorage conserva la mayor puntuación de cada juego en este navegador.
function recordScore(id, n) {
  try {
    const key = "josemi-best-" + id,
      best = Math.max(n, Number(localStorage.getItem(key)) || 0);
    localStorage.setItem(key, best);
    const label = document.querySelector(`.game-card--${id} .game-card__bottom span`);
    if (label) label.textContent = "RÉCORD " + best;
  } catch {}
}
function bestScore(id) {
  try {
    return Number(localStorage.getItem("josemi-best-" + id)) || 0;
  } catch {
    return 0;
  }
}
// PAUSA AUTOMÁTICA: observa minimizar, cambiar pestaña o perder foco. El cierre retira todos los listeners.
function attachGameLifecycle(win, pause) {
  const check = () => {
    if (
      win.classList.contains("minimized") ||
      win.classList.contains("minimizing") ||
      document.hidden ||
      !win.contains(document.activeElement)
    )
      pause();
  };
  const observer = new MutationObserver(check);
  observer.observe(win, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", check);
  document.addEventListener("focusin", check);
  window.addEventListener("blur", pause);
  const cleanup = win.__cleanup;
  win.__cleanup = () => {
    cleanup?.();
    observer.disconnect();
    document.removeEventListener("visibilitychange", check);
    document.removeEventListener("focusin", check);
    window.removeEventListener("blur", pause);
  };
}
// Boot art is stable ASCII. Noise only reveals the glyphs, never shifts the layout.
// FIRMA: seis líneas de caracteres forman JOSEMI-OS. La animación cambia su posición o revelado, no el nombre final.
const NAME_ART = [
  "     ██╗ ██████╗ ███████╗███████╗███╗   ███╗██╗       ██████╗ ███████╗",
  "     ██║██╔═══██╗██╔════╝██╔════╝████╗ ████║██║      ██╔═══██╗██╔════╝",
  "     ██║██║   ██║███████╗█████╗  ██╔████╔██║██║ ████╗██║   ██║███████╗",
  "██   ██║██║   ██║╚════██║██╔══╝  ██║╚██╔╝██║██║ ╚═══╝██║   ██║╚════██║",
  "╚█████╔╝╚██████╔╝███████║███████╗██║ ╚═╝ ██║██║      ╚██████╔╝███████║",
  " ╚════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝       ╚═════╝ ╚══════╝",
];
ICONS.push("easter");
currentUser.apps.push("easter");
