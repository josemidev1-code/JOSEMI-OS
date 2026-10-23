// src/apps/project-window.js: fuente de JOSEMI-OS.
function openProject(k) {
  const p = PROJECTS[k];
  if (!p) return;
  const id = "proj-" + k;
  Apps[id] = {
    title: p.name,
    icon: Apps.projects.icon,
    render: () => `<div class="app-title">${p.name.toUpperCase()}</div><p class="bio">${p.desc}</p>
    <div class="proj">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    <dl class="kv"><dt>Lenguaje</dt><dd>${p.lang}</dd><dt>Base de datos</dt><dd>${p.db}</dd><dt>Framework</dt><dd>${p.fw}</dd><dt>Fecha</dt><dd>${p.date}</dd></dl>
    <span class="status ${p.status}">${p.status === "done" ? "COMPLETADO" : p.status === "dev" ? "EN DESARROLLO" : "EXPERIMENTAL"}</span>
    <div class="btn-row">${p.github ? `<a class="btn btn--accent" href="${p.github}" target="_blank" rel="noopener">ABRIR GITHUB ↗</a>` : '<span class="roadmap-badge">SIN ENLACE · ROADMAP / FORMACIÓN</span>'}</div>`,
  };
  openWindow(id);
}
