/* Milo AI — integració amb el gateway de JOSEMI-OS */
const MiloAI = (() => {
  const CONFIG = {
    endpoint: 'https://milo-ai.josemidev1.workers.dev//chat',
    enabled: true,
    maxHistory: 12,
  };

  // Si els teus IDs/clases són diferents, canvia només açò:
  const SEL = {
    log: '.mascot-log',
    form: '.mascot-form',
    input: '.mascot-form input',
    results: '.mascot-results',
    quick: '.mascot-quick',
  };

  /* ---- QUI ÉS JOSEMI: açò fa que responga sobre TU ---- */
  const SYSTEM = `Eres MILO, un axolote de compañía que vive en JOSEMI-OS, el portfolio interactivo de José Miguel Miralles Gandia ("Josemi").

DATOS REALES (nunca inventes nada que no esté aquí):
- Nombre: José Miguel Miralles Gandia, "Josemi". Español.
- Rol: Desarrollador de software EN PROCESO. Estudia DAM (Multiplataforma) en el IES Dr. Lluís Simarro.
- Stack actual: HTML, CSS y JavaScript puro (sin frameworks), porque JOSEMI-OS está hecho a mano.
- Usa IA como herramienta de aprendizaje y creación.
- Aspiración: automatizaciones y aplicaciones para grandes empresas combinando programación + IA + creatividad.
- Gustos: informática, IA, automatización, gimnasio, boxeo, running, e-commerce/dropshipping.
- JOSEMI-OS incluye: terminal con comandos, Arcade (Tetris, Pac-Man y JOSEMI Run), Secret Vault, salvapantallas ASCII, ajustes de tema/fondo/cursor y este asistente.
- Contacto público: GitHub @josemidev1-code, email josemidev1@gmail.com.

REGLAS:
1. Responde en el idioma del usuario (valenciano, castellano o inglés). Sé breve: 2-4 frases.
2. Si preguntan algo de Josemi que NO está en los datos, di que no lo sabes. NUNCA inventes notas, sueldos, edades o experiencias.
3. Si preguntan algo externo (noticias, "qué es X"), usa la herramienta web_search antes de responder.
4. Puedes ACCIONAR el sistema: play_music, open_app, set_theme.
5. Tono: cercano, gamberro ligero, motivador. Eres un axolote, no un chatbot corporativo.`;

  // IMPORTANT: OpenAI/Groq vol les tools amb "function" dins. No ho toques o falla.
  const TOOLS = [
    { type: 'function', function: { name: 'web_search', description: 'Busca en Internet informació actual o que no estiga en les dades de Josemi.', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
    { type: 'function', function: { name: 'play_music', description: 'Reprodueix música (preview de 30s + enllaç a YouTube).', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
    { type: 'function', function: { name: 'open_app', description: 'Obri una app de JOSEMI-OS.', parameters: { type: 'object', properties: { app: { type: 'string', enum: ['about','projects','skills','terminal','contact','arcade','settings'] } }, required: ['app'] } } },
    { type: 'function', function: { name: 'set_theme', description: 'Canvia el tema visual.', parameters: { type: 'object', properties: { theme: { type: 'string', enum: ['night','paper','violet','ocean','sunset'] } }, required: ['theme'] } } },
  ];

  let history = [], busy = false, audio = null;

  const q = s => document.querySelector(s);
  function say(text, who = 'assistant') {
    const log = q(SEL.log); if (!log) return null;
    const p = document.createElement('p');
    p.className = who; p.textContent = text;
    log.appendChild(p); log.scrollTop = log.scrollHeight;
    return p;
  }
  function typing() {
    const p = say('…', 'assistant typing'); let n = 0;
    const t = setInterval(() => { if (!p.isConnected) return clearInterval(t); p.textContent = '·'.repeat(1 + (n++ % 3)); }, 320);
    return () => { clearInterval(t); p.remove(); };
  }

  async function runTool(call) {
    const args = safeParse(call.function.arguments);
    switch (call.function.name) {
      case 'play_music': return await playMusic(args.query || 'chill');
      case 'open_app': (window.openWindow || (() => {}))(args.app); return { ok: true, opened: args.app };
      case 'set_theme': (window.chooseTheme || (() => {}))(args.theme); return { ok: true, theme: args.theme };
      default: return { error: 'no_tool' };
    }
  }
  const safeParse = s => { try { return JSON.parse(s) || {}; } catch { return {}; } };

  // Música gratis: iTunes Search (preview 30s, sense clau, CORS OK)
  async function playMusic(query) {
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=3`);
      const tracks = (await r.json()).results.filter(t => t.previewUrl).slice(0, 3);
      if (!tracks.length) return { ok: false, reason: 'sin resultados' };
      const list = tracks.map(t => ({
        title: t.trackName, artist: t.artistName, preview: t.previewUrl,
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${t.trackName} ${t.artistName}`)}`,
      }));
      renderResults(list); play(list[0]);
      return { ok: true, now_playing: `${list[0].title} — ${list[0].artist}`, note: 'Suena un preview de 30s. El enlace completo está en los resultados.' };
    } catch { return { ok: false, reason: 'iTunes no responde' }; }
  }
  function play(track) {
    if (!audio) { audio = new Audio(); audio.preload = 'none'; }
    audio.src = track.preview; audio.play().catch(() => {});
    const st = q('#music-status'); if (st) st.textContent = `${track.title} — ${track.artist}`;
  }
  function renderResults(list) {
    const box = q(SEL.results); if (!box) return; box.innerHTML = '';
    list.forEach(t => {
      const b = document.createElement('button');
      b.innerHTML = `<b>${esc(t.title)}</b><br><small>${esc(t.artist)}</small>`;
      b.onclick = () => play(t); box.appendChild(b);
    });
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  async function callApi(messages) {
    const res = await fetch(CONFIG.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, tools: TOOLS }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async function send(userText) {
    if (!userText.trim() || busy) return;
    busy = true; say(userText, 'user'); const stop = typing();
    let messages = [{ role: 'system', content: SYSTEM }, ...history, { role: 'user', content: userText }];
    try {
      let reply = null;
      if (CONFIG.enabled) {
        for (let turn = 0; turn < 4; turn++) {
          const data = await callApi(messages);
          const msg = data.message || {};
          messages = data.messages || messages;
          const calls = msg.tool_calls || [];
          if (calls.length) {
            messages.push(msg);
            for (const call of calls) {
              const result = await runTool(call);
              messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
            }
            continue;
          }
          reply = msg.content || null; break;
        }
      }
      if (!reply) reply = fallback(userText); // si la IA falla, Milo no es queda mut
      say(reply, 'assistant');
      history = messages.filter(m => m.role !== 'system').slice(-CONFIG.maxHistory);
    } catch (e) {
      say('Milo ha tingut un problema de connexió. Prova en un moment o escriu "ayuda".', 'assistant');
      console.warn('[MiloAI]', e);
    } finally { stop(); busy = false; }
  }

  function fallback(t) {
    const s = t.toLowerCase();
    if (/(hola|bones|hey|salut)/.test(s)) return 'Bones! Sóc Milo. Pregunta’m per Josemi, els projectes o l’Arcade. 💧';
    if (/(josé|josemi|sobre)/.test(s)) return 'Josemi estudia DAM a l’IES Dr. Lluís Simarro i està aprenent HTML, CSS i JS construint aquest sistema.';
    if (/(proyecto|projecte)/.test(s)) return 'El projecte estrella és JOSEMI-OS, un portfolio en forma de sistema operatiu fet a mà.';
    if (/(ayuda|ajuda|help)/.test(s)) return 'Puc: parlar de Josemi, buscar a Internet, posar música, obrir apps i canviar el tema.';
    return 'Interessant! Escriu "ayuda" o pregunta’m per Josemi, els projectes o l’Arcade.';
  }

  function init(overrides = {}) {
    Object.assign(CONFIG, overrides);
    const form = q(SEL.form), input = q(SEL.input);
    if (!form || !input) return console.warn('[MiloAI] No trobe el xat de Milo (revisa SEL).');
    form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
    say('Sóc Milo. Pregunta’m per Josemi, busca el que vulgues o digue’m “posa música”.', 'assistant');
  }

  return { init, send, playMusic };
})();
window.MiloAI = MiloAI;
