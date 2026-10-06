const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const weatherText = code => {
  const map = {
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
  return map[code] || 'Condición desconocida';
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

function parseJSONLoose(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try { return JSON.parse(fence[1]); } catch {}
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return null;
}

function sanitizeChat(parsed) {
  if (!parsed || typeof parsed !== 'object') return { reply: 'No he podido responder.', action: 'reply' };
  const allowedActions = ['reply', 'pause', 'resume', 'volume', 'open', 'music', 'weather', 'books'];
  if (!allowedActions.includes(parsed.action)) parsed.action = 'reply';
  parsed.reply = String(parsed.reply || 'No he podido responder.').slice(0, 1200);
  if (parsed.action === 'volume') parsed.volume = Math.max(0, Math.min(100, Number(parsed.volume) || 50));
  if (parsed.action === 'open') {
    const apps = ['about', 'projects', 'contact', 'arcade', 'settings', 'readme', 'mario', 'pacman', 'tetris'];
    if (!apps.includes(parsed.app)) parsed.action = 'reply';
  }
  if (parsed.query) parsed.query = String(parsed.query).slice(0, 220);
  return parsed;
}

async function youtubeSearchItems(query, env) {
  if (!query) throw new Error('Falta la búsqueda.');
  if (!env.YOUTUBE_API_KEY) throw new Error('Falta YOUTUBE_API_KEY en el Worker.');
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('q', query);
  url.searchParams.set('key', env.YOUTUBE_API_KEY);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'YouTube ha devuelto un error.');
  return (data.items || [])
    .filter(i => i.id?.videoId && i.snippet)
    .map(i => ({ id: i.id.videoId, title: i.snippet.title, channel: i.snippet.channelTitle || 'YouTube' }));
}

async function weatherQuery(city) {
  if (!city) throw new Error('Falta la ciudad.');
  const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geoUrl.searchParams.set('count', '1');
  geoUrl.searchParams.set('language', 'es');
  geoUrl.searchParams.set('format', 'json');
  geoUrl.searchParams.set('name', city);
  const geoRes = await fetch(geoUrl);
  const geo = await geoRes.json();
  const place = geo.results?.[0];
  if (!place) throw new Error('No he encontrado esa ciudad.');

  const fcUrl = new URL('https://api.open-meteo.com/v1/forecast');
  fcUrl.searchParams.set('latitude', String(place.latitude));
  fcUrl.searchParams.set('longitude', String(place.longitude));
  fcUrl.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m');
  fcUrl.searchParams.set('timezone', 'auto');
  const fcRes = await fetch(fcUrl);
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

async function booksQuery(query) {
  if (!query) throw new Error('Falta la búsqueda de libros.');
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('orderBy', 'relevance');
  url.searchParams.set('projection', 'partial');
  const res = await fetch(url, { headers: { 'User-Agent': 'JOSEMI-OS Worker' } });
  const data = await res.json();
  const items = (data.items || []).slice(0, 5).map(i => ({
    title: i.volumeInfo?.title || 'Sin título',
    authors: (i.volumeInfo?.authors || ['Desconocido']).join(', '),
    snippet: (i.volumeInfo?.description || '').replace(/<[^>]+>/g, '').slice(0, 180),
    thumbnail: i.volumeInfo?.imageLinks?.thumbnail || ''
  }));
  if (!items.length) throw new Error('No he encontrado libros.');
  return {
    items,
    summary: items.map((x, i) => `${i + 1}. ${x.title} — ${x.authors}`).join('\n')
  };
}

async function geminiCall(message, history, env) {
  if (!env.GEMINI_API_KEY) throw new Error('Falta GEMINI_API_KEY en el Worker.');
  const model = env.GEMINI_MODEL || 'gemini-1.5-flash';

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
{"reply":"...","action":"reply|open|music|pause|resume|volume|weather|books","app":"about|projects|contact|arcade|settings|readme|mario|pacman|tetris","query":"texto para música/clima/libros","volume":0}

Reglas:
- action "reply": respuesta informativa normal.
- action "open": si pide abrir una app. app debe ser una permitida.
- action "music": si pide poner/buscar música. query con búsqueda limpia.
- action "pause": si pide pausar música.
- action "resume": si pide continuar música.
- action "volume": si pide volumen. volume 0-100.
- action "weather": si pide clima/tiempo. query ciudad.
- action "books": si pide libros. query búsqueda.
- No inventes experiencia privada ni datos no confirmados.
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
  contents.push({ role: 'user', parts: [{ text: `${systemPrompt}\n\nMensaje actual del usuario: ${message}` }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.35, maxOutputTokens: 700, responseMimeType: 'application/json' }
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini ha devuelto un error.');
  const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text).join('');
  const parsed = parseJSONLoose(text);
  return parsed || { reply: text || 'No he podido responder.', action: 'reply' };
}

async function handleChat(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Body inválido' }, 400); }
  const message = String(body.message || '').slice(0, 500);
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
  if (!message) return json({ error: 'Falta message' }, 400);
  if (!env.GEMINI_API_KEY) return json({ error: 'No GEMINI_API_KEY configurada' }, 503);

  let parsed;
  try {
    parsed = await geminiCall(message, history, env);
  } catch (e) {
    return json({ error: e.message || 'Gemini no disponible' }, 502);
  }

  parsed = sanitizeChat(parsed);

  if (parsed.action === 'music' && parsed.query) {
    try {
      parsed.items = await youtubeSearchItems(parsed.query, env);
      if (parsed.items.length && !parsed.reply.includes('No')) parsed.reply = `He encontrado esto: ${parsed.items[0].title}`;
    } catch (e) {
      parsed.items = [];
      parsed.reply = `No he podido buscar música: ${e.message}`;
    }
  }

  if (parsed.action === 'weather' && parsed.query) {
    try {
      parsed.weather = await weatherQuery(parsed.query);
      parsed.reply = `Clima en ${parsed.weather.city}: ${parsed.weather.weather}, ${parsed.weather.temperatureC}°C, viento ${parsed.weather.windKmh} km/h.`;
    } catch (e) {
      parsed.reply = `No he podido consultar el clima: ${e.message}`;
    }
  }

  if (parsed.action === 'books' && parsed.query) {
    try {
      parsed.books = await booksQuery(parsed.query);
      parsed.reply = 'Te dejo algunos resultados de libros.';
    } catch (e) {
      parsed.reply = `No he podido consultar libros: ${e.message}`;
    }
  }

  return json(parsed);
}

async function handleYouTubeSearch(url, env) {
  const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
  if (!q) return json({ error: 'Falta q' }, 400);
  const items = await youtubeSearchItems(q, env);
  return json({ items });
}

async function handleWeather(url) {
  const city = url.searchParams.get('city') || url.searchParams.get('q') || '';
  const data = await weatherQuery(city);
  return json(data);
}

async function handleBooks(url) {
  const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
  const data = await booksQuery(q);
  return json(data);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    try {
      if (url.pathname === '/health') return json({ ok: true, time: new Date().toISOString() });
      if (url.pathname === '/api/youtube/search') return await handleYouTubeSearch(url, env);
      if (url.pathname === '/api/chat') return await handleChat(request, env);
      if (url.pathname === '/api/weather') return await handleWeather(url);
      if (url.pathname === '/api/books') return await handleBooks(url);
      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: e.message || 'Error interno' }, 500);
    }
  }
};