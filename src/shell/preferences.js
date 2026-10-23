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
