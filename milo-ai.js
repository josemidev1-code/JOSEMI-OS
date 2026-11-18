/* GENERADO: editar src/ o styles/ y ejecutar npm run build. Orden: sources.manifest.json. */
// Contrato común del cliente y el Worker. No incluir credenciales.
const MILO_APP_IDS = [
  "welcome",
  "readme",
  "about",
  "projects",
  "education",
  "skills",
  "terminal",
  "contact",
  "arcade",
  "tetris",
  "pacman",
  "minesweeper",
  "settings",
  "system",
  "easter",
  "screensaver",
  "gallery",
  "notes",
  "calculator",
  "focus",
  "roadmap",
  "launchpad",
  "portfolio",
  "motivation",
  "trash",
];
const MILO_THEME_IDS = ["night", "paper", "violet", "ocean", "sunset", "glacier", "copper"];

// src/milo/player.js: fuente de JOSEMI-OS.
// Reproductor de Milo. Busca en la API pública de iTunes (sin clave) y reproduce la muestra
// de 30 segundos que ofrece Apple. Lo usan la orden directa «pon …» y la herramienta
// play_music de la IA. Recorrido: navegador → itunes.apple.com → JSON → <audio> → pantalla.
const MiloPlayer = (() => {
  // El elemento de audio se crea al primer uso: así el módulo también carga en las pruebas de Node.
  let element = null;
  const media = () => element || (element = createAudio());
  let tracks = [];
  let index = 0;
  let box = null;

  const escapeText = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const mascot = () => document.querySelector("#mascot-button");
  const setDancing = (on) => {
    const m = mascot();
    if (m) m.dataset.music = on ? "on" : "off";
  };

  async function search(query, signal) {
    const url =
      "https://itunes.apple.com/search?term=" +
      encodeURIComponent(String(query).slice(0, 100)) +
      "&media=music&entity=song&limit=5&country=ES";
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("iTunes HTTP " + response.status);
    const data = await response.json();
    return (data.results || [])
      .filter((t) => t.previewUrl)
      .slice(0, 3)
      .map((t) => ({
        name: t.trackName,
        artist: t.artistName,
        preview: t.previewUrl,
        art: (t.artworkUrl100 || "").replace("100x100bb", "200x200bb"),
        link: t.trackViewUrl || t.artistViewUrl || "",
      }));
  }

  // Pinta la tarjeta «sonando ahora» y la lista de alternativas dentro del panel de Milo.
  function render() {
    box = box || document.querySelector(".mascot-results");
    if (!box) return;
    const t = tracks[index];
    if (!t) {
      box.replaceChildren();
      return;
    }
    box.innerHTML = `<div class="milo-player" data-state="${media().paused ? "paused" : "playing"}">
      ${t.art ? `<img class="milo-player__art" src="${escapeText(t.art)}" alt="" width="56" height="56">` : ""}
      <div class="milo-player__info"><small>${media().paused ? "EN PAUSA" : "SONANDO AHORA"}</small><strong>${escapeText(t.name)}</strong><span>${escapeText(t.artist)}</span>
      <div class="milo-player__bar" role="progressbar" aria-label="Progreso de la muestra" aria-valuemin="0" aria-valuemax="30"><i></i></div></div>
      <div class="milo-player__controls"><button type="button" data-player="toggle" aria-label="${media().paused ? "Reproducir" : "Pausar"}">${media().paused ? "▶" : "❚❚"}</button><button type="button" data-player="stop" aria-label="Parar la música">■</button></div>
    </div>
    ${tracks
      .map((x, i) =>
        i === index
          ? ""
          : `<button type="button" class="music-result" data-player-track="${i}">▶ ${escapeText(x.name)} — ${escapeText(x.artist)}</button>`,
      )
      .join("")}
    <small class="milo-player__note">Muestra de 30 s de iTunes${t.link ? ` · <a href="${escapeText(t.link)}" target="_blank" rel="noopener">canción completa ↗</a>` : ""}</small>`;
  }

  function progress() {
    const bar = box?.querySelector(".milo-player__bar");
    if (!bar || !media().duration) return;
    bar.style.setProperty("--progress", (media().currentTime / media().duration) * 100 + "%");
    bar.setAttribute("aria-valuenow", String(Math.round(media().currentTime)));
  }

  async function start(i) {
    index = i;
    media().src = tracks[index].preview;
    let ok = true;
    try {
      await media().play();
    } catch {
      ok = false; // El navegador puede exigir otro clic: la tarjeta queda con ▶.
    }
    render();
    return ok;
  }

  async function play(query, signal) {
    const found = await search(query, signal);
    if (!found.length) return { ok: false, text: `No he encontrado «${query}» en iTunes.` };
    tracks = found;
    const ok = await start(0);
    const t = tracks[0];
    return {
      ok: true,
      playing: ok,
      text: ok
        ? `🎵 Sonando: ${t.name} — ${t.artist} (muestra de 30 s).`
        : `He encontrado ${t.name} — ${t.artist}. Pulsa ▶ para escucharla.`,
      tracks: tracks.map(({ name, artist }) => ({ name, artist, preview_seconds: 30 })),
    };
  }

  function pause() {
    media().pause();
    render();
    return { ok: true, text: "Música en pausa." };
  }
  function resume() {
    if (!tracks.length)
      return { ok: false, text: "No hay ninguna canción. Dime «pon» y un título." };
    media()
      .play()
      .catch(() => {});
    return { ok: true, text: "Sigo con la música." };
  }
  function stop() {
    media().pause();
    media().removeAttribute("src");
    tracks = [];
    setDancing(false);
    render();
    return { ok: true, text: "Música parada." };
  }

  function createAudio() {
    const el = new Audio();
    el.preload = "none";
    el.addEventListener("play", () => {
      setDancing(true);
      render();
    });
    el.addEventListener("pause", () => setDancing(false));
    el.addEventListener("ended", () => {
      setDancing(false);
      render();
    });
    el.addEventListener("timeupdate", progress);
    return el;
  }

  if (typeof document !== "undefined")
    document.addEventListener("click", (event) => {
      const control = event.target.closest("[data-player]");
      if (control) {
        if (control.dataset.player === "toggle") media().paused ? resume() : pause();
        if (control.dataset.player === "stop") stop();
        return;
      }
      const other = event.target.closest("[data-player-track]");
      if (other) start(Number(other.dataset.playerTrack));
    });

  return { play, pause, resume, stop, isPlaying: () => Boolean(element && !element.paused) };
})();
window.MiloPlayer = MiloPlayer;

/* Milo AI: client sense credencials; el Worker executa les APIs protegides. */
const MiloAI = (() => {
  const endpoint = "https://milo-ai.josemidev1.workers.dev";
  const tools = [
    {
      type: "function",
      function: {
        name: "web_search",
        description: "Busca informació actual a Internet.",
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Consulta el temps actual en una ciutat.",
        parameters: {
          type: "object",
          properties: { city: { type: "string" } },
          required: ["city"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "play_music",
        description: "Busca una cançó en iTunes i escolta una mostra.",
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "open_app",
        description: "Obri una app de JOSEMI-OS.",
        parameters: {
          type: "object",
          properties: {
            app: {
              type: "string",
              enum: MILO_APP_IDS,
            },
          },
          required: ["app"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "set_theme",
        description: "Canvia el tema visual de JOSEMI-OS.",
        parameters: {
          type: "object",
          properties: {
            theme: {
              type: "string",
              enum: MILO_THEME_IDS,
            },
          },
          required: ["theme"],
        },
      },
    },
  ];

  // Mantener estas listas y tools sincronizadas con worker.js (prueba automatizada).
  const allowedApps = new Set(MILO_APP_IDS);
  const allowedThemes = new Set(MILO_THEME_IDS);

  async function post(path, payload, signal) {
    const response = await fetch(endpoint + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "API HTTP " + response.status);
    return data;
  }

  // La música la reproduce MiloPlayer (src/milo/player.js), igual que la orden directa «pon …».
  const music = (query, signal) => window.MiloPlayer.play(query, signal);

  async function runTool(call, signal) {
    let args;
    try {
      args = JSON.parse(call.function?.arguments || "{}");
    } catch {
      return { error: "Argumentos JSON no válidos" };
    }
    try {
      switch (call.function?.name) {
        case "web_search":
          return await post("/search", { query: String(args.query || "").slice(0, 250) }, signal);
        case "get_weather":
          return await post("/weather", { city: String(args.city || "").slice(0, 100) }, signal);
        case "play_music":
          return await music(String(args.query || "chill"), signal);
        case "open_app":
          if (!allowedApps.has(args.app)) return { error: "Aplicación desconocida" };
          if (window.PixelOS) return window.PixelOS.perform("open", args.app);
          if (typeof window.openWindow !== "function")
            return { error: "No se puede abrir la aplicación" };
          window.openWindow(args.app);
          return { ok: true, app: args.app };
        case "set_theme":
          if (!allowedThemes.has(args.theme)) return { error: "Tema desconocido" };
          if (typeof window.chooseTheme !== "function")
            return { error: "No se puede cambiar el tema" };
          window.chooseTheme(args.theme);
          return { ok: true, theme: args.theme };
        case "system_action":
          if (!window.PixelOS)
            return { error: "Los controles del escritorio no están disponibles" };
          return window.PixelOS.perform(String(args.action || ""), String(args.value || ""));
        default:
          return { error: "Herramienta no permitida" };
      }
    } catch (error) {
      return { error: error.message || "Error en una herramienta externa" };
    }
  }

  async function reply(text, history = [], externalSignal) {
    const local = window.PixelOS?.command(text);
    if (local) return local;
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (externalSignal?.aborted) controller.abort();
    externalSignal?.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, 28000);
    const messages = [
      ...history
        .filter((m) => ["user", "assistant"].includes(m.role))
        .slice(-12)
        .map((m) => ({ role: m.role, content: String(m.content || "").slice(0, 3000) })),
      { role: "user", content: String(text).slice(0, 500) },
    ];
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const data = await post("/chat", { messages }, controller.signal);
        const message = data.message;
        if (!message || typeof message !== "object")
          throw new Error("Respuesta no válida del proveedor de IA");
        const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
        if (calls.length) {
          messages.push({
            role: "assistant",
            content: typeof message.content === "string" ? message.content : null,
            tool_calls: calls,
          });
          for (const call of calls) {
            const result = await runTool(call, controller.signal);
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(result).slice(0, 3500),
            });
          }
          continue;
        }
        if (typeof message.content === "string" && message.content.trim()) {
          return { text: message.content.trim() };
        }
        throw new Error("Respuesta vacía de la IA");
      }
      throw new Error("Demasiadas acciones consecutivas");
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abort);
    }
  }

  return { reply, playMusic: music, tools };
})();
window.MiloAI = MiloAI;
