// src/portfolio/wallpaper.js: fuente de JOSEMI-OS.
const previousApplyTheme = applyTheme;
applyTheme = function () {
  if (!state.vault.matrix && state.atmosphere === "matrixBlue") state.atmosphere = "matrix";
  previousApplyTheme();
  const bg = document.querySelector("#bg");
  if (!bg) return;
  const gof = !!state.vault?.gof && state.wallpaper === "godOfWar";
  document.body.classList.toggle("has-god-of-war", gof);
  if (gof) {
    bg.style.background = `linear-gradient(180deg, rgba(0,0,0,.38), rgba(0,0,0,.62)), url("${GOW_URL}") center/cover no-repeat, var(--bg)`;
  }
  const pixel = PIXEL_WALLPAPERS[state.wallpaper];
  document.body.classList.toggle("has-pixel-wallpaper", !!pixel);
  if (pixel) bg.style.background = `url("${pixel.url}") center / cover no-repeat, #08101b`;
};

applyTheme();
buildIcons();
buildMenu();
