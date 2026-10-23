// src/apps/focus.js: fuente de JOSEMI-OS.
Apps.focus = {
  title: "Concentración",
  icon: spriteIcon("focus"),
  size: [580, 555],
  render: () =>
    '<section class="pixel-focus"><div class="extra-heading"><span class="card-kicker">UNA COSA CADA VEZ</span><h2>Tiempo para crear.</h2><p>Trabaja un rato. Descansa. Vuelve con otra idea.</p></div><div class="focus-modes"><button class="btn" data-focus-mode="work" aria-pressed="true">TRABAJO · 25</button><button class="btn" data-focus-mode="short" aria-pressed="false">PAUSA · 5</button><button class="btn" data-focus-mode="long" aria-pressed="false">PAUSA · 15</button></div><output class="focus-clock" aria-label="Tiempo restante">25:00</output><p class="focus-status" role="status">LISTO PARA EMPEZAR</p><div class="focus-actions"><button class="btn btn--accent" data-focus-start>INICIAR</button><button class="btn" data-focus-reset>REINICIAR</button></div><label class="focus-duration">Duración personalizada<input type="number" min="1" max="180" value="25" aria-label="Duración en minutos"><span>minutos</span></label><p class="focus-note">Puedes minimizar la ventana. Cerrar la ventana detiene el temporizador.</p></section>',
  bind(body, win) {
    let duration = 25 * 60000,
      remaining = duration,
      deadline = 0,
      running = false,
      mode = "work";
    const clock = body.querySelector("output"),
      status = body.querySelector(".focus-status"),
      start = body.querySelector("[data-focus-start]"),
      input = body.querySelector("input");
    function draw() {
      const seconds = Math.ceil(remaining / 1000);
      clock.textContent =
        String(Math.floor(seconds / 60)).padStart(2, "0") +
        ":" +
        String(seconds % 60).padStart(2, "0");
    }
    function reset() {
      running = false;
      remaining = duration;
      start.textContent = "INICIAR";
      input.disabled = false;
      status.textContent = "LISTO PARA EMPEZAR";
      draw();
    }
    function tick() {
      if (!running) return;
      remaining = Math.max(0, deadline - Date.now());
      draw();
      if (!remaining) {
        running = false;
        input.disabled = false;
        start.textContent = "REPETIR";
        status.textContent =
          mode === "work" ? "SESIÓN COMPLETADA. TÓMATE UN DESCANSO." : "DESCANSO COMPLETADO.";
        toast(
          mode === "work"
            ? "Buen trabajo. Es hora de descansar."
            : "Descanso terminado. ¿Seguimos?",
        );
        if (state.sound) beep();
      }
    }
    start.onclick = () => {
      if (running) {
        tick();
        if (!running) return;
        running = false;
        input.disabled = false;
        start.textContent = "CONTINUAR";
        status.textContent = "EN PAUSA";
      } else {
        if (!remaining) remaining = duration;
        deadline = Date.now() + remaining;
        running = true;
        input.disabled = true;
        start.textContent = "PAUSAR";
        status.textContent = mode === "work" ? "CONCENTRACIÓN EN MARCHA" : "DESCANSO EN MARCHA";
      }
    };
    body.querySelector("[data-focus-reset]").onclick = reset;
    body.querySelectorAll("[data-focus-mode]").forEach(
      (b) =>
        (b.onclick = () => {
          mode = b.dataset.focusMode;
          duration = { work: 25, short: 5, long: 15 }[mode] * 60000;
          input.value = duration / 60000;
          body
            .querySelectorAll("[data-focus-mode]")
            .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          reset();
        }),
    );
    function changeDuration(report) {
      if (running) return;
      const value = Number(input.value);
      if (!Number.isInteger(value) || value < 1 || value > 180) {
        if (report) input.value = duration / 60000;
        status.textContent = "ELIGE ENTRE 1 Y 180 MINUTOS.";
        return;
      }
      duration = value * 60000;
      body
        .querySelectorAll("[data-focus-mode]")
        .forEach((b) =>
          b.setAttribute(
            "aria-pressed",
            String(
              { work: 25, short: 5, long: 15 }[b.dataset.focusMode] === value &&
                b.dataset.focusMode === mode,
            ),
          ),
        );
      reset();
    }
    input.addEventListener("input", () => changeDuration(false));
    input.addEventListener("change", () => changeDuration(true));
    const timer = setInterval(tick, 250);
    win.__cleanup = () => clearInterval(timer);
    draw();
  },
};
