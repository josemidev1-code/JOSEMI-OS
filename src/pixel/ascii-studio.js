// src/pixel/ascii-studio.js: fuente de JOSEMI-OS.
q(".saver-exit").textContent = "Pulsa Escape o haz clic para volver ↵";
const studioBind = Apps.screensaver.bind;
Apps.screensaver.bind = (body, win) => {
  studioBind(body, win);
  let effect = state.bootEffect;
  body.addEventListener("click", (e) => {
    if (e.target.closest("[data-effect]"))
      effect = e.target.closest("[data-effect]").dataset.effect;
  });
  const timer = setInterval(() => {
    if (!state.motion && !document.hidden && !win.classList.contains("minimized"))
      q(`[data-effect="${effect}"]`, body)?.click();
  }, 7200);
  const cleanup = win.__cleanup;
  win.__cleanup = () => {
    clearInterval(timer);
    cleanup?.();
  };
};
