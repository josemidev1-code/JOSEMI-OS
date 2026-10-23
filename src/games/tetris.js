// src/games/tetris.js: fuente de JOSEMI-OS.
const T_COLS = 10,
  T_ROWS = 22,
  T_HIDDEN = 2,
  T_CELL = 20,
  DAS = 0.16,
  ARR = 0.035,
  LOCK_DELAY = 0.5,
  MAX_RESETS = 15;
// PIEZAS: cajas de rotación SRS. La I usa 4×4 y el resto 3×3, así la rotación de matriz coincide con la oficial.
const T_SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};
const T_COLORS = {
  I: "#4fd8e8",
  O: "#f2d055",
  T: "#b07ce8",
  S: "#6fd479",
  Z: "#ef6a6a",
  J: "#5b8cf0",
  L: "#f0a050",
  X: "#56605b",
};
// Mezcla un color con blanco (+) o negro (−) para dar volumen a cada bloque.
const shade = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16),
    target = amount > 0 ? 255 : 0,
    k = Math.abs(amount),
    mix = (c) => Math.round(c + (target - c) * k);
  return `rgb(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
};
const T_PALETTE = Object.fromEntries(
  Object.entries(T_COLORS).map(([id, c]) => [
    id,
    { base: c, light: shade(c, 0.4), dark: shade(c, -0.3), edge: shade(c, -0.6) },
  ]),
);
// SRS: pruebas de desplazamiento («wall kicks») con el eje y hacia arriba, como en la guía oficial.
const KICKS = {
  "0>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "1>0": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "1>2": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "2>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "2>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  "3>2": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "3>0": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "0>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};
const KICKS_I = {
  "0>1": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "1>0": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "1>2": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  "2>1": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "2>3": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "3>2": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "3>0": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "0>3": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};
const rotateCW = (m) => m[0].map((_, i) => m.map((row) => row[i]).reverse());
const rotateCCW = (m) => m[0].map((_, i) => m.map((row) => row[row.length - 1 - i]));
const TETRIS_MODES = {
  marathon: {
    label: "MARATÓN",
    hint: "Partida infinita: cada 10 líneas subes de nivel y la caída se acelera.",
  },
  sprint: { label: "SPRINT 40", hint: "Limpia 40 líneas en el menor tiempo posible." },
  ultra: { label: "ULTRA 2:00", hint: "Consigue la mayor puntuación posible en dos minutos." },
};
const T_SFX = {
  move: () => tone(220, 0.025, { volume: 0.015 }),
  rotate: () => tone(520, 0.035, { volume: 0.02, type: "triangle" }),
  lock: () => tone(120, 0.07, { type: "triangle", volume: 0.07 }),
  drop: () => tone(200, 0.12, { type: "triangle", volume: 0.08, slide: -150 }),
  hold: () => tone(330, 0.07, { type: "triangle", volume: 0.04, slide: 220 }),
  clear: (n) => melody([523, 659, 784, 1046].slice(0, n), 0.06, { volume: 0.035 }),
  tetris: () => melody([523, 659, 784, 1046, 1318], 0.055, { volume: 0.04 }),
  tspin: () => melody([392, 587, 784], 0.07, { volume: 0.04, type: "triangle" }),
  level: () => melody([659, 784, 988, 1318], 0.08, { volume: 0.035 }),
  count: (n) => tone(n ? 440 : 880, 0.12, { volume: 0.04 }),
  over: () => melody([392, 330, 262, 196], 0.16, { volume: 0.04, type: "triangle" }),
  win: () => melody([523, 659, 784, 1046, 0, 1046, 1318], 0.09, { volume: 0.04 }),
};

Apps.tetris.size = [700, 800];
Apps.tetris.render = () => `
    <div class="game jg jg-tetris">
      <div class="jg-top">
        <div class="jg-modes" role="group" aria-label="Modo de juego">${Object.entries(TETRIS_MODES)
          .map(
            ([id, m]) =>
              `<button type="button" class="jg-chip" data-mode="${id}" aria-pressed="false">${m.label}</button>`,
          )
          .join("")}</div>
        <div class="jg-actions">
          <button type="button" class="btn btn--accent" data-act="start">JUGAR</button>
          <button type="button" class="btn" data-act="pause" disabled>PAUSA</button>
          <button type="button" class="btn" data-act="sound" aria-pressed="true">♪ SONIDO</button>
        </div>
      </div>
      <canvas class="jg-canvas jg-tetris-canvas" aria-label="Tetris. Flechas para mover, arriba para girar, espacio para soltar, C para guardar."></canvas>
      <p class="jg-hint" aria-live="polite"></p>
      <div class="jg-pad" aria-label="Controles táctiles">
        <button type="button" class="btn" data-pad="left" aria-label="Izquierda">←</button>
        <button type="button" class="btn" data-pad="soft" aria-label="Bajar">↓</button>
        <button type="button" class="btn" data-pad="right" aria-label="Derecha">→</button>
        <button type="button" class="btn" data-pad="ccw" aria-label="Girar a la izquierda">⟲</button>
        <button type="button" class="btn" data-pad="cw" aria-label="Girar a la derecha">⟳</button>
        <button type="button" class="btn" data-pad="hard" aria-label="Caída rápida">⤓</button>
        <button type="button" class="btn" data-pad="hold" aria-label="Guardar pieza">HOLD</button>
      </div>
      <p class="game-help">← → mover · ↓ bajar · ↑/X girar · Z girar al revés · ESPACIO caída · C/SHIFT guardar · P pausa · En móvil: desliza para mover, toca para girar, desliza hacia abajo para soltar y hacia arriba para guardar.</p>
    </div>`;

Apps.tetris.bind = function (body, win) {
  const canvas = body.querySelector(".jg-tetris-canvas"),
    W = 420,
    H = 440,
    BX = 110,
    BY = 20,
    BW = T_COLS * T_CELL,
    BH = (T_ROWS - T_HIDDEN) * T_CELL,
    ctx = setupCanvas(canvas, W, H),
    startBtn = body.querySelector('[data-act="start"]'),
    pauseBtn = body.querySelector('[data-act="pause"]'),
    hintEl = body.querySelector(".jg-hint");
  let mode = TETRIS_MODES[read("josemi-tetris-mode")] ? read("josemi-tetris-mode") : "marathon",
    g = null,
    paused = false;
  const held = new Set();
  const records = () => read("josemi-tetris-records", {});
  const recordText = () => {
    const r = records()[mode];
    return mode === "sprint" ? (r ? clock(r) : "--") : String(r || 0);
  };

  function selectMode(id) {
    mode = id;
    write("josemi-tetris-mode", id);
    body
      .querySelectorAll("[data-mode]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === id)));
    hintEl.textContent = TETRIS_MODES[id].hint;
  }

  /* --- Estado de la partida --- */
  function newGame() {
    g = {
      board: Array.from({ length: T_ROWS }, () => Array(T_COLS).fill(null)),
      bag: [],
      queue: [],
      piece: null,
      hold: null,
      canHold: true,
      score: 0,
      lines: 0,
      level: 1,
      time: 0,
      pieces: 0,
      combo: -1,
      maxCombo: 0,
      b2b: false,
      phase: "countdown",
      phaseTime: 0,
      clearing: [],
      gravityTimer: 0,
      lockTimer: 0,
      lockResets: 0,
      lowest: 0,
      lastAction: "",
      lastKick: 0,
      soft: false,
      dasDir: 0,
      dasTimer: 0,
      arrTimer: 0,
      texts: [],
      particles: [],
      shake: 0,
      newRecord: false,
      countdownShown: -1,
    };
    if (held.has("left")) g.dasDir = -1;
    if (held.has("right")) g.dasDir = 1;
    fillQueue();
  }
  function fillQueue() {
    while (g.queue.length < 6) {
      if (!g.bag.length) g.bag = shuffle(Object.keys(T_SHAPES));
      g.queue.push(g.bag.pop());
    }
  }
  const makePiece = (type) => ({
    type,
    shape: T_SHAPES[type].map((r) => r.slice()),
    rot: 0,
    x: type === "O" ? 4 : 3,
    y: 0,
  });
  function collide(p, dx = 0, dy = 0, shape = p.shape) {
    for (let y = 0; y < shape.length; y++)
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const nx = p.x + x + dx,
          ny = p.y + y + dy;
        if (nx < 0 || nx >= T_COLS || ny >= T_ROWS) return true;
        if (ny >= 0 && g.board[ny][nx]) return true;
      }
    return false;
  }
  const playing = () => g && g.phase === "play" && g.piece && !paused;
  const gravity = () => Math.pow(0.8 - (g.level - 1) * 0.007, g.level - 1);

  function spawn(type) {
    g.piece = makePiece(type || g.queue.shift());
    fillQueue();
    g.lockTimer = 0;
    g.lockResets = 0;
    g.gravityTimer = 0;
    g.lastAction = "spawn";
    if (collide(g.piece)) return gameOver();
    if (!collide(g.piece, 0, 1)) g.piece.y++;
    g.lowest = g.piece.y;
  }
  // Mover o girar en el suelo reinicia el retardo de bloqueo, como máximo 15 veces por pieza.
  function afterMove(kind) {
    g.lastAction = kind;
    if (g.lockTimer > 0 && g.lockResets < MAX_RESETS) {
      g.lockTimer = 0;
      g.lockResets++;
    }
  }
  function shift(dx) {
    if (!playing() || collide(g.piece, dx, 0)) return false;
    g.piece.x += dx;
    afterMove("move");
    T_SFX.move();
    return true;
  }
  function rotate(dir) {
    if (!playing() || g.piece.type === "O") return;
    const p = g.piece,
      to = (p.rot + dir + 4) % 4,
      shape = dir > 0 ? rotateCW(p.shape) : rotateCCW(p.shape),
      kicks = (p.type === "I" ? KICKS_I : KICKS)[`${p.rot}>${to}`];
    for (let i = 0; i < kicks.length; i++) {
      const [kx, ky] = kicks[i];
      if (collide(p, kx, -ky, shape)) continue;
      p.x += kx;
      p.y -= ky;
      p.shape = shape;
      p.rot = to;
      g.lastKick = i;
      if (p.y > g.lowest) {
        g.lowest = p.y;
        g.lockResets = 0;
      }
      afterMove("rotate");
      T_SFX.rotate();
      return;
    }
  }
  function hardDrop() {
    if (!playing()) return;
    const p = g.piece;
    let n = 0;
    while (!collide(p, 0, 1)) {
      p.y++;
      n++;
    }
    if (n) g.lastAction = "drop";
    g.score += n * 2;
    // Estela: chispas en las columnas que ocupa la pieza.
    p.shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (!v || p.y + y < T_HIDDEN) return;
        for (let i = 0; i < 2; i++)
          g.particles.push({
            x: BX + (p.x + x) * T_CELL + Math.random() * T_CELL,
            y: BY + (p.y + y - T_HIDDEN) * T_CELL,
            vx: (Math.random() - 0.5) * 30,
            vy: -40 - Math.random() * 80,
            life: 0.35,
            color: T_COLORS[p.type],
          });
      }),
    );
    g.shake = Math.min(4, 1 + n / 6);
    T_SFX.drop();
    lock();
  }
  function hold() {
    if (!playing() || !g.canHold) return;
    const type = g.piece.type;
    spawn(g.hold || undefined);
    g.hold = type;
    g.canHold = false;
    T_SFX.hold();
  }
  // T-SPIN: la última acción fue un giro y al menos tres esquinas del cuadro 3×3 están ocupadas.
  function tSpin(p) {
    if (p.type !== "T" || g.lastAction !== "rotate") return null;
    const filled = (x, y) => x < 0 || x >= T_COLS || y >= T_ROWS || (y >= 0 && !!g.board[y][x]);
    const corners = [
      filled(p.x, p.y),
      filled(p.x + 2, p.y),
      filled(p.x + 2, p.y + 2),
      filled(p.x, p.y + 2),
    ];
    if (corners.filter(Boolean).length < 3) return null;
    const [a, b] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ][p.rot];
    return (corners[a] && corners[b]) || g.lastKick === 4 ? "full" : "mini";
  }
  function lock() {
    const p = g.piece;
    let hidden = true;
    p.shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (!v) return;
        const by = p.y + y;
        if (by >= 0) g.board[by][p.x + x] = p.type;
        if (by >= T_HIDDEN) hidden = false;
      }),
    );
    g.pieces++;
    g.piece = null;
    g.canHold = true;
    const spin = tSpin(p),
      full = [];
    for (let y = 0; y < T_ROWS; y++) if (g.board[y].every(Boolean)) full.push(y);
    award(full, spin);
    if (hidden && !full.length) return gameOver();
    if (full.length) {
      g.phase = "clear";
      g.phaseTime = 0;
      g.clearing = full;
      full.forEach((y) =>
        g.board[y].forEach((type, x) => {
          for (let i = 0; i < 3; i++)
            g.particles.push({
              x: BX + x * T_CELL + T_CELL / 2,
              y: BY + (y - T_HIDDEN) * T_CELL + T_CELL / 2,
              vx: (Math.random() - 0.5) * 220,
              vy: -60 - Math.random() * 160,
              life: 0.5 + Math.random() * 0.4,
              color: T_COLORS[type],
            });
        }),
      );
    } else {
      T_SFX.lock();
      spawn();
    }
  }
  function popup(text, color = "#e9f5ee", size = 26) {
    g.texts.push({ text, color, size, life: 1.3, y: BY + 150 + g.texts.length * 30 });
  }
  // PUNTUACIÓN: tabla de la guía moderna con back-to-back, combos y perfect clear.
  function award(full, spin) {
    const n = full.length;
    let points = 0,
      name = "",
      difficult = false;
    if (spin) {
      points = (spin === "mini" ? [100, 200, 400, 400] : [400, 800, 1200, 1600])[n];
      name = (spin === "mini" ? "T-SPIN MINI" : "T-SPIN") + ["", " SIMPLE", " DOBLE", " TRIPLE"][n];
      difficult = n > 0;
    } else if (n) {
      points = [0, 100, 300, 500, 800][n];
      name = ["", "", "DOBLE", "TRIPLE", "¡TETRIS!"][n];
      difficult = n === 4;
    }
    if (n) {
      if (difficult && g.b2b) {
        points *= 1.5;
        name = "B2B " + name;
      }
      g.b2b = difficult;
      g.combo++;
      g.maxCombo = Math.max(g.maxCombo, g.combo);
      points += 50 * Math.max(0, g.combo);
      const rest = g.board.every((row, y) => full.includes(y) || row.every((c) => !c));
      if (rest) points += [0, 800, 1200, 1800, 2000][n];
      if (name)
        popup(name, spin ? "#d4a5ff" : n === 4 ? "#4fd8e8" : "#e9f5ee", n === 4 || spin ? 30 : 24);
      if (g.combo > 0) popup(`COMBO ×${g.combo}`, "#f2d055", 20);
      if (rest) popup("¡PERFECT CLEAR!", "#6fd479", 26);
      if (spin) T_SFX.tspin();
      else if (n === 4) T_SFX.tetris();
      else T_SFX.clear(n);
      if (n === 4 || spin) g.shake = 6;
    } else {
      g.combo = -1;
      if (spin) {
        popup(name, "#d4a5ff", 22);
        T_SFX.tspin();
      }
    }
    g.score += Math.round(points * g.level);
    g.lines += n;
    if (mode === "marathon") {
      const level = Math.min(20, 1 + Math.floor(g.lines / 10));
      if (level > g.level) {
        g.level = level;
        popup(`NIVEL ${level}`, "#6fd479", 28);
        T_SFX.level();
      }
    }
  }
  function finishClear() {
    for (const y of g.clearing) {
      g.board.splice(y, 1);
      g.board.unshift(Array(T_COLS).fill(null));
    }
    g.clearing = [];
    g.phase = "play";
    if (mode === "sprint" && g.lines >= 40) return finish();
    spawn();
  }

  /* --- Final, récords y pausa --- */
  function saveRecord() {
    const r = records();
    if (mode === "sprint") {
      if (g.phase === "done" && (!r.sprint || g.time < r.sprint)) {
        r.sprint = Math.round(g.time);
        g.newRecord = true;
      }
    } else {
      recordScore("tetris", g.score);
      if (g.score > (r[mode] || 0)) {
        r[mode] = g.score;
        g.newRecord = g.score > 0;
      }
    }
    write("josemi-tetris-records", r);
  }
  function gameOver() {
    g.piece = null;
    g.phase = "over";
    g.phaseTime = 0;
    saveRecord();
    T_SFX.over();
    syncButtons();
  }
  function finish() {
    g.piece = null;
    g.phase = "done";
    g.phaseTime = 0;
    saveRecord();
    T_SFX.win();
    syncButtons();
  }
  const running = () => g && !["over", "done"].includes(g.phase);
  function syncButtons() {
    pauseBtn.disabled = !running();
    pauseBtn.textContent = paused ? "CONTINUAR" : "PAUSA";
    startBtn.textContent = running() ? "REINICIAR" : "JUGAR";
  }
  function start() {
    if (running() && mode !== "sprint" && g.phase !== "countdown") recordScore("tetris", g.score);
    paused = false;
    newGame();
    syncButtons();
    focusGame(win);
  }
  function togglePause(force) {
    if (!running()) return;
    paused = force ?? !paused;
    if (paused) g.soft = false;
    syncButtons();
  }

  /* --- Bucle --- */
  function update(dt) {
    if (!g) return;
    g.particles = g.particles.filter((p) => (p.life -= dt) > 0);
    g.particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
    });
    g.texts = g.texts.filter((t) => (t.life -= dt) > 0);
    g.texts.forEach((t) => (t.y -= 16 * dt));
    g.shake = Math.max(0, g.shake - dt * 24);
    if (paused) return;
    g.phaseTime += dt;
    if (g.phase === "countdown") {
      const n = 2 - Math.floor(g.phaseTime / 0.6);
      if (n !== g.countdownShown && n >= 0) {
        g.countdownShown = n;
        T_SFX.count(n);
      }
      if (g.phaseTime >= 1.8) {
        g.phase = "play";
        g.phaseTime = 0;
        T_SFX.count(0);
        spawn();
      }
      return;
    }
    if (!running()) return;
    g.time += dt * 1000;
    if (mode === "ultra" && g.time >= 120000) {
      g.time = 120000;
      return finish();
    }
    if (g.phase === "clear") {
      if (g.phaseTime >= 0.3) finishClear();
      return;
    }
    if (!g.piece) return;
    // DAS/ARR: primera pulsación mueve una vez; si se mantiene, se repite rápido tras una pausa corta.
    if (g.dasDir) {
      g.dasTimer += dt;
      if (g.dasTimer >= DAS) {
        g.arrTimer += dt;
        while (g.arrTimer >= ARR && g.piece) {
          g.arrTimer -= ARR;
          if (!shift(g.dasDir)) {
            g.arrTimer = 0;
            break;
          }
        }
      }
    }
    if (!g.piece) return;
    const interval = g.soft ? Math.min(gravity(), 0.03) : gravity();
    g.gravityTimer += dt;
    while (g.gravityTimer >= interval) {
      g.gravityTimer -= interval;
      if (collide(g.piece, 0, 1)) {
        g.gravityTimer = 0;
        break;
      }
      g.piece.y++;
      g.lastAction = "fall";
      g.lockTimer = 0;
      if (g.soft) g.score++;
      if (g.piece.y > g.lowest) {
        g.lowest = g.piece.y;
        g.lockResets = 0;
      }
    }
    if (collide(g.piece, 0, 1)) {
      g.lockTimer += dt;
      if (g.lockTimer >= LOCK_DELAY || g.lockResets >= MAX_RESETS) lock();
    } else g.lockTimer = 0;
  }

  /* --- Dibujo --- */
  function block(x, y, type, size = T_CELL, alpha = 1) {
    const c = T_PALETTE[type];
    ctx.globalAlpha = alpha;
    ctx.fillStyle = c.edge;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = c.base;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    const b = size > 12 ? 2 : 1;
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 1, y + 1, size - 2, b);
    ctx.fillRect(x + 1, y + 1, b, size - 2);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 1, y + size - 1 - b, size - 2, b);
    ctx.fillRect(x + size - 1 - b, y + 1, b, size - 2);
    if (size > 12) {
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.fillRect(x + 4, y + 4, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
  function frame(x, y, w, h, color = "#2c3d35") {
    ctx.fillStyle = "#0a110e";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x, y, 2, h);
    ctx.fillRect(x + w - 2, y, 2, h);
  }
  function mini(type, x, y, w, h, size, alpha = 1) {
    const cells = [];
    T_SHAPES[type].forEach((row, cy) => row.forEach((v, cx) => v && cells.push([cx, cy])));
    const xs = cells.map((c) => c[0]),
      ys = cells.map((c) => c[1]),
      minX = Math.min(...xs),
      minY = Math.min(...ys),
      pw = (Math.max(...xs) - minX + 1) * size,
      ph = (Math.max(...ys) - minY + 1) * size,
      ox = Math.round(x + (w - pw) / 2),
      oy = Math.round(y + (h - ph) / 2);
    cells.forEach(([cx, cy]) =>
      block(ox + (cx - minX) * size, oy + (cy - minY) * size, type, size, alpha),
    );
  }
  function stat(name, value, y, color = "#e9f5ee") {
    label(ctx, name, 14, y, 15, "#7d9488");
    label(ctx, value, 14, y + 22, 24, color);
  }
  function overlay(lines) {
    ctx.fillStyle = "rgba(3,7,5,.84)";
    ctx.fillRect(BX, BY, BW, BH);
    const total = lines.reduce((sum, l) => sum + (l[1] || 18) + 10, 0);
    let y = BY + BH / 2 - total / 2;
    lines.forEach(([text, size = 18, color = "#dbe9e0"]) => {
      y += size + 10;
      label(ctx, text, BX + BW / 2, y - 4, size, color, "center", true);
    });
  }
  function draw() {
    ctx.fillStyle = "#050807";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (g && g.shake > 0)
      ctx.translate(
        Math.round((Math.random() - 0.5) * g.shake),
        Math.round((Math.random() - 0.5) * g.shake),
      );
    // Columna izquierda: pieza guardada y marcador.
    label(ctx, "GUARDAR", 14, 15, 15, "#7d9488");
    frame(12, 20, 80, 60);
    if (g?.hold) mini(g.hold, 12, 20, 80, 60, 14, g.canHold ? 1 : 0.3);
    const r = recordText();
    if (mode === "sprint") {
      stat("TIEMPO", clock(g?.time || 0), 104);
      stat("LÍNEAS", `${Math.min(40, g?.lines || 0)}/40`, 156);
      stat("PIEZAS", String(g?.pieces || 0), 208);
      stat("RÉCORD", r, 260, "#f2d055");
    } else {
      stat("PUNTOS", String(g?.score || 0), 104);
      stat("NIVEL", String(g?.level || 1), 156);
      stat("LÍNEAS", String(g?.lines || 0), 208);
      stat(
        mode === "ultra" ? "QUEDA" : "TIEMPO",
        clock(mode === "ultra" ? 120000 - (g?.time || 0) : g?.time || 0, 0),
        260,
      );
      stat("RÉCORD", r, 312, "#f2d055");
    }
    if (g?.b2b) label(ctx, "B2B ACTIVO", 14, 386, 16, "#4fd8e8");
    if (g?.combo > 0) label(ctx, `COMBO ×${g.combo}`, 14, 406, 16, "#f2d055");
    // Columna derecha: cola de cinco piezas.
    label(ctx, "SIGUIENTE", 330, 15, 15, "#7d9488");
    frame(328, 20, 80, 60);
    if (g) mini(g.queue[0], 328, 20, 80, 60, 14);
    for (let i = 0; i < 4; i++) {
      frame(328, 88 + i * 48, 80, 42, "#1f2c26");
      if (g) mini(g.queue[i + 1], 328, 88 + i * 48, 80, 42, 10, 0.85);
    }
    label(ctx, TETRIS_MODES[mode].label, 368, 300, 18, "#6fd479", "center");
    if (g && g.phase !== "countdown") {
      label(ctx, "PPS", 330, 340, 15, "#7d9488");
      label(ctx, g.time > 1000 ? (g.pieces / (g.time / 1000)).toFixed(2) : "0.00", 330, 362, 22);
    }
    // Tablero.
    const danger = g && g.board.slice(T_HIDDEN, T_HIDDEN + 4).some((row) => row.some(Boolean));
    ctx.fillStyle = danger && Math.floor(performance.now() / 250) % 2 ? "#a3423a" : "#2c3d35";
    ctx.fillRect(BX - 3, BY - 3, BW + 6, BH + 6);
    ctx.fillStyle = "#070c0a";
    ctx.fillRect(BX, BY, BW, BH);
    ctx.fillStyle = "#13201a";
    for (let x = 1; x < T_COLS; x++)
      for (let y = 1; y < T_ROWS - T_HIDDEN; y++)
        ctx.fillRect(BX + x * T_CELL - 1, BY + y * T_CELL - 1, 2, 2);
    if (g) {
      const grayRows = g.phase === "over" ? Math.floor(g.phaseTime / 0.035) : 0;
      g.board.forEach((row, y) => {
        if (y < T_HIDDEN) return;
        const gray = T_ROWS - y <= grayRows;
        row.forEach(
          (type, x) =>
            type && block(BX + x * T_CELL, BY + (y - T_HIDDEN) * T_CELL, gray ? "X" : type),
        );
      });
      // Animación de líneas: destello que se cierra hacia el centro.
      if (g.phase === "clear") {
        const t = g.phaseTime / 0.3,
          w = Math.round(BW * (1 - t));
        g.clearing.forEach((y) => {
          const py = BY + (y - T_HIDDEN) * T_CELL;
          ctx.fillStyle = "#070c0a";
          ctx.fillRect(BX, py, BW, T_CELL);
          ctx.fillStyle = Math.floor(t * 6) % 2 ? "#ffffff" : "#bff5d0";
          ctx.fillRect(BX + Math.round((BW - w) / 2), py + 2, w, T_CELL - 4);
        });
      }
      const p = g.piece;
      if (p) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(BX, BY, BW, BH);
        ctx.clip();
        let gy = 0;
        while (!collide(p, 0, gy + 1)) gy++;
        p.shape.forEach((row, y) =>
          row.forEach((v, x) => {
            if (!v) return;
            const px = BX + (p.x + x) * T_CELL,
              py = BY + (p.y + gy + y - T_HIDDEN) * T_CELL;
            ctx.fillStyle = T_COLORS[p.type] + "30";
            ctx.fillRect(px + 1, py + 1, T_CELL - 2, T_CELL - 2);
            ctx.fillStyle = T_COLORS[p.type] + "aa";
            ctx.fillRect(px + 1, py + 1, T_CELL - 2, 1);
            ctx.fillRect(px + 1, py + T_CELL - 2, T_CELL - 2, 1);
            ctx.fillRect(px + 1, py + 1, 1, T_CELL - 2);
            ctx.fillRect(px + T_CELL - 2, py + 1, 1, T_CELL - 2);
          }),
        );
        // El bloqueo inminente se nota: la pieza parpadea durante el retardo.
        const fading = g.lockTimer > 0 ? 1 - (g.lockTimer / LOCK_DELAY) * 0.45 : 1;
        p.shape.forEach((row, y) =>
          row.forEach(
            (v, x) =>
              v &&
              block(
                BX + (p.x + x) * T_CELL,
                BY + (p.y + y - T_HIDDEN) * T_CELL,
                p.type,
                T_CELL,
                fading,
              ),
          ),
        );
        ctx.restore();
      }
      g.particles.forEach((s) => {
        ctx.globalAlpha = Math.min(1, s.life * 2);
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 3, 3);
      });
      ctx.globalAlpha = 1;
      g.texts.forEach((t) => {
        ctx.globalAlpha = Math.min(1, t.life * 2.5);
        label(ctx, t.text, BX + BW / 2, Math.round(t.y), t.size, t.color, "center", true);
      });
      ctx.globalAlpha = 1;
    }
    // Pantallas superpuestas.
    if (!g)
      overlay([
        ["TETRIS", 44, "#6fd479"],
        [TETRIS_MODES[mode].label, 22, "#f2d055"],
        ["← → MOVER   ↑ GIRAR", 17],
        ["ESPACIO SOLTAR", 17],
        ["C GUARDAR   P PAUSA", 17],
        ["ENTER O JUGAR", 20, "#4fd8e8"],
      ]);
    else if (g.phase === "countdown")
      overlay([
        [String(3 - Math.floor(g.phaseTime / 0.6)), 72, "#f2d055"],
        ["PREPÁRATE", 20],
      ]);
    else if (paused)
      overlay([
        ["PAUSA", 40, "#f2d055"],
        ["P O ESC PARA SEGUIR", 18],
      ]);
    else if (g.phase === "over" && g.phaseTime > 0.8)
      overlay([
        ["FIN DE PARTIDA", 30, "#ef6a6a"],
        mode === "sprint" ? [`${Math.min(40, g.lines)}/40 LÍNEAS`, 22] : [`${g.score} PUNTOS`, 24],
        [`${g.lines} LÍNEAS · COMBO MÁX ${Math.max(0, g.maxCombo)}`, 16, "#9fb3a7"],
        ...(g.newRecord ? [["¡NUEVO RÉCORD!", 22, "#f2d055"]] : []),
        ["ENTER PARA REPETIR", 18, "#4fd8e8"],
      ]);
    else if (g.phase === "done" && g.phaseTime > 0.4)
      overlay([
        [mode === "sprint" ? "¡SPRINT COMPLETADO!" : "¡TIEMPO!", 28, "#6fd479"],
        mode === "sprint" ? [clock(g.time), 36, "#e9f5ee"] : [`${g.score} PUNTOS`, 30, "#e9f5ee"],
        [
          `${g.pieces} PIEZAS · ${(g.pieces / Math.max(1, g.time / 1000)).toFixed(2)} PPS`,
          16,
          "#9fb3a7",
        ],
        ...(g.newRecord ? [["¡NUEVO RÉCORD!", 22, "#f2d055"]] : []),
        ["ENTER PARA REPETIR", 18, "#4fd8e8"],
      ]);
    ctx.restore();
  }

  /* --- Entrada --- */
  const KEYS = {
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
    arrowdown: "soft",
    s: "soft",
    arrowup: "cw",
    x: "cw",
    w: "cw",
    z: "ccw",
    control: "ccw",
    " ": "hard",
    c: "hold",
    shift: "hold",
    p: "pause",
    escape: "pause",
    enter: "start",
  };
  function press(action, repeat = false) {
    if (action === "start") {
      if (!running()) start();
      return;
    }
    if (action === "pause") {
      if (!repeat) togglePause();
      return;
    }
    if (!g || !running()) {
      if (!repeat && ["hard", "cw"].includes(action) && !g) start();
      return;
    }
    if (paused) return;
    if (action === "left" || action === "right") {
      if (repeat) return;
      held.add(action);
      const dir = action === "left" ? -1 : 1;
      shift(dir);
      g.dasDir = dir;
      g.dasTimer = 0;
      g.arrTimer = 0;
    } else if (action === "soft") g.soft = true;
    else if (repeat) return;
    else if (action === "cw") rotate(1);
    else if (action === "ccw") rotate(-1);
    else if (action === "hard") hardDrop();
    else if (action === "hold") hold();
  }
  function release(action) {
    held.delete(action);
    if (!g) return;
    if (action === "soft") g.soft = false;
    if (action === "left" || action === "right") {
      const dir = action === "left" ? -1 : 1;
      if (g.dasDir !== dir) return;
      const other = action === "left" ? "right" : "left";
      g.dasDir = held.has(other) ? -dir : 0;
      g.dasTimer = 0;
    }
  }
  const keydown = (e) => {
    if (e.target.closest("input, select, textarea, a, [contenteditable='true']")) return;
    if (e.target.closest("button") && !/^(Arrow(Up|Down|Left|Right)|[wasd])$/i.test(e.key)) return;
    const action = KEYS[e.key.toLowerCase()];
    if (!action) return;
    e.preventDefault();
    press(action, e.repeat);
  };
  const keyup = (e) => {
    const action = KEYS[e.key.toLowerCase()];
    if (action) release(action);
  };
  win.tabIndex = 0;
  win.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);

  // GESTOS: arrastrar mueve por casillas, tocar gira, deslizar rápido abajo suelta y arriba guarda.
  let touch = null;
  canvas.addEventListener("pointerdown", (e) => {
    focusGame(win);
    if (e.pointerType === "mouse") {
      if (!running()) start();
      return;
    }
    canvas.setPointerCapture?.(e.pointerId);
    touch = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, dropped: 0 };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!touch || !playing()) return;
    const step = Math.max(14, (canvas.getBoundingClientRect().width / W) * T_CELL),
      dx = e.clientX - touch.x,
      dy = e.clientY - touch.y;
    while (dx - touch.moved * step > step) {
      shift(1);
      touch.moved++;
    }
    while (dx - touch.moved * step < -step) {
      shift(-1);
      touch.moved--;
    }
    while (dy - touch.dropped * step > step * 1.2 && Math.abs(dy) > Math.abs(dx)) {
      if (!collide(g.piece, 0, 1)) {
        g.piece.y++;
        g.score++;
      }
      touch.dropped++;
    }
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!touch) return;
    const dx = e.clientX - touch.x,
      dy = e.clientY - touch.y,
      ms = performance.now() - touch.t,
      moved = touch.moved || touch.dropped;
    touch = null;
    if (!running()) return start();
    if (paused) return togglePause(false);
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && ms < 300) rotate(1);
    else if (dy > 50 && dy / ms > 0.6) hardDrop();
    else if (dy < -50 && !moved) hold();
  });
  canvas.addEventListener("pointercancel", () => (touch = null));
  bindPad(body.querySelector(".jg-pad"), win, (a) => press(a), release);

  body.querySelectorAll("[data-mode]").forEach((b) =>
    b.addEventListener("click", () => {
      if (running() && g.phase !== "countdown") saveRecord();
      g = null;
      paused = false;
      selectMode(b.dataset.mode);
      syncButtons();
      focusGame(win);
    }),
  );
  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", () => {
    togglePause();
    focusGame(win);
  });
  bindSound(body.querySelector('[data-act="sound"]'));

  const stop = gameLoop(win, (dt) => {
    update(dt);
    draw();
  });
  win.__cleanup = () => {
    if (running() && mode !== "sprint") recordScore("tetris", g.score);
    stop();
    win.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
  };
  attachGameLifecycle(win, () => {
    held.clear();
    if (g) {
      g.dasDir = 0;
      g.soft = false;
    }
    if (running() && !paused) togglePause(true);
  });
  selectMode(mode);
  syncButtons();
  requestAnimationFrame(() => focusGame(win));
};
