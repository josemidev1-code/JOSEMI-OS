// src/ascii/screensaver.js: fuente de JOSEMI-OS.
let saverAnimation = null,
  saverCycle = 0,
  idleTimer = 0,
  lastInput = Date.now();
function hideScreensaver() {
  const overlay = $("#os-screensaver");
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  saverCycle++;
  saverAnimation?.cancel();
  saverAnimation = null;
  lastInput = Date.now();
  $("#launch-saver")?.focus({ preventScroll: true });
}
function showScreensaver() {
  if ($("#desktop").classList.contains("hidden") || !$("#shutdown").classList.contains("hidden"))
    return;
  const overlay = $("#os-screensaver");
  if (!overlay || !overlay.hidden) return;
  overlay.hidden = false;
  overlay.focus();
  const cycle = ++saverCycle;
  const canvas = $(".saver-field", overlay),
    ctx = canvas.getContext("2d");
  const art = $(".saver-art", overlay),
    command = $(".saver-command", overlay);
  const subtitle = $(".saver-subtitle", overlay),
    notes = $(".saver-notes", overlay);
  const label = $(".saver-scene", overlay),
    progress = $(".saver-progress", overlay);
  const chars = "01アイウエオカキクケコサシスセソ<>/:+=*";
  const total = SAVER_SCENES.reduce((sum, scene) => sum + scene.duration, 0);
  const start = performance.now();
  let width,
    height,
    columns,
    drops,
    raf = 0,
    last = -Infinity,
    currentIndex = -1,
    rows = [];
  let closed = false;
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = Math.ceil(width / 18);
    drops = Array.from({ length: columns }, (_, i) => ({
      y: seededNoise(i + 9) * height,
      speed: 35 + seededNoise(i + 3) * 70,
    }));
    fitArt();
  }
  function fitArt() {
    if (!rows.length) return;
    const widest = Math.max(...rows.map((row) => row.length));
    const size = Math.max(
      5,
      Math.min(64, (width * 0.87) / (widest * 0.61), (height * 0.48) / (rows.length * 1.15)),
    );
    art.style.fontSize = `${size}px`;
  }
  function matrix(time, elapsed) {
    ctx.fillStyle = "rgba(2,8,5,.17)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "20px JetBrains Mono";
    drops.forEach((drop, i) => {
      drop.y += drop.speed * elapsed;
      if (drop.y > height + 240) drop.y = -20;
      for (let tail = 0; tail < 9; tail++) {
        const y = drop.y - tail * 19;
        ctx.fillStyle =
          tail === 0
            ? "#baffce"
            : i % 7 === 0
              ? `rgba(80,199,215,${0.55 - tail * 0.05})`
              : `rgba(67,199,112,${0.65 - tail * 0.065})`;
        ctx.fillText(chars[(Math.floor(time * 5) + i * 13 + tail * 7) % chars.length], i * 18, y);
      }
    });
  }
  // Un toro 3D dibujado con caracteres: profundidad, rotación y luz sin imágenes.
  function orbit(time) {
    ctx.fillStyle = "#020805";
    ctx.fillRect(0, 0, width, height);
    const cols = Math.min(94, Math.floor(width / 9)),
      lines = Math.min(40, Math.floor(height / 16));
    const pixels = Array(cols * lines).fill(" "),
      depths = Array(cols * lines).fill(0);
    const ca = Math.cos(time * 0.4),
      sa = Math.sin(time * 0.4),
      cb = Math.cos(time * 0.23),
      sb = Math.sin(time * 0.23);
    for (let a = 0; a < Math.PI * 2; a += 0.09)
      for (let b = 0; b < Math.PI * 2; b += 0.045) {
        const c = Math.cos(a),
          s = Math.sin(a),
          circle = 2 + Math.cos(b),
          h = Math.sin(b);
        const z = 1 / (s * circle * sa + h * ca + 5);
        const x = c * circle * cb - (s * circle * ca - h * sa) * sb;
        const y = c * circle * sb + (s * circle * ca - h * sa) * cb;
        const col = Math.floor(cols / 2 + cols * 0.58 * z * x),
          line = Math.floor(lines / 2 + lines * 0.64 * z * y);
        const lum = Math.max(
          0,
          Math.min(
            11,
            Math.floor(
              8 *
                ((h * sa - s * Math.cos(b) * ca) * cb -
                  s * Math.cos(b) * sa -
                  h * ca -
                  c * Math.cos(b) * sb),
            ),
          ),
        );
        const index = col + line * cols;
        if (col >= 0 && col < cols && line >= 0 && line < lines && z > depths[index]) {
          depths[index] = z;
          pixels[index] = ".,-~:;=!*#$@"[lum];
        }
      }
    const cell = Math.min(width / (cols + 2), height / (lines + 4));
    ctx.font = `${cell}px JetBrains Mono`;
    ctx.fillStyle = "#307a60";
    const x = (width - cols * cell * 0.61) / 2,
      y = (height - lines * cell) / 2;
    for (let row = 0; row < lines; row++)
      ctx.fillText(pixels.slice(row * cols, (row + 1) * cols).join(""), x, y + row * cell);
  }
  function stars(time) {
    ctx.fillStyle = "#030806";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "20px JetBrains Mono";
    for (let i = 0; i < 140; i++) {
      const phase = (time * 0.025 + seededNoise(i + 100)) % 1;
      const angle = seededNoise(i + 800) * Math.PI * 2;
      const x = width / 2 + Math.cos(angle) * phase * width * 0.7,
        y = height / 2 + Math.sin(angle) * phase * height * 0.7;
      ctx.fillStyle = `rgba(93,188,153,${phase * 0.7})`;
      ctx.fillText(i % 4 ? "+" : "*", x, y);
    }
  }
  function frame(now) {
    if (closed || cycle !== saverCycle || overlay.hidden || document.hidden) return;
    if (now - last < 42) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const step = Math.min(0.08, Number.isFinite(last) ? (now - last) / 1000 : 0.042);
    last = now;
    const position = state.motion ? 4000 : (now - start) % total;
    let offset = 0,
      index = 0;
    while (index < SAVER_SCENES.length - 1 && position >= offset + SAVER_SCENES[index].duration)
      offset += SAVER_SCENES[index++].duration;
    const scene = SAVER_SCENES[index],
      age = position - offset,
      time = (now - start) / 1000;
    if (index !== currentIndex) {
      currentIndex = index;
      rows = scene.art();
      fitArt();
      ctx.clearRect(0, 0, width, height);
      command.textContent = scene.command;
      subtitle.textContent = scene.subtitle;
      label.textContent = `${String(index + 1).padStart(2, "0")} / ${String(SAVER_SCENES.length).padStart(2, "0")} · ${scene.name}`;
      overlay.dataset.scene = scene.field;
    }
    if (scene.field === "orbit") orbit(time);
    else if (scene.field === "stars") stars(time);
    else matrix(time, step);
    const p = state.motion ? 1 : Math.min(1, age / 2900);
    art.textContent = asciiFrame(rows, scene.effect, p);
    art.style.opacity = String(state.motion ? 1 : Math.min(1, (scene.duration - age) / 650));
    const note =
      scene.notes[
        Math.min(scene.notes.length - 1, Math.floor(age / (scene.duration / scene.notes.length)))
      ];
    notes.textContent = "> " + note;
    progress.style.transform = `scaleX(${state.motion ? 1 : age / scene.duration})`;
    if (!state.motion) raf = requestAnimationFrame(frame);
  }
  saverAnimation = {
    cancel() {
      closed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    },
  };
  addEventListener("resize", resize);
  resize();
  frame(start);
}
