// src/apps/settings.js: fuente de JOSEMI-OS.
Apps.settings = {
  title: "Ajustes",
  icon: pixelIcon("settings"),
  size: [900, 760],
  render: () => `
      <div class="preferences preferences--updates">
        <aside class="preferences-nav">
          <span class="card-kicker">PERSONALIZA TU ESPACIO</span>
          <h2>Ajustes</h2>
          <a href="#pref-theme">01 / Apariencia</a>
          <a href="#pref-wallpaper">02 / Fondo</a>
          <a href="#pref-cursor">03 / Cursor</a>
          <a href="#pref-motion">04 / Movimiento</a>
          <a href="#pref-screen">05 / Salvapantallas</a>
          <div class="preferences-note">Se guarda en este navegador.<br>Tu escritorio, a tu manera.</div>
        </aside>
        <div class="preferences-main">
          <section id="pref-theme">
            <span class="card-kicker">01 / APARIENCIA</span>
            <h3>Un ambiente para cada idea.</h3>
            <div class="theme-picker">
              ${Object.entries(THEMES)
                .map(
                  ([id, t]) => `
                <button data-theme="${id}" class="theme-option ${state.theme === id ? "selected" : ""}" aria-pressed="${state.theme === id}">
                  <span class="theme-mini" style="--sample-bg:${t.bg};--sample-color:${t.accent}"><i></i><b>J</b><em></em></span>${t.name}
                </button>
              `,
                )
                .join("")}
            </div>
            <label class="pref-row">Color de acento<input class="accent-input" type="color" value="${state.accent}" aria-label="Color de acento"></label>
          </section>

          <section id="pref-wallpaper">
            <span class="card-kicker">02 / FONDO</span>
            <h3>Elige tu fondo.</h3>
            <div class="wallpaper-picker">
              ${Object.entries(PIXEL_WALLPAPERS)
                .map(
                  ([id, wall]) =>
                    `<button class="wallpaper-option wallpaper-option--pixel ${state.wallpaper === id ? "selected" : ""}" data-wallpaper="${id}" aria-pressed="${state.wallpaper === id}"><span class="wallpaper-preview" style="background-image:url('${wall.url}')" aria-hidden="true"></span><b>${wall.name}</b><small>${wall.detail}</small></button>`,
                )
                .join("")}
              ${[0, 1, 2, 3]
                .map(
                  (i) => `
                <button class="wallpaper-option ${state.wallpaper === "static" && state.wp === i ? "selected" : ""}" data-wallpaper="static${i}">
                  Gradiente ${i + 1}<small>${["Aurora", "Bosque", "Azul profundo", "Violeta"][i]}</small>
                </button>
              `,
                )
                .join("")}
              <button class="wallpaper-option ${state.wallpaper === "matrix" ? "selected" : ""}" data-wallpaper="matrix" ${state.vault.matrix ? "" : "disabled"}>Matrix verde/azul<small>${state.vault.matrix ? "Fondo especial desbloqueado" : "Bloqueado en Secret Vault"}</small></button>
              <button class="wallpaper-option ${state.wallpaper === "godOfWar" ? "selected" : ""}" data-wallpaper="godOfWar" ${state.vault.gof ? "" : "disabled"}>
                God of War<small>${state.vault.gof ? "Imagen personalizada" : "Bloqueada en Secret Vault"}</small>
              </button>
            </div>

            <label class="pref-row" style="margin-top:18px">Fondo animado
              <select data-setting="atmosphere">
                ${Object.entries(ATMOSPHERES)
                  .map(
                    ([id, label]) =>
                      `<option value="${id}" ${id === "matrixBlue" && !state.vault.matrix ? "disabled" : ""}>${label}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label class="pref-row">Densidad
              <input type="range" min="15" max="90" step="5" data-setting="weatherDensity" aria-label="Densidad del fondo">
            </label>
            <label class="pref-row">Velocidad
              <select data-setting="weatherSpeed">
                <option value="0.5">Contemplativa</option>
                <option value="1">Natural</option>
                <option value="1.5">Enérgica</option>
              </select>
            </label>
          </section>

          <section id="pref-cursor">
            <span class="card-kicker">03 / CURSOR</span>
            <h3>Elige cómo señalar el mundo.</h3>
            <div class="cursor-picker">
              ${Object.entries(CURSORS)
                .map(
                  ([id, label]) => `
                <button data-cursor="${id}" class="cursor-option ${state.cursor === id ? "selected" : ""}" aria-pressed="${state.cursor === id}">
                  <span>${id === "system" ? "↖" : cursorSVG(id, 30)}</span>${label}
                </button>
              `,
                )
                .join("")}
            </div>
            <label class="pref-row">Tamaño
              <select data-setting="cursorSize">
                <option value="20">Pequeño</option>
                <option value="24">Mediano</option>
                <option value="32">Grande</option>
              </select>
            </label>
            <div class="cursor-test">Prueba el cursor aquí. No hay círculo ni rastro.</div>
          </section>

          <section id="pref-motion">
            <span class="card-kicker">04 / MOVIMIENTO</span>
            <h3>Que el sistema respire.</h3>
            <label class="pref-row">Animación ASCII
              <select data-setting="bootEffect">
                ${Object.entries(EFFECTS)
                  .map(
                    ([id, label]) =>
                      `<option value="${id}" ${id === "matrixBlue" && !state.vault.matrix ? "disabled" : ""}>${label}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label class="pref-row">Intensidad
              <select data-setting="intensity">
                <option value="full">Expresiva</option>
                <option value="calm">Suave</option>
              </select>
            </label>
            <label class="pref-row">Reducir movimiento<input type="checkbox" data-setting="motion" ${state.motion ? "checked" : ""}></label>
            <label class="pref-row">Textura de papel<input type="checkbox" data-setting="grain" ${state.grain ? "checked" : ""}></label>
            <label class="pref-row">Sonidos del sistema<input type="checkbox" data-setting="sound" ${state.sound ? "checked" : ""}></label>
            <button class="btn preview-ascii">VER ANIMACIÓN ASCII ↗</button>
          </section>

          <section id="pref-screen">
            <span class="card-kicker">05 / SALVAPANTALLAS</span>
            <h3>Arte cuando te tomas un descanso.</h3>
            <label class="pref-row">Iniciar tras inactividad
              <select data-setting="idle">
                <option value="0">Solo manualmente</option>
                <option value="60">1 minuto</option>
                <option value="180">3 minutos</option>
              </select>
            </label>
            <button class="btn start-saver">ABRIR SALVAPANTALLAS ↗</button>
          </section>
        </div>
      </div>`,
  bind(body) {
    for (const el of $$("[data-setting]", body)) {
      const key = el.dataset.setting;
      if (el.type !== "checkbox") el.value = String(state[key]);
      el.addEventListener(el.type === "range" ? "input" : "change", () => {
        if (key === "atmosphere" && el.value === "matrixBlue" && !state.vault.matrix) {
          el.value = state.atmosphere;
          toast("El fondo especial Matrix se desbloquea en Secret Vault.");
          return;
        }
        state[key] =
          el.type === "checkbox"
            ? el.checked
            : ["idle", "wp", "cursorSize", "weatherDensity", "weatherSpeed"].includes(key)
              ? Number(el.value)
              : el.value;

        // La animación y la imagen son independientes: cambiar un efecto no borra el fondo.
        if (key === "atmosphere") state.universeUserAtmosphere = true;

        if (key === "sound" && state.sound && typeof beep === "function") beep();
        applyTheme();
        save();
      });
    }

    $$("[data-theme]", body).forEach((button) => {
      button.onclick = () => {
        chooseTheme(button.dataset.theme);
        $$("[data-theme]", body).forEach((b) => {
          const on = b === button;
          b.classList.toggle("selected", on);
          b.setAttribute("aria-pressed", on);
        });
        const accentInput = $(".accent-input", body);
        if (accentInput) accentInput.value = state.accent;
      };
    });

    $$("[data-wallpaper]", body).forEach((button) => {
      if (button.disabled) return;
      button.onclick = () => {
        const val = button.dataset.wallpaper;
        if (val === "godOfWar" && !state.vault.gof)
          return toast("Desbloquea God of War en Secret Vault.");
        if (val === "matrix" && !state.vault.matrix)
          return toast("Desbloquea la llave Matrix en Secret Vault.");
        if (PIXEL_WALLPAPERS[val]) {
          selectPixelWallpaper(val);
        } else if (val === "matrix") {
          state.wallpaper = "matrix";
          state.wp = 4;
          state.atmosphere = "matrixBlue";
        } else if (val === "godOfWar") {
          state.wallpaper = "godOfWar";
          state.atmosphere = "none";
        } else {
          state.wallpaper = "static";
          state.wp = Number(val.replace("static", ""));
          state.atmosphere = "none";
        }
        applyTheme();
        save();
        $$("[data-wallpaper]", body).forEach((x) => {
          x.classList.toggle("selected", x === button);
          x.setAttribute("aria-pressed", String(x === button));
        });
      };
    });

    $$("[data-cursor]", body).forEach((button) => {
      button.onclick = () => {
        state.cursor = button.dataset.cursor;
        applyShell();
        save();
        $$("[data-cursor]", body).forEach((b) => {
          const on = b === button;
          b.classList.toggle("selected", on);
          b.setAttribute("aria-pressed", on);
        });
      };
    });

    const accentInput = $(".accent-input", body);
    if (accentInput)
      accentInput.oninput = (e) => {
        state.accent = e.target.value;
        applyTheme();
        save();
      };

    $(".preview-ascii", body)?.addEventListener("click", () => openWindow("screensaver"));
    $(".start-saver", body)?.addEventListener("click", () => showScreensaver());
  },
};
