// src/portfolio/icons.js: fuente de JOSEMI-OS.
// Los iconos de las aplicaciones salen de los mapas de src/core/pixel-icons.js.
const PIXEL_ICON_IDS = {
  about: "about",
  projects: "projects",
  terminal: "console",
  contact: "contact",
  arcade: "arcade",
  settings: "settings",
  easter: "easter",
  screensaver: "screensaver",
  pacman: "pacman",
  tetris: "tetris",
};
const pixelIcon = (id) => mapIcon(PIXEL_ICON_IDS[id] || id);

Object.keys(PIXEL_ICON_IDS).forEach((id) => {
  if (Apps[id]) Apps[id].icon = pixelIcon(id);
});
if (Apps.welcome) Apps.welcome.icon = mapIcon("computer");

// JOSEMI Music deja de ser app/icono.
if (Apps.music) delete Apps.music;
currentUser.apps = (currentUser.apps || []).filter((id) => id !== "music");
