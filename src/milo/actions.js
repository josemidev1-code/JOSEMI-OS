// src/milo/actions.js: fuente de JOSEMI-OS.
const face = q("#mascot-button .mascot-svg");
face.insertAdjacentHTML(
  "beforeend",
  '<g class="milo-extra-face"><path class="milo-happy-eyes" d="M14 18h1v-2h4v2h1v2h-2v-2h-2v2h-2zM29 18h1v-2h4v2h1v2h-2v-2h-2v2h-2z" fill="#513b53"/><path class="milo-surprised-mouth" d="M22 21h4v5h-4z" fill="#9d4e77"/><path class="milo-thinking" d="M29 15h6v2h-6z" fill="#513b53"/></g>',
);
// Milo responde dentro del chat, sin bocadillos ni mensajes espontáneos en el escritorio.
q("#mascot-input").addEventListener("input", () => {
  q("#mascot-button").dataset.mood = "thinking";
});
new MutationObserver(() => {
  if (chatBusy) q("#mascot-button").dataset.mood = "thinking";
  else q("#mascot-button").dataset.mood = "happy";
}).observe(q("#mascot-log"), { childList: true, subtree: true });

const aliases = {
  welcome: ["inicio", "escritorio", "home"],
  readme: ["readme", "ayuda"],
  about: ["sobre mi", "sobre josemi", "perfil"],
  projects: ["proyectos"],
  education: ["dam", "estudios", "formacion"],
  skills: ["habilidades"],
  terminal: ["terminal", "consola"],
  contact: ["contacto"],
  arcade: ["arcade", "recreativa"],
  tetris: ["tetris"],
  pacman: ["pacman", "pac man", "pac-man"],
  minesweeper: ["buscaminas", "minas"],
  settings: ["ajustes", "configuracion"],
  system: ["monitor del sistema", "monitor", "informacion del sistema"],
  easter: ["secret vault", "vault", "secretos"],
  screensaver: ["salvapantallas", "ascii studio", "ascii"],
  gallery: ["fondos", "galeria"],
  notes: ["bloc de notas", "notas"],
  calculator: ["calculadora"],
  focus: ["concentracion", "temporizador", "pomodoro"],
  roadmap: ["ia y software", "ia + software", "roadmap"],
  launchpad: ["aplicaciones", "apps"],
  portfolio: ["josemi-os", "josemi os"],
  motivation: ["motivacion"],
  trash: ["papelera"],
};
function findApp(text) {
  return Object.entries(aliases)
    .sort((a, b) => Math.max(...b[1].map((x) => x.length)) - Math.max(...a[1].map((x) => x.length)))
    .find(([, list]) => list.some((a) => text.includes(a)))?.[0];
}
function perform(action, value) {
  const id = String(value || "");
  if (["open", "close", "minimize", "maximize"].includes(action)) {
    if (!Object.hasOwn(Apps, id)) return { ok: false, text: "No encuentro esa aplicación." };
    if (action === "open" && gameIds.includes(id) && !arcadeReady) {
      openWindow("arcade");
      return {
        ok: true,
        text: "Te he abierto Arcade. Inserta la moneda para entrar a los juegos.",
      };
    }
    if (action === "open") openWindow(id);
    else {
      const win = q(`.window[data-id="${id}"]`);
      if (!win) return { ok: false, text: `${Apps[id].title} no está abierta.` };
      q(action === "close" ? ".close" : action === "minimize" ? ".min" : ".max", win).click();
    }
    return {
      ok: true,
      text: `${Apps[id].title}: ${{ open: "abierta", close: "cerrada", minimize: "minimizada", maximize: "tamaño cambiado" }[action]}.`,
    };
  }
  if (action === "wallpaper") {
    if (id === "godOfWar") {
      if (!state.vault.gof)
        return { ok: false, text: "El fondo de God of War se desbloquea en Secret Vault." };
      state.wallpaper = id;
      applyTheme();
      save();
    } else if (!Object.hasOwn(PIXEL_WALLPAPERS, id) || !selectPixelWallpaper(id))
      return { ok: false, text: "Ese fondo no existe en la galería." };
    return { ok: true, text: `Fondo cambiado a ${PIXEL_WALLPAPERS[id]?.name || "God of War"}.` };
  }
  if (action === "theme" && Object.hasOwn(THEMES, id)) {
    chooseTheme(id);
    return { ok: true, text: `Tema ${THEMES[id].name} aplicado.` };
  }
  if (action === "cursor" && Object.hasOwn(CURSORS, id)) {
    state.cursor = id;
    applyShell();
    save();
    return { ok: true, text: `Puntero ${CURSORS[id]} aplicado.` };
  }
  if (action === "sound") {
    state.sound = id === "on";
    applyShell();
    save();
    return { ok: true, text: state.sound ? "Sonidos activados." : "Sonidos desactivados." };
  }
  if (action === "motion") {
    state.motion = id === "off";
    applyTheme();
    save();
    return { ok: true, text: state.motion ? "Movimiento reducido." : "Animaciones activadas." };
  }
  if (action === "atmosphere" && Object.hasOwn(ATMOSPHERES, id)) {
    if (Object.hasOwn(PIXEL_WALLPAPERS, state.wallpaper) || state.wallpaper === "godOfWar")
      return {
        ok: false,
        text: "Este fondo conserva su propia animación. Para usar un efecto ASCII, elige primero un fondo de color en Ajustes.",
      };
    if (id === "matrixBlue" && !state.vault.matrix)
      return { ok: false, text: "Ese efecto se desbloquea en Secret Vault." };
    state.atmosphere = id;
    state.universeUserAtmosphere = true;
    applyTheme();
    save();
    return { ok: true, text: `Animación: ${ATMOSPHERES[id]}.` };
  }
  if (action === "note") {
    openWindow("notes");
    const input = q('.window[data-id="notes"] textarea');
    input.value = (input.value ? input.value + "\n" : "") + id.slice(0, 2000);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return { ok: true, text: "He añadido el texto a tus notas de este navegador." };
  }
  if (action === "calculate") {
    try {
      const result = PixelTools.calculate(id);
      const win = openWindow("calculator");
      win.calculateExpression(id);
      return { ok: true, text: `${id} = ${result}` };
    } catch {
      return { ok: false, text: "No he podido calcular esa operación." };
    }
  }
  if (action === "timer") {
    const mins = Number(id);
    if (!Number.isInteger(mins) || mins < 1 || mins > 180)
      return { ok: false, text: "Elige entre 1 y 180 minutos." };
    openWindow("focus");
    const b = q('.window[data-id="focus"]'),
      input = q("input", b);
    if (input.disabled) q("[data-focus-reset]", b).click();
    input.value = mins;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    q("[data-focus-start]", b).click();
    return { ok: true, text: `Temporizador iniciado: ${mins} minutos.` };
  }
  return {
    ok: false,
    text: "No he realizado esa acción. Puedo abrir, cerrar, minimizar y maximizar apps, cambiar fondos, temas, punteros y animaciones, tomar notas, calcular e iniciar temporizadores.",
  };
}
function command(message) {
  const text = norm(message).replace(/^milo[, :]+/, "");
  let result = null;
  const app = findApp(text),
    opening =
      /^(?:(?:por favor|me puedes|puedes|podrias|quiero que|quiero)[, ]+)?(abre|abrir|open|muestra|lanzar|inicia)\b/.test(
        text,
      );
  if (
    /^(pon|inicia|activa).*(temporizador|pomodoro|concentracion)/.test(text) &&
    /\b\d{1,3}\b/.test(text)
  )
    result = perform("timer", text.match(/\b(\d{1,3})\b/)[1]);
  else if (app && opening) {
    const batch = text.split(/\s+(?:y|and)\s+|,\s*/).map(findApp);
    if (batch.length > 1 && batch.every(Boolean))
      result = {
        ok: true,
        text: [...new Set(batch)].map((id) => perform("open", id).text).join(" "),
      };
    else result = perform("open", app);
  } else if (app && /\b(cierra|cerrar|close)\b/.test(text)) result = perform("close", app);
  else if (app && /\b(minimiza|minimizar)\b/.test(text)) result = perform("minimize", app);
  else if (app && /\b(maximiza|maximizar)\b/.test(text)) result = perform("maximize", app);
  else if (/^(pon|cambia|activa|elige|usar|usa|quiero).*(fondo|wallpaper)/.test(text)) {
    const found = Object.entries(PIXEL_WALLPAPERS).find(
      ([id, w]) =>
        text.includes(norm(w.name)) ||
        text.includes(norm(id)) ||
        text.includes(norm(w.name.split(" · ")[0])),
    );
    if (found) result = perform("wallpaper", found[0]);
    else if (/god of war/.test(text)) result = perform("wallpaper", "godOfWar");
    else {
      openWindow("gallery");
      result = {
        ok: true,
        text: "Aquí tienes todos los fondos. Dime el nombre del que prefieres.",
      };
    }
  } else if (/^(pon|cambia|activa|elige|usa).*(tema)/.test(text)) {
    const found = Object.entries(THEMES).find(
      ([id, t]) => text.includes(norm(t.name)) || text.includes(id),
    );
    if (found) result = perform("theme", found[0]);
  } else if (/^(pon|cambia|activa|elige|usa).*(puntero|cursor)/.test(text)) {
    const found = Object.entries(CURSORS).find(
      ([id, name]) => text.includes(norm(name)) || text.includes(id),
    );
    if (found) result = perform("cursor", found[0]);
  } else if (/^(silencia|quita el sonido|desactiva.*sonido)/.test(text))
    result = perform("sound", "off");
  else if (/^activa.*sonido/.test(text)) result = perform("sound", "on");
  else if (/^(reduce|desactiva|quita).*(movimiento|animaciones)/.test(text))
    result = perform("motion", "off");
  else if (/^activa.*(animaciones|movimiento)/.test(text)) result = perform("motion", "on");
  else if (/^(pon|cambia|activa).*(lluvia|tormenta|nieve|particulas|matrix|estrellas)/.test(text)) {
    const found = Object.entries(ATMOSPHERES).find(
      ([id, name]) => text.includes(norm(name)) || text.includes(norm(id)),
    );
    if (found) result = perform("atmosphere", found[0]);
  } else if (/^calcula\s+/.test(text))
    result = perform("calculate", message.replace(/^.*?calcula\s+/i, ""));
  else if (/^anota\s+/.test(text)) result = perform("note", message.replace(/^.*?anota\s+/i, ""));
  else if (/^(pon|inicia|activa).*(temporizador|pomodoro|concentracion)/.test(text)) {
    const n = text.match(/\b(\d{1,3})\b/);
    if (n) result = perform("timer", n[1]);
  }
  if (result) {
    q("#mascot-button").dataset.mood = result.ok ? "happy" : "surprised";
    return { text: result.text };
  }
  return null;
}
window.PixelOS = { perform, command, apps: desktopApps.slice() };
