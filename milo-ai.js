/* Milo AI: client sense credencials; el Worker executa les APIs protegides. */
const MiloAI = (() => {
  const endpoint = "https://milo-ai.josemidev1.workers.dev";
  const tools = [
    {
      type: "function",
      function: {
        name: "web_search",
        description: "Busca informació actual a Internet.",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
      }
    },
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Consulta el temps actual en una ciutat.",
        parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] }
      }
    },
    {
      type: "function",
      function: {
        name: "play_music",
        description: "Busca una cançó en iTunes i escolta una mostra.",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
      }
    },
    {
      type: "function",
      function: {
        name: "open_app",
        description: "Obri una app de JOSEMI-OS.",
        parameters: {
          type: "object",
          properties: { app: { type: "string", enum: ["welcome", "readme", "about", "projects", "education", "skills", "terminal", "contact", "arcade", "tetris", "pacman", "minesweeper", "settings", "system", "easter", "screensaver", "gallery", "notes", "calculator", "focus", "roadmap", "launchpad", "portfolio", "motivation", "trash"] } },
          required: ["app"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "set_theme",
        description: "Canvia el tema visual de JOSEMI-OS.",
        parameters: {
          type: "object",
          properties: { theme: { type: "string", enum: ["night", "paper", "violet", "ocean", "sunset", "glacier", "copper"] } },
          required: ["theme"]
        }
      }
    }
  ];

  let player = null;
  let resultsBox = null;
  // Mantener estas listas y tools sincronizadas con worker.js (prueba automatizada).
  const allowedApps = new Set(["welcome", "readme", "about", "projects", "education", "skills", "terminal", "contact", "arcade", "tetris", "pacman", "minesweeper", "settings", "system", "easter", "screensaver", "gallery", "notes", "calculator", "focus", "roadmap", "launchpad", "portfolio", "motivation", "trash"]);
  const allowedThemes = new Set(["night", "paper", "violet", "ocean", "sunset", "glacier", "copper"]);

  async function post(path, payload, signal) {
    const response = await fetch(endpoint + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "API HTTP " + response.status);
    return data;
  }

  async function music(query, signal) {
    const url = "https://itunes.apple.com/search?term=" + encodeURIComponent(query.slice(0, 100)) + "&media=music&entity=song&limit=3";
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("iTunes HTTP " + response.status);
    const data = await response.json();
    const tracks = (data.results || []).filter(t => t.previewUrl).slice(0, 3);
    if (!tracks.length) return { error: "No se han encontrado canciones" };
    if (!player) player = new Audio();
    player.src = tracks[0].previewUrl;
    player.play().catch(() => {});
    if (!resultsBox) resultsBox = document.querySelector(".mascot-results");
    if (resultsBox) {
      resultsBox.replaceChildren();
      for (const track of tracks) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = track.trackName + " — " + track.artistName + " ▶";
        button.addEventListener("click", () => {
          player.src = track.previewUrl;
          player.play().catch(() => {});
        });
        resultsBox.appendChild(button);
      }
    }
    return {
      source: "iTunes Search API",
      tracks: tracks.map(t => ({
        name: t.trackName, artist: t.artistName,
        preview_seconds: 30,
        artist_link: t.artistViewUrl || ""
      })),
      note: "Se muestran hasta 3 canciones, con muestras de 30 segundos."
    };
  }

  async function runTool(call, signal) {
    let args;
    try { args = JSON.parse(call.function?.arguments || "{}"); }
    catch { return { error: "Argumentos JSON no válidos" }; }
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
          if (typeof window.openWindow !== "function") return { error: "No se puede abrir la aplicación" };
          window.openWindow(args.app);
          return { ok: true, app: args.app };
        case "set_theme":
          if (!allowedThemes.has(args.theme)) return { error: "Tema desconocido" };
          if (typeof window.chooseTheme !== "function") return { error: "No se puede cambiar el tema" };
          window.chooseTheme(args.theme);
          return { ok: true, theme: args.theme };
        case "system_action":
          if (!window.PixelOS) return { error: "Los controles del escritorio no están disponibles" };
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
      ...history.filter(m => ["user", "assistant"].includes(m.role))
        .slice(-12).map(m => ({ role: m.role, content: String(m.content || "").slice(0, 3000) })),
      { role: "user", content: String(text).slice(0, 500) }
    ];
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const data = await post("/chat", { messages }, controller.signal);
        const message = data.message;
        if (!message || typeof message !== "object") throw new Error("Respuesta no válida del proveedor de IA");
        const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
        if (calls.length) {
          messages.push({
            role: "assistant",
            content: typeof message.content === "string" ? message.content : null,
            tool_calls: calls
          });
          for (const call of calls) {
            const result = await runTool(call, controller.signal);
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(result).slice(0, 3500)
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
