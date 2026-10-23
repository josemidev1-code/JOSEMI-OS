/* GENERADO: editar src/ o styles/ y ejecutar npm run build. Orden: sources.manifest.json. */
(() => {
  // src/shell/preferences.js: fuente de JOSEMI-OS.
  document.body.classList.add("pixel-system");
  if (state.wallpaper === "marioWorld") {
    state.wallpaper = "platformWorld";
    save();
  }
  const originalApply = applyTheme;
  applyTheme = function () {
    originalApply();
    const wallpaper = PIXEL_WALLPAPERS[state.wallpaper];
    if (wallpaper) document.body.style.setProperty("--pixel-wallpaper", `url("${wallpaper.url}")`);
  };
  // Recover the original palette only for visitors of the retired desktop.
  if (state.macShellVersion) {
    state.theme = "night";
    state.accent = "#8be9a8";
    state.bg = "#090e14";
    if (state.wallpaper === "horizon") {
      state.wallpaper = "matrixCity";
      state.atmosphere = "matrix";
      state.wp = 0;
    }
    delete state.macShellVersion;
    save();
    applyTheme();
  }
  if (state.pixelSystemVersion !== 3) {
    if (!state.wallpaper || state.wallpaper === "static") state.wallpaper = "matrixCity";
    if (state.cursor === "system") state.cursor = "pixel";
    state.pixelSystemVersion = 3;
    save();
  }
  applyTheme();

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

  // src/apps/home.js: fuente de JOSEMI-OS.
  Apps.welcome = {
    title: "Inicio",
    icon: Apps.readme.icon,
    size: [900, 700],
    render:
      () => `<div class="pixel-home"><div class="pixel-home-status"><span><i></i>JOSEMI-OS / PORTFOLIO</span><span>DISEÑADO PARA EXPLORAR</span></div><div class="pixel-home-hero"><div class="pixel-profile-frame home-computer"><div class="pixel-portrait">${window.PixelArt?.computer || Apps.welcome.icon}</div><span>JOSEMI-OS</span><small>ESCRITORIO PERSONAL</small></div><div class="pixel-home-copy"><span class="pixel-kicker">JOSÉ MIGUEL MIRALLES GANDIA</span><h1>Ideas que se<br>convierten en código<span class="pixel-cursor">_</span></h1><p>Estudiante de DAM en Xàtiva.<br>Este escritorio reúne lo que construyo, lo que aprendo y un pequeño Arcade para desconectar.</p><div class="pixel-home-actions"><button class="btn btn--accent" data-pixel-open="projects">VER MIS PROYECTOS →</button><a class="btn" href="mailto:josemidev1@gmail.com">CONTÁCTAME ↗</a></div></div></div><section class="home-brand-section" aria-labelledby="home-about"><span class="card-kicker">01 / SOBRE MÍ</span><h2 id="home-about">De jugar a construir.</h2><p>Desde pequeño me apasiona la tecnología y los videojuegos me despertaron la curiosidad por el código. Estudio DAM en el IES Dr. Lluís Simarro, en Xàtiva. Ahora aprendo a convertir mis ideas en aplicaciones.</p><button class="btn" data-pixel-open="about">MÁS SOBRE MÍ →</button></section>
      <section class="home-brand-section" aria-labelledby="home-work"><span class="card-kicker">02 / LO QUE HE HECHO</span><h2 id="home-work">Dos proyectos que puedes explorar.</h2><div class="home-proof-grid"><article><h3>JOSEMI-OS</h3><p><strong>Reto:</strong> presentar mi perfil de forma interactiva. <strong>Solución:</strong> un escritorio en HTML, CSS y JavaScript. <strong>Resultado:</strong> esta web, con ventanas, Arcade y Milo conectado a APIs.</p><button class="btn" data-pixel-open="portfolio">VER EL PROYECTO →</button></article><article><h3>Museu grec</h3><p>Un proyecto de formación de portfolio web. Puedes consultar su código en GitHub y ver otra parte de mi aprendizaje.</p><a class="btn" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener">VER REPOSITORIO ↗</a></article></div></section>
      <section class="home-brand-section" aria-labelledby="home-interests"><span class="card-kicker">03 / ME GUSTA</span><h2 id="home-interests">Fuera y dentro del código.</h2><ul class="home-interest-list"><li>Programar</li><li>Videojuegos</li><li>Gimnasio y deporte</li><li>Ciencia ficción</li><li>Cine y lectura</li><li>IA y automatización</li></ul></section>
      <section class="home-brand-section" aria-labelledby="home-contact"><span class="card-kicker">04 / CONTACTO</span><h2 id="home-contact">Hablemos.</h2><p>Estoy aprendiendo y abierto a feedback, oportunidades y proyectos reales.</p><div class="home-contact-links"><a href="mailto:josemidev1@gmail.com">josemidev1@gmail.com ↗</a><a href="https://github.com/josemidev1-code" target="_blank" rel="noopener">GitHub ↗</a><a href="https://www.linkedin.com/in/jose-miguel-miralles-gandia-74347b43a/" target="_blank" rel="noopener">LinkedIn ↗</a></div></section>
      <div class="pixel-section-label"><span>EXPLORA EL ESCRITORIO</span><span>↓</span></div><div class="pixel-home-launchers"><button data-pixel-open="projects">${Apps.projects.icon}<span><strong>PROYECTOS</strong><small>Explora mi trabajo.</small></span></button><button data-pixel-open="arcade">${Apps.arcade.icon}<span><strong>ARCADE</strong><small>Una moneda. Tres clásicos.</small></span></button><button data-pixel-milo>${document.querySelector("#mascot-button .mascot-svg")?.outerHTML || ""}<span><strong>HABLA CON MILO</strong><small>Tu guía por este escritorio.</small></span></button></div><footer class="pixel-home-footer"><span>JOSÉ MIGUEL MIRALLES GANDIA · ${new Date().getFullYear()} · DE JUGAR A CONSTRUIR.</span><button data-pixel-open="contact">CONTACTO ↗</button></footer></div>`,
    bind(body) {
      body.addEventListener("click", launch);
    },
  };

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
})();
