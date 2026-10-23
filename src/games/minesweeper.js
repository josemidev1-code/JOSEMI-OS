// src/games/minesweeper.js: fuente de JOSEMI-OS.
const MS_LEVELS = {
  easy: { label: "FÁCIL", rows: 9, cols: 9, mines: 10 },
  medium: { label: "MEDIO", rows: 16, cols: 16, mines: 40 },
  hard: { label: "DIFÍCIL", rows: 16, cols: 30, mines: 99 },
  custom: { label: "A MEDIDA" },
};
const MS_KEY = "josemi-minesweeper";
const msSVG = (rects) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">${rects
    .map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)
    .join("")}</svg>`;
const MINE = msSVG([
  [7, 1, 2, 14, "#141a17"],
  [1, 7, 14, 2, "#141a17"],
  [4, 4, 8, 8, "#141a17"],
  [3, 5, 10, 6, "#141a17"],
  [5, 3, 6, 10, "#141a17"],
  [3, 3, 2, 2, "#141a17"],
  [11, 3, 2, 2, "#141a17"],
  [3, 11, 2, 2, "#141a17"],
  [11, 11, 2, 2, "#141a17"],
  [5, 5, 3, 3, "#f2f7f4"],
]);
const FLAG = msSVG([
  [5, 2, 2, 10, "#141a17"],
  [7, 2, 5, 2, "#ff4a3d"],
  [7, 4, 6, 2, "#ff4a3d"],
  [7, 6, 4, 2, "#ff4a3d"],
  [7, 8, 2, 1, "#c4251c"],
  [3, 12, 7, 2, "#141a17"],
  [2, 14, 10, 1, "#141a17"],
]);
// CARAS: botón clásico de nueva partida. Contorno, relleno y gesto en píxeles.
function face(kind) {
  const rects = [];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const d = (x - 7.5) ** 2 + (y - 7.5) ** 2;
      if (d <= 56) rects.push([x, y, 1, 1, d > 40 ? "#2a2208" : "#f6d04d"]);
    }
  const ink = "#2a2208",
    eyes = [
      [5, 5, 2, 2, ink],
      [9, 5, 2, 2, ink],
    ],
    smile = [
      [4, 9, 1, 1, ink],
      [5, 10, 1, 1, ink],
      [6, 11, 4, 1, ink],
      [10, 10, 1, 1, ink],
      [11, 9, 1, 1, ink],
    ];
  const features = {
    smile: [...eyes, ...smile],
    wow: [...eyes, [7, 9, 2, 3, ink], [6, 10, 4, 1, ink]],
    cool: [
      [3, 5, 10, 1, ink],
      [4, 5, 3, 3, ink],
      [9, 5, 3, 3, ink],
      [5, 6, 1, 1, "#6aa0ff"],
      [10, 6, 1, 1, "#6aa0ff"],
      ...smile,
    ],
    dead: [
      ...[4, 9].flatMap((x) => [
        [x, 4, 1, 1, ink],
        [x + 2, 4, 1, 1, ink],
        [x + 1, 5, 1, 1, ink],
        [x, 6, 1, 1, ink],
        [x + 2, 6, 1, 1, ink],
      ]),
      [5, 10, 6, 1, ink],
      [4, 11, 1, 1, ink],
      [11, 11, 1, 1, ink],
    ],
  }[kind];
  return msSVG([...rects, ...features]);
}
const MS_SFX = {
  open: () => tone(880, 0.03, { volume: 0.02 }),
  cascade: (n) =>
    melody([523, 659, 784].slice(0, Math.min(3, 1 + Math.floor(n / 10))), 0.04, { volume: 0.025 }),
  flag: () => tone(440, 0.05, { type: "triangle", volume: 0.04, slide: 220 }),
  unflag: () => tone(520, 0.05, { type: "triangle", volume: 0.03, slide: -200 }),
  boom: () => {
    tone(90, 0.6, { type: "sawtooth", volume: 0.06, slide: -60 });
    tone(160, 0.3, { type: "square", volume: 0.03, slide: -120 });
  },
  win: () => melody([523, 659, 784, 1046, 784, 1046, 1318], 0.08, { volume: 0.035 }),
  hint: () => melody([660, 990], 0.07, { volume: 0.03 }),
  no: () => tone(140, 0.08, { volume: 0.03 }),
};
const msData = () => {
  const data = read(MS_KEY, {});
  return data && typeof data === "object" ? data : {};
};
function msBestLabel() {
  const data = msData();
  for (const id of ["medium", "easy", "hard"])
    if (data[id]?.best) return `${clock(data[id].best * 1000, 0)} ${MS_LEVELS[id].label}`;
  return "--";
}
function updateMinesCard() {
  const span = document.querySelector(".game-card--minesweeper .game-card__bottom span");
  if (span) span.textContent = "RÉCORD " + msBestLabel();
}

Apps.minesweeper = {
  title: "Buscaminas",
  icon: pixelSVG([
    [3, 3, 26, 26, "#22302a"],
    [4, 4, 24, 24, "#8aa797"],
    [4, 4, 24, 2, "#cfe3d6"],
    [4, 4, 2, 24, "#cfe3d6"],
    [4, 26, 24, 2, "#4c6457"],
    [26, 4, 2, 24, "#4c6457"],
    [15, 8, 2, 16, "#16201b"],
    [8, 15, 16, 2, "#16201b"],
    [11, 11, 10, 10, "#16201b"],
    [10, 13, 12, 6, "#16201b"],
    [13, 10, 6, 12, "#16201b"],
    [10, 10, 2, 2, "#16201b"],
    [20, 10, 2, 2, "#16201b"],
    [10, 20, 2, 2, "#16201b"],
    [20, 20, 2, 2, "#16201b"],
    [13, 13, 3, 3, "#eef6f0"],
    [21, 4, 2, 8, "#3a2416"],
    [23, 4, 5, 4, "#ff5a48"],
  ]),
  size: [800, 720],
  render: () => `
      <div class="game jg jg-mines">
        <div class="jg-top">
          <div class="jg-modes" role="group" aria-label="Dificultad">${Object.entries(MS_LEVELS)
            .map(
              ([id, l]) =>
                `<button type="button" class="jg-chip" data-level="${id}" aria-pressed="false">${l.label}</button>`,
            )
            .join("")}</div>
          <div class="jg-actions">
            <button type="button" class="btn" data-act="hint">PISTA</button>
            <button type="button" class="btn" data-act="flagmode" aria-pressed="false">⚑ BANDERA</button>
            <button type="button" class="btn" data-act="sound" aria-pressed="true">♪ SONIDO</button>
          </div>
        </div>
        <form class="ms-custom" hidden>
          <label>FILAS<input type="number" name="rows" min="5" max="24" value="12" required></label>
          <label>COLUMNAS<input type="number" name="cols" min="5" max="30" value="20" required></label>
          <label>MINAS<input type="number" name="mines" min="1" max="200" value="45" required></label>
          <button class="btn btn--accent" type="submit">CREAR TABLERO</button>
        </form>
        <div class="ms-frame">
          <div class="ms-bar">
            <output class="ms-led ms-left" aria-label="Minas restantes">010</output>
            <button type="button" class="ms-face" aria-label="Nueva partida">${face("smile")}</button>
            <output class="ms-led ms-time" aria-label="Segundos">000</output>
          </div>
          <div class="ms-scroll">
            <div class="ms-grid" role="grid" aria-label="Tablero de Buscaminas"></div>
            <button type="button" class="ms-paused btn btn--accent" hidden>CONTINUAR</button>
          </div>
        </div>
        <p class="ms-status" role="status"></p>
        <p class="ms-stats"></p>
        <label class="ms-option"><input type="checkbox" class="ms-question"> Usar marcas «?» al poner banderas</label>
        <p class="game-help">Clic: descubrir · Clic derecho: bandera · Clic sobre un número con sus banderas puestas: abre los vecinos · Teclado: flechas, ESPACIO descubrir, F bandera · En móvil: mantén pulsado para poner bandera. El primer clic nunca es una mina.</p>
      </div>`,
  bind(body, win) {
    const grid = body.querySelector(".ms-grid"),
      scroll = body.querySelector(".ms-scroll"),
      faceBtn = body.querySelector(".ms-face"),
      leftEl = body.querySelector(".ms-left"),
      timeEl = body.querySelector(".ms-time"),
      statusEl = body.querySelector(".ms-status"),
      statsEl = body.querySelector(".ms-stats"),
      customForm = body.querySelector(".ms-custom"),
      flagBtn = body.querySelector('[data-act="flagmode"]'),
      hintBtn = body.querySelector('[data-act="hint"]'),
      pausedBtn = body.querySelector(".ms-paused"),
      questionBox = body.querySelector(".ms-question");
    let level = MS_LEVELS[read("josemi-minesweeper-level")]
        ? read("josemi-minesweeper-level")
        : "easy",
      custom = read("josemi-minesweeper-custom", { rows: 12, cols: 20, mines: 45 }),
      cfg,
      cells = [],
      els = [],
      started = false,
      over = false,
      opened = 0,
      elapsed = 0,
      since = 0,
      timer = null,
      paused = false,
      flagMode = false,
      focusIndex = 0,
      hintTimer = null;
    questionBox.checked = read("josemi-minesweeper-question", false) === true;

    const total = () => cfg.rows * cfg.cols;
    const rc = (i) => [Math.floor(i / cfg.cols), i % cfg.cols];
    function neighbors(i) {
      const [r, c] = rc(i),
        list = [];
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nr = r + dr,
            nc = c + dc;
          if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols) list.push(nr * cfg.cols + nc);
        }
      return list;
    }
    const seconds = () => Math.floor((elapsed + (timer ? performance.now() - since : 0)) / 1000);
    const flags = () => cells.filter((c) => c.flag === 1).length;
    const pad3 = (n) =>
      n < 0
        ? "-" + String(Math.min(99, -n)).padStart(2, "0")
        : String(Math.min(999, n)).padStart(3, "0");
    function leds() {
      leftEl.value = leftEl.textContent = pad3(cfg.mines - flags());
      timeEl.value = timeEl.textContent = pad3(seconds());
    }
    function setFace(kind) {
      faceBtn.innerHTML = face(kind);
    }
    function stats() {
      if (level === "custom") {
        statsEl.textContent = `TABLERO A MEDIDA · ${cfg.rows}×${cfg.cols} · ${cfg.mines} MINAS · SIN RÉCORD`;
        return;
      }
      const s = msData()[level] || {};
      statsEl.textContent = `RÉCORD ${s.best ? clock(s.best * 1000, 0) : "--"} · VICTORIAS ${s.won || 0} DE ${s.played || 0} · RACHA ${s.streak || 0} · MEJOR RACHA ${s.bestStreak || 0}`;
    }

    /* --- Tablero --- */
    function newGame() {
      cfg = level === "custom" ? { ...custom } : { ...MS_LEVELS[level] };
      cells = Array.from({ length: total() }, () => ({ mine: false, n: 0, open: false, flag: 0 }));
      started = over = paused = false;
      opened = elapsed = 0;
      stopClock();
      grid.className = "ms-grid";
      grid.style.setProperty("--cols", cfg.cols);
      grid.innerHTML = cells
        .map(
          (_, i) =>
            `<button type="button" class="ms-cell" data-i="${i}" role="gridcell" tabindex="${i ? -1 : 0}"></button>`,
        )
        .join("");
      els = [...grid.children];
      focusIndex = 0;
      els.forEach((_, i) => paint(i));
      pausedBtn.hidden = true;
      scroll.classList.remove("is-paused");
      setFace("smile");
      statusEl.textContent = `${cfg.rows}×${cfg.cols} · ${cfg.mines} minas. Haz clic en cualquier casilla para empezar.`;
      leds();
      stats();
      fit();
    }
    function placeMines(first) {
      const safe = new Set([first, ...neighbors(first)]);
      let pool = cells.map((_, i) => i).filter((i) => !safe.has(i));
      if (pool.length < cfg.mines) pool = cells.map((_, i) => i).filter((i) => i !== first);
      shuffle(pool)
        .slice(0, cfg.mines)
        .forEach((i) => (cells[i].mine = true));
      cells.forEach((c, i) => (c.n = neighbors(i).filter((k) => cells[k].mine).length));
    }
    function paint(i) {
      const c = cells[i],
        el = els[i],
        [r, col] = rc(i);
      let cls = "ms-cell",
        html = "",
        state = "oculta";
      if (c.open && c.mine) {
        cls += " is-open is-mine" + (c.boom ? " is-boom" : "");
        html = MINE;
        state = "mina";
      } else if (c.open) {
        cls += " is-open" + (c.n ? " n" + c.n : "");
        html = c.n ? String(c.n) : "";
        state = c.n ? `${c.n} ${c.n === 1 ? "mina" : "minas"} alrededor` : "vacía";
      } else if (over && c.mine && c.flag !== 1) {
        cls += " is-open is-mine";
        html = MINE;
        state = "mina";
      } else if (c.flag === 1) {
        cls += " is-flag" + (over && !c.mine ? " is-wrong" : "");
        html = FLAG;
        state = over && !c.mine ? "bandera incorrecta" : "bandera";
      } else if (c.flag === 2) {
        cls += " is-question";
        html = "?";
        state = "dudosa";
      }
      if (el.className !== cls) el.className = cls;
      if (el.innerHTML !== html) el.innerHTML = html;
      el.setAttribute("aria-label", `Fila ${r + 1}, columna ${col + 1}: ${state}`);
    }
    // TAMAÑO: las casillas crecen o encogen para caber en la ventana; en móvil el tablero difícil se desplaza.
    function fit() {
      if (!cfg) return;
      const width = body.clientWidth - 64,
        height = Math.max(200, body.clientHeight - 300);
      const size = clamp(Math.floor(Math.min(width / cfg.cols, height / cfg.rows)), 22, 40);
      grid.style.setProperty("--cell", size + "px");
    }

    /* --- Reloj --- */
    function startClock() {
      if (timer) return;
      since = performance.now();
      timer = setInterval(leds, 250);
    }
    function stopClock() {
      if (!timer) return;
      elapsed += performance.now() - since;
      clearInterval(timer);
      timer = null;
    }
    function pause() {
      if (!started || over || paused) return;
      stopClock();
      paused = true;
      scroll.classList.add("is-paused");
      pausedBtn.hidden = false;
      statusEl.textContent = "Partida en pausa. El tablero se oculta para que nadie haga trampas.";
    }
    function resume() {
      if (!paused) return;
      paused = false;
      scroll.classList.remove("is-paused");
      pausedBtn.hidden = true;
      startClock();
      statusEl.textContent = "";
      els[focusIndex]?.focus({ preventScroll: true });
    }

    /* --- Jugadas --- */
    function reveal(i) {
      const c = cells[i];
      if (over || paused || c.open || c.flag === 1) return;
      if (!started) {
        placeMines(i);
        started = true;
        startClock();
        statusEl.textContent = "";
      }
      if (c.mine) {
        c.open = true;
        c.boom = true;
        return lose(i);
      }
      const stack = [i];
      let count = 0;
      while (stack.length) {
        const j = stack.pop(),
          d = cells[j];
        if (d.open || d.flag === 1) continue;
        d.open = true;
        d.flag = 0;
        opened++;
        count++;
        paint(j);
        if (!d.n) for (const k of neighbors(j)) if (!cells[k].open && !cells[k].mine) stack.push(k);
      }
      count > 1 ? MS_SFX.cascade(count) : MS_SFX.open();
      if (opened === total() - cfg.mines) win_();
    }
    // ACORDE: si un número ya tiene sus banderas, abre de una vez el resto de vecinos.
    function chord(i) {
      const c = cells[i];
      if (over || paused || !c.open || !c.n) return;
      const around = neighbors(i);
      if (around.filter((k) => cells[k].flag === 1).length !== c.n) {
        around.forEach(
          (k) => !cells[k].open && !cells[k].flag && els[k].classList.add("is-pressed"),
        );
        setTimeout(() => around.forEach((k) => els[k]?.classList.remove("is-pressed")), 140);
        MS_SFX.no();
        return;
      }
      for (const k of around) {
        if (!cells[k].open && cells[k].flag !== 1) reveal(k);
        if (over) return;
      }
    }
    function toggleFlag(i) {
      const c = cells[i];
      if (over || paused || c.open) return;
      c.flag = c.flag === 1 ? (questionBox.checked ? 2 : 0) : c.flag === 2 ? 0 : 1;
      c.flag === 1 ? MS_SFX.flag() : MS_SFX.unflag();
      paint(i);
      leds();
    }
    function act(i, flag = false) {
      clearHint();
      if (paused) return resume();
      if (cells[i].open) chord(i);
      else if (flag || flagMode) toggleFlag(i);
      else reveal(i);
    }
    function record(won) {
      if (level === "custom") return false;
      const data = msData(),
        s = data[level] || { played: 0, won: 0, streak: 0, bestStreak: 0 };
      s.played++;
      let best = false;
      if (won) {
        s.won++;
        s.streak++;
        s.bestStreak = Math.max(s.bestStreak || 0, s.streak);
        if (!s.best || seconds() < s.best) {
          s.best = seconds();
          best = true;
        }
      } else s.streak = 0;
      data[level] = s;
      write(MS_KEY, data);
      updateMinesCard();
      stats();
      return best;
    }
    function lose(boom) {
      over = true;
      stopClock();
      const [br, bc] = rc(boom);
      cells.forEach((c, i) => {
        if (c.mine || c.flag === 1) {
          const [r, col] = rc(i);
          els[i].style.setProperty("--d", Math.round(Math.hypot(r - br, col - bc) * 45) + "ms");
        }
        paint(i);
      });
      grid.classList.add("is-lost");
      setFace("dead");
      MS_SFX.boom();
      record(false);
      statusEl.textContent = `¡BOOM! Has pisado una mina a los ${seconds()} s. Pulsa la cara para intentarlo de nuevo.`;
    }
    function win_() {
      over = true;
      stopClock();
      cells.forEach((c, i) => {
        if (c.mine) c.flag = 1;
        const [r, col] = rc(i);
        els[i].style.setProperty("--d", (r + col) * 18 + "ms");
        paint(i);
      });
      grid.classList.add("is-won");
      setFace("cool");
      MS_SFX.win();
      leds();
      const best = record(true);
      statusEl.textContent = `¡Tablero despejado en ${clock(seconds() * 1000, 0)}!${best ? " ¡Nuevo récord!" : ""}`;
      if (best) toast("Buscaminas: nuevo récord en " + MS_LEVELS[level].label.toLowerCase());
    }

    /* --- Pistas --- */
    function clearHint() {
      clearTimeout(hintTimer);
      grid.querySelectorAll(".is-hint").forEach((el) => el.classList.remove("is-hint"));
    }
    // Deducción con lo que se ve: un número con todas sus minas localizadas deja libres al resto de vecinos.
    function deduceSafe() {
      const mines = new Set(),
        safe = new Set();
      let changed = true;
      while (changed) {
        changed = false;
        cells.forEach((c, i) => {
          if (!c.open || !c.n) return;
          const hidden = neighbors(i).filter((k) => !cells[k].open),
            knownMines = hidden.filter((k) => mines.has(k)).length,
            unknown = hidden.filter((k) => !mines.has(k) && !safe.has(k));
          if (!unknown.length) return;
          if (knownMines === c.n) unknown.forEach((k) => safe.add(k));
          else if (knownMines + unknown.length === c.n) unknown.forEach((k) => mines.add(k));
          else return;
          changed = true;
        });
      }
      return [...safe].filter((k) => !cells[k].open);
    }
    function hint() {
      clearHint();
      if (over) return;
      if (paused) return resume();
      if (!started) {
        statusEl.textContent =
          "Empieza por cualquier casilla: el primer clic siempre es seguro y abre una zona.";
        return;
      }
      const safe = deduceSafe();
      let i,
        penalty = false;
      if (safe.length) i = safe[Math.floor(Math.random() * safe.length)];
      else {
        const candidates = cells
          .map((c, k) => k)
          .filter((k) => !cells[k].open && !cells[k].mine && cells[k].flag !== 1);
        if (!candidates.length) return;
        i = candidates[Math.floor(Math.random() * candidates.length)];
        penalty = true;
        elapsed += 20000;
      }
      els[i].classList.add("is-hint");
      moveFocus(i);
      MS_SFX.hint();
      hintTimer = setTimeout(clearHint, 3200);
      statusEl.textContent = penalty
        ? "No hay jugada segura deducible: te muestro una casilla libre a cambio de +20 s."
        : "Esta casilla es segura: se deduce de los números que ya ves.";
      leds();
    }

    /* --- Entrada --- */
    function moveFocus(i) {
      els[focusIndex]?.setAttribute("tabindex", "-1");
      focusIndex = i;
      els[i].setAttribute("tabindex", "0");
      els[i].focus({ preventScroll: false });
    }
    let press = null;
    grid.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".ms-cell");
      if (!el || over) return;
      const i = Number(el.dataset.i);
      if (paused) return resume();
      press = { i, type: e.pointerType, button: e.button, x: e.clientX, y: e.clientY, done: false };
      if (e.button === 2) return;
      if (!cells[i].open && !cells[i].flag) el.classList.add("is-pressed");
      setFace("wow");
      if (e.pointerType !== "mouse") {
        press.timer = setTimeout(() => {
          press.done = true;
          el.classList.remove("is-pressed");
          setFace("smile");
          if (cells[i].open) chord(i);
          else toggleFlag(i);
          navigator.vibrate?.(18);
        }, 380);
      }
    });
    grid.addEventListener("pointermove", (e) => {
      if (
        press &&
        press.type !== "mouse" &&
        Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10
      ) {
        clearTimeout(press.timer);
        els[press.i].classList.remove("is-pressed");
        press = null;
        if (!over) setFace("smile");
      }
    });
    const release = (e) => {
      if (!press) return;
      clearTimeout(press.timer);
      els[press.i]?.classList.remove("is-pressed");
      const p = press;
      press = null;
      if (!over) setFace("smile");
      if (p.done || e.type === "pointercancel" || p.button === 2) return;
      const el = e.target.closest?.(".ms-cell") || els[p.i],
        i = Number(el.dataset.i);
      moveFocus(i);
      if (p.button === 1) chord(i);
      else act(i);
    };
    grid.addEventListener("pointerup", release);
    grid.addEventListener("pointercancel", release);
    grid.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const el = e.target.closest(".ms-cell");
      if (!el || (press && press.type !== "mouse")) return;
      clearHint();
      const i = Number(el.dataset.i);
      moveFocus(i);
      cells[i].open ? chord(i) : toggleFlag(i);
    });
    grid.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase(),
        [r, c] = rc(focusIndex),
        moves = { arrowup: [-1, 0], arrowdown: [1, 0], arrowleft: [0, -1], arrowright: [0, 1] };
      if (moves[k]) {
        e.preventDefault();
        const nr = clamp(r + moves[k][0], 0, cfg.rows - 1),
          nc = clamp(c + moves[k][1], 0, cfg.cols - 1);
        moveFocus(nr * cfg.cols + nc);
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        act(focusIndex);
      } else if (k === "f" || k === "m") {
        e.preventDefault();
        act(focusIndex, true);
      }
    });

    function selectLevel(id) {
      level = id;
      write("josemi-minesweeper-level", id);
      body
        .querySelectorAll("[data-level]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.level === id)));
      customForm.hidden = id !== "custom";
      if (id === "custom")
        ["rows", "cols", "mines"].forEach((k) => (customForm.elements[k].value = custom[k]));
      newGame();
    }
    body
      .querySelectorAll("[data-level]")
      .forEach((b) => b.addEventListener("click", () => selectLevel(b.dataset.level)));
    customForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rows = clamp(Math.round(+customForm.elements.rows.value) || 9, 5, 24),
        cols = clamp(Math.round(+customForm.elements.cols.value) || 9, 5, 30),
        mines = clamp(Math.round(+customForm.elements.mines.value) || 10, 1, rows * cols - 9);
      custom = { rows, cols, mines };
      write("josemi-minesweeper-custom", custom);
      ["rows", "cols", "mines"].forEach((k) => (customForm.elements[k].value = custom[k]));
      newGame();
    });
    faceBtn.addEventListener("click", newGame);
    pausedBtn.addEventListener("click", resume);
    hintBtn.addEventListener("click", hint);
    flagBtn.addEventListener("click", () => {
      flagMode = !flagMode;
      flagBtn.setAttribute("aria-pressed", String(flagMode));
      flagBtn.classList.toggle("btn--accent", flagMode);
      statusEl.textContent = flagMode
        ? "Modo bandera: cada toque pone o quita una bandera."
        : "Modo normal: cada toque descubre una casilla.";
    });
    questionBox.addEventListener("change", () =>
      write("josemi-minesweeper-question", questionBox.checked),
    );
    bindSound(body.querySelector('[data-act="sound"]'));

    const observer = new ResizeObserver(fit);
    observer.observe(body);
    win.__cleanup = () => {
      observer.disconnect();
      clearInterval(timer);
      clearTimeout(hintTimer);
    };
    attachGameLifecycle(win, pause);
    selectLevel(level);
  },
};
