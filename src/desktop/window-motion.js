// src/desktop/window-motion.js: fuente de JOSEMI-OS.
function minimizeWithMotion(win, finish) {
  if (win.classList.contains("minimizing")) return;
  if (state.motion || !win.animate) {
    finish();
    return;
  }
  const dock = $(`.tb-app[data-id="${win.dataset.id}"]`),
    start = win.getBoundingClientRect(),
    end = dock?.getBoundingClientRect();
  if (!end) {
    finish();
    return;
  }
  win.classList.add("minimizing");
  win.__transition = win.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: `translate(${end.x - start.x}px,${end.y - start.y}px) scale(${end.width / start.width},${end.height / start.height})`,
        opacity: 0,
      },
    ],
    {
      duration: state.intensity === "calm" ? 180 : 360,
      easing: "cubic-bezier(.4,0,.2,1)",
      fill: "forwards",
    },
  );
  win.__transition.finished
    .catch(() => {})
    .then(() => {
      finish();
      win.__transition?.cancel();
      win.__transition = null;
      win.classList.remove("minimizing");
    });
}
// MAXIMIZAR: técnica FLIP. Mide antes y después y anima la diferencia para evitar un salto brusco.
function maximizeWithMotion(win) {
  win.__transition?.cancel();
  const before = win.getBoundingClientRect();
  win.classList.toggle("maximized");
  const after = win.getBoundingClientRect();
  if (state.motion || !win.animate) return;
  win.__transition = win.animate(
    [
      {
        transform: `translate(${before.x - after.x}px,${before.y - after.y}px) scale(${before.width / after.width},${before.height / after.height})`,
      },
      { transform: "none" },
    ],
    {
      duration: state.intensity === "calm" ? 180 : 420,
      easing: "cubic-bezier(.16,1,.3,1)",
    },
  );
}
