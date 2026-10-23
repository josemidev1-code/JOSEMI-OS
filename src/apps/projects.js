// src/apps/projects.js: fuente de JOSEMI-OS.
Apps.projects = {
  title: "Proyectos",
  icon: pixelIcon("projects"),
  render: () => `
      <div class="app-title">/PROYECTOS</div>
      <p class="bio">Aquí separo lo que ya estoy construyendo de las áreas en las que quiero seguir experimentando. No relleno el portfolio con proyectos inventados.</p>
      <div class="folder-grid">
        <div class="folder" tabindex="0" data-folder="web"><span class="g">⌘</span><span class="n">JOSEMI-OS</span><small>Proyecto real</small></div>
        <div class="folder" tabindex="0" data-folder="museo"><span class="g">◈</span><span class="n">Museu grec</span><small>Formación</small></div>
        <div class="folder" tabindex="0" data-folder="school"><span class="g">{ }</span><span class="n">DAM</span><small>Formación</small></div>
        <div class="folder" tabindex="0" data-folder="ai"><span class="g">✦</span><span class="n">IA + software</span><small>Roadmap</small></div>
      </div>`,
  bind(b) {
    b.querySelectorAll(".folder").forEach((f) => {
      const abrir = () => openProject(f.dataset.folder);
      f.setAttribute("role", "button");
      f.addEventListener("click", (event) => {
        if (event.pointerType === "touch" || matchMedia("(pointer: coarse)").matches) abrir();
      });
      f.addEventListener("dblclick", (event) => {
        if (event.pointerType !== "touch" && !matchMedia("(pointer: coarse)").matches) abrir();
      });
      f.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
        }
      });
    });
  },
};
