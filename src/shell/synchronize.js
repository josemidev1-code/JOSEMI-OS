// src/shell/synchronize.js: fuente de JOSEMI-OS.
function launch(e) {
  const id = e.target.closest("[data-pixel-open]")?.dataset.pixelOpen;
  if (id) openWindow(id);
  if (e.target.closest("[data-pixel-search]")) togglePalette(true);
  if (e.target.closest("[data-pixel-milo]")) toggleMilo(true);
}
topbar.addEventListener("click", launch);
renderDock();
window.refreshPixelDock = renderDock;

let pending = false;
function synchronize() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    const wins = [...desktop.querySelectorAll(".window:not(.minimized):not(.closing)")];
    const active = wins.sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex))[0];
    const name = active ? Apps[active.dataset.id]?.title : "ESCRITORIO";
    topbar.querySelector(".pixel-current-app").textContent = name || "ESCRITORIO";
    dock.querySelectorAll("[data-pixel-dock]").forEach((button) => {
      const win = desktop.querySelector(
        `.window[data-id="${button.dataset.pixelDock}"]:not(.closing)`,
      );
      button.classList.toggle("is-open", !!win);
      button.classList.toggle("is-active", win === active);
    });
    desktop.querySelectorAll(".window:not([data-pixel-window])").forEach((win) => {
      win.dataset.pixelWindow = "true";
      win.setAttribute("aria-label", Apps[win.dataset.id]?.title || "Ventana");
      if (win.dataset.id === "welcome") {
        win.classList.add("pixel-home-window");
        if (innerWidth > 820) {
          win.style.left = Math.max(14, (innerWidth - win.offsetWidth) / 2) + "px";
          win.style.top = Math.max(64, (innerHeight - win.offsetHeight - 55) / 2) + "px";
        }
      }
    });
  });
}
new MutationObserver(synchronize).observe(desktop, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "style"],
});
let openedHome = false;
const startObserver = new MutationObserver(() => {
  if (!openedHome && !desktop.classList.contains("hidden")) {
    openedHome = true;
    if (!desktop.querySelector('.window[data-id="welcome"]')) openWindow("welcome");
    startObserver.disconnect();
    synchronize();
  }
});
startObserver.observe(desktop, { attributes: true, attributeFilter: ["class"] });
let small = innerWidth <= 820;
addEventListener("resize", () => {
  if (small && innerWidth > 820)
    desktop.querySelectorAll(".window").forEach((win) => {
      const size = Apps[win.dataset.id]?.size || [640, 500];
      const bounds = fitWindowBounds(
        { width: size[0], height: size[1], left: (innerWidth - size[0]) / 2, top: 70 },
        innerWidth,
        innerHeight,
      );
      Object.entries(bounds).forEach(([key, value]) => (win.style[key] = value + "px"));
    });
  small = innerWidth <= 820;
});
document.fonts.ready.then(() => {
  desktop.querySelectorAll(".boot-logo,.ascii-stage").forEach((el) => {
    if (typeof fitAsciiText === "function") fitAsciiText(el);
  });
});
