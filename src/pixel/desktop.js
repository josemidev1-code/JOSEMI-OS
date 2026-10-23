// src/pixel/desktop.js: fuente de JOSEMI-OS.
const desktopApps = [
  "welcome",
  "readme",
  "about",
  "projects",
  "portfolio",
  "education",
  "skills",
  "terminal",
  "contact",
  "arcade",
  "tetris",
  "pacman",
  "minesweeper",
  "settings",
  "system",
  "easter",
  "screensaver",
  "gallery",
  "notes",
  "calculator",
  "focus",
  "roadmap",
  "launchpad",
  "motivation",
  "trash",
];
desktopApps.forEach((id) => {
  if (!currentUser.apps.includes(id)) currentUser.apps.push(id);
  if (!ICONS.includes(id)) ICONS.push(id);
});
function arrangeIcons() {
  const rows = Math.max(2, Math.floor((innerHeight - 185) / 99));
  q("#icons").style.setProperty("--desktop-rows", rows);
}
const essentialApps = ["about", "projects", "arcade", "notes", "gallery", "contact"];
const originalIcons = buildIcons;
buildIcons = function () {
  const catalog = currentUser.apps;
  try {
    currentUser.apps = essentialApps;
    originalIcons();
  } finally {
    currentUser.apps = catalog;
  }
};
const originalMenu = buildMenu;
buildMenu = function () {
  const catalog = currentUser.apps;
  try {
    currentUser.apps = catalog.filter((id) => !gameIds.includes(id));
    originalMenu();
  } finally {
    currentUser.apps = catalog;
  }
};
arrangeIcons();
window.addEventListener("resize", arrangeIcons);
buildIcons();
buildMenu();
window.refreshPixelDock?.();
