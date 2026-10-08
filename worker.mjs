const DEFAULT_ORIGINS = [
  'https://josemidev1.site',
  'https://www.josemidev1.site',
  'https://milo-ai.josemidev1.workers.dev',
  'http://127.0.0.1:8000',
  'http://localhost:8000',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/chat') {
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
    }
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS.join(',')).split(',').map(s => s.trim());
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
    if (origin && !allowed.includes(origin)) {
      return Response.json({ error: 'Origin not allowed' }, { status: 403, headers });
    }
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    const json = (body, status = 200) => Response.json(body, { status, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Use POST /chat' }, 405);
    if (!env.GROQ_API_KEY) return json({ error: 'Milo is missing its Groq configuration' }, 503);
    let body;
    try {
      const text = await request.text();
      if (text.length > 64000) return json({ error: 'Request too large' }, 413);
      body = JSON.parse(text);
    } catch { return json({ error: 'Invalid JSON' }, 400); }
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 40 ||
        body.messages.some(m => !m || !['system', 'user', 'assistant', 'tool'].includes(m.role) ||
          (typeof m.content !== 'string' && !(m.role === 'assistant' && m.content === null && Array.isArray(m.tool_calls)))) ||
        (body.tools !== undefined && (!Array.isArray(body.tools) || body.tools.length > 8))) {
      return json({ error: 'Invalid chat request' }, 400);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: body.messages,
          ...(body.tools?.length ? { tools: body.tools, tool_choice: 'auto' } : {}),
          max_completion_tokens: 600,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        // Do not expose provider responses, configuration or credentials to clients.
        console.warn('[Milo gateway] Groq status:', response.status);
        return json({ error: 'Groq could not complete the request', provider_status: response.status }, response.status === 429 ? 429 : 502);
      }
      const data = await response.json();
      const message = data.choices?.[0]?.message;
      if (!message || (typeof message.content !== 'string' && !message.tool_calls?.length)) {
        return json({ error: 'Invalid response from Groq' }, 502);
      }
      return json({ message });
    } catch {
      return json({ error: controller.signal.aborted ? 'Groq request timed out' : 'Groq is unavailable' }, 502);
    } finally { clearTimeout(timer); }
  },
};
