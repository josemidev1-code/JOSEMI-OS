// src/worker/search.js: fuente de JOSEMI-OS.
async function search(payload, env, origin) {
  if (!env.TAVILY_API_KEY)
    return json({ error: "La búsqueda web no está disponible temporalmente." }, 503, origin);
  const query = typeof payload.query === "string" ? payload.query.trim().slice(0, 250) : "";
  if (!query) return json({ error: "Consulta vacía" }, 400, origin);

  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: "Bearer " + env.TAVILY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
        include_raw_content: false,
      }),
    });
    if (!r.ok) return json({ error: "El buscador no está disponible" }, 502, origin);
    const data = await r.json();
    return json(
      {
        source: "Tavily",
        results: (data.results || []).slice(0, 3).map((item) => ({
          title: String(item.title || "").slice(0, 150),
          url: String(item.url || "").slice(0, 500),
          content: String(item.content || "").slice(0, 600),
        })),
      },
      200,
      origin,
    );
  } catch (error) {
    if (timedOut(error))
      return json({ error: "La búsqueda ha tardado demasiado. Inténtalo de nuevo." }, 504, origin);
    return json({ error: "No se puede contactar con el buscador" }, 502, origin);
  }
}
