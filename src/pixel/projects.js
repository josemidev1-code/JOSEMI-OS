// src/pixel/projects.js: fuente de JOSEMI-OS.
Apps.motivation.render = () =>
  `<section class="pixel-project-detail"><span class="project-large-art">${art.ai}</span><span class="card-kicker">UNA IDEA PARA SEGUIR</span><h2>Sigue construyendo.</h2><p>No hace falta saberlo todo para empezar. Aprende algo, pruébalo y mejora la siguiente versión.</p></section>`;

Apps.education = {
  title: "DAM · Mi formación",
  icon: art.code,
  size: [720, 570],
  render: () =>
    `<section class="pixel-project-detail"><span class="project-large-art">${art.code}</span><span class="card-kicker">FORMACIÓN / EN CURSO</span><h2>Aprendiendo a construir software.</h2><p>Estudio <strong>Desarrollo de Aplicaciones Multiplataforma (DAM)</strong> en el <strong>IES Dr. Lluís Simarro, en Xàtiva</strong>.</p><p>Mi formación gira en torno a la programación, las bases de datos y la creación de aplicaciones. En JOSEMI-OS pongo en práctica HTML, CSS, JavaScript, Git y GitHub.</p><div class="pixel-study-line"><span>APRENDER</span><i></i><span>CONSTRUIR</span><i></i><span>MEJORAR</span></div></section>`,
};
Apps.roadmap = {
  title: "IA + software",
  icon: art.ai,
  size: [720, 570],
  render: () =>
    `<section class="pixel-project-detail"><span class="project-large-art">${art.ai}</span><span class="card-kicker">ÁREA DE EXPLORACIÓN</span><h2>Código con nuevas posibilidades.</h2><p>Estoy explorando cómo integrar inteligencia artificial en aplicaciones y automatizaciones útiles.</p><p>Milo es una parte real de ese aprendizaje: conecta esta interfaz con un asistente, búsqueda web y meteorología. Esta sección reúne lo que quiero seguir aprendiendo; no presenta proyectos futuros como terminados.</p><button class="btn btn--accent" data-project-milo>HABLAR CON MILO</button></section>`,
  bind: (b) => (q("[data-project-milo]", b).onclick = () => toggleMilo(true)),
};
Apps.portfolio = {
  title: "JOSEMI-OS",
  icon: art.computer,
  size: [760, 580],
  render: () =>
    `<section class="pixel-project-detail"><span class="project-large-art">${art.computer}</span><span class="card-kicker">PROYECTO PERSONAL / EN EVOLUCIÓN</span><h2>Un PC dentro de tu navegador.</h2><p>JOSEMI-OS es mi portfolio interactivo: un escritorio con ventanas, aplicaciones, juegos y Milo, mi ajolote con IA. Todo está construido con HTML, CSS y JavaScript.</p><dl class="project-facts"><div><dt>Aplicaciones integradas</dt><dd>${Object.keys(Apps).length}</dd></div><div><dt>Juegos en Arcade</dt><dd>3</dd></div><div><dt>Paisajes pixel art</dt><dd>${Object.keys(PIXEL_WALLPAPERS).length}</dd></div></dl><div class="proj"><span class="chip">JavaScript</span><span class="chip">Pixel art</span><span class="chip">APIs</span><span class="chip">Aprendizaje</span></div><a class="btn btn--accent" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener">VER REPOSITORIO ↗</a><figure class="project-demo"><video controls playsinline preload="none" poster="media/demo-poster.png" width="1280" height="720" aria-label="Demostración de JOSEMI-OS: Milo, proyectos y Arcade"><source src="media/josemi-os-demo.mp4" type="video/mp4"><track kind="captions" src="media/demo-es.vtt" srclang="es" label="Español" default>Tu navegador no reproduce este vídeo. <a href="media/josemi-os-demo.mp4">Descargar la demo MP4</a>.</video><figcaption>Un recorrido real de unos 30 segundos: presentación, Milo abriendo Proyectos, entrada al Arcade y contacto. Sin audio. <a href="media/demo-transcripcion.html" target="_blank" rel="noopener">Leer la descripción del vídeo ↗</a></figcaption></figure></section>`,
  bind: (body, win) => {
    const video = q("video", body);
    const pause = () => video.pause();
    const observe = new MutationObserver(() => {
      if (win.classList.contains("minimized") || win.classList.contains("minimizing")) pause();
    });
    observe.observe(win, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", pause);
    win.__cleanup = () => {
      pause();
      observe.disconnect();
      document.removeEventListener("visibilitychange", pause);
    };
  },
};
Apps.projects.render = () =>
  `<section class="pixel-projects"><span class="card-kicker">/PROYECTOS Y APRENDIZAJE</span><h2>Código que puedes explorar.</h2><p class="bio">Lo que construyo, dónde aprendo y lo que quiero explorar después.</p><div class="folder-grid universe-projects"><button class="folder" data-project-app="portfolio"><span class="g">${art.computer}</span><span class="n">JOSEMI-OS</span><small>Mi escritorio interactivo</small><span class="project-go">EXPLORAR →</span></button><a class="folder" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener"><span class="g">${art.temple}</span><span class="n">Museu grec</span><small>Portfolio web · formación</small><span class="project-go">VER GITHUB ↗</span></a><button class="folder" data-project-app="education"><span class="g">${art.code}</span><span class="n">DAM</span><small>IES Dr. Lluís Simarro</small><span class="project-go">MI FORMACIÓN →</span></button><button class="folder" data-project-app="roadmap"><span class="g">${art.ai}</span><span class="n">IA + software</span><small>Exploración y aprendizaje</small><span class="project-go">DESCUBRIR →</span></button></div></section>`;
Apps.projects.size = [860, 760];
Apps.projects.bind = (b) =>
  b.addEventListener("click", (e) => {
    const id = e.target.closest("[data-project-app]")?.dataset.projectApp;
    if (id) openWindow(id);
  });
