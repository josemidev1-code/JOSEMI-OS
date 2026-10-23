// src/shell/navigation.js: fuente de JOSEMI-OS.
const desktop = document.querySelector("#desktop");
const topbar = document.createElement("header");
topbar.className = "pixel-system-bar";
topbar.innerHTML = `<div class="pixel-brand"><span class="pixel-brand-mark" aria-hidden="true">J</span><strong>JOSEMI-OS</strong><span class="pixel-bar-divider"></span><span class="pixel-current-app">ESCRITORIO</span></div><nav aria-label="Herramientas del sistema"><button data-pixel-open="projects">ARCHIVOS</button><button data-pixel-open="readme">AYUDA</button><button data-pixel-search>BUSCAR <kbd>CTRL K</kbd></button></nav><span class="pixel-system-caption">UN PEQUEÑO UNIVERSO DIGITAL</span>`;
desktop.prepend(topbar);
const dock = document.createElement("div");
dock.className = "pixel-pinned";
const pinned = ["welcome", "projects", "arcade", "settings"];
function renderDock() {
  dock.innerHTML = pinned
    .map(
      (id) =>
        `<button data-pixel-dock="${id}" aria-label="${id === "welcome" ? "Inicio" : Apps[id].title}" title="${id === "welcome" ? "Inicio" : Apps[id].title}">${Apps[id].icon}<span>${id === "welcome" ? "Inicio" : Apps[id].title}</span><i aria-hidden="true"></i></button>`,
    )
    .join("");
}
document.querySelector(".taskbar__apps").before(dock);
dock.addEventListener("click", (e) => {
  const id = e.target.closest("[data-pixel-dock]")?.dataset.pixelDock;
  if (!id) return;
  const chip = document.querySelector(`.tb-app[data-id="${id}"]`);
  if (chip) chip.click();
  else openWindow(id);
});
const hiddenChips = document.createElement("style");
hiddenChips.textContent =
  pinned.map((id) => `.pixel-system .tb-app[data-id="${id}"]`).join(",") + "{display:none}";
document.head.append(hiddenChips);
