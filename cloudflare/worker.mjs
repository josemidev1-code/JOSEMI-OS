const ALLOWED_ACTIONS = new Set(['reply', 'pause', 'resume', 'volume', 'open', 'music', 'weather', 'books']);

const ALLOWED_APPS = new Set([
  'about',
  'projects',
  'contact',
  'arcade',
  'settings',
  'readme',
  'mario',
  'pacman',
  'tetris',
  'easter',
  'vault',
  'screensaver'
]);

const WEATHER_TEXT = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla helada',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  71: 'Nieve ligera',
  73: 'Nieve',
  75: 'Nieve intensa',
  80: 'Chubascos',
  81: 'Chubascos fuertes',
  82: 'Chubascos muy fuertes',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta fuerte con granizo'
};

function weatherText(code) {
  return WEATHER_TEXT[code] || 'Condición desconocida';
}

function allowedOrigin(origin, env, method) {
  const raw = env?.ALLOWED_ORIGIN || '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);

  if (!origin) return method === 'GET';
  if (list.includes('*')) return true;
  return list.includes(origin);
}

function corsHeaders(env, origin) {
  const allow = origin && allowedOrigin(origin, env, 'OPTIONS')
    ? origin
    : (env?.ALLOWED_ORIGIN || '*');

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status = 200, env = {}, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(env, origin)
    }
  });
}

function parseAiJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {}

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  return null;
}

function sanitizeAI(ai) {
  if (!ai || typeof ai !== 'object') throw new Error('ai_object');

  const reply = String(ai.reply || '').trim().slice(0, 1200);
  if (!reply) throw new Error('reply');

  const action = String(ai.action || 'reply').toLowerCase();
  if (!ALLOWED_ACTIONS.has(action)) throw new Error('action');

  const out = { reply, action };

  if (action === 'music') {
    out.query = String(ai.query || '').trim().slice(0, 120);
    if (!out.query) throw new Error('query');
  }

  if (action === 'volume') {
    const volume = Number(ai.volume);
    if (!Number.isFinite(volume) || volume < 0 || volume > 100) {
      throw new Error('volumen inválido');
    }
    out.volume = Math.round(volume);
  }

  if (action === 'open') {
    const app = String(ai.app || '').toLowerCase();
    if (!ALLOWED_APPS.has(app)) throw new Error('app');
    out.app = app;
  }

  if (action === 'weather') {
    out.city = String(ai.city || ai.query || '').trim().slice(0, 80);
    if (!out.city) throw new Error('city');
  }

  if (action === 'books') {
    out.query = String(ai.query || '').trim().slice(0, 120);
    if (!out.query) throw new Error('query');
  }

  return out;
}

async function geminiCall(message, history, env, fetchImpl) {
  if (!env.GEMINI_API_KEY) throw new Error('missing_gemini_api_key');

  const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const systemPrompt = `
Eres el asistente público de JOSEMI-OS, el portfolio de José Miguel Miralles Gandia (Josemi).

Datos públicos confirmados:
- Estudia DAM en IES Dr. Lluís Simarro.
- Está aprendiendo HTML, CSS, JavaScript, Git y GitHub.
- Proyecto principal: JOSEMI-OS, portfolio interactivo con escritorio, aplicaciones, juegos y easter eggs.
- Otro proyecto: Portfolio del Museu grec, repositorio portafolio-web.
- GitHub: https://github.com/josemidev1-code
- LinkedIn: https://www.linkedin.com/in/jose-miguel-miralles-gandia-74347b43a/
- Correo: josemidev1@gmail.com
- Aficiones: gimnasio, deporte, programar, proyectos, ciencia ficción, cine y lectura.
- Virtudes: disciplina, motivación, ganas de aprender y compromiso.

Debes responder SIEMPRE con JSON válido, sin markdown y sin texto extra.
Formato:
{"reply":"...","action":"reply|open|music|pause|resume|volume|weather|books","app":"about|projects|contact|arcade|settings|readme|mario|pacman|tetris","query":"texto para música/clima/libros","city":"ciudad","volume":0}

Reglas:
- action "reply": respuesta informativa normal.
- action "open": si pide abrir una app. app debe ser una permitida.
- action "music": si pide poner/buscar música. query con búsqueda limpia.
- action "pause": si pide pausar música.
- action "resume": si pide continuar música.
- action "volume": si pide volumen. volume 0-100.
- action "weather": si pide clima/tiempo. city o query con ciudad.
- action "books": si pide libros. query búsqueda.
- No inventes experiencia privada ni datos no confirmados.
- No des direcciones exactas, DNI, teléfono privado ni datos sensibles.
- Sé breve, útil y con tono cercano.
`;

  const contents = [];
  const safeHistory = Array.isArray(history) ? history.slice(-6) : [];

  for (const h of safeHistory) {
    if (!h || typeof h.text !== 'string') continue;
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: `${systemPrompt}\n\nMensaje actual del usuario: ${message}` }]
  });

  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 700,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!res.ok) throw new Error('gemini_error');

  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map(part => part?.text || '')
    .join('');

  const parsed = parseAiJson(text);
  if (!parsed) throw new Error('gemini_json');

  return parsed;
}

async function youtubeSearchItems(query, env, fetchImpl) {
  if (!query) throw new Error('Falta la búsqueda.');
  if (!env.YOUTUBE_API_KEY) throw new Error('Falta YOUTUBE_API_KEY en el Worker.');

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('q', query);
  url.searchParams.set('key', env.YOUTUBE_API_KEY);

  const res = await fetchImpl(url.toString());
  if (!res.ok) throw new Error('YouTube ha devuelto un error.');

  const data = await res.json();

  return (data.items || [])
    .filter(item => item.id?.videoId && item.snippet)
    .map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle || 'YouTube'
    }));
}

async function weatherQuery(city, fetchImpl) {
  if (!city) throw new Error('Falta la ciudad.');

  const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geoUrl.searchParams.set('count', '1');
  geoUrl.searchParams.set('language', 'es');
  geoUrl.searchParams.set('format', 'json');
  geoUrl.searchParams.set('name', city);

  const geoRes = await fetchImpl(geoUrl.toString());
  if (!geoRes.ok) throw new Error('No he encontrado esa ciudad.');

  const geo = await geoRes.json();
  const place = geo.results?.[0];
  if (!place) throw new Error('No he encontrado esa ciudad.');

  const fcUrl = new URL('https://api.open-meteo.com/v1/forecast');
  fcUrl.searchParams.set('latitude', String(place.latitude));
  fcUrl.searchParams.set('longitude', String(place.longitude));
  fcUrl.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m');
  fcUrl.searchParams.set('timezone', 'auto');

  const fcRes = await fetchImpl(fcUrl.toString());
  if (!fcRes.ok) throw new Error('No he podido consultar el tiempo.');

  const fc = await fcRes.json();
  const current = fc.current || {};

  return {
    city: place.name,
    country: place.country || '',
    temperatureC: Math.round(current.temperature_2m ?? 0),
    weather: weatherText(current.weather_code),
    windKmh: Math.round(current.wind_speed_10m ?? 0)
  };
}

async function booksQuery(query, fetchImpl) {
  if (!query) throw new Error('Falta la búsqueda de libros.');

  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('orderBy', 'relevance');
  url.searchParams.set('projection', 'partial');

  const res = await fetchImpl(url.toString(), {
    headers: { 'User-Agent': 'JOSEMI-OS Worker' }
  });

  if (!res.ok) throw new Error('No he podido consultar libros.');

  const data = await res.json();
  const items = (data.items || []).slice(0, 5).map(item => ({
    title: item.volumeInfo?.title || 'Sin título',
    authors: (item.volumeInfo?.authors || ['Desconocido']).join(', '),
    snippet: (item.volumeInfo?.description || '').replace(/<[^>]+>/g, '').slice(0, 180),
    thumbnail: item.volumeInfo?.imageLinks?.thumbnail || ''
  }));

  if (!items.length) throw new Error('No he encontrado libros.');

  return {
    items,
    summary: items.map((x, i) => `${i + 1}. ${x.title} — ${x.authors}`).join('\n')
  };
}

async function handleChat(request, env, fetchImpl) {
  const origin = request.headers.get('Origin') || '';

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400, env, origin);
  }

  if (body === null || typeof body !== 'object') {
    return json({ error: 'invalid_json' }, 400, env, origin);
  }

  const message = String(body.message || '').trim();
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  if (!message || message.length > 160) {
    return json({ error: 'message_invalid' }, 400, env, origin);
  }

  if (!env.GEMINI_API_KEY) {
    return json({ error: 'missing_gemini_api_key' }, 503, env, origin);
  }

  let parsed;
  try {
    parsed = await geminiCall(message, history, env, fetchImpl);
  } catch {
    return json({ error: 'gemini_unavailable' }, 502, env, origin);
  }

  let safe;
  try {
    safe = sanitizeAI(parsed);
  } catch {
    return json({ error: 'ai_action_invalid' }, 502, env, origin);
  }

  if (safe.action === 'music') {
    if (!env.YOUTUBE_API_KEY) {
      return json({ reply: 'No tengo la clave de YouTube configurada en el Worker.', action: 'reply' }, 200, env, origin);
    }

    try {
      safe.items = await youtubeSearchItems(safe.query, env, fetchImpl);
      if (safe.items.length && !safe.reply.includes('No')) {
        safe.reply = `He encontrado esto: ${safe.items[0].title}`;
      }
    } catch {
      safe.items = [];
      safe.reply = 'No he podido buscar música ahora mismo.';
    }
  }

  if (safe.action === 'weather') {
    try {
      safe.weather = await weatherQuery(safe.city, fetchImpl);
      safe.reply = `Clima en ${safe.weather.city}: ${safe.weather.weather}, ${safe.weather.temperatureC}°C, viento ${safe.weather.windKmh} km/h.`;
    } catch {
      safe.reply = 'No he podido consultar el clima.';
    }
  }

  if (safe.action === 'books') {
    try {
      safe.books = await booksQuery(safe.query, fetchImpl);
      safe.reply = 'Te dejo algunos resultados de libros.';
    } catch {
      safe.reply = 'No he podido consultar libros.';
    }
  }

  return json(safe, 200, env, origin);
}

export async function handle(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';

  if (request.method === 'OPTIONS') {
    if (!allowedOrigin(origin, env, 'OPTIONS')) {
      return json({ error: 'origin_not_allowed' }, 403, env, origin);
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders(env, origin)
    });
  }

  if (!allowedOrigin(origin, env, request.method)) {
    return json({ error: 'origin_not_allowed' }, 403, env, origin);
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    return json({ ok: true, time: new Date().toISOString() }, 200, env, origin);
  }

  if (request.method === 'POST' && url.pathname === '/api/chat') {
    return handleChat(request, env, fetchImpl);
  }

  if (request.method === 'GET' && url.pathname === '/api/youtube/search') {
    const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
    if (!q) return json({ error: 'q_required' }, 400, env, origin);
    if (!env.YOUTUBE_API_KEY) return json({ error: 'missing_api_key' }, 503, env, origin);

    try {
      const items = await youtubeSearchItems(q, env, fetchImpl);
      return json({ items }, 200, env, origin);
    } catch {
      return json({ error: 'youtube_unavailable' }, 502, env, origin);
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/weather') {
    const city = url.searchParams.get('city') || url.searchParams.get('q') || '';
    if (!city) return json({ error: 'city_required' }, 400, env, origin);

    try {
      const data = await weatherQuery(city, fetchImpl);
      return json(data, 200, env, origin);
    } catch {
      return json({ error: 'weather_unavailable' }, 502, env, origin);
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/books') {
    const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
    if (!q) return json({ error: 'q_required' }, 400, env, origin);

    try {
      const data = await booksQuery(q, fetchImpl);
      return json(data, 200, env, origin);
    } catch {
      return json({ error: 'books_unavailable' }, 502, env, origin);
    }
  }

  return json({ error: 'not_found' }, 404, env, origin);
}

export default {
  async fetch(request, env, ctx) {
    return handle(request, env, fetch);
  }
};