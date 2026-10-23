// src/wallpapers/atmosphere-renderer.js: fuente de JOSEMI-OS.
const atmosphereBuffer = { size: 0, w: 0, h: 0, ch: [], light: null, ink: [], used: [] };
function atmosphereFrame(kind, w, h, t, density = 55) {
  const buf = atmosphereBuffer;
  if (buf.size !== w * h) {
    buf.size = w * h;
    buf.ch = new Array(buf.size).fill(" ");
    buf.light = new Float32Array(buf.size);
    buf.ink = new Array(buf.size).fill("");
    buf.used = [];
  }
  for (const i of buf.used) buf.ch[i] = " ";
  buf.used.length = 0;
  buf.w = w;
  buf.h = h;
  const put = (x, y, ch, light = 0.4) => {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = y * w + x;
    if (buf.ch[i] === " ") buf.used.push(i);
    buf.ch[i] = ch;
    buf.light[i] = Math.max(0, Math.min(1, light));
    buf.ink[i] = "";
  };
  if (kind === "storm" || kind === "rain") {
    for (let i = 0; i < Math.floor((w * h * density) / 1400); i++) {
      const speed = 6 + seededNoise(i + 32) * 9,
        y = ((seededNoise(i + 20) * h + t * speed) % (h + 8)) - 4,
        x = (seededNoise(i + 1) * w - t * speed * 0.36 + w * 100) % w;
      for (let tail = 0; tail < 3; tail++)
        put(x + tail * 0.4, y - tail, "/", 0.22 + (3 - tail) * 0.08);
    }
    if (kind === "storm") {
      const cycle = Math.floor(t / 6),
        phase = t % 6;
      if (phase > 0.7 && phase < 1.45) {
        const root = w * (0.15 + seededNoise(cycle + 88) * 0.7),
          growth = Math.min(h, (phase - 0.7) * h * 5),
          light = Math.max(0.3, 1 - (phase - 1) * 1.8);
        for (let y = 0; y < growth; y++) {
          const x = root + Math.sin(y * 0.6 + cycle) * 3 - y * 0.28;
          put(x, y, "/", light);
          put(x + 1, y, "/", light);
          if (y > h * 0.24 && y < h * 0.7 && y % 5 === 0)
            for (let b = 0; b < 7; b++) put(x + b, y + b * 0.55, "/", light * 0.7);
        }
        const impactX = root + Math.sin((h - 1) * 0.6 + cycle) * 3 - (h - 1) * 0.28;
        if (growth >= h)
          for (let s = 0; s < 18; s++) {
            const angle = s * 0.7,
              r = (phase - 0.9) * 20;
            put(
              impactX + Math.cos(angle) * r,
              h - 2 - Math.abs(Math.sin(angle) * r * 0.35),
              s % 2 ? "*" : "+",
              light * 0.7,
            );
          }
      }
    }
  } else if (kind === "aurora" || kind === "terrain") {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const value =
          kind === "aurora"
            ? Math.sin(x * 0.09 + t * 0.35) +
              Math.cos(y * 0.23 + x * 0.03 - t * 0.5) +
              Math.sin(x * 0.035 + y * 0.12 + t * 0.3)
            : Math.sin(x * 0.08 + t * 0.06) * 1.8 +
              Math.cos(y * 0.16 - t * 0.04) +
              Math.sin(x * 0.05 + y * 0.09);
        const band = Math.abs(Math.sin(value * (kind === "terrain" ? 5 : 2)));
        if (band < density / 700)
          put(
            x,
            y,
            kind === "terrain" ? (band < 0.04 ? "+" : ".") : "~",
            0.22 + Math.abs(value) * 0.13,
          );
      }
  } else if (kind === "stars") {
    for (let i = 0; i < Math.floor((w * h * density) / 1100); i++) {
      const x = seededNoise(i + 3) * w,
        y = seededNoise(i + 7) * h,
        light = 0.28 + (Math.sin(t * 0.8 + i) + 1) * 0.2;
      put(x, y, i % 6 === 0 ? "+" : ".", light);
      if (i % 9 === 0) for (let j = 1; j < 5; j++) put(x + j, y + j * 0.2, ".", 0.16);
    }
    const cycle = Math.floor(t / 9),
      phase = t % 9;
    if (phase < 2)
      for (let tail = 0; tail < 7; tail++)
        put(
          w - phase * w * 0.4 + tail,
          seededNoise(cycle + 300) * h + phase * 4 - tail * 0.15,
          tail ? "·" : "*",
          0.8 - tail * 0.09,
        );
  } else if (["matrix", "matrixBlue", "matrixDepth"].includes(kind)) {
    // Cada columna tiene su velocidad y longitud. La cabeza brilla y la cola se desvanece.
    const glyphs = "012345789アイウエオカキクケコサシスセソタチツテトナニヌネノ<>/{}";
    for (let x = 0; x < w; x++) {
      const layer = seededNoise(x + 230),
        speed = 3 + layer * 11,
        span = h + 26;
      const head = ((t * speed + seededNoise(x + 90) * span) % span) - 8;
      const length = 5 + Math.floor(density / 4 + layer * 10);
      if (seededNoise(x + 600) > density / 100 + 0.12) continue;
      for (let tail = 0; tail < length; tail++) {
        const y = Math.floor(head - tail);
        if (y < 0 || y >= h) continue;
        const light = tail === 0 ? 1 : Math.pow(1 - tail / length, 1.7) * (0.35 + layer * 0.5);
        put(
          x,
          y,
          glyphs[
            Math.floor(
              seededNoise(x * 73 + y * 19 + Math.floor(t * (layer + 1) * 4)) * glyphs.length,
            )
          ],
          kind === "matrixDepth" ? light * (0.3 + layer * 0.7) : light,
        );
        buf.ink[y * w + x] =
          tail === 0
            ? "head"
            : kind === "matrixBlue" && (x % 7 < 2 || layer > 0.8)
              ? "cyan"
              : "green";
      }
    }
  }

  return buf;
}
