// src/desktop/desktop.js: fuente de JOSEMI-OS.
function boot() {
  location.reload();
}

/* ========================================================= ESCRITORIO */
// ACCESOS DEL ESCRITORIO: los juegos se abren desde el Arcade, el buscador o la terminal.
const ICONS = [
  "readme",
  "about",
  "projects",
  "skills",
  "terminal",
  "contact",
  "arcade",
  "settings",
  "system",
  "trash",
];
let startTime = Date.now();
// ICONOS: construye accesos desde currentUser.apps. shell.js sustituye esta versión por botones SVG accesibles.
function buildMenu() {
  const m = $("#menu__apps");
  m.innerHTML = "";
  const llista = currentUser && currentUser.apps ? currentUser.apps : ICONS;
  llista.forEach((id) => {
    const a = Apps[id];
    if (!a) return;
    const b = document.createElement("button");
    b.innerHTML = `<span>${a.icon}</span> ${a.title}`;
    b.onclick = () => {
      openWindow(id);
      $("#menu").classList.add("hidden");
    };
    m.appendChild(b);
  });
}
// RELOJ: actualiza hora y fecha una vez por segundo con Date y el idioma del navegador.
function buildClock() {
  const t = $("#clock__time"),
    d = $("#clock__date");
  const tick = () => {
    if (document.hidden) return;
    const n = new Date();
    t.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
    d.textContent = n.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const st = $("#sys-uptime");
    if (st) st.textContent = Math.floor((n - startTime) / 1000) + "s";
    const sc = $("#sys-time");
    if (sc) sc.textContent = t.textContent;
  };
  tick();
  setInterval(tick, 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick();
  });
}
// PROFUNDIDAD: desplaza el fondo unos píxeles con el ratón. Los paisajes pixel art, Matrix ASCII y reducir movimiento lo desactivan.
// RENDIMIENTO: como máximo un cálculo por fotograma y solo se escribe el estilo si cambia.
function buildParallax() {
  const bg = $("#bg");
  let pending = false,
    last = "",
    x = 0,
    y = 0;
  addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const still =
        state.motion ||
        PIXEL_WALLPAPERS[state.wallpaper] ||
        state.wp === 4 ||
        state.atmosphere?.startsWith("matrix");
      const value = still
        ? "none"
        : `translate(${Math.round((x / innerWidth - 0.5) * 30)}px,${Math.round((y / innerHeight - 0.5) * 30)}px)`;
      if (value !== last) bg.style.transform = last = value;
    });
  });
}
// INICIO: alterna la visibilidad del menú y lo cierra cuando se pulsa fuera.
function buildStart() {
  const m = $("#menu");
  $("#start").onclick = (e) => {
    e.stopPropagation();
    m.classList.toggle("hidden");
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#menu") && !e.target.closest("#start")) m.classList.add("hidden");
  });
  $$(".menu__power button").forEach(
    (b) =>
      (b.onclick = () => {
        m.classList.add("hidden");
        b.dataset.power === "shutdown" ? shutdown() : boot();
      }),
  );
}
// CLIC DERECHO: evita el menú nativo dentro del escritorio y coloca nuestro menú sin salir de pantalla.
function buildContext() {
  const ctx = $("#ctxmenu");
  document.addEventListener("contextmenu", (e) => {
    if (
      $("#desktop").classList.contains("hidden") ||
      e.target.closest(".window,.menu,.taskbar,#mascot-chat")
    )
      return;
    e.preventDefault();
    ctx.classList.remove("hidden");
    const w = ctx.offsetWidth,
      h = ctx.offsetHeight;
    ctx.style.left = Math.min(e.clientX, innerWidth - w - 8) + "px";
    ctx.style.top = Math.min(e.clientY, innerHeight - h - 8) + "px";
  });
  document.addEventListener("click", () => ctx.classList.add("hidden"));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") ctx.classList.add("hidden");
  });
  ctx.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.act;
        ctx.classList.add("hidden");
        if (a === "refresh") {
          buildIcons();
          toast("Escritorio actualizado.");
        }
        if (a === "wallpaper") {
          openWindow("gallery");
        }
        if (a === "terminal") openWindow("terminal");
        if (a === "system") openWindow("system");
        if (a === "arcade") openWindow("arcade");
      }),
  );
}
// APAGADO SIMULADO: cierra las ventanas y muestra una pantalla final; no apaga el ordenador.
function shutdown() {
  Object.keys(Apps).forEach((id) => WM.closeWindow(id));
  const s = $("#shutdown");
  s.classList.remove("hidden");
  $("#shutdown__msg").textContent = "Apagando JOSEMI-OS...";
  setTimeout(() => {
    $("#shutdown__msg").textContent = "Ahora puedes cerrar esta pestaña con seguridad.";
    $("#reboot").classList.remove("hidden");
  }, 1600);
  $("#reboot").onclick = () => location.reload();
}
// SECRETOS: compara las últimas teclas con el código Konami y activa pequeñas sorpresas.
function buildKonami() {
  const s = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let i = 0;
  addEventListener("keydown", (e) => {
    if (e.target.closest(".game") || e.target.closest(".window")?.querySelector(".game")) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === s[i]) i++;
    else if (key === s[0]) i = 1;
    else i = 0;
    if (i === s.length) {
      state.wp = 4;
      state.atmosphere = "matrix";
      applyTheme();
      save();
      toast("Código Konami: MODO DESARROLLADOR ACTIVADO");
      openWindow("easter");
      i = 0;
    }
  });
  let clockClicks = 0,
    clockTimer = null;
  $("#clock__time").addEventListener("click", () => {
    clockClicks++;
    clearTimeout(clockTimer);
    clockTimer = setTimeout(() => (clockClicks = 0), 1500);
    if (clockClicks >= 7) {
      clockClicks = 0;
      openWindow("easter");
      toast("Has forzado una anomalía temporal.");
    }
  });
  let typed = "";
  addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea")) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith("josemi")) {
      toast("Usuario raíz detectado.");
      openWindow("about");
      typed = "";
    }
  });
}
