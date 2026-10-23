// src/desktop/search.js: fuente de JOSEMI-OS.
let paletteFocus = null,
  paletteIndex = 0;
// BUSCADOR: abre un diálogo con foco en el campo y devuelve el foco anterior al cerrar.
function togglePalette(show) {
  const modal = $("#command-palette");
  if (show) {
    if ($("#desktop").classList.contains("hidden")) return;
    paletteFocus = document.activeElement;
    modal.hidden = false;
    $("#palette-query").value = "";
    paletteIndex = 0;
    renderPalette();
    $("#palette-query").focus();
  } else {
    modal.hidden = true;
    paletteFocus?.focus({ preventScroll: true });
  }
}
// RESULTADOS: filtra nombres e identificadores; cada botón abre la aplicación correspondiente.
function renderPalette() {
  const query = $("#palette-query").value.trim().toLowerCase(),
    ids = [...currentUser.apps, "pacman", "tetris", "minesweeper"].filter((id) =>
      `${Apps[id].title} ${id}`.toLowerCase().includes(query),
    );
  paletteIndex = Math.min(paletteIndex, Math.max(0, ids.length - 1));
  const list = $("#palette-results");
  list.innerHTML = ids.length
    ? ids
        .map(
          (id, i) =>
            `<button role="option" aria-selected="${i === paletteIndex}" class="${i === paletteIndex ? "current" : ""}" data-launch="${id}">${Apps[id].icon}<span>${Apps[id].title}</span><small>ABRIR ↵</small></button>`,
        )
        .join("")
    : '<p class="palette-empty">No hay aplicaciones con ese nombre.</p>';
  $$("[data-launch]", list).forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.launch;
        togglePalette(false);
        openWindow(id);
      }),
  );
}
// TECLADO: Ctrl+K abre, flechas seleccionan, Enter ejecuta, Escape cierra y Tab permanece en el diálogo.
function setupPalette() {
  const overlay = document.createElement("div");
  overlay.id = "command-palette";
  overlay.hidden = true;
  overlay.innerHTML =
    '<section role="dialog" aria-modal="true" aria-label="Buscar aplicaciones"><div class="palette-head"><span>⌕</span><input id="palette-query" placeholder="Busca en tu escritorio…" aria-label="Buscar aplicación" autocomplete="off"><button class="btn palette-close">ESC</button></div><div id="palette-results" role="listbox" aria-label="Aplicaciones"></div><footer>↑ ↓ seleccionar · ENTER abrir · ESC cerrar</footer></section>';
  document.body.append(overlay);
  $(".palette-close", overlay).onclick = () => togglePalette(false);
  overlay.onclick = (e) => {
    if (e.target === overlay) togglePalette(false);
  };
  const query = $("#palette-query");
  query.oninput = () => {
    paletteIndex = 0;
    renderPalette();
  };
  query.onkeydown = (e) => {
    const count = $$("[data-launch]", $("#palette-results")).length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      paletteIndex = Math.max(
        0,
        Math.min(count - 1, paletteIndex + (e.key === "ArrowDown" ? 1 : -1)),
      );
      renderPalette();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      $$("[data-launch]", $("#palette-results"))[paletteIndex]?.click();
    }
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      togglePalette(overlay.hidden);
    }
    if (e.key === "Escape" && !overlay.hidden) {
      e.preventDefault();
      togglePalette(false);
    }
    if (e.key === "Tab" && !overlay.hidden) {
      const nodes = $$("input,button", overlay);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
