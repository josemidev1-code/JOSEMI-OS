// src/bootstrap/desktop.js: fuente de JOSEMI-OS.
setupDesktop();
setupPalette();
windowObserver.observe($("#desktop"), { childList: true });
new MutationObserver((records) => {
  if (
    records.some(
      (r) =>
        (r.type === "attributes" &&
          (r.target.id === "desktop" || r.target.classList.contains("window"))) ||
        (r.type === "childList" &&
          [...r.addedNodes, ...r.removedNodes].some(
            (n) => n.nodeType === 1 && n.classList.contains("window"),
          )),
    )
  )
    syncAtmosphere();
}).observe($("#desktop"), {
  attributes: true,
  attributeFilter: ["class"],
  childList: true,
  subtree: true,
});
new MutationObserver(syncAtmosphere).observe($("#shutdown"), {
  attributes: true,
  attributeFilter: ["class"],
});
new MutationObserver(syncAtmosphere).observe($("#os-screensaver"), {
  attributes: true,
  attributeFilter: ["hidden"],
});
document.addEventListener("visibilitychange", syncAtmosphere);
window.addEventListener("resize", syncAtmosphere);
window.addEventListener("resize", () => {
  fitBootLogo();
  $$(".boot-logo--hero,.ascii-stage,.saver-art").forEach(fitAsciiText);
});
if (state.experienceVersion !== 5) {
  state.atmosphere = "matrixBlue";
  state.bootEffect = "cinematic";
  state.theme = "night";
  state.accent = THEMES.night.accent;
  state.bg = THEMES.night.bg;
  state.experienceVersion = 5;
}
applyTheme();
save();
buildIcons();
buildMenu();
buildClock();
buildParallax();
buildStart();
buildContext();
buildKonami();
initDirectAccess();
