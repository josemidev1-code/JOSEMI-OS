// src/apps/base.js: fuente de JOSEMI-OS.
const pixelIcon = (tipo) =>
  `<span class="app-pixel-icon app-pixel-icon--${tipo}" aria-hidden="true"></span>`;

// APLICACIONES: cada entrada tiene título, icono, render() para el HTML y bind() para los eventos.
const Apps = {
  // TERMINAL: guarda el historial visible y envía cada línea al intérprete runCommand.
  terminal: {
    title: "Terminal",
    icon: "💻",
    render: () => `
   <div class="term"><div class="term__out" id="term-out"></div>
   <div class="term__line"><span class="p">josemi@portfolio</span>:<span class="dir">~</span>$<input class="term__in" id="term-in" autocomplete="off" spellcheck="false"></div></div>`,
    bind(b) {
      const out = $("#term-out", b),
        inp = $("#term-in", b);
      const print = (h, c = "") => {
        const d = document.createElement("div");
        d.className = c;
        d.innerHTML = h;
        out.appendChild(d);
        out.scrollTop = out.scrollHeight;
      };
      print('Terminal de JOSEMI-OS · escribe <span class="ok">ayuda</span>');
      inp.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const raw = inp.value.trim();
        inp.value = "";
        print(
          `<span class="p">josemi@portfolio</span>:<span class="dir">~</span>$ ${escapeHTML(raw)}`,
        );
        runCommand(raw, print, openWindow);
      });
      b.addEventListener("click", () => inp.focus());
    },
  },

  // ARCADE: games.js dibuja las tarjetas; aquí cada tarjeta abre su juego.
  arcade: {
    title: "Arcade",
    icon: "🕹️",
    bind(b) {
      b.querySelectorAll("[data-game]").forEach((x) =>
        x.addEventListener("click", () => openWindow(x.dataset.game)),
      );
    },
  },

  // JUEGOS: Tetris y Pac-Man se definen completos en games.js; aquí solo reservan título e icono.
  tetris: { title: "Tetris", icon: pixelIcon("tetris") },
  pacman: { title: "Pac-Man", icon: pixelIcon("pacman") },
};
// Genera el HTML repetido de una barra de habilidad; data-w guarda el porcentaje.
function bar(n, v) {
  return `<div class="res"><div class="res__top"><span>${n}</span><span>${v}%</span></div><div class="bar"><i data-w="${v}"></i></div></div>`;
}
