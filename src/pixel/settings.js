// src/pixel/settings.js: fuente de JOSEMI-OS.
const settingsRender = Apps.settings.render;
Apps.settings.render = () =>
  settingsRender()
    .replace(
      "God of War<small>",
      `<span class="wallpaper-preview gow-preview"></span>God of War<small>`,
    )
    .replace("Imagen personalizada", "Imagen oficial · Ragnarök")
    .replace("Animación ASCII", "Efecto de ASCII Studio");
const settingsBind = Apps.settings.bind;
Apps.settings.bind = (body, win) => {
  settingsBind(body, win);
  const effect = q('[data-setting="atmosphere"]', body),
    note = document.createElement("p");
  note.className = "wallpaper-motion-note";
  effect.closest("label").after(note);
  function sync() {
    const own = Object.hasOwn(PIXEL_WALLPAPERS, state.wallpaper) || state.wallpaper === "godOfWar";
    effect.disabled = own;
    effect.value = state.atmosphere;
    note.textContent = own
      ? "Este paisaje usa su propia animación, sin efectos superpuestos. Los efectos ASCII están disponibles con los fondos de color."
      : "Elige un efecto para animar este fondo de color.";
  }
  body.addEventListener("click", (e) => {
    if (e.target.closest("[data-wallpaper]")) sync();
  });
  sync();
};
applyTheme();
save();
syncScene();
