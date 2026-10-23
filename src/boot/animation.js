// src/boot/animation.js: fuente de JOSEMI-OS.
const BOOT_ART = [
  "       ______  _____ ________  _______     ____  _____",
  "      / / __ \\/ ___// ____/  |/  /  _/    / __ \\/ ___/",
  " __  / / / / /\\__ \\/ __/ / /|_/ // /_____/ / / /\\__ \\ ",
  "/ /_/ / /_/ /___/ / /___/ /  / // /_____/ /_/ /___/ / ",
  "\\____/\\____//____/_____/_/  /_/___/     \\____//____/  ",
];
// Ajusta el rótulo completo al ancho real, también al girar el móvil.
function fitBootLogo() {
  const login = $("#login");
  const out = $("#bootTerminalOutput");
  const logo = out?.querySelector(".boot-logo:not(.boot-logo--hot)");
  if (!login || !logo || login.dataset.phase !== "signature") return;
  const padding = getComputedStyle(login);
  const available = Math.max(
    1,
    login.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight),
  );
  const context = document.createElement("canvas").getContext("2d");
  if (context) context.font = `700 100px ${getComputedStyle(logo).fontFamily}`;
  const width = Math.max(
    ...BOOT_ART.map((row) => (context ? context.measureText(row).width : row.length * 62)),
  );
  out.style.setProperty("--boot-logo-size", `${Math.min(27, (available * 100) / width)}px`);
}

const BOOT_NOISE = "/\\\\|_-=+<>*#01";
const bootNoise = () => BOOT_NOISE[Math.floor(Math.random() * BOOT_NOISE.length)];
// Cada carácter del rótulo recibe el instante (0–1) en que deja de ser ruido: avanza de
// izquierda a derecha con algo de azar, como un descifrado. Se calcula una sola vez.
function bootPlan() {
  return BOOT_ART.map((row) =>
    [...row].map((ch, x) =>
      ch === " " ? -1 : 0.12 + (x / row.length) * 0.5 + Math.random() * 0.2,
    ),
  );
}
// FOTOGRAMA DEL RÓTULO: devuelve dos textos del mismo tamaño. «base» es la capa verde;
// «hot» solo contiene los caracteres que brillan en blanco en ese instante.
//  0 → .12  una cortina de ruido escribe el rótulo de izquierda a derecha.
//  … → .82  cada carácter se descifra y destella al fijarse.
//  .82 → 1  un haz de luz inclinado recorre el rótulo ya terminado.
function bootFrame(plan, p) {
  const base = [],
    hot = [];
  BOOT_ART.forEach((row, y) => {
    let a = "",
      b = "";
    for (let x = 0; x < row.length; x++) {
      const at = plan[y][x],
        typed = x / row.length <= p / 0.12;
      if (at < 0 || !typed) {
        a += " ";
        b += " ";
        continue;
      }
      if (p >= 1) {
        a += row[x];
        b += " ";
        continue;
      }
      if (p < at) {
        const ch = bootNoise();
        a += ch;
        b += Math.random() < 0.08 || (p < 0.12 && x / row.length > p / 0.12 - 0.06) ? ch : " ";
        continue;
      }
      const beam =
        p > 0.82 && Math.abs(x + y * 1.5 - ((p - 0.82) / 0.18) * (row.length + 12) + 4) < 2.5;
      a += row[x];
      b += p - at < 0.045 || beam ? row[x] : " ";
    }
    base.push(a);
    hot.push(b);
  });
  return { base: base.join("\n"), hot: hot.join("\n") };
}
// ARRANQUE: terminal negra como la de la película.
//  1. Escribe «Wake up, Neo...», lo borra y escribe «The Matrix has you...».
//  2. Limpia la pantalla y descifra el rótulo JOSEMI-OS en el centro.
//  3. Entra al escritorio.
// Solo usa texto y temporizadores (sin canvas ni requestAnimationFrame): son 5 filas de
// caracteres, así que funciona igual en ordenadores lentos. Cada espera comprueba bootRun
// para que Saltar nunca deje otra intro en marcha.
typeLoginArt = async function () {
  currentBootAnimation?.cancel();
  currentBootAnimation = null;
  const run = ++bootRun;
  enteringOS = false;
  const login = $("#login"),
    out = $("#bootTerminalOutput"),
    still = state.motion;
  login.classList.remove("hidden", "out");
  login.dataset.phase = "matrix";
  out.innerHTML = "";
  const active = () => run === bootRun && !enteringOS;
  try {
    const neo = appendBoot("", "boot-neo boot-cursor");
    neo.textContent = "";
    if (!still) await bootDelay(600);
    if (!active()) return;
    if (!(await typeBootText(neo, "Wake up, Neo...", still ? 0 : 110, run))) return;
    await bootDelay(still ? 900 : 1200);
    if (!active()) return;
    // Borrado: retrocede letra a letra, como si alguien pulsara la tecla de borrar.
    if (!still)
      for (let n = neo.textContent.length - 1; n >= 0; n--) {
        neo.textContent = neo.textContent.slice(0, n);
        await bootDelay(28);
        if (!active()) return;
      }
    neo.textContent = "";
    if (!still) await bootDelay(450);
    if (!active()) return;
    if (!(await typeBootText(neo, "The Matrix has you...", still ? 0 : 95, run))) return;
    await bootDelay(still ? 900 : 1300);
    if (!active()) return;

    out.innerHTML = "";
    login.dataset.phase = "signature";
    const hot = appendBoot("", "boot-logo boot-logo--hot"),
      logo = appendBoot("", "boot-logo");
    fitBootLogo();
    const final = BOOT_ART.join("\n"),
      plan = bootPlan(),
      steps = still ? 0 : 84;
    for (let n = 0; n < steps; n++) {
      const frame = bootFrame(plan, n / steps);
      logo.textContent = frame.base;
      hot.textContent = frame.hot;
      await bootDelay(40);
      if (!active()) return;
    }
    logo.textContent = final;
    hot.textContent = "";
    await bootDelay(still ? 1500 : 1100);
    if (active()) {
      state.introSeen = true;
      save();
      enterOS();
    }
  } catch (error) {
    // Si algo falla en un navegador raro, el visitante entra igualmente al escritorio.
    console.error("Intro de arranque:", error);
    if (active()) {
      state.introSeen = true;
      save();
      enterOS();
    }
  }
};
