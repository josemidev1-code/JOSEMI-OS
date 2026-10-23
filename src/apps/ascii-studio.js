// src/apps/ascii-studio.js: fuente de JOSEMI-OS.
Apps.screensaver = {
  title: "ASCII Studio",
  icon: osIcon("screensaver"),
  size: [780, 560],
  render: () =>
    `<div class="ascii-studio"><span class="card-kicker">JOSEMI-OS / CHARACTER MOTION</span><h2>El texto también se mueve.</h2><pre class="ascii-stage" aria-label="Animación del nombre JOSEMI-OS"></pre><div class="ascii-actions">${Object.entries(
      EFFECTS,
    )
      .filter(([id]) => id !== "random")
      .map(([id, name]) => `<button class="btn" data-effect="${id}">${name}</button>`)
      .join("")}</div><p>Selecciona un efecto. Cada carácter encuentra su sitio.</p></div>`,
  bind(body, win) {
    let animation;
    const play = (effect) => {
      animation?.cancel();
      animation = animateAscii($(".ascii-stage", body), effect, {
        duration: state.intensity === "calm" ? 2200 : 4200,
      });
    };
    $$("[data-effect]", body).forEach((b) => (b.onclick = () => play(b.dataset.effect)));
    const stage = $(".ascii-stage", body);
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(() => fitAsciiText(stage)) : null;
    observer?.observe(stage);
    win.__cleanup = () => {
      animation?.cancel();
      observer?.disconnect();
    };
    play(state.bootEffect);
  },
};
ICONS.push("screensaver");
currentUser.apps.push("screensaver");
