// src/desktop/toolbar.js: fuente de JOSEMI-OS.
function setupDesktop() {
  const toolbar = document.createElement("div");
  toolbar.className = "shell-tools";
  toolbar.innerHTML =
    '<button id="launch-search" title="Buscar aplicaciones · Ctrl+K">⌕ <span>Buscar</span><kbd>Ctrl K</kbd></button><button id="launch-saver" title="Salvapantallas ASCII">✦</button><button id="launch-settings" title="Ajustes">' +
    osIcon("settings") +
    "</button>";
  $("#desktop-tools").append(toolbar);
  $("#launch-search").onclick = () => togglePalette(true);
  $("#launch-saver").onclick = showScreensaver;
  $("#launch-settings").onclick = () => openWindow("settings");
  const saver = document.createElement("section");
  saver.id = "os-screensaver";
  saver.hidden = true;
  saver.tabIndex = -1;
  saver.setAttribute("role", "dialog");
  saver.setAttribute("aria-modal", "true");
  saver.setAttribute("aria-label", "Salvapantallas de JOSEMI");
  saver.innerHTML =
    '<canvas class="saver-field" aria-hidden="true"></canvas><header class="saver-terminal-head"><span class="saver-command"></span><span class="saver-scene"></span></header><div class="saver-stage"><pre class="saver-art" aria-hidden="true"></pre><div class="saver-subtitle"></div></div><footer class="saver-terminal-foot"><p class="saver-notes"></p><div class="saver-track"><span class="saver-progress"></span></div><div class="saver-meta"><span>JOSEMI-OS / TERMINAL ASCII</span><button class="saver-exit" type="button">Mueve el ratón o pulsa una tecla para volver ↵</button></div></footer>';
  document.body.append(saver);
  $(".saver-exit", saver).onclick = hideScreensaver;
  saver.addEventListener("keydown", (e) => {
    e.preventDefault();
    hideScreensaver();
  });
  saver.addEventListener("pointerdown", hideScreensaver);
  document.addEventListener(
    "pointermove",
    () => {
      lastInput = Date.now();
    },
    { passive: true },
  );
  document.addEventListener("keydown", () => (lastInput = Date.now()));
  document.addEventListener("pointerdown", () => (lastInput = Date.now()), {
    passive: true,
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hideScreensaver();
    lastInput = Date.now();
  });
  idleTimer = setInterval(() => {
    if (
      state.idle &&
      !document.hidden &&
      !$("#desktop").classList.contains("hidden") &&
      saver.hidden &&
      Date.now() - lastInput > state.idle * 1000 &&
      !document.activeElement?.closest(".game") &&
      !$$(".window").some((w) => !w.classList.contains("minimized") && w.querySelector(".game"))
    )
      showScreensaver();
  }, 5000);
  $("#desktop").addEventListener(
    "pointermove",
    (e) => {
      if (state.motion || state.intensity === "calm") return;
      const target = e.target.closest(".icon");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--tilt-x", `${(e.clientY - rect.top - rect.height / 2) / 16}deg`);
      target.style.setProperty("--tilt-y", `${-(e.clientX - rect.left - rect.width / 2) / 16}deg`);
    },
    { passive: true },
  );
  $("#icons").addEventListener("pointerout", (e) => {
    const icon = e.target.closest(".icon");
    if (icon) {
      icon.style.setProperty("--tilt-x", "0deg");
      icon.style.setProperty("--tilt-y", "0deg");
    }
  });
}
