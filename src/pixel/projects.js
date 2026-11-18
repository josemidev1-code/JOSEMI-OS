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
    `<section class="pixel-project-detail"><span class="project-large-art">${art.computer}</span><span class="card-kicker">PROYECTO PERSONAL / EN EVOLUCIÓN</span><h2>Un PC dentro de tu navegador.</h2><p>JOSEMI-OS es mi portfolio interactivo: un escritorio con ventanas, aplicaciones, juegos y Milo, mi ajolote con IA. Todo está construido con HTML, CSS y JavaScript.</p><dl class="project-facts"><div><dt>Aplicaciones integradas</dt><dd>${Object.keys(Apps).filter((id) => !id.startsWith("case-")).length}</dd></div><div><dt>Juegos en Arcade</dt><dd>3</dd></div><div><dt>Paisajes pixel art</dt><dd>${Object.keys(PIXEL_WALLPAPERS).length}</dd></div></dl><div class="proj"><span class="chip">JavaScript</span><span class="chip">Pixel art</span><span class="chip">APIs</span><span class="chip">Aprendizaje</span></div><a class="btn btn--accent" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener">VER REPOSITORIO ↗</a><figure class="project-demo"><video controls playsinline preload="none" poster="media/demo-poster.png" width="1280" height="720" aria-label="Demostración de JOSEMI-OS: Milo, proyectos y Arcade"><source src="media/josemi-os-demo.mp4" type="video/mp4"><track kind="captions" src="media/demo-es.vtt" srclang="es" label="Español" default>Tu navegador no reproduce este vídeo. <a href="media/josemi-os-demo.mp4">Descargar la demo MP4</a>.</video><figcaption>Un recorrido real de unos 30 segundos: presentación, Milo abriendo Proyectos, entrada al Arcade y contacto. Sin audio. <a href="media/demo-transcripcion.html" target="_blank" rel="noopener">Leer la descripción del vídeo ↗</a></figcaption></figure></section>`,
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
// Un caso por proyecto real: reto → solución → resultado, con fecha en directo de GitHub.
const caseLinks = (c) =>
  `<div class="btn-row">${c.live ? `<a class="btn btn--accent" href="${c.live}" target="_blank" rel="noopener">VER EN DIRECTO ↗</a>` : ""}<a class="btn${c.live ? "" : " btn--accent"}" href="https://github.com/${GITHUB_USER}/${c.repo}" target="_blank" rel="noopener">VER CÓDIGO ↗</a></div>`;
const caseApp = (c) => ({
  title: c.name,
  icon: art[c.art],
  size: [760, 680],
  render: () =>
    `<section class="pixel-project-detail case-study"><span class="project-large-art">${art[c.art]}</span><span class="card-kicker">${c.kicker} · ${c.status === "done" ? "PUBLICADO" : "EN DESARROLLO"}</span><h2>${c.tagline}</h2><ol class="case-steps"><li><h3>Reto</h3><p>${c.reto}</p></li><li><h3>Solución</h3><p>${c.solucion}</p></li><li><h3>Resultado</h3><p>${c.resultado}</p></li></ol><dl class="project-facts">${c.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl><div class="proj">${c.stack.map((t) => `<span class="chip">${t}</span>`).join("")}</div>${c.note ? `<p class="case-note">${c.note}</p>` : ""}<p class="case-updated" data-gh-pushed="${c.repo}"></p>${caseLinks(c)}</section>`,
  bind: (body) => hydrateGithub(body),
});
CASE_STUDIES.forEach((c) => (Apps["case-" + c.id] = caseApp(c)));

const projectCard = (id, icon, name, kicker, text, go, repo) =>
  `<button class="folder" data-project-app="${id}"><span class="g">${icon}</span><small class="project-kicker">${kicker}</small><span class="n">${name}</span><small>${text}</small>${repo ? `<small class="case-updated" data-gh-pushed="${repo}"></small>` : ""}<span class="project-go">${go}</span></button>`;

Apps.projects.render = () =>
  `<section class="pixel-projects"><span class="card-kicker">/PROYECTOS</span><h2>Código que puedes explorar.</h2><p class="bio">${CASE_STUDIES.length + 1} proyectos reales. Cada uno cuenta el reto, cómo lo resolví y qué salió.</p>${githubWidget()}<div class="folder-grid universe-projects">${projectCard("portfolio", art.computer, "JOSEMI-OS", "PORTFOLIO · ESTA WEB", "Un escritorio en el navegador con Arcade y Milo.", "EXPLORAR →", "JOSEMI-OS")}${CASE_STUDIES.map((c) => projectCard("case-" + c.id, art[c.art], c.name, c.kicker, c.tagline, "VER EL CASO →", c.repo)).join("")}</div><div class="project-more"><span class="card-kicker">TAMBIÉN</span><button class="btn" data-project-app="education">FORMACIÓN DAM →</button><button class="btn" data-project-app="roadmap">IA + SOFTWARE →</button></div></section>`;
Apps.projects.size = [900, 780];
Apps.projects.bind = (b) => {
  b.addEventListener("click", (e) => {
    const id = e.target.closest("[data-project-app]")?.dataset.projectApp;
    if (id) openWindow(id);
  });
  hydrateGithub(b);
};
