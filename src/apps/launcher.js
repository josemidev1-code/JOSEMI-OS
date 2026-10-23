// src/apps/launcher.js: fuente de JOSEMI-OS.
const extras = ["gallery", "notes", "calculator", "focus"];
Apps.launchpad = {
  title: "Aplicaciones",
  icon: spriteIcon("launchpad"),
  size: [760, 610],
  render: () =>
    `<section class="pixel-launchpad"><div class="extra-heading"><span class="card-kicker">TODO TU SISTEMA, EN UN LUGAR</span><h2>¿Qué quieres hacer?</h2><p>También puedes buscar cualquier aplicación con Ctrl + K.</p></div><div class="pixel-app-grid">${[
      ...new Set(["welcome", ...currentUser.apps, ...extras]),
    ]
      .filter((id) => Apps[id] && !["trash", "tetris", "pacman", "minesweeper"].includes(id))
      .map(
        (id) =>
          `<button data-extra-open="${id}">${Apps[id].icon}<strong>${escape(Apps[id].title)}</strong></button>`,
      )
      .join("")}</div></section>`,
  bind(body) {
    body.addEventListener("click", (e) => {
      const id = e.target.closest("[data-extra-open]")?.dataset.extraOpen;
      if (id) openWindow(id);
    });
  },
};
[...extras, "launchpad"].forEach((id) => {
  if (!currentUser.apps.includes(id)) currentUser.apps.push(id);
  if (!ICONS.includes(id)) ICONS.push(id);
});
const appsButton = document.createElement("button");
appsButton.textContent = "APPS";
appsButton.onclick = () => openWindow("launchpad");
document.querySelector(".pixel-system-bar nav").prepend(appsButton);

buildIcons();
buildMenu();
