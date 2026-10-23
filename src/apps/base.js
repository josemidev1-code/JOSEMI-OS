// src/apps/base.js: fuente de JOSEMI-OS.
const pixelIcon = (tipo) =>
  `<span class="app-pixel-icon app-pixel-icon--${tipo}" aria-hidden="true"></span>`;

// APLICACIONES: cada entrada tiene título, icono, render() para el HTML y bind() para los eventos.
const Apps = {
  // HABILIDADES: barras visuales con porcentajes; no son mediciones automáticas.
  skills: {
    title: "Habilidades",
    icon: "⚡",
    render: () => `
   <div class="app-title">STACK / ESTADO ACTUAL</div>
   <div class="skill-focus">
     <span class="card-kicker">TRABAJANDO AHORA</span>
     <div class="skill-big"><span>HTML</span><span>CSS</span><span>JavaScript</span></div>
     <p>Son las tecnologías con las que más estoy trabajando actualmente porque estoy desarrollando JOSEMI-OS.</p>
   </div>
   <div class="content-grid content-grid--compact">
     <article class="content-card"><span class="card-kicker">FORMACIÓN DAM</span><h3>Base de desarrollo</h3><p>Programación, aplicaciones multiplataforma y bases de datos dentro de mi formación. Prefiero no poner porcentajes falsos: mi nivel sigue creciendo.</p></article>
     <article class="content-card"><span class="card-kicker">ENFOQUE</span><h3>IA + automatización</h3><p>Estoy aprendiendo a utilizar la IA para acelerar desarrollo, crear automatizaciones y construir aplicaciones con más creatividad.</p></article>
     <article class="content-card"><span class="card-kicker">HERRAMIENTAS</span><h3>Git & GitHub</h3><p>Uso Git y GitHub para versionar este portfolio y seguir aprendiendo un flujo de trabajo real.</p></article>
     <article class="content-card"><span class="card-kicker">SIGUIENTE PASO</span><h3>Más proyectos</h3><p>La prioridad es construir, equivocarme, corregir y convertir cada proyecto en evidencia real de lo que sé hacer.</p></article>
   </div>`,
  },

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

  // README: vista HTML del texto de presentación, escrita en el código.
  readme: {
    title: "README.md",
    icon: "📄",
    render: () => `
   <article class="markdown-view">
     <div class="md-path">~/JOSEMI-OS/README.md</div>
     <h1>JOSEMI-OS</h1>
     <blockquote><strong> Este es mi primer proyecto personal como desarrollador de software.</strong></blockquote>
     <p>JOSEMI-OS es mi portfolio convertido en un pequeño sistema operativo interactivo. No quería hacer una web típica de “sobre mí + proyectos + contacto”, así que decidí construir un espacio que se pueda explorar, abrir, tocar y descubrir.</p>
     <h2>¿Quién soy?</h2>
     <p>Soy <strong>José Miguel Miralles Gandia</strong>, estudiante de <strong>DAM (Desarrollo de Aplicaciones Multiplataforma) en IES Dr. Lluís Simarro</strong> y desarrollador de software en proceso.</p>
     <p>Ahora mismo estoy trabajando especialmente con <code>HTML</code>, <code>CSS</code> y <code>JavaScript</code>. Me interesa la informática, la inteligencia artificial y el potencial de combinar software, automatización y creatividad.</p>
     <h2>¿Qué es esta web?</h2>
     <ul><li>Un portfolio interactivo presentado como un sistema operativo propio.</li><li>Un laboratorio para practicar frontend, interacción y JavaScript.</li><li>Un proyecto que irá creciendo conmigo.</li><li>Un sitio con aplicaciones, terminal, Arcade, easter eggs y acertijos.</li></ul>
     <h2>Cómo explorar</h2>
     <p>Doble clic abre aplicaciones. Las ventanas se pueden mover, minimizar, maximizar y redimensionar. El clic derecho abre acciones rápidas. En la terminal, <code>ayuda</code> es un buen comienzo.</p>
     <h2>Easter eggs</h2>
     <p>Hay secretos escondidos por el sistema. No voy a poner aquí las soluciones. Si encuentras algo raro, puede que no sea un bug.</p>
     <div class="md-sign">JOSEMI-OS // build, learn, repeat.</div>
   </article>`,
  },

  // PAPELERA: archivos ficticios para la metáfora del escritorio; no borra archivos del ordenador.
  trash: {
    title: "Papelera",
    icon: "🗑",
    render: () => `
   <div class="app-title">/home/josemi/.papelera</div>
   <div class="file-row" data-file="motivación.exe"><span class="g">⚙️</span> motivacion.exe</div>
   <div class="file-row" data-file="x"><span class="g">📄</span> Josemiprimeraweb.old</div>
   <div class="file-row" data-file="x"><span class="g">🗜️</span> proyecto-fallido.zip</div>
   <div class="file-row" data-file="x"><span class="g">📄</span> todo-final-final-ahora-si.html</div>`,
    bind(b) {
      b.querySelectorAll(".file-row").forEach((row) => {
        const openFile = () => {
          if (row.dataset.file === "motivación.exe") openWindow("motivation");
          else toast("No trabajo con motivación, trabajo con disciplina.");
        };
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.addEventListener("click", (event) => {
          if (event.pointerType === "touch" || matchMedia("(pointer: coarse)").matches) openFile();
        });
        row.addEventListener("dblclick", (event) => {
          if (event.pointerType !== "touch" && !matchMedia("(pointer: coarse)").matches) openFile();
        });
        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFile();
          }
        });
      });
    },
  },

  // MONITOR: información disponible del navegador y tiempo de sesión, no acceso a CPU o RAM real.
  system: {
    title: "Monitor del sistema",
    icon: "🖥️",
    render: () => `
   <div class="app-title">JOSEMI-OS · ESTADO: <span style="color:var(--accent)">EN LÍNEA</span></div>
   <div class="sys-grid">
     <div class="sys-card"><b id="sys-uptime">0s</b><span>Tiempo de sesión</span></div>
     <div class="sys-card"><b id="sys-time">--:--</b><span>Hora actual</span></div>
     <div class="sys-card"><b id="sys-res">—</b><span>Resolución</span></div>
     <div class="sys-card"><b id="sys-lang">—</b><span>Idioma del navegador</span></div>
     <div class="sys-card"><b id="sys-browser">—</b><span>Navegador</span></div></div>`,
    bind(b) {
      $("#sys-res", b).textContent = `${screen.width}×${screen.height}`;
      $("#sys-lang", b).textContent = navigator.language;
      const ua = navigator.userAgent;
      $("#sys-browser", b).textContent = /Firefox/.test(ua)
        ? "Firefox"
        : /Edg/.test(ua)
          ? "Edge"
          : /Chrome/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : "Desconocido";
    },
  },

  // MOTIVACIÓN: muestra mensajes del propio portfolio.
  motivation: {
    title: "motivacion.exe",
    icon: "💡",
    render: () =>
      `<div style="text-align:center;padding:2rem 1rem"><div style="font-size:2.5rem">💡</div><p style="font-family:var(--font-mono);margin-top:1rem;line-height:1.8">Sigue construyendo.<br>Cada proyecto te acerca a lo que quieres ser.</p></div>`,
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
