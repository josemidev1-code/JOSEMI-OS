// src/bootstrap/viewport.js: fuente de JOSEMI-OS.
window.openWindow = openWindow;
window.chooseTheme = chooseTheme;
// Espai visible real: barres del navegador, teclat virtual i canvis d'orientació.
function syncResponsiveViewport() {
  const view = window.visualViewport;
  const height = view?.height || innerHeight;
  const top = view?.offsetTop || 0;
  const root = document.documentElement.style;
  root.setProperty("--screen-height", `${height}px`);
  root.setProperty("--screen-top", `${top}px`);
  root.setProperty("--keyboard-inset", `${Math.max(0, innerHeight - height - top)}px`);
}
window.addEventListener("resize", syncResponsiveViewport);
window.visualViewport?.addEventListener("resize", syncResponsiveViewport);
window.visualViewport?.addEventListener("scroll", syncResponsiveViewport);
syncResponsiveViewport();
