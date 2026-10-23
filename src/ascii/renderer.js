// src/ascii/renderer.js: fuente de JOSEMI-OS.
function fitAsciiText(el) {
  // El salvapantallas calcula su tamaño con su propia firma y el alto de pantalla.
  if (el.closest("#os-screensaver")) return;
  const container = el.closest(".boot-shell__body") || el;
  const available = Math.max(1, container.clientWidth - (el === container ? 32 : 48));
  const columns = Math.max(...NAME_ART.map((row) => row.length));
  el.style.setProperty(
    "--ascii-size",
    `${Math.max(4, Math.min(18, available / (columns * 0.61)))}px`,
  );
}
function seededNoise(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
// FOTOGRAMA ASCII: construye una rejilla vacía y coloca caracteres según el efecto y progreso de 0 a 1.
function signatureFrame(art, effect, p) {
  const h = art.length,
    w = Math.max(...art.map((l) => l.length)),
    grid = Array.from({ length: h }, () => Array(w).fill(" "));
  if (p >= 1) return art.join("\n");
  const put = (x, y, ch) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < w && y >= 0 && y < h) grid[y][x] = ch;
  };
  if (effect === "cinematic") {
    // Tres actos: ruido digital, partículas que convergen y una onda que fija la firma.
    if (p < 0.24) {
      const q = p / 0.24;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (seededNoise(x + y * w + Math.floor(p * 90)) > 0.64 - q * 0.12)
            put(x, y, "01/<>*"[Math.floor(seededNoise(x + y * 71 + Math.floor(p * 70)) * 6)]);
      return grid.map((row) => row.join("")).join("\n");
    }
    if (p < 0.7) {
      effect = "orbit";
      p = (p - 0.24) / 0.46;
    } else {
      const q = (p - 0.7) / 0.3;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < art[y].length; x++) {
          const ch = art[y][x];
          if (ch === " ") continue;
          const distance = Math.abs(x - w / 2) / (w / 2),
            front = q * 1.35;
          if (distance < front - 0.08) put(x, y, ch);
          else if (distance < front + 0.06) put(x, y, "▓");
          else put(x, y, seededNoise(x + y * w + Math.floor(q * 30)) > 0.8 ? "+" : ch);
        }
      return grid.map((row) => row.join("")).join("\n");
    }
  }
  if (effect === "storm") {
    for (let i = 0; i < w; i++) {
      const y = Math.floor((p * 24 + seededNoise(i) * h * 3) % h);
      if (seededNoise(i) > 0.62) put(i, y, "/");
    }
    const strike = Math.floor(p * 4),
      phase = (p * 4) % 1,
      root = seededNoise(strike + 400) * w;
    if (phase < 0.35)
      for (let y = 0; y < h; y++) {
        const x = root + Math.sin(y * 2 + strike) * 3;
        put(x, y, "/");
        put(x + 1, y, "/");
      }
  }
  const scan = p * (w + 9);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < art[y].length; x++) {
      const ch = art[y][x];
      if (ch === " ") continue;
      const seed = y * w + x,
        n = seededNoise(seed);
      if (effect === "orbit") {
        const q = Math.max(0, Math.min(1, (p - n * 0.16) / 0.78)),
          ease = q * q * (3 - 2 * q),
          angle = n * Math.PI * 2 + (1 - q) * Math.PI * 3;
        const ox = w / 2 + Math.cos(angle) * (w * 0.46),
          oy = h / 2 + Math.sin(angle) * (h * 0.43);
        put(ox + (x - ox) * ease, oy + (y - oy) * ease, q > 0.84 ? ch : [".", "+", "*"][seed % 3]);
      } else if (effect === "laser") {
        if (x < scan - 3) put(x, y, ch);
        else if (Math.abs(x - scan) < 2) put(x, y, "#");
        else if (x < scan + 7 && n > 0.76) put(x, y, [".", "+", "*"][seed % 3]);
      } else if (effect === "decrypt") {
        const threshold = n * 0.65 + (y / h) * 0.13;
        put(
          x,
          y,
          p > threshold ? ch : "01/+<>*"[Math.floor(seededNoise(seed + Math.floor(p * 60)) * 7)],
        );
      } else if (effect === "storm" && (p > 0.82 || n < p * 0.85)) put(x, y, ch);
    }
  if (effect === "laser" && scan < w) for (let y = 0; y < h; y++) put(scan, y, "|");
  return grid.map((row) => row.join("")).join("\n");
}
// EFECTOS: usa la rejilla para lluvia, barrido o convergencia. En progreso 1 devuelve la firma exacta.
function asciiFrame(art, effect, progress) {
  const height = art.length,
    width = Math.max(...art.map((l) => l.length)),
    grid = Array.from({ length: height }, () => Array(width).fill(" "));
  progress = Math.max(0, Math.min(1, progress));
  if (["cinematic", "storm", "orbit", "laser", "decrypt"].includes(effect))
    return signatureFrame(art, effect, progress);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < art[y].length; x++) {
      const ch = art[y][x];
      if (ch === " ") continue;
      const seed = y * width + x,
        delay = seededNoise(seed) * 0.22,
        p = Math.max(0, Math.min(1, (progress - delay) / 0.72));
      if (effect === "gather") {
        const ease = 1 - (1 - p) ** 3,
          ox = Math.round(x + (seededNoise(seed + 9) * width - x) * (1 - ease)),
          oy = Math.round(y + (seededNoise(seed + 21) * height - y) * (1 - ease));
        grid[Math.max(0, Math.min(height - 1, oy))][Math.max(0, Math.min(width - 1, ox))] =
          p > 0.9 ? ch : "·";
      } else if (effect === "rain") {
        const fall = Math.max(0, Math.min(1, (progress - (x / width) * 0.2) / 0.72));
        const cy = Math.round(-height + (y + height) * fall);
        if (cy >= 0)
          grid[cy][x] =
            fall > 0.97
              ? ch
              : ["0", "1", "│", "╎"][Math.floor(seededNoise(seed + Math.floor(progress * 35)) * 4)];
      } else {
        const sweep = progress * (width + 8);
        grid[y][x] =
          x < sweep - 5
            ? ch
            : x < sweep
              ? ["░", "▒", "▓"][Math.min(2, Math.floor((sweep - x) / 2))]
              : " ";
      }
    }
  return progress >= 1 ? art.join("\n") : grid.map((row) => row.join("")).join("\n");
}
// ANIMACIÓN: requestAnimationFrame aporta el tiempo real; cancel() termina el bucle y resuelve la promesa.
function animateAscii(el, effect, { duration = 1900, signal = () => false } = {}) {
  if (typeof fitAsciiText === "function") fitAsciiText(el);
  if (effect === "random")
    effect = ["cinematic", "storm", "orbit", "laser", "decrypt", "beams", "rain", "gather"][
      Math.floor(Math.random() * 8)
    ];
  let handle = 0,
    resolveDone,
    settled = false,
    start = null,
    last = 0;
  const done = new Promise((resolve) => (resolveDone = resolve));
  const end = (value) => {
    if (settled) return;
    settled = true;
    cancelAnimationFrame(handle);
    resolveDone(value);
  };
  const frame = (now) => {
    if (signal() || !el.isConnected) {
      end(false);
      return;
    }
    if (state.motion) {
      el.textContent = NAME_ART.join("\n");
      end(true);
      return;
    }
    if (start === null) start = now;
    const p = Math.min(1, (now - start) / duration);
    if (now - last > 28 || p === 1) {
      el.textContent = asciiFrame(NAME_ART, effect, p);
      last = now;
    }
    if (p === 1) end(true);
    else handle = requestAnimationFrame(frame);
  };
  handle = requestAnimationFrame(frame);
  return { done, cancel: () => end(false) };
}
let currentBootAnimation = null;
