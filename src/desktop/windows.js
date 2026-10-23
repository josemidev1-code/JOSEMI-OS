// src/desktop/windows.js: fuente de JOSEMI-OS.
function fitWindowBounds(rect, viewportWidth, viewportHeight) {
  const topInset = document.body.classList.contains("pixel-system") ? 48 : 12;
  const availableWidth = Math.max(1, viewportWidth - 32);
  const availableHeight = Math.max(1, viewportHeight - topInset - 98);
  const width = Math.max(Math.min(300, availableWidth), Math.min(rect.width, availableWidth));
  const height = Math.max(Math.min(220, availableHeight), Math.min(rect.height, availableHeight));
  return {
    width,
    height,
    left: Math.max(16, Math.min(rect.left, viewportWidth - width - 16)),
    top: Math.max(topInset, Math.min(rect.top, viewportHeight - height - 98)),
  };
}

const WM = (() => {
  let z = 10,
    open = new Map(),
    x = 40,
    y = 86;
  // Desplaza cada ventana nueva para que no aparezcan todas exactamente superpuestas.
  const nextPos = () => {
    x += 28;
    y += 28;
    if (x > 200) x = 40;
    if (y > 170) y = 86;
    return { x, y };
  };
  // Un z-index mayor coloca la ventana enfocada delante de las demás.
  function focus(win) {
    win.style.zIndex = ++z;
    win.focus({ preventScroll: true });
    $$(".tb-app").forEach((t) => t.classList.remove("active"));
    const c = $(`.tb-app[data-id="${win.dataset.id}"]`);
    if (c) {
      c.classList.add("active");
      c.classList.remove("dim");
      c.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  function openWindow(id) {
    const app = Apps[id];
    if (!app) return;
    // Map permite saber si la app ya está abierta y evita crear duplicados.
    if (open.has(id)) {
      const o = open.get(id);
      if (o.minimized) {
        o.el.classList.remove("minimized");
        o.minimized = false;
      }
      focus(o.el);
      beep();
      return o.el;
    }
    const p = nextPos(),
      win = document.createElement("section");
    win.className = "window";
    win.dataset.id = id;
    win.tabIndex = -1;
    const bounds = fitWindowBounds(
      {
        width: app.size?.[0] || 640,
        height: app.size?.[1] || 500,
        left: p.x,
        top: p.y,
      },
      innerWidth,
      innerHeight,
    );
    for (const [key, value] of Object.entries(bounds)) win.style[key] = value + "px";
    win.style.zIndex = ++z;
    win.innerHTML = `<div class="win__bar"><div class="win__title"><span class="t-ico">${app.icon}</span> ${app.title}</div>
      <div class="win__btns"><button class="win-btn min" aria-label="Minimizar"></button><button class="win-btn max" aria-label="Maximizar"></button><button class="win-btn close" aria-label="Cerrar"></button></div></div>
      <div class="win__body"></div><div class="win__resize"></div>`;
    // Primero insertamos el HTML; después bind() puede buscar sus elementos y añadir eventos.
    $("#desktop").appendChild(win);
    $(".win__body", win).innerHTML = app.render();
    if (app.bind) app.bind($(".win__body", win), win);
    requestAnimationFrame(() => win.classList.add("open"));
    $(".close", win).onclick = () => closeWindow(id);
    $(".min", win).onclick = () => {
      const finish = () => {
        if (!open.has(id)) return;
        win.classList.add("minimized");
        open.get(id).minimized = true;
        const c = $(`.tb-app[data-id="${id}"]`);
        if (c) c.classList.add("dim");
        beep();
      };
      typeof minimizeWithMotion === "function" ? minimizeWithMotion(win, finish) : finish();
    };
    $(".max", win).onclick = () =>
      typeof maximizeWithMotion === "function"
        ? maximizeWithMotion(win)
        : win.classList.toggle("maximized");
    win.addEventListener("pointerdown", () => focus(win));
    drag(win, $(".win__bar", win));
    resize(win, $(".win__resize", win));
    addChip(id, app);
    open.set(id, { el: win, minimized: false });
    beep();
    return win;
  }
  // CERRAR: win.__cleanup() libera bucles, temporizadores y eventos de cada aplicación.
  function closeWindow(id) {
    const o = open.get(id);
    if (!o) return;
    o.el.__transition?.cancel();
    if (o.el.__cleanup) o.el.__cleanup();
    o.el.classList.remove("open");
    setTimeout(() => o.el.remove(), 220);
    open.delete(id);
    const c = $(`.tb-app[data-id="${id}"]`);
    if (c) c.remove();
    beep();
  }
  function addChip(id, app) {
    const b = document.createElement("button");
    b.className = "tb-app active";
    b.dataset.id = id;
    b.title = app.title;
    b.setAttribute("aria-label", app.title);
    b.innerHTML = `<span>${app.icon}</span> <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${app.title}</span>`;
    b.onclick = () => {
      const o = open.get(id);
      if (!o) return;
      if (o.minimized) {
        o.el.classList.remove("minimized");
        o.minimized = false;
        focus(o.el);
      } else if (o.el.style.zIndex == z) {
        $(".min", o.el).click();
      } else focus(o.el);
    };
    $("#taskbar__apps").appendChild(b);
    b.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  // pointerdown guarda la posición inicial; pointermove calcula el desplazamiento del ratón.
  function drag(win, h) {
    h.addEventListener("pointerdown", (e) => {
      if (innerWidth <= 820 || e.target.closest(".win-btn")) return;
      if (win.classList.contains("maximized")) return;
      focus(win);
      const sx = e.clientX,
        sy = e.clientY,
        ox = win.offsetLeft,
        oy = win.offsetTop;
      const mv = (ev) => {
        let nx = Math.max(0, Math.min(ox + ev.clientX - sx, innerWidth - 120)),
          ny = Math.max(
            document.body.classList.contains("pixel-system") ? 48 : 12,
            Math.min(oy + ev.clientY - sy, innerHeight - 150),
          );
        win.style.left = nx + "px";
        win.style.top = ny + "px";
      };
      const up = () => {
        document.removeEventListener("pointermove", mv);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
      };
      document.addEventListener("pointermove", mv);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    });
  }
  // El tirador inferior derecho modifica ancho y alto respetando tamaños mínimos.
  function resize(win, h) {
    h.addEventListener("pointerdown", (e) => {
      if (win.classList.contains("maximized")) return;
      e.stopPropagation();
      focus(win);
      const sx = e.clientX,
        sy = e.clientY,
        ow = win.offsetWidth,
        oh = win.offsetHeight;
      const mv = (ev) => {
        win.style.width =
          Math.max(280, Math.min(ow + ev.clientX - sx, innerWidth - win.offsetLeft - 10)) + "px";
        win.style.height =
          Math.max(180, Math.min(oh + ev.clientY - sy, innerHeight - win.offsetTop - 98)) + "px";
      };
      const up = () => {
        document.removeEventListener("pointermove", mv);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
      };
      document.addEventListener("pointermove", mv);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    });
  }
  window.addEventListener("resize", () => {
    if (innerWidth <= 820) return;
    for (const { el } of open.values()) {
      const bounds = fitWindowBounds(
        {
          width: parseFloat(el.style.width),
          height: parseFloat(el.style.height),
          left: parseFloat(el.style.left),
          top: parseFloat(el.style.top),
        },
        innerWidth,
        innerHeight,
      );
      for (const [key, value] of Object.entries(bounds)) el.style[key] = value + "px";
    }
  });
  return { openWindow, closeWindow };
})();
let openWindow = WM.openWindow;
