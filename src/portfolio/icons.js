// src/portfolio/icons.js: fuente de JOSEMI-OS.
// Los iconos de las aplicaciones salen de los mapas de src/core/pixel-icons.js.
const PIXEL_ICON_IDS = {
  readme: "readme",
  about: "about",
  projects: "projects",
  skills: "skills",
  terminal: "console",
  contact: "contact",
  arcade: "arcade",
  settings: "settings",
  system: "system",
  trash: "trash",
  easter: "easter",
  screensaver: "screensaver",
  pacman: "pacman",
  tetris: "tetris",
};
const pixelIcon = (id) => mapIcon(PIXEL_ICON_IDS[id] || id);

Object.keys(PIXEL_ICON_IDS).forEach((id) => {
  if (Apps[id]) Apps[id].icon = pixelIcon(id);
});
if (Apps.welcome) Apps.welcome.icon = pixelIcon("readme");

// JOSEMI Music deja de ser app/icono.
if (Apps.music) delete Apps.music;
currentUser.apps = (currentUser.apps || []).filter((id) => id !== "music");
