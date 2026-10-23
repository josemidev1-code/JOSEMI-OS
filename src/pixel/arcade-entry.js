// src/pixel/arcade-entry.js: fuente de JOSEMI-OS.
const cabinet = () =>
  `<svg class="coin-machine" viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><defs><pattern id="machine-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#1d5262" stroke-width="1"/></pattern></defs><path d="M27 5H151V19H161V116L173 148V232H7V148L19 116V19H27Z" fill="#0b1526"/><path d="M27 9H147V19H155V116L167 148V226H13V148L25 116V19H27Z" fill="#604982"/><path d="M27 11H147V39H27Z" fill="#d786a8"/><path d="M32 15H142V35H32Z" fill="#211a36"/><text x="87" y="29" text-anchor="middle" fill="#ffde91" font-family="JetBrains Mono,monospace" font-size="15">JOSEMI ARCADE</text><path d="M32 47H148V122H32Z" fill="#0c1122"/><path d="M38 53H142V113H38Z" fill="#102a3c"/><path d="M38 53H142V113H38Z" fill="url(#machine-grid)"/><g class="machine-stars" fill="#ffe4a4"><path d="M58 62H61V65H58ZM120 68H123V71H120ZM101 57H104V60H101Z"/><path d="M75 80H109V84H75ZM82 73H102V92H82Z" fill="#8ee5bd"/><path d="M82 84H89V88H82ZM96 84H102V88H96Z" fill="#102a3c"/></g><path d="M25 126H155L165 151H15Z" fill="#8c6ba7"/><path d="M32 138H52V143H32Z" fill="#1b1b36"/><path d="M40 126H44V140H40Z" fill="#d6e1dc"/><path d="M37 123H47V129H37Z" fill="#f38da6"/><path d="M112 136H120V143H112Z" fill="#84dcce"/><path d="M128 136H136V143H128Z" fill="#f1c674"/><path d="M21 157H159V219H21Z" fill="#392a55"/><path d="M26 161H72V213H26Z" fill="#46315b"/><path d="M90 170H146V204H90Z" fill="#1a2035"/><path d="M99 179H137V194H99Z" fill="#5c5b74"/><path d="M104 184H132V189H104Z" fill="#0a1520"/><path d="M30 219H52V225H30ZM124 219H146V225H124Z" fill="#a877a2"/><path d="M16 227H166V233H16Z" fill="#161a2c"/></svg>`;
const gameIds = ["tetris", "pacman", "minesweeper"];
let arcadeReady = false;
const launchWindow = openWindow;
openWindow = function (id, ...args) {
  return launchWindow(gameIds.includes(id) && !arcadeReady ? "arcade" : id, ...args);
};
window.openWindow = openWindow;
const baseArcadeRender = Apps.arcade.render,
  baseArcadeBind = Apps.arcade.bind;
Apps.arcade.render = () =>
  `<section class="arcade-entry"><div class="arcade-entry-heading"><span class="card-kicker">JOSEMI / ARCADE</span><h2>La próxima partida empieza aquí.</h2><p>Arrastra la moneda hasta la ranura de la máquina.</p></div><div class="arcade-machine-stage">${cabinet()}<div class="coin-target" aria-label="Ranura para la moneda"></div><div class="arcade-floor"></div></div><button class="arcade-coin" aria-label="Insertar moneda">${art.coin}</button><p class="coin-instruction" role="status">ARRASTRA LA MONEDA · O PULSA ENTER</p><button class="btn coin-accessible">INSERTAR MONEDA</button></section>`;
Apps.arcade.bind = (body, win) => {
  const root = q(".arcade-entry", body),
    coin = q(".arcade-coin", root),
    slot = q(".coin-target", root),
    status = q('[role="status"]', root);
  let entered = false,
    drag = null,
    timer = 0,
    justDragged = false;
  function enter() {
    if (entered) return;
    entered = true;
    root.classList.add("coin-inserted");
    status.textContent = "CRÉDITO ACEPTADO · PREPARANDO LOS JUEGOS";
    if (state.sound) beep();
    timer = setTimeout(
      () => {
        if (!win.isConnected) return;
        arcadeReady = true;
        body.innerHTML = baseArcadeRender();
        qa("[data-game]", body).forEach((b) => {
          q(".game-card__number", b).innerHTML = Apps[b.dataset.game].icon;
        });
        baseArcadeBind?.(body, win);
        body.classList.add("arcade-revealed");
      },
      state.motion ? 0 : 1100,
    );
  }
  coin.addEventListener("pointerdown", (e) => {
    if (entered) return;
    e.preventDefault();
    const r = coin.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    coin.setPointerCapture(e.pointerId);
    coin.classList.add("dragging");
  });
  coin.addEventListener("pointermove", (e) => {
    if (!drag) return;
    coin.style.transform = `translate(${e.clientX - drag.x}px,${e.clientY - drag.y}px)`;
    const s = slot.getBoundingClientRect();
    root.classList.toggle(
      "coin-over",
      e.clientX > s.left - 28 &&
        e.clientX < s.right + 28 &&
        e.clientY > s.top - 28 &&
        e.clientY < s.bottom + 28,
    );
  });
  coin.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10;
    drag = null;
    coin.classList.remove("dragging");
    const s = slot.getBoundingClientRect();
    if (
      e.clientX > s.left - 28 &&
      e.clientX < s.right + 28 &&
      e.clientY > s.top - 28 &&
      e.clientY < s.bottom + 28
    )
      enter();
    else {
      coin.style.transform = "";
      root.classList.remove("coin-over");
      if (moved) status.textContent = "ACÉRCALA A LA RANURA ILUMINADA";
    }
    justDragged = moved;
  });
  coin.addEventListener("pointercancel", () => {
    drag = null;
    coin.style.transform = "";
    coin.classList.remove("dragging");
    root.classList.remove("coin-over");
  });
  coin.addEventListener("click", (e) => {
    if (!justDragged || e.detail === 0) enter();
    justDragged = false;
  });
  q(".coin-accessible", root).onclick = enter;
  win.__cleanup = () => clearTimeout(timer);
};
