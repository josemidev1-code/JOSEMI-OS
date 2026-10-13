/**
 * MILO API — Cloudflare Worker para JOSEMI-OS.
 * Secrets de Cloudflare (NUNCA van al frontend):
 *  GROQ_API_KEY (obligatorio), TAVILY_API_KEY (opcional para búsqueda web).
 * Config opcional: GROQ_MODEL, y un binding MILO_RATE_LIMITER (rate limiting).
 */

const MODEL = 'llama-3.3-70b-versatile';
const ALLOWED_ORIGINS = new Set([
  'https://josemidev1.site',
  'https://www.josemidev1.site',
]);
const SYSTEM = `Eres MILO, un ajolote de compañía que vive en JOSEMI-OS, portfolio interactivo de José Miguel Miralles Gandia (Josemi).
DATOS PÚBLICOS VERIFICADOS DEL PORTFOLIO:
- Josemi es estudiante de Desarrollo de Aplicaciones Multiplataforma (DAM) en el IES Dr. Lluís Simarro y desarrollador en formación.
- Su web JOSEMI-OS usa HTML, CSS y JavaScript sin frameworks.
- Le interesan la programación, IA, automatización, gimnasio y e-commerce.
- JOSEMI-OS tiene aplicaciones de proyectos, habilidades, terminal, Arcade, ajustes y contacto.
- GitHub: josemidev1-code. Email de contacto público: josemidev1@gmail.com.
REGLAS:
- Responde en el idioma del visitante (valencià/català, castellano o inglés), en 2-4 frases normalmente.
- Nunca inventes datos personales, experiencia laboral, precios, notas o logros.
- Para información de actualidad, usa web_search si está disponible; no simules búsquedas.
- Puedes usar play_music, open_app y set_theme para controlar JOSEMI-OS.
- Si usas resultados web, incluye al menos un enlace de fuente en tu respuesta.
- Tono amable, simpático y un poco travieso; eres un ajolote.`;

const fn = (name, description, properties, required) => ({
  type: 'function',
  function: { name, description, parameters: { type: 'object', properties, required, additionalProperties: false } },
});
const BASE_TOOLS = [
  fn('play_music', 'Busca música y muestra vistas previas reproducibles (30 segundos) con enlace a YouTube.', { query: { type: 'string' } }, ['query']),
  fn('open_app', 'Abre una aplicación en el escritorio JOSEMI-OS.', { app: { type: 'string', enum: ['about', 'projects', 'skills', 'terminal', 'contact', 'arcade', 'settings'] } }, ['app']),
  fn('set_theme', 'Cambia el tema visual del escritorio.', { theme: { type: 'string', enum: ['night', 'paper', 'violet', 'ocean', 'sunset'] } }, ['theme']),
];
const SEARCH_TOOL = fn('web_search', 'Busca datos externos, actualizados o noticias por Internet. Devuelve resultados con URLs.', { query: { type: 'string' } }, ['query']);

function allowedOrigin(origin) {
  // Para desarrollar con un servidor HTTP local: http://localhost:5500, 127.0.0.1:8000, etc.
  return !origin || ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(origin);
}
function cors(origin) {
  const headers = { Vary: 'Origin', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' };
  if (origin && allowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '600';
  }
  return headers;
}
function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), { status, headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8' } });
}
function slimHistory(messages) {
  if (!Array.isArray(messages)) return [];
  // El prompt del sistema y la lista de tools los impone el Worker, no el visitante.
  const out = [];
  for (const m of messages.slice(-16)) {
    if (!m || typeof m !== 'object') continue;
    if (m.role === 'user' && typeof m.content === 'string') {
      out.push({ role: 'user', content: m.content.slice(0, 500) });
    } else if (m.role === 'assistant') {
      const entry = { role: 'assistant', content: typeof m.content === 'string' ? m.content.slice(0, 3000) : null };
      if (Array.isArray(m.tool_calls)) {
        const calls = m.tool_calls.slice(0, 3).filter(c =>
          typeof c?.id === 'string' && typeof c?.function?.name === 'string' &&
          ['web_search', 'play_music', 'open_app', 'set_theme'].includes(c.function.name)
        ).map(c => ({ id: c.id.slice(0, 100), type: 'function', function: { name: c.function.name, arguments: String(c.function.arguments || '{}').slice(0, 700) } }));
        if (calls.length) entry.tool_calls = calls;
      }
      out.push(entry);
    } else if (m.role === 'tool' && typeof m.tool_call_id === 'string' && typeof m.content === 'string') {
      out.push({ role: 'tool', tool_call_id: m.tool_call_id.slice(0, 100), content: m.content.slice(0, 4000) });
    }
  }
  // No iniciar con una respuesta tool huérfana si se ha recortado el historial.
  while (out.length && out[0].role === 'tool') out.shift();
  return out;
}
async function askGroq(messages, env, origin) {
  if (!env.GROQ_API_KEY) return json({ error: 'Falta configurar GROQ_API_KEY en los Secrets de Cloudflare.' }, 503, origin);
  if (!messages.length || !messages.some(m => m.role === 'user')) return json({ error: 'Falta un mensaje de usuario válido.' }, 400, origin);
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.GROQ_MODEL || MODEL,
        messages: [{ role: 'system', content: SYSTEM }, ...messages],
        tools: env.TAVILY_API_KEY ? [...BASE_TOOLS, SEARCH_TOOL] : BASE_TOOLS,
        tool_choice: 'auto',
        parallel_tool_calls: false,
        temperature: 0.5,
        max_completion_tokens: 500,
      }),
    });
    if (!r.ok) {
      console.error('Groq API status', r.status); // No imprimir tokens ni datos del usuario.
      return json({ error: 'Error del proveedor de IA.', upstream_status: r.status }, r.status === 429 ? 429 : 502, origin);
    }
    const data = await r.json();
    if (!data?.choices?.[0]?.message) return json({ error: 'El proveedor no devolvió respuesta.' }, 502, origin);
    return json({ message: data.choices[0].message }, 200, origin);
  } catch (err) {
    console.error('Fallo de red con Groq', err?.name);
    return json({ error: 'No se pudo conectar con el proveedor de IA.' }, 502, origin);
  }
}
async function searchWeb(query, env, origin) {
  if (!env.TAVILY_API_KEY) return json({ error: 'Falta configurar TAVILY_API_KEY.' }, 503, origin);
  if (typeof query !== 'string' || !query.trim() || query.length > 300) return json({ error: 'Búsqueda vacía o demasiado larga.' }, 400, origin);
  try {
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.TAVILY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), search_depth: 'basic', max_results: 3, include_answer: false, include_raw_content: false, include_images: false }),
    });
    if (!r.ok) {
      console.error('Tavily API status', r.status);
      return json({ error: 'Error al buscar en Internet.', upstream_status: r.status }, r.status === 429 ? 429 : 502, origin);
    }
    const data = await r.json();
    return json({ query: query.trim(), results: (data.results || []).slice(0, 3).map(x => ({ title: String(x.title || '').slice(0, 150), url: x.url, content: String(x.content || '').slice(0, 450) })) }, 200, origin);
  } catch (err) {
    console.error('Fallo de red con Tavily', err?.name);
    return json({ error: 'No se pudo hacer la búsqueda.' }, 502, origin);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (!allowedOrigin(origin)) return json({ error: 'Origen no permitido.' }, 403, origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, groq: Boolean(env.GROQ_API_KEY), tavily: Boolean(env.TAVILY_API_KEY) }, 200, origin);
    }
    if (!['/chat', '/search'].includes(url.pathname)) return json({ error: 'Ruta no encontrada.' }, 404, origin);
    if (request.method !== 'POST') return json({ error: 'Usa POST.' }, 405, origin);
    if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ error: 'Se esperaba JSON.' }, 415, origin);
    // Si se configura un binding RATE LIMITER en Cloudflare, se aplica automáticamente.
    if (env.MILO_RATE_LIMITER) {
      const key = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.MILO_RATE_LIMITER.limit({ key });
      if (!success) return json({ error: 'Demasiadas peticiones; inténtalo en un minuto.' }, 429, origin);
    }
    if (Number(request.headers.get('Content-Length') || 0) > 20000) return json({ error: 'Petición demasiado grande.' }, 413, origin);
    let payload;
    try {
      const body = await request.text();
      if (body.length > 20000) return json({ error: 'Petición demasiado grande.' }, 413, origin);
      payload = JSON.parse(body);
    } catch {
      return json({ error: 'JSON incorrecto.' }, 400, origin);
    }
    if (url.pathname === '/chat') return askGroq(slimHistory(payload?.messages), env, origin);
    return searchWeb(payload?.query, env, origin);
  },
};
