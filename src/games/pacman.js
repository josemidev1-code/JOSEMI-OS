// src/games/pacman.js: fuente de JOSEMI-OS.
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
  {
    id: "blinky",
    name: "BLINKY",
    role: "PERSEGUIDOR",
    color: "#ff4b4b",
    corner: { x: PAC_COLS - 2, y: -3 },
    start: { x: 10, y: 7 },
    release: [0, 0],
  },
  {
    id: "pinky",
    name: "PINKY",
    role: "EMBOSCADA",
    color: "#ffa3e0",
    corner: { x: 1, y: -3 },
    start: { x: 10, y: 9 },
    release: [0, 0.6],
  },
  {
    id: "inky",
    name: "INKY",
    role: "IMPREDECIBLE",
    color: "#48e0ff",
    corner: { x: PAC_COLS - 1, y: PAC_ROWS + 1 },
    start: { x: 9, y: 9 },
    release: [30, 5],
  },
  {
    id: "clyde",
    name: "CLYDE",
    role: "DESPISTADO",
    color: "#ffb347",
    corner: { x: 0, y: PAC_ROWS + 1 },
    start: { x: 11, y: 9 },
    release: [60, 10],
  },
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
    tone(wakaFlip ? 330 : 260, 0.07, {
      type: "triangle",
      volume: 0.05,
      slide: wakaFlip ? -90 : 90,
    });
  },
  power: () => tone(140, 0.4, { type: "sawtooth", volume: 0.035, slide: 260 }),
  ghost: () => tone(200, 0.35, { volume: 0.04, slide: 1200 }),
  fruit: () => melody([784, 988, 1175, 1568], 0.05, { volume: 0.035 }),
  life: () => melody([1046, 0, 1046, 0, 1046], 0.08, { volume: 0.035 }),
  death: () => tone(700, 1.2, { type: "triangle", volume: 0.05, slide: -620 }),
  start: () => {
    melody(
      [
        494, 988, 740, 622, 988, 740, 622, 0, 523, 1046, 784, 659, 1046, 784, 659, 0, 494, 988, 740,
        622, 988, 740, 622, 587, 622, 659, 659, 698, 740, 784, 988,
      ],
      0.105,
      { volume: 0.035 },
    );
    melody([247, 0, 247, 0, 247, 0, 247, 0, 262, 0, 262, 0, 262, 0, 262], 0.21, {
      type: "triangle",
      volume: 0.018,
    });
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
    const isWall = (x, y) =>
      x < 0 || x >= PAC_COLS || y < 0 || y >= PAC_ROWS
        ? y !== PAC_TUNNEL
        : "#-".includes(PAC_MAZE[y][x]);
    for (let y = 0; y < PAC_ROWS; y++)
      for (let x = 0; x < PAC_COLS; x++) {
        if (PAC_MAZE[y][x] !== "#") continue;
        const px = x * T,
          py = y * T,
          open = {
            t: !isWall(x, y - 1),
            b: !isWall(x, y + 1),
            l: !isWall(x - 1, y),
            r: !isWall(x + 1, y),
          };
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
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].forEach(([dx, dy]) => {
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
    game.pac = {
      x: PAC_HOME.x,
      y: PAC_HOME.y,
      dir: { ...PAC_DIRS.left },
      facing: PAC_DIRS.left,
      prog: 0,
      anim: 0,
    };
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
    if (gh.y === PAC_TUNNEL && (gh.x < 5 || gh.x > PAC_COLS - 6))
      return BASE * [0.4, 0.45, 0.5][tier()];
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
      game.popups.push({
        text: "¡VIDA EXTRA!",
        x: W / 2,
        y: TOP + 11.5 * T,
        life: 1.6,
        color: "#6fd479",
      });
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
    if (game.eaten === 70 || game.eaten === 170)
      game.fruit = { ...PAC_FRUITS[Math.min(game.level - 1, PAC_FRUITS.length - 1)], time: 9.5 };
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
    if (queued && (p.dir.x || p.dir.y) && queued.x === -p.dir.x && queued.y === -p.dir.y)
      reverse(p);
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
    const options = PAC_ORDER.filter(
      (d) => !(d.x === -gh.dir.x && d.y === -gh.dir.y) && canGo(gh.x, gh.y, d),
    );
    if (!options.length) return { x: -gh.dir.x, y: -gh.dir.y };
    if (gh.fright && gh.state === "normal")
      return options[Math.floor(Math.random() * options.length)];
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
      if (
        (game.fresh && game.eaten >= dots && game.roundTime >= seconds * 0.3) ||
        game.roundTime >= seconds
      )
        gh.state = "leaving";
      return;
    }
    if (gh.state === "leaving") {
      if (approach(gh, PAC_DOOR.x, PAC_DOOR.y, 4 * dt)) {
        Object.assign(gh, {
          state: "normal",
          free: false,
          x: PAC_DOOR.x,
          y: PAC_DOOR.y,
          prog: 0,
          dir: { ...PAC_DIRS.left },
        });
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
        game.popups.push({
          text: String(points),
          x: gp.x * T + T / 2,
          y: TOP + gp.y * T + T / 2 + 4,
          life: 0.9,
          color: "#48e0ff",
        });
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
      game.popups.push({
        text: String(game.fruit.points),
        x: 10 * T + T / 2,
        y: TOP + 11 * T + 12,
        life: 1.4,
        color: "#ffb8de",
      });
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
          inside =
            sx <= 7 &&
            sx * sx + sy * sy <= r2 &&
            !(forward > 0 && Math.abs(across) < forward * open);
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
    const pellets =
      game?.pellets ||
      PAC_MAZE.map((row) => [...row].map((c) => (c === "." ? 1 : c === "o" ? 2 : 0)));
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
    for (let i = 0; i < Math.min(reserve, 6); i++)
      drawPac(12 + i * 18, TOP + MH + 13, PAC_DIRS.left, 0.6, 6);
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
    const showGhosts =
      !["dying", "clear"].includes(game.phase) || (game.phase === "dying" && game.phaseTime < 0.5);
    if (showGhosts)
      game.ghosts.forEach((gh) => {
        if (gh === game.hidden) return;
        const p = pos(gh);
        drawGhost(gh, ...at(p));
        if (p.y === PAC_TUNNEL && (p.x < 1 || p.x > PAC_COLS - 2))
          drawGhost(gh, ...at(p, p.x < 1 ? PAC_COLS : -PAC_COLS));
      });
    const pp = pos(game.pac);
    if (game.phase === "dying") {
      const t = Math.max(0, (game.phaseTime - 0.5) / 1.1);
      if (t < 1) drawPac(...at(pp), PAC_DIRS.up, t * 6, 7 * (1 - t * 0.35));
    } else if (game.phase !== "eat") {
      const moving = game.pac.dir.x || game.pac.dir.y,
        open =
          game.phase === "play" && moving
            ? [0.05, 0.55, 1.05, 0.55][Math.floor(game.pac.anim * 18) % 4]
            : 0.55;
      drawPac(...at(pp), game.pac.facing, open);
      if (pp.y === PAC_TUNNEL && (pp.x < 1 || pp.x > PAC_COLS - 2))
        drawPac(...at(pp, pp.x < 1 ? PAC_COLS : -PAC_COLS), game.pac.facing, open);
    }
    ctx.restore();
    game.popups.forEach((p) =>
      label(ctx, p.text, p.x, Math.round(p.y), 15, p.color, "center", true),
    );
    const textY = TOP + 11 * T + 13;
    if (game.phase === "ready")
      centerText(
        game.level > 1 && game.readyFor === 2 ? `NIVEL ${game.level}` : "¡PREPARADO!",
        textY,
        20,
        "#ffd51f",
      );
    if (game.phase === "over" && game.phaseTime <= 1)
      centerText("FIN DE PARTIDA", textY, 20, "#ff4b4b");
    if (game.phase === "over" && game.phaseTime > 1) {
      ctx.fillStyle = "rgba(0,0,0,.8)";
      ctx.fillRect(0, TOP, W, MH);
      centerText("FIN DE PARTIDA", TOP + MH / 2 - 44, 30, "#ff4b4b");
      centerText(`${game.score} PUNTOS`, TOP + MH / 2 - 8, 26, "#f6f0dc");
      centerText(
        game.newRecord ? "¡NUEVO RÉCORD!" : `NIVEL ${game.level}`,
        TOP + MH / 2 + 22,
        18,
        game.newRecord ? "#ffd51f" : "#9fb3a7",
      );
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
    drawPac(
      t - 30,
      TOP + 262,
      PAC_DIRS.right,
      [0.05, 0.55, 1.05, 0.55][Math.floor(attract * 14) % 4],
    );
    for (let x = 0; x < W; x += 16)
      if (x > t - 30) {
        ctx.fillStyle = "#f6d7a7";
        ctx.fillRect(x + 7, TOP + 261, 2, 2);
      }
    if (Math.floor(attract * 2) % 2 === 0)
      centerText("ENTER O JUGAR PARA EMPEZAR", TOP + 300, 18, "#48e0ff");
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
