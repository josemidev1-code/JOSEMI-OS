// src/apps/vault.js: fuente de JOSEMI-OS.
Apps.easter = {
  title: "Secret Vault",
  icon: pixelIcon("easter"),
  size: [760, 700],
  render: () => `
      <section class="vault vault--personal">
        <div class="vault-top">
          <span class="card-kicker">/ROOT / SECRET_VAULT</span>
          <span class="vault-status">${state.vault.matrix && state.vault.gof ? "DESBLOQUEADA" : "SECRETOS GUARDADOS"}</span>
        </div>
        <h2>Secret Vault de Josemi</h2>
        <div class="vault-opening" aria-hidden="true">
          <pre class="vault-ascii-door">+-------------------+
|  .-----------.    |
|  |     +     |    |
|  |   --O--   |    |
|  |     +     |    |
|  '-----------'    |
+-------------------+</pre>
          <span>ABRIENDO SECRET VAULT<span class="vault-dots">...</span></span>
        </div>
        <p class="vault-copy">Dos secretos bajo llave. Elige un candado y descubre su pregunta.</p>

        <div class="vault-locks" aria-label="Candados de la Secret Vault">
          ${["matrix", "gof"]
            .map(
              (
                key,
                index,
              ) => `<button type="button" class="vault-lock ${state.vault[key] ? "unlocked" : ""}" data-lock="${key}" aria-label="${index === 0 ? "Candado izquierdo" : "Candado derecho"}${state.vault[key] ? ", desbloqueado" : ""}" aria-expanded="false" aria-controls="vault-question-${key}">
            <pre class="vault-lock-art" aria-hidden="true">${state.vault[key] ? "   .----.\n   |    |\n .-+----'-.\n |   o   |\n |   |   |\n '-------'" : "  .---.\n /     \\\n |     |\n.+-----+.\n|   o   |\n|   |   |\n'-------'"}</pre>
            <span class="vault-lock-caption">${state.vault[key] ? "DESBLOQUEADO" : "EXPLORAR"}</span>
          </button>`,
            )
            .join("")}
        </div>

        <div class="vault-challenges">
        <section class="vault-question" id="vault-question-matrix" hidden>
          <h3>¿Quién ayuda a Neo a escapar de Matrix?</h3>
          <form data-key="matrix">
            <input maxlength="100" required aria-label="Tu respuesta" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…">
            <button class="btn btn--accent" type="submit">VALIDAR ↵</button>
          </form>
          <button type="button" class="vault-hint-button" data-hint="matrix">NECESITO UNA PISTA</button><p class="vault-feedback" data-feedback="matrix" role="status"></p>
          <button class="btn vault-reward" data-reward="matrix" ${state.vault.matrix ? "" : "hidden disabled"}>DESCUBRIR FONDO ↗</button>
        </section>

        <section class="vault-question" id="vault-question-gof" hidden>
          <h3>¿Cuál es el videojuego favorito de Josemi?</h3>
          <form data-key="gof">
            <input maxlength="100" required aria-label="Tu respuesta" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…">
            <button class="btn btn--accent" type="submit">VALIDAR ↵</button>
          </form>
          <button type="button" class="vault-hint-button" data-hint="gof">NECESITO UNA PISTA</button><p class="vault-feedback" data-feedback="gof" role="status"></p>
          <button class="btn vault-reward" data-reward="gof" ${state.vault.gof ? "" : "hidden disabled"}>DESCUBRIR FONDO ↗</button>
        </section>

        </div>
        <div class="vault-note">
          <button class="btn vault-play">VOLVER AL ARCADE</button>
          <button class="btn vault-settings">ELEGIR FONDO EN AJUSTES</button>
        </div>
      </section>`,
  bind(body) {
    const normalize = (s) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    function refresh() {
      body.querySelector(".vault-status").textContent =
        state.vault.matrix && state.vault.gof ? "DESBLOQUEADA" : "SECRETOS GUARDADOS";
      body.querySelectorAll("[data-lock]").forEach((button) => {
        const unlocked = !!state.vault[button.dataset.lock];
        button.classList.toggle("unlocked", unlocked);
        button.querySelector(".vault-lock-caption").textContent = unlocked
          ? "DESBLOQUEADO"
          : "EXPLORAR";
        button.setAttribute(
          "aria-label",
          `${button.dataset.lock === "matrix" ? "Candado izquierdo" : "Candado derecho"}${unlocked ? ", desbloqueado" : ""}`,
        );
        if (unlocked)
          button.querySelector("pre").textContent =
            "   .----.\n   |    |\n .-+----'-.\n |   o   |\n |   |   |\n '-------'";
      });
      body.querySelectorAll("[data-reward]").forEach((btn) => {
        btn.disabled = !state.vault[btn.dataset.reward];
        btn.hidden = btn.disabled;
      });
    }

    body.querySelectorAll("[data-lock]").forEach((button) => {
      button.addEventListener("click", () => {
        const show = button.getAttribute("aria-expanded") !== "true";
        body.querySelectorAll("[data-lock]").forEach((lock) => {
          const active = show && lock === button;
          lock.setAttribute("aria-expanded", String(active));
          body.querySelector(`#vault-question-${lock.dataset.lock}`).hidden = !active;
        });
        if (show) body.querySelector(`#vault-question-${button.dataset.lock} input`).focus();
      });
    });

    const formMatrix = body.querySelector('form[data-key="matrix"]');
    if (formMatrix) {
      formMatrix.onsubmit = (e) => {
        e.preventDefault();
        const input = formMatrix.querySelector("input");
        const a = normalize(input.value);
        const ok = ["morfeo", "morpheus"].includes(a);
        if (ok) {
          state.vault.matrix = true;
          save();
          body.querySelector('[data-feedback="matrix"]').textContent =
            "Llave correcta. Ya puedes activar Matrix verde/azul.";
          refresh();
          input.value = "";
        } else {
          body.querySelector('[data-feedback="matrix"]').textContent =
            "Esa llave no encaja. Piensa en Matrix.";
        }
      };
    }

    const formGof = body.querySelector('form[data-key="gof"]');
    if (formGof) {
      formGof.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = formGof.querySelector("input");
        const a = normalize(input.value);
        const compact = a.replace(/\s+/g, "");
        const ok = compact === "godofwar";
        if (ok) {
          state.vault.gof = true;
          save();
          body.querySelector('[data-feedback="gof"]').textContent =
            "Llave correcta. Ya puedes activar God of War.";
          refresh();
          input.value = "";
        } else {
          body.querySelector('[data-feedback="gof"]').textContent =
            "Esa llave no encaja. Es un favorito muy concreto.";
        }
      });
    }

    body.querySelector('[data-reward="matrix"]')?.addEventListener("click", () => {
      if (!state.vault.matrix) return toast("Primero desbloquea la llave Matrix.");
      state.wallpaper = "matrix";
      state.wp = 4;
      state.atmosphere = "matrixBlue";
      applyTheme();
      save();
      toast("Fondo Matrix verde/azul activado.");
    });

    body.querySelector('[data-reward="gof"]')?.addEventListener("click", () => {
      if (!state.vault.gof) return toast("Primero desbloquea la llave God of War.");
      state.wallpaper = "godOfWar";
      state.atmosphere = "none";
      applyTheme();
      save();
      toast("Fondo God of War activado.");
    });

    body.querySelector('[data-hint="matrix"]').onclick = () => {
      body.querySelector('[data-feedback="matrix"]').textContent =
        "Le ofrece a Neo elegir la pastilla roja o la azul.";
    };
    body.querySelector('[data-hint="gof"]').onclick = () => {
      body.querySelector('[data-feedback="gof"]').textContent =
        "Kratos es el protagonista. Hay otra pista en mis aficiones.";
    };
    body.querySelector(".vault-play")?.addEventListener("click", () => openWindow("arcade"));
    body.querySelector(".vault-settings")?.addEventListener("click", () => openWindow("settings"));
  },
};
