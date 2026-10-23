/* JOSEMI ARCADE: Tetris, Pac-Man y Buscaminas.
   Cada juego vive en su ventana. Comparten récords, sonido, bucle de animación y controles táctiles. */
(() => {
  "use strict";

  /* ========================================================= UTILIDADES */
  // ALMACÉN: lee y guarda JSON en localStorage sin romper el juego si el navegador lo bloquea.
  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  // TIEMPO: 83456 ms → «1:23.45». Los segundos enteros sirven para el Buscaminas.
  const clock = (ms, decimals = 2) => {
    const total = Math.max(0, ms) / 1000,
      minutes = Math.floor(total / 60),
      seconds = (total % 60).toFixed(decimals);
    return `${minutes}:${seconds.padStart(decimals ? 3 + decimals : 2, "0")}`;
  };
  const focusGame = (win) => win.focus({ preventScroll: true });

  // SONIDO: osciladores de Web Audio; el arcade tiene su propio interruptor, independiente del sistema.
  const SOUND_KEY = "josemi-arcade-sound";
  const soundOn = () => read(SOUND_KEY, true) !== false;
  let audio = null;
  function tone(freq, duration, { type = "square", volume = 0.04, slide = 0, delay = 0 } = {}) {
    if (!soundOn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const start = audio.currentTime + delay,
        osc = audio.createOscillator(),
        gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), start + duration);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch {}
  }
  const melody = (notes, step = 0.09, options = {}) =>
    notes.forEach((freq, i) => freq && tone(freq, step * 0.9, { ...options, delay: i * step }));

  function bindSound(button) {
    const sync = () => {
      button.textContent = soundOn() ? "♪ SONIDO" : "♪ MUDO";
      button.setAttribute("aria-pressed", String(soundOn()));
    };
    button.addEventListener("click", () => {
      write(SOUND_KEY, !soundOn());
      if (audio) {
        if (soundOn()) audio.resume();
        else audio.suspend();
      }
      sync();
      tone(660, 0.06);
    });
    sync();
  }

  // CANVAS: resolución interna doble para texto nítido; el CSS lo escala sin suavizar.
  function setupCanvas(canvas, width, height, scale = 2) {
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.aspectRatio = `${width} / ${height}`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }
  function label(ctx, str, x, y, size = 16, color = "#dbe9e0", align = "left", shadow = false) {
    ctx.font = `${size}px VT323, monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    if (shadow) {
      ctx.fillStyle = "#020806";
      ctx.fillText(str, x + 2, y + 2);
    }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  // BUCLE: requestAnimationFrame con delta limitado; se detiene al cerrar la ventana.
  function gameLoop(win, step) {
    let raf = 0,
      last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!win.classList.contains("minimized")) step(dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  // BOTONES TÁCTILES: mantener pulsado funciona igual que mantener una tecla.
  function bindPad(pad, win, press, release) {
    const up = (e) => {
      const button = e.target.closest("[data-pad]");
      if (!button || !button.classList.contains("is-down")) return;
      button.classList.remove("is-down");
      release?.(button.dataset.pad);
    };
    pad.addEventListener("pointerdown", (e) => {
      const button = e.target.closest("[data-pad]");
      if (!button) return;
      e.preventDefault();
      focusGame(win);
      button.setPointerCapture?.(e.pointerId);
      button.classList.add("is-down");
      press(button.dataset.pad);
    });
    pad.addEventListener("pointerup", up);
    pad.addEventListener("pointercancel", up);
    pad.addEventListener("lostpointercapture", up);
    pad.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // ICONOS: rejilla de 32 píxeles, igual que el resto del sistema.
  const pixelSVG = (rects, size = 32) =>
    `<svg class="os-icon" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shape-rendering="crispEdges">${rects
      .map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)
      .join("")}</svg>`;

  /* ========================================================= TETRIS */
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
    "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    "1>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    "2>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    "3>2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    "0>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  };
  const KICKS_I = {
    "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    "1>0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    "2>1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    "3>2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    "0>3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  };
  const rotateCW = (m) => m[0].map((_, i) => m.map((row) => row[i]).reverse());
  const rotateCCW = (m) => m[0].map((_, i) => m.map((row) => row[row.length - 1 - i]));
  const TETRIS_MODES = {
    marathon: { label: "MARATÓN", hint: "Partida infinita: cada 10 líneas subes de nivel y la caída se acelera." },
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
          .map(([id, m]) => `<button type="button" class="jg-chip" data-mode="${id}" aria-pressed="false">${m.label}</button>`)
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
      body.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === id)));
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
        if (name) popup(name, spin ? "#d4a5ff" : n === 4 ? "#4fd8e8" : "#e9f5ee", n === 4 || spin ? 30 : 24);
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
      cells.forEach(([cx, cy]) => block(ox + (cx - minX) * size, oy + (cy - minY) * size, type, size, alpha));
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
      if (g && g.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * g.shake), Math.round((Math.random() - 0.5) * g.shake));
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
        stat(mode === "ultra" ? "QUEDA" : "TIEMPO", clock(mode === "ultra" ? 120000 - (g?.time || 0) : g?.time || 0, 0), 260);
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
      for (let x = 1; x < T_COLS; x++) for (let y = 1; y < T_ROWS - T_HIDDEN; y++) ctx.fillRect(BX + x * T_CELL - 1, BY + y * T_CELL - 1, 2, 2);
      if (g) {
        const grayRows = g.phase === "over" ? Math.floor(g.phaseTime / 0.035) : 0;
        g.board.forEach((row, y) => {
          if (y < T_HIDDEN) return;
          const gray = T_ROWS - y <= grayRows;
          row.forEach((type, x) => type && block(BX + x * T_CELL, BY + (y - T_HIDDEN) * T_CELL, gray ? "X" : type));
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
            row.forEach((v, x) => v && block(BX + (p.x + x) * T_CELL, BY + (p.y + y - T_HIDDEN) * T_CELL, p.type, T_CELL, fading)),
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
      else if (g.phase === "countdown") overlay([[String(3 - Math.floor(g.phaseTime / 0.6)), 72, "#f2d055"], ["PREPÁRATE", 20]]);
      else if (paused) overlay([["PAUSA", 40, "#f2d055"], ["P O ESC PARA SEGUIR", 18]]);
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
          [`${g.pieces} PIEZAS · ${(g.pieces / Math.max(1, g.time / 1000)).toFixed(2)} PPS`, 16, "#9fb3a7"],
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

  /* ========================================================= PAC-MAN */
  // LABERINTO PROPIO: # pared, . punto, o energía, - puerta, G casa de fantasmas, P salida de Pac-Man.
  const PAC_MAZE = [
    "#####################",
    "#.........#.........#",
    "#o##.####.#.####.##o#",
    "#...................#",
    "#.##.#.#######.#.##.#",
    "#....#....#....#....#",
    "####.####.#.####.####",
    "####.#         #.####",
    "####.# ###-### #.####",
    "    .  #GGGGG#  .    ",
    "####.# ####### #.####",
    "####.#         #.####",
    "####.# ####### #.####",
    "#.........#.........#",
    "#o##.####.#.####.##o#",
    "#..#......P......#..#",
    "##.#.#.#######.#.#.##",
    "#....#.........#....#",
    "#.######.###.######.#",
    "#...................#",
    "#####################",
  ];
  const PAC_COLS = PAC_MAZE[0].length,
    PAC_ROWS = PAC_MAZE.length,
    PAC_TILE = 16,
    PAC_TUNNEL = 9,
    PAC_DOOR = { x: 10, y: 7 },
    PAC_HOME = { x: 10, y: 15 };
  const PAC_DIRS = {
    up: { x: 0, y: -1 },
    left: { x: -1, y: 0 },
    down: { x: 0, y: 1 },
    right: { x: 1, y: 0 },
  };
  // Orden de desempate clásico: arriba, izquierda, abajo, derecha.
  const PAC_ORDER = [PAC_DIRS.up, PAC_DIRS.left, PAC_DIRS.down, PAC_DIRS.right];
  const PAC_GHOSTS = [
    { id: "blinky", name: "BLINKY", role: "PERSEGUIDOR", color: "#ff4b4b", corner: { x: PAC_COLS - 2, y: -3 }, start: { x: 10, y: 7 }, release: [0, 0] },
    { id: "pinky", name: "PINKY", role: "EMBOSCADA", color: "#ffa3e0", corner: { x: 1, y: -3 }, start: { x: 10, y: 9 }, release: [0, 0.6] },
    { id: "inky", name: "INKY", role: "IMPREDECIBLE", color: "#48e0ff", corner: { x: PAC_COLS - 1, y: PAC_ROWS + 1 }, start: { x: 9, y: 9 }, release: [30, 5] },
    { id: "clyde", name: "CLYDE", role: "DESPISTADO", color: "#ffb347", corner: { x: 0, y: PAC_ROWS + 1 }, start: { x: 11, y: 9 }, release: [60, 10] },
  ];
  const PAC_FRUITS = [
    { name: "CEREZA", points: 100, color: "#ff3b4e" },
    { name: "FRESA", points: 300, color: "#ff5a7a" },
    { name: "NARANJA", points: 500, color: "#ffa024" },
    { name: "MANZANA", points: 700, color: "#e8413c" },
    { name: "UVAS", points: 1000, color: "#a66bff" },
    { name: "MELÓN", points: 2000, color: "#8bd450" },
    { name: "CAMPANA", points: 3000, color: "#ffd84d" },
    { name: "LLAVE", points: 5000, color: "#9ad1d4" },
  ];
  // Alterna dispersión (cada fantasma a su esquina) y persecución.
  const PAC_SCHEDULE = [7, 20, 7, 20, 5, 20, 5, Infinity];
  const GHOST_ROWS = [
    "00001111110000",
    "00111111111100",
    "01111111111110",
    "01111111111110",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
    "11111111111111",
  ];
  const GHOST_FEET = [
    ["11100111100111", "11000011000011"],
    ["11011100111011", "10011100111001"],
  ];
  let wakaFlip = false;
  const P_SFX = {
    waka: () => {
      wakaFlip = !wakaFlip;
      tone(wakaFlip ? 330 : 260, 0.07, { type: "triangle", volume: 0.05, slide: wakaFlip ? -90 : 90 });
    },
    power: () => tone(140, 0.4, { type: "sawtooth", volume: 0.035, slide: 260 }),
    ghost: () => tone(200, 0.35, { volume: 0.04, slide: 1200 }),
    fruit: () => melody([784, 988, 1175, 1568], 0.05, { volume: 0.035 }),
    life: () => melody([1046, 0, 1046, 0, 1046], 0.08, { volume: 0.035 }),
    death: () => tone(700, 1.2, { type: "triangle", volume: 0.05, slide: -620 }),
    start: () => {
      melody([494, 988, 740, 622, 988, 740, 622, 0, 523, 1046, 784, 659, 1046, 784, 659, 0, 494, 988, 740, 622, 988, 740, 622, 587, 622, 659, 659, 698, 740, 784, 988], 0.105, { volume: 0.035 });
      melody([247, 0, 247, 0, 247, 0, 247, 0, 262, 0, 262, 0, 262, 0, 262], 0.21, { type: "triangle", volume: 0.018 });
    },
    clear: () => melody([523, 659, 784, 1046, 784, 1046], 0.08, { volume: 0.035 }),
  };

  Apps.pacman.size = [640, 800];
  Apps.pacman.render = () => `
    <div class="game jg jg-pacman">
      <div class="jg-top">
        <p class="jg-legend">${PAC_GHOSTS.map((g) => `<span style="--ghost:${g.color}">${g.name}</span>`).join("")}</p>
        <div class="jg-actions">
          <button type="button" class="btn btn--accent" data-act="start">JUGAR</button>
          <button type="button" class="btn" data-act="pause" disabled>PAUSA</button>
          <button type="button" class="btn" data-act="sound" aria-pressed="true">♪ SONIDO</button>
        </div>
      </div>
      <canvas class="jg-canvas jg-pac-canvas" aria-label="Pac-Man. Usa las flechas para recorrer el laberinto, come los puntos y evita a los fantasmas."></canvas>
      <div class="jg-pad jg-dpad" aria-label="Cruceta táctil">
        <button type="button" class="btn" data-pad="up" aria-label="Arriba">↑</button>
        <button type="button" class="btn" data-pad="left" aria-label="Izquierda">←</button>
        <button type="button" class="btn" data-pad="down" aria-label="Abajo">↓</button>
        <button type="button" class="btn" data-pad="right" aria-label="Derecha">→</button>
      </div>
      <p class="game-help">Flechas / WASD mover · P pausa · Las bolas grandes asustan a los fantasmas: cómetelos seguidos para 200, 400, 800 y 1600 · Fruta a los 70 y 170 puntos · Vida extra a 10 000 · En móvil, desliza sobre el laberinto.</p>
    </div>`;

  Apps.pacman.bind = function (body, win) {
    const canvas = body.querySelector(".jg-pac-canvas"),
      T = PAC_TILE,
      TOP = 26,
      W = PAC_COLS * T,
      MH = PAC_ROWS * T,
      H = TOP + MH + 26,
      ctx = setupCanvas(canvas, W, H),
      startBtn = body.querySelector('[data-act="start"]'),
      pauseBtn = body.querySelector('[data-act="pause"]');
    let game = null,
      paused = false,
      queued = null,
      attract = 0;
    const wrap = (x) => (x + PAC_COLS) % PAC_COLS;
    const solid = (x, y) => {
      if (y < 0 || y >= PAC_ROWS) return true;
      if (x < 0 || x >= PAC_COLS) return y !== PAC_TUNNEL;
      return "#-G".includes(PAC_MAZE[y][x]);
    };
    const canGo = (x, y, d) => !solid(y === PAC_TUNNEL ? wrap(x + d.x) : x + d.x, y + d.y);
    const pos = (e) =>
      e.free ? { x: e.fx, y: e.fy } : { x: e.x + e.dir.x * e.prog, y: e.y + e.dir.y * e.prog };
    const reverse = (e) => {
      if (!e.dir.x && !e.dir.y) return;
      e.x = wrap(e.x + e.dir.x);
      e.y += e.dir.y;
      e.dir = { x: -e.dir.x, y: -e.dir.y };
      e.prog = 1 - e.prog;
    };

    // CAPA DE PAREDES: se dibuja una vez por color en un lienzo aparte (contorno neón como el arcade).
    function wallLayer(edge, fill) {
      const layer = document.createElement("canvas");
      layer.width = W * 2;
      layer.height = MH * 2;
      const c = layer.getContext("2d");
      c.scale(2, 2);
      const isWall = (x, y) => (x < 0 || x >= PAC_COLS || y < 0 || y >= PAC_ROWS ? y !== PAC_TUNNEL : "#-".includes(PAC_MAZE[y][x]));
      for (let y = 0; y < PAC_ROWS; y++)
        for (let x = 0; x < PAC_COLS; x++) {
          if (PAC_MAZE[y][x] !== "#") continue;
          const px = x * T,
            py = y * T,
            open = { t: !isWall(x, y - 1), b: !isWall(x, y + 1), l: !isWall(x - 1, y), r: !isWall(x + 1, y) };
          c.fillStyle = fill;
          c.fillRect(px, py, T, T);
          c.fillStyle = edge;
          const x0 = open.l ? px + 3 : px,
            x1 = open.r ? px + T - 3 : px + T,
            y0 = open.t ? py + 3 : py,
            y1 = open.b ? py + T - 3 : py + T;
          if (open.t) c.fillRect(x0, py + 3, x1 - x0, 2);
          if (open.b) c.fillRect(x0, py + T - 5, x1 - x0, 2);
          if (open.l) c.fillRect(px + 3, y0, 2, y1 - y0);
          if (open.r) c.fillRect(px + T - 5, y0, 2, y1 - y0);
          // Esquinas interiores: une los contornos de las paredes vecinas.
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
            if (isWall(x + dx, y) && isWall(x, y + dy) && !isWall(x + dx, y + dy)) {
              c.fillRect(dx < 0 ? px : px + T - 5, dy < 0 ? py + 3 : py + T - 5, 5, 2);
              c.fillRect(dx < 0 ? px + 3 : px + T - 5, dy < 0 ? py : py + T - 5, 2, 5);
            }
          });
        }
      c.fillStyle = "#ffb8de";
      c.fillRect(PAC_DOOR.x * T, (PAC_DOOR.y + 1) * T + 6, T, 3);
      return layer;
    }
    const walls = wallLayer("#3d6bff", "#070c26"),
      wallsFlash = wallLayer("#ffffff", "#141a3a");

    /* --- Partida --- */
    function newGame() {
      game = {
        score: 0,
        lives: 3,
        level: 1,
        bonusLife: false,
        phase: "ready",
        phaseTime: 0,
        readyFor: 4,
        popups: [],
        fruits: [],
        newRecord: false,
      };
      buildLevel();
      P_SFX.start();
    }
    function buildLevel() {
      game.pellets = PAC_MAZE.map((row) => [...row].map((c) => (c === "." ? 1 : c === "o" ? 2 : 0)));
      game.left = game.pellets.flat().filter(Boolean).length;
      game.eaten = 0;
      game.fresh = true;
      game.fruit = null;
      resetActors();
    }
    function resetActors() {
      game.pac = { x: PAC_HOME.x, y: PAC_HOME.y, dir: { ...PAC_DIRS.left }, facing: PAC_DIRS.left, prog: 0, anim: 0 };
      queued = null;
      game.ghosts = PAC_GHOSTS.map((spec) => ({
        ...spec,
        x: spec.start.x,
        y: spec.start.y,
        fx: spec.start.x,
        fy: spec.start.y,
        dir: { ...PAC_DIRS.left },
        prog: 0,
        state: spec.id === "blinky" ? "normal" : "house",
        free: spec.id !== "blinky",
        fright: false,
      }));
      game.modeIndex = 0;
      game.modeTime = 0;
      game.frightTime = 0;
      game.ghostCombo = 0;
      game.roundTime = 0;
    }
    const chase = () => game.modeIndex % 2 === 1;
    const elroy = () => game.left <= 20 + game.level * 2;
    const tier = () => (game.level === 1 ? 0 : game.level < 5 ? 1 : 2);
    const BASE = 9;
    function pacSpeed() {
      return BASE * (game.frightTime > 0 ? [0.9, 0.95, 1][tier()] : [0.8, 0.9, 1][tier()]);
    }
    function ghostSpeed(gh) {
      if (gh.state === "eyes") return BASE * 1.7;
      if (gh.y === PAC_TUNNEL && (gh.x < 5 || gh.x > PAC_COLS - 6)) return BASE * [0.4, 0.45, 0.5][tier()];
      if (gh.fright) return BASE * [0.5, 0.55, 0.6][tier()];
      return BASE * ([0.75, 0.85, 0.95][tier()] + (gh.id === "blinky" && elroy() ? 0.06 : 0));
    }
    const frightDuration = () => Math.max(1.2, 6.5 - (game.level - 1) * 0.6);

    function addScore(n) {
      game.score += n;
      if (!game.bonusLife && game.score >= 10000) {
        game.bonusLife = true;
        game.lives++;
        P_SFX.life();
        game.popups.push({ text: "¡VIDA EXTRA!", x: W / 2, y: TOP + 11.5 * T, life: 1.6, color: "#6fd479" });
      }
    }
    function eatAt(x, y) {
      const v = game.pellets[y]?.[x];
      if (!v) return;
      game.pellets[y][x] = 0;
      game.left--;
      game.eaten++;
      if (v === 1) {
        addScore(10);
        P_SFX.waka();
      } else {
        addScore(50);
        frighten();
      }
      if (game.eaten === 70 || game.eaten === 170) game.fruit = { ...PAC_FRUITS[Math.min(game.level - 1, PAC_FRUITS.length - 1)], time: 9.5 };
      if (!game.left) {
        game.phase = "clear";
        game.phaseTime = 0;
        P_SFX.clear();
      }
    }
    function frighten() {
      game.frightTime = frightDuration();
      game.ghostCombo = 0;
      P_SFX.power();
      game.ghosts.forEach((gh) => {
        if (gh.state === "eyes" || gh.state === "entering") return;
        gh.fright = true;
        if (gh.state === "normal") reverse(gh);
      });
    }

    function movePac(dt) {
      const p = game.pac;
      p.anim += dt;
      if (queued && (p.dir.x || p.dir.y) && queued.x === -p.dir.x && queued.y === -p.dir.y) reverse(p);
      if (!p.dir.x && !p.dir.y) {
        if (!queued || !canGo(p.x, p.y, queued)) return;
        p.dir = { ...queued };
      }
      p.facing = p.dir;
      p.prog += pacSpeed() * dt;
      while (p.prog >= 1) {
        p.prog -= 1;
        p.x = wrap(p.x + p.dir.x);
        p.y += p.dir.y;
        eatAt(p.x, p.y);
        if (queued && canGo(p.x, p.y, queued)) p.dir = { ...queued };
        else if (!canGo(p.x, p.y, p.dir)) {
          p.facing = p.dir;
          p.dir = { x: 0, y: 0 };
          p.prog = 0;
          break;
        }
        p.facing = p.dir;
      }
    }
    // OBJETIVOS: cada fantasma calcula una casilla destino distinta. Así se comportan como personajes.
    function target(gh) {
      if (gh.state === "eyes") return PAC_DOOR;
      const p = game.pac,
        d = p.dir.x || p.dir.y ? p.dir : p.facing;
      if (!chase() && !(gh.id === "blinky" && elroy())) return gh.corner;
      if (gh.id === "pinky") return { x: p.x + d.x * 4, y: p.y + d.y * 4 };
      if (gh.id === "inky") {
        const b = game.ghosts[0];
        return { x: (p.x + d.x * 2) * 2 - b.x, y: (p.y + d.y * 2) * 2 - b.y };
      }
      if (gh.id === "clyde" && (gh.x - p.x) ** 2 + (gh.y - p.y) ** 2 < 64) return gh.corner;
      return { x: p.x, y: p.y };
    }
    function chooseDir(gh) {
      const options = PAC_ORDER.filter((d) => !(d.x === -gh.dir.x && d.y === -gh.dir.y) && canGo(gh.x, gh.y, d));
      if (!options.length) return { x: -gh.dir.x, y: -gh.dir.y };
      if (gh.fright && gh.state === "normal") return options[Math.floor(Math.random() * options.length)];
      const t = target(gh);
      let best = options[0],
        bestDist = Infinity;
      for (const d of options) {
        const dist = (gh.x + d.x - t.x) ** 2 + (gh.y + d.y - t.y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = d;
        }
      }
      return best;
    }
    // Movimiento libre (casa, salida y regreso) sigue rutas fijas en coordenadas decimales.
    function approach(gh, tx, ty, step) {
      if (gh.fx !== tx) gh.fx += clamp(tx - gh.fx, -step, step);
      else gh.fy += clamp(ty - gh.fy, -step, step);
      return gh.fx === tx && gh.fy === ty;
    }
    function moveGhost(gh, dt) {
      if (gh.state === "house") {
        gh.fy = gh.start.y + Math.sin(game.roundTime * 7 + gh.start.x) * 0.25;
        const [dots, seconds] = gh.release;
        if ((game.fresh && game.eaten >= dots && game.roundTime >= seconds * 0.3) || game.roundTime >= seconds) gh.state = "leaving";
        return;
      }
      if (gh.state === "leaving") {
        if (approach(gh, PAC_DOOR.x, PAC_DOOR.y, 4 * dt)) {
          Object.assign(gh, { state: "normal", free: false, x: PAC_DOOR.x, y: PAC_DOOR.y, prog: 0, dir: { ...PAC_DIRS.left } });
        }
        return;
      }
      if (gh.state === "entering") {
        if (approach(gh, PAC_DOOR.x, PAC_TUNNEL, 8 * dt)) {
          gh.state = "leaving";
          gh.fright = false;
        }
        return;
      }
      gh.prog += ghostSpeed(gh) * dt;
      while (gh.prog >= 1) {
        gh.prog -= 1;
        gh.x = wrap(gh.x + gh.dir.x);
        gh.y += gh.dir.y;
        if (gh.state === "eyes" && gh.x === PAC_DOOR.x && gh.y === PAC_DOOR.y) {
          Object.assign(gh, { state: "entering", free: true, fx: gh.x, fy: gh.y, prog: 0 });
          return;
        }
        gh.dir = chooseDir(gh);
      }
    }
    function near(a, b) {
      let dx = Math.abs(a.x - b.x);
      dx = Math.min(dx, PAC_COLS - dx);
      return dx < 0.6 && Math.abs(a.y - b.y) < 0.6;
    }
    function collisions() {
      const pp = pos(game.pac);
      for (const gh of game.ghosts) {
        if (gh.state !== "normal" || !near(pp, pos(gh))) continue;
        if (gh.fright) {
          const points = 200 * 2 ** game.ghostCombo;
          game.ghostCombo = Math.min(3, game.ghostCombo + 1);
          addScore(points);
          const gp = pos(gh);
          game.popups.push({ text: String(points), x: gp.x * T + T / 2, y: TOP + gp.y * T + T / 2 + 4, life: 0.9, color: "#48e0ff" });
          Object.assign(gh, { state: "eyes", fright: false });
          game.phase = "eat";
          game.phaseTime = 0;
          game.hidden = gh;
          P_SFX.ghost();
          return;
        }
        game.phase = "dying";
        game.phaseTime = 0;
        P_SFX.death();
        return;
      }
      if (game.fruit && game.pac.x === 10 && game.pac.y === 11 && near(pp, { x: 10, y: 11 })) {
        addScore(game.fruit.points);
        game.popups.push({ text: String(game.fruit.points), x: 10 * T + T / 2, y: TOP + 11 * T + 12, life: 1.4, color: "#ffb8de" });
        game.fruits.push(game.fruit);
        game.fruit = null;
        P_SFX.fruit();
      }
    }

    function update(dt) {
      attract += dt;
      if (!game || paused) return;
      game.phaseTime += dt;
      game.popups = game.popups.filter((p) => (p.life -= dt) > 0);
      game.popups.forEach((p) => (p.y -= 10 * dt));
      if (game.phase === "ready") {
        if (game.phaseTime >= game.readyFor) {
          game.phase = "play";
          game.phaseTime = 0;
        }
        return;
      }
      if (game.phase === "eat") {
        if (game.phaseTime >= 0.6) {
          game.phase = "play";
          game.hidden = null;
        }
        return;
      }
      if (game.phase === "dying") {
        if (game.phaseTime >= 1.7) {
          game.lives--;
          if (game.lives <= 0) return gameOver();
          game.fresh = false;
          resetActors();
          game.phase = "ready";
          game.phaseTime = 0;
          game.readyFor = 1.8;
        }
        return;
      }
      if (game.phase === "clear") {
        if (game.phaseTime >= 2.2) {
          game.level++;
          buildLevel();
          game.phase = "ready";
          game.phaseTime = 0;
          game.readyFor = 2;
        }
        return;
      }
      if (game.phase !== "play") return;
      game.roundTime += dt;
      if (game.frightTime > 0) {
        game.frightTime -= dt;
        if (game.frightTime <= 0) game.ghosts.forEach((gh) => (gh.fright = false));
      } else {
        game.modeTime += dt;
        if (game.modeTime >= PAC_SCHEDULE[game.modeIndex]) {
          game.modeTime = 0;
          game.modeIndex++;
          game.ghosts.forEach((gh) => gh.state === "normal" && reverse(gh));
        }
      }
      if (game.fruit && (game.fruit.time -= dt) <= 0) game.fruit = null;
      movePac(dt);
      if (game.phase !== "play") return;
      collisions();
      game.ghosts.forEach((gh) => moveGhost(gh, dt));
      if (game.phase === "play") collisions();
    }
    function gameOver() {
      game.phase = "over";
      game.phaseTime = 0;
      game.newRecord = game.score > bestScore("pacman") && game.score > 0;
      recordScore("pacman", game.score);
      syncButtons();
    }
    const running = () => game && game.phase !== "over";
    function syncButtons() {
      pauseBtn.disabled = !running();
      pauseBtn.textContent = paused ? "CONTINUAR" : "PAUSA";
      startBtn.textContent = running() ? "REINICIAR" : "JUGAR";
    }
    function start() {
      if (running()) recordScore("pacman", game.score);
      paused = false;
      newGame();
      syncButtons();
      focusGame(win);
    }
    function togglePause(force) {
      if (!running()) return;
      paused = force ?? !paused;
      syncButtons();
    }

    /* --- Dibujo --- */
    function runs(rows, x, y, color) {
      ctx.fillStyle = color;
      rows.forEach((row, sy) => {
        let start = -1;
        for (let sx = 0; sx <= row.length; sx++) {
          if (row[sx] === "1" && start < 0) start = sx;
          else if (row[sx] !== "1" && start >= 0) {
            ctx.fillRect(x + start, y + sy, sx - start, 1);
            start = -1;
          }
        }
      });
    }
    function drawPac(cx, cy, dir, open, radius = 7) {
      cx = Math.round(cx);
      cy = Math.round(cy);
      ctx.fillStyle = "#ffd51f";
      const r2 = radius * radius + radius;
      for (let sy = -7; sy <= 7; sy++) {
        let start = null;
        for (let sx = -7; sx <= 8; sx++) {
          const forward = dir.x < 0 ? -sx : dir.x > 0 ? sx : dir.y < 0 ? -sy : sy,
            across = dir.y ? sx : sy,
            inside = sx <= 7 && sx * sx + sy * sy <= r2 && !(forward > 0 && Math.abs(across) < forward * open);
          if (inside && start === null) start = sx;
          else if (!inside && start !== null) {
            ctx.fillRect(cx + start, cy + sy, sx - start, 1);
            start = null;
          }
        }
      }
    }
    function drawGhost(gh, x, y) {
      x = Math.round(x) - 7;
      y = Math.round(y) - 7;
      const blink = game && game.frightTime < 2 && Math.floor(game.frightTime * 5) % 2 === 0,
        feet = GHOST_FEET[Math.floor(attract * 8) % 2];
      if (gh.state !== "eyes" && gh.state !== "entering") {
        const body = gh.fright ? (blink ? "#f4f4ff" : "#2b46ff") : gh.color;
        runs([...GHOST_ROWS, ...feet], x, y, body);
      }
      if (gh.fright && gh.state !== "eyes" && gh.state !== "entering") {
        ctx.fillStyle = blink ? "#ff4b4b" : "#ffe8d1";
        ctx.fillRect(x + 4, y + 5, 2, 2);
        ctx.fillRect(x + 8, y + 5, 2, 2);
        for (let sx = 2; sx < 12; sx += 2) ctx.fillRect(x + sx, y + 10 - (sx % 4 ? 1 : 0), 2, 1);
        return;
      }
      const d = gh.state === "house" || gh.state === "leaving" ? PAC_DIRS.up : gh.dir;
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 2, y + 3, 4, 5);
      ctx.fillRect(x + 8, y + 3, 4, 5);
      ctx.fillRect(x + 1, y + 4, 6, 3);
      ctx.fillRect(x + 7, y + 4, 6, 3);
      ctx.fillStyle = "#1b2cc7";
      const ex = d.x < 0 ? 0 : d.x > 0 ? 2 : 1,
        ey = d.y < 0 ? 0 : d.y > 0 ? 3 : 2;
      ctx.fillRect(x + 2 + ex, y + 3 + ey, 2, 2);
      ctx.fillRect(x + 8 + ex, y + 3 + ey, 2, 2);
    }
    function drawFruit(f, cx, cy) {
      cx = Math.round(cx);
      cy = Math.round(cy);
      ctx.fillStyle = "#3fae4a";
      ctx.fillRect(cx, cy - 7, 2, 4);
      ctx.fillRect(cx + 2, cy - 7, 3, 2);
      if (f.name === "CEREZA") {
        ctx.fillStyle = f.color;
        ctx.fillRect(cx - 6, cy - 1, 5, 5);
        ctx.fillRect(cx + 1, cy, 5, 5);
        ctx.fillStyle = "#ffd5d5";
        ctx.fillRect(cx - 5, cy, 1, 1);
        ctx.fillRect(cx + 2, cy + 1, 1, 1);
        return;
      }
      ctx.fillStyle = f.color;
      ctx.fillRect(cx - 4, cy - 4, 9, 9);
      ctx.fillRect(cx - 5, cy - 3, 11, 7);
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.fillRect(cx - 3, cy - 3, 2, 2);
    }
    function centerText(text, y, size, color) {
      label(ctx, text, W / 2, y, size, color, "center", true);
    }
    function draw() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const flash = game?.phase === "clear" && Math.floor(game.phaseTime * 4) % 2 === 1;
      ctx.drawImage(flash ? wallsFlash : walls, 0, TOP, W, MH);
      // Puntos y energía.
      const pellets = game?.pellets || PAC_MAZE.map((row) => [...row].map((c) => (c === "." ? 1 : c === "o" ? 2 : 0)));
      ctx.fillStyle = "#f6d7a7";
      pellets.forEach((row, y) =>
        row.forEach((v, x) => {
          const px = x * T,
            py = TOP + y * T;
          if (v === 1) ctx.fillRect(px + 7, py + 7, 2, 2);
          else if (v === 2 && (!game || game.phase !== "play" || Math.floor(attract * 4) % 2 === 0)) {
            ctx.fillRect(px + 5, py + 4, 6, 8);
            ctx.fillRect(px + 4, py + 5, 8, 6);
          }
        }),
      );
      // Marcador.
      const score = game?.score || 0,
        best = Math.max(bestScore("pacman"), score);
      label(ctx, "PUNTOS", 6, 11, 13, "#7d9488");
      label(ctx, String(score), 6, 23, 17, "#f6f0dc");
      label(ctx, "RÉCORD", W / 2, 11, 13, "#7d9488", "center");
      label(ctx, String(best), W / 2, 23, 17, "#ffd51f", "center");
      label(ctx, "NIVEL", W - 6, 11, 13, "#7d9488", "right");
      label(ctx, String(game?.level || 1), W - 6, 23, 17, "#f6f0dc", "right");
      const reserve = game ? Math.max(0, game.lives - (game.phase === "over" ? 0 : 1)) : 2;
      for (let i = 0; i < Math.min(reserve, 6); i++) drawPac(12 + i * 18, TOP + MH + 13, PAC_DIRS.left, 0.6, 6);
      (game?.fruits || []).slice(-6).forEach((f, i) => drawFruit(f, W - 12 - i * 18, TOP + MH + 14));
      if (!game) {
        attractScreen();
        return;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, TOP, W, MH);
      ctx.clip();
      const at = (p, dx = 0) => [(p.x + dx) * T + T / 2, TOP + p.y * T + T / 2];
      if (game.fruit) drawFruit(game.fruit, ...at({ x: 10, y: 11 }));
      const showGhosts = !["dying", "clear"].includes(game.phase) || (game.phase === "dying" && game.phaseTime < 0.5);
      if (showGhosts)
        game.ghosts.forEach((gh) => {
          if (gh === game.hidden) return;
          const p = pos(gh);
          drawGhost(gh, ...at(p));
          if (p.y === PAC_TUNNEL && (p.x < 1 || p.x > PAC_COLS - 2)) drawGhost(gh, ...at(p, p.x < 1 ? PAC_COLS : -PAC_COLS));
        });
      const pp = pos(game.pac);
      if (game.phase === "dying") {
        const t = Math.max(0, (game.phaseTime - 0.5) / 1.1);
        if (t < 1) drawPac(...at(pp), PAC_DIRS.up, t * 6, 7 * (1 - t * 0.35));
      } else if (game.phase !== "eat") {
        const moving = game.pac.dir.x || game.pac.dir.y,
          open = game.phase === "play" && moving ? [0.05, 0.55, 1.05, 0.55][Math.floor(game.pac.anim * 18) % 4] : 0.55;
        drawPac(...at(pp), game.pac.facing, open);
        if (pp.y === PAC_TUNNEL && (pp.x < 1 || pp.x > PAC_COLS - 2)) drawPac(...at(pp, pp.x < 1 ? PAC_COLS : -PAC_COLS), game.pac.facing, open);
      }
      ctx.restore();
      game.popups.forEach((p) => label(ctx, p.text, p.x, Math.round(p.y), 15, p.color, "center", true));
      const textY = TOP + 11 * T + 13;
      if (game.phase === "ready") centerText(game.level > 1 && game.readyFor === 2 ? `NIVEL ${game.level}` : "¡PREPARADO!", textY, 20, "#ffd51f");
      if (game.phase === "over" && game.phaseTime <= 1) centerText("FIN DE PARTIDA", textY, 20, "#ff4b4b");
      if (game.phase === "over" && game.phaseTime > 1) {
        ctx.fillStyle = "rgba(0,0,0,.8)";
        ctx.fillRect(0, TOP, W, MH);
        centerText("FIN DE PARTIDA", TOP + MH / 2 - 44, 30, "#ff4b4b");
        centerText(`${game.score} PUNTOS`, TOP + MH / 2 - 8, 26, "#f6f0dc");
        centerText(game.newRecord ? "¡NUEVO RÉCORD!" : `NIVEL ${game.level}`, TOP + MH / 2 + 22, 18, game.newRecord ? "#ffd51f" : "#9fb3a7");
        centerText("ENTER O JUGAR PARA REPETIR", TOP + MH / 2 + 52, 16, "#48e0ff");
      }
      if (paused) {
        ctx.fillStyle = "rgba(0,0,0,.7)";
        ctx.fillRect(0, TOP, W, MH);
        centerText("PAUSA", TOP + MH / 2, 36, "#ffd51f");
        centerText("P PARA CONTINUAR", TOP + MH / 2 + 26, 16, "#dbe9e0");
      }
    }
    // PANTALLA DE INICIO: presenta a los cuatro fantasmas y su personalidad.
    function attractScreen() {
      ctx.fillStyle = "rgba(0,0,0,.8)";
      ctx.fillRect(0, TOP, W, MH);
      centerText("PAC-MAN", TOP + 52, 46, "#ffd51f");
      centerText("EDICIÓN JOSEMI-OS", TOP + 74, 16, "#9fb3a7");
      PAC_GHOSTS.forEach((spec, i) => {
        const y = TOP + 110 + i * 32;
        if (attract > 0.4 + i * 0.4) {
          drawGhost({ ...spec, state: "normal", fright: false, dir: PAC_DIRS.right }, 70, y);
          label(ctx, spec.name, 92, y + 5, 18, spec.color);
          label(ctx, spec.role, W - 60, y + 5, 15, "#9fb3a7", "right");
        }
      });
      const t = (attract * 70) % (W + 120);
      drawPac(t - 30, TOP + 262, PAC_DIRS.right, [0.05, 0.55, 1.05, 0.55][Math.floor(attract * 14) % 4]);
      for (let x = 0; x < W; x += 16) if (x > t - 30) {
        ctx.fillStyle = "#f6d7a7";
        ctx.fillRect(x + 7, TOP + 261, 2, 2);
      }
      if (Math.floor(attract * 2) % 2 === 0) centerText("ENTER O JUGAR PARA EMPEZAR", TOP + 300, 18, "#48e0ff");
    }

    /* --- Entrada --- */
    const KEYS = {
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
    };
    function press(action) {
      if (PAC_DIRS[action]) {
        queued = PAC_DIRS[action];
        if (!game) start();
      }
    }
    const keydown = (e) => {
      if (e.target.closest("input, select, textarea, a, [contenteditable='true']")) return;
      if (e.target.closest("button") && !/^(Arrow(Up|Down|Left|Right)|[wasd])$/i.test(e.key)) return;
      const k = e.key.toLowerCase();
      if (KEYS[k]) {
        e.preventDefault();
        if (!paused) press(KEYS[k]);
      } else if (k === "p" || k === "escape") {
        e.preventDefault();
        if (!e.repeat) togglePause();
      } else if (k === "enter" || (k === " " && !running())) {
        e.preventDefault();
        if (!running()) start();
      }
    };
    win.tabIndex = 0;
    win.addEventListener("keydown", keydown);
    let swipe = null;
    canvas.addEventListener("pointerdown", (e) => {
      focusGame(win);
      if (!running()) return start();
      if (paused) return togglePause(false);
      canvas.setPointerCapture?.(e.pointerId);
      swipe = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!swipe) return;
      const dx = e.clientX - swipe.x,
        dy = e.clientY - swipe.y;
      if (Math.hypot(dx, dy) < 16) return;
      press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
      swipe = { x: e.clientX, y: e.clientY };
    });
    const endSwipe = () => (swipe = null);
    canvas.addEventListener("pointerup", endSwipe);
    canvas.addEventListener("pointercancel", endSwipe);
    bindPad(body.querySelector(".jg-dpad"), win, (a) => !paused && press(a));
    startBtn.addEventListener("click", start);
    pauseBtn.addEventListener("click", () => {
      togglePause();
      focusGame(win);
    });
    bindSound(body.querySelector('[data-act="sound"]'));

    let sirenTime = 0;
    const stop = gameLoop(win, (dt) => {
      if (game?.phase === "play" && !paused) {
        sirenTime += dt;
        if (sirenTime >= 0.45) {
          sirenTime = 0;
          tone(190, 0.38, { type: "triangle", volume: 0.012, slide: 210 });
        }
      }
      update(dt);
      draw();
    });
    win.__cleanup = () => {
      if (game) recordScore("pacman", game.score);
      stop();
      win.removeEventListener("keydown", keydown);
    };
    attachGameLifecycle(win, () => {
      if (running() && !paused) togglePause(true);
    });
    syncButtons();
    requestAnimationFrame(() => focusGame(win));
  };

  /* ========================================================= BUSCAMINAS */
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
      cool: [[3, 5, 10, 1, ink], [4, 5, 3, 3, ink], [9, 5, 3, 3, ink], [5, 6, 1, 1, "#6aa0ff"], [10, 6, 1, 1, "#6aa0ff"], ...smile],
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
    cascade: (n) => melody([523, 659, 784].slice(0, Math.min(3, 1 + Math.floor(n / 10))), 0.04, { volume: 0.025 }),
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
    for (const id of ["medium", "easy", "hard"]) if (data[id]?.best) return `${clock(data[id].best * 1000, 0)} ${MS_LEVELS[id].label}`;
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
            .map(([id, l]) => `<button type="button" class="jg-chip" data-level="${id}" aria-pressed="false">${l.label}</button>`)
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
      let level = MS_LEVELS[read("josemi-minesweeper-level")] ? read("josemi-minesweeper-level") : "easy",
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
      const pad3 = (n) => (n < 0 ? "-" + String(Math.min(99, -n)).padStart(2, "0") : String(Math.min(999, n)).padStart(3, "0"));
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
          .map((_, i) => `<button type="button" class="ms-cell" data-i="${i}" role="gridcell" tabindex="${i ? -1 : 0}"></button>`)
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
          around.forEach((k) => !cells[k].open && !cells[k].flag && els[k].classList.add("is-pressed"));
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
          statusEl.textContent = "Empieza por cualquier casilla: el primer clic siempre es seguro y abre una zona.";
          return;
        }
        const safe = deduceSafe();
        let i,
          penalty = false;
        if (safe.length) i = safe[Math.floor(Math.random() * safe.length)];
        else {
          const candidates = cells.map((c, k) => k).filter((k) => !cells[k].open && !cells[k].mine && cells[k].flag !== 1);
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
        if (press && press.type !== "mouse" && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) {
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
        body.querySelectorAll("[data-level]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.level === id)));
        customForm.hidden = id !== "custom";
        if (id === "custom") ["rows", "cols", "mines"].forEach((k) => (customForm.elements[k].value = custom[k]));
        newGame();
      }
      body.querySelectorAll("[data-level]").forEach((b) => b.addEventListener("click", () => selectLevel(b.dataset.level)));
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
        statusEl.textContent = flagMode ? "Modo bandera: cada toque pone o quita una bandera." : "Modo normal: cada toque descubre una casilla.";
      });
      questionBox.addEventListener("change", () => write("josemi-minesweeper-question", questionBox.checked));
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

  /* ========================================================= ARCADE */
  const ARCADE_GAMES = [
    ["tetris", "▟", "3 MODOS · SRS", "Tetris", "Maratón, Sprint 40 y Ultra. Pieza guardada, cinco siguientes, T-spins, combos y back-to-back.", "← → · ↑ · Espacio · C"],
    ["pacman", "●", "4 FANTASMAS", "Pac-Man", "Laberinto propio, cuatro fantasmas con personalidad, frutas, túnel y niveles cada vez más rápidos.", "Flechas · P pausa"],
    ["minesweeper", "✱", "4 DIFICULTADES", "Buscaminas", "Fácil, medio, difícil o a medida. Primer clic seguro, acordes, pistas por deducción y estadísticas.", "Clic · Clic derecho · F"],
  ];
  Apps.arcade.size = [960, 660];
  Apps.arcade.render = () =>
    `<div class="arcade-heading"><div><span class="card-kicker">JOSEMI / ARCADE COLLECTION</span><h2>Una partida más.</h2><p>Tres clásicos reconstruidos desde cero dentro del sistema.</p></div><span class="arcade-badge">INSERT COIN<br>FREE PLAY</span></div><div class="arcade-grid arcade-grid--v2">${ARCADE_GAMES.map(
      ([id, mark, kicker, title, desc, keys]) =>
        `<button class="game-shortcut game-card game-card--${id}" data-game="${id}"><span class="game-card__number">${mark}</span><span class="card-kicker">${kicker}</span><strong>${title}</strong><p>${desc}</p><small>${keys}</small><span class="game-card__bottom">JUGAR ↗ <span>RÉCORD ${id === "minesweeper" ? msBestLabel() : bestScore(id)}</span></span></button>`,
    ).join("")}</div><p class="arcade-footnote">Las partidas se pausan al cambiar de ventana o pestaña. Haz clic en el juego para recuperar el teclado. El sonido del arcade se activa o desactiva desde cada juego.</p>`;
})();
