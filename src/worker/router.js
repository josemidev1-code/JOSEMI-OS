// src/worker/router.js: fuente de JOSEMI-OS.
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin && !ORIGINS.has(origin)) return json({ error: "Origen no permitido" }, 403, origin);
    if (request.method === "OPTIONS") {
      if (!ORIGINS.has(origin)) return json({ error: "Origen no permitido" }, 403, origin);
      return new Response(null, { status: 204, headers: headers(origin) });
    }

    const path = new URL(request.url).pathname;
    if (path === "/health" && request.method === "GET") {
      return json({ ok: true }, 200, origin);
    }
    if (!["/chat", "/search", "/weather"].includes(path))
      return json({ error: "Ruta no encontrada" }, 404, origin);
    if (request.method !== "POST") return json({ error: "Esta ruta requiere POST" }, 405, origin);
    // CORS no autentica: el límite por IP protege también frente a un Origin falsificado.
    if (!ORIGINS.has(origin)) return json({ error: "Origen no permitido" }, 403, origin);
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json({ error: "Content-Type debe ser application/json" }, 415, origin);
    }

    let payload;
    try {
      const body = await request.text();
      if (new TextEncoder().encode(body).byteLength > 18000)
        return json({ error: "Petición demasiado grande" }, 413, origin);
      payload = JSON.parse(body);
    } catch {
      return json({ error: "JSON incorrecto" }, 400, origin);
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return json({ error: "JSON incorrecto" }, 400, origin);
    }

    // CF-Connecting-IP lo establece Cloudflare; no usamos cabeceras elegidas por el cliente.
    const ip = request.headers.get("CF-Connecting-IP");
    try {
      if (!ip || !env.MILO_RATE_LIMITER) throw new Error("Rate limiter unavailable");
      const { success } = await env.MILO_RATE_LIMITER.limit({ key: "milo-api:" + ip });
      if (!success)
        return json(
          { error: "Has hecho demasiadas consultas. Espera un minuto e inténtalo de nuevo." },
          429,
          origin,
          { "Retry-After": "60" },
        );
    } catch {
      return json(
        { error: "Milo no está disponible temporalmente. Inténtalo más tarde." },
        503,
        origin,
      );
    }

    if (path === "/chat") return chat(payload, env, origin);
    if (path === "/search") return search(payload, env, origin);
    return weather(payload, origin);
  },
};
