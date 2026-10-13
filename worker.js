
const MODEL = "llama-3.3-70b-versatile";

const ORIGINS = [
  "https://josemidev1.site",
  "https://www.josemidev1.site"
];

const SYSTEM = `Eres Milo, el ajolote asistente de JOSEMI-OS, el portfolio de Josemi.

Josemi estudia DAM, programa con HTML, CSS y JavaScript y le interesan la IA, las automatizaciones, el gimnasio y el comercio electrónico.

La web tiene proyectos, habilidades, terminal, Arcade, ajustes y contacto.

Contesta en el idioma del visitante, normalmente en 2-4 frases.
No inventes información personal sobre Josemi.
Para noticias o datos actuales, usa web_search.
Puedes usar play_music, open_app y set_theme.
Si utilizas resultados web, cita sus enlaces.`;

const tool = (name, description, properties, required) => ({
  type: "function",
  function: {
    name,
    description,
    parameters: {
      type: "object",
      properties,
      required
    }
  }
});

const TOOLS = [
  tool(
    "web_search",
    "Busca datos actuales en Internet.",
    { query: { type: "string" } },
    ["query"]
  ),
  tool(
    "play_music",
    "Reproduce una canción en Milo.",
    { query: { type: "string" } },
    ["query"]
  ),
  tool(
    "open_app",
    "Abre una aplicación de JOSEMI-OS.",
    {
      app: {
        type: "string",
        enum: [
          "about", "projects", "skills",
          "terminal", "contact", "arcade", "settings"
        ]
      }
    },
    ["app"]
  ),
  tool(
    "set_theme",
    "Cambia el tema visual.",
    {
      theme: {
        type: "string",
        enum: [
          "night", "paper", "violet",
          "ocean", "sunset"
        ]
      }
    },
    ["theme"]
  )
];

function cors(origin) {
  const h = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };

  if (origin && ORIGINS.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  }

  return h;
}

function reply(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors(origin)
  });
}

function cleanMessages(input) {
  if (!Array.isArray(input)) return [];

  return input.slice(-16).flatMap(m => {
    if (!m || typeof m !== "object") return [];

    if (m.role === "user" && typeof m.content === "string") {
      return [{
        role: "user",
        content: m.content.slice(0, 500)
      }];
    }

    if (m.role === "assistant") {
      const msg = {
        role: "assistant",
        content: typeof m.content === "string"
          ? m.content.slice(0, 3000)
          : null
      };

      if (Array.isArray(m.tool_calls)) {
        msg.tool_calls = m.tool_calls.slice(0, 3)
          .filter(c =>
            typeof c?.id === "string" &&
            TOOLS.some(t => t.function.name === c.function?.name)
          )
          .map(c => ({
            id: c.id,
            type: "function",
            function: {
              name: c.function.name,
              arguments: String(c.function.arguments || "{}").slice(0, 700)
            }
          }));
      }

      return [msg];
    }

    if (
      m.role === "tool" &&
      typeof m.tool_call_id === "string" &&
      typeof m.content === "string"
    ) {
      return [{
        role: "tool",
        tool_call_id: m.tool_call_id,
        content: m.content.slice(0, 4000)
      }];
    }

    return [];
  });
}

async function chat(payload, env, origin) {
  if (!env.GROQ_API_KEY) {
    return reply({
      error: "Falta GROQ_API_KEY en Secrets del Worker"
    }, 503, origin);
  }

  const messages = cleanMessages(payload.messages);

  if (!messages.some(m => m.role === "user")) {
    return reply({ error: "Falta el missatge" }, 400, origin);
  }

  try {
    const r = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM },
            ...messages
          ],
          tools: env.TAVILY_API_KEY
            ? TOOLS
            : TOOLS.filter(t => t.function.name !== "web_search"),
          tool_choice: "auto",
          parallel_tool_calls: false,
          temperature: 0.5,
          max_completion_tokens: 500
        })
      }
    );

    if (!r.ok) {
      return reply({
        error: `Groq ha retornat HTTP ${r.status}`
      }, 502, origin);
    }

    const data = await r.json();

    if (!data.choices?.[0]?.message) {
      return reply({
        error: "Resposta buida de Groq"
      }, 502, origin);
    }

    return reply({
      message: data.choices[0].message
    }, 200, origin);

  } catch (e) {
    console.error("Groq network error", e?.name);

    return reply({
      error: "No es pot connectar amb Groq"
    }, 502, origin);
  }
}

async function search(payload, env, origin) {
  if (!env.TAVILY_API_KEY) {
    return reply({
      error: "Falta TAVILY_API_KEY en Secrets del Worker"
    }, 503, origin);
  }

  const query = typeof payload.query === "string"
    ? payload.query.trim().slice(0, 300)
    : "";

  if (!query) {
    return reply({ error: "Consulta buida" }, 400, origin);
  }

  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.TAVILY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
        include_raw_content: false
      })
    });

    if (!r.ok) {
      return reply({
        error: `Tavily ha retornat HTTP ${r.status}`
      }, 502, origin);
    }

    const data = await r.json();

    return reply({
      results: (data.results || []).slice(0, 3).map(x => ({
        title: String(x.title || "").slice(0, 150),
        url: String(x.url || "").slice(0, 500),
        content: String(x.content || "").slice(0, 600)
      }))
    }, 200, origin);

  } catch (e) {
    console.error("Tavily network error", e?.name);

    return reply({
      error: "No es pot connectar amb Tavily"
    }, 502, origin);
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (origin && !ORIGINS.includes(origin)) {
      return reply({ error: "Origen no permés" }, 403, origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: cors(origin)
      });
    }

    const path = new URL(request.url).pathname;

    if (path === "/health" && request.method === "GET") {
      return reply({
        ok: true,
        groq: !!env.GROQ_API_KEY,
        tavily: !!env.TAVILY_API_KEY
      }, 200, origin);
    }

    if (!["/chat", "/search"].includes(path)) {
      return reply({ error: "Ruta no trobada" }, 404, origin);
    }

    if (request.method !== "POST") {
      return reply({ error: "Cal fer POST" }, 405, origin);
    }

    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return reply({
        error: "Content-Type ha de ser application/json"
      }, 415, origin);
    }

    let payload;

    try {
      const body = await request.text();

      if (body.length > 20000) {
        return reply({ error: "Petició massa gran" }, 413, origin);
      }

      payload = JSON.parse(body);

    } catch {
      return reply({ error: "JSON incorrecte" }, 400, origin);
    }

    if (!payload || typeof payload !== "object") {
      return reply({ error: "JSON incorrecte" }, 400, origin);
    }

    return path === "/chat"
      ? chat(payload, env, origin)
      : search(payload, env, origin);
  }
};
