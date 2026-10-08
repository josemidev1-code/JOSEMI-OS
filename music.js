/* === BEGIN music.js === */
/* JOSEMI Music como mascota, no como app. Chatbot + YouTube visible + APIs vía Worker. */
(() => {
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const base = () => (window.JOSEMI_MUSIC_API || '').trim().replace(/\/+$/, '');

  const allowedApps = ['about', 'projects', 'contact', 'arcade', 'settings', 'readme', 'mario', 'pacman', 'tetris'];
  const history = [];

  let player = null;
  let readyPromise = null;
  let track = null;
  let request = 0;
  let wantsPlayback = false;

  // Mascota.
  const mascot = document.createElement('button');
  mascot.id = 'mascot-button';
  mascot.type = 'button';
  mascot.setAttribute('aria-label', 'Abrir asistente de Josemi');
  mascot.setAttribute('aria-expanded', 'false');
  mascot.innerHTML = '<svg class="mascot-svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h8v2H4zM2 4h2v8H2zM12 4h2v8h-2zM6 10h4v2H6z"/></svg>';

  // Chatbot.
  const panel = document.createElement('section');
  panel.id = 'mascot-chat';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', 'Asistente de Josemi');
  panel.innerHTML = `
    <div class="mascot-head"><strong>JOSEMI Assistant</strong><button id="mascot-close" aria-label="Cerrar asistente">×</button></div>
    <div id="mascot-log" class="mascot-log" aria-live="polite"></div>
    <div id="mascot-results" class="mascot-results"></div>
    <form id="mascot-form" class="mascot-form">
      <label class="sr-only" for="mascot-input">Mensaje</label>
      <input id="mascot-input" maxlength="180" placeholder="Pon música, clima Madrid, proyectos o contacto" autocomplete="off">
      <button class="btn" type="submit">Enviar</button>
    </form>
    <div class="mascot-quick">
      <button class="btn" data-q="¿Quién eres?">Quién eres</button>
      <button class="btn" data-q="Proyectos">Proyectos</button>
      <button class="btn" data-q="Contacto">Contacto</button>
      <button class="btn" data-q="Clima Madrid">Clima</button>
      <button class="btn" data-q="Pon una canción">Música</button>
    </div>
  `;

  // Reproductor.
  const dock = document.createElement('aside');
  dock.id = 'music-dock';
  dock.hidden = true;
  dock.innerHTML = `
    <div class="music-heading"><strong>JOSEMI Music · YouTube</strong><button id="music-stop" aria-label="Cerrar reproductor">×</button></div>
    <div id="youtube-player"></div>
    <div class="music-track">
      <img id="music-cover" alt="Miniatura del vídeo">
      <div><small id="music-state">LISTO PARA REPRODUCIR</small><strong id="music-title"></strong><span id="music-channel"></span></div>
    </div>
    <div class="music-controls">
      <button class="btn" id="music-play">Reproducir</button>
      <button class="btn" id="music-pause">Pausa</button>
      <label>Volumen <input id="music-volume" type="range" min="0" max="100" value="65"></label>
    </div>
    <p id="music-status" role="status"></p>
    <a id="music-source" target="_blank" rel="noopener">Ver en YouTube ↗</a>
  `;

  document.body.append(mascot, panel, dock);

  function status(text) {
    const el = q('#music-status');
    if (el) el.textContent = text;
  }

  function pushHistory(role, text) {
    history.push({ role, text });
    if (history.length > 6) history.splice(0, history.length - 6);
  }

  function say(text, who = 'assistant') {
    const log = q('#mascot-log');
    if (!log) return;
    const line = document.createElement('p');
    line.className = who;
    line.textContent = (who === 'user' ? 'Tú: ' : 'JOSEMI: ') + text;
    log.append(line);
    while (log.children.length > 30) log.firstChild.remove();
    log.scrollTop = log.scrollHeight;
    if (who === 'assistant') pushHistory('model', text);
  }

  function toggleChat() {
    panel.hidden = !panel.hidden;
    mascot.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) q('#mascot-input')?.focus();
  }

  mascot.addEventListener('click', toggleChat);
  q('#mascot-close')?.addEventListener('click', () => {
    panel.hidden = true;
    mascot.setAttribute('aria-expanded', 'false');
    mascot.focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      mascot.setAttribute('aria-expanded', 'false');
      mascot.focus();
    }
  });

  qa('[data-q]').forEach(b => {
    b.addEventListener('click', () => {
      const input = q('#mascot-input');
      if (input) input.value = b.dataset.q;
      q('#mascot-form')?.requestSubmit();
    });
  });

  function validMusicItems(items) {
    if (!Array.isArray(items)) throw new Error('YouTube ha devuelto una lista de vídeos inválida.');
    return items
      .filter(item => item && /^[-\w]{11}$/.test(item.id) && typeof item.title === 'string')
      .map(item => ({ id: item.id, title: item.title, channel: typeof item.channel === 'string' ? item.channel : 'YouTube' }));
  }

  function videoId(text) {
    try {
      const u = new URL(text);
      if (u.hostname === 'youtu.be') return /^[\w-]{11}$/.test(u.pathname.slice(1)) ? u.pathname.slice(1) : null;
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(u.hostname)) {
        const id = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1];
        return /^[\w-]{11}$/.test(id || '') ? id : null;
      }
    } catch {}
    return null;
  }

  function loadPlayer() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve, reject) => {
      let active = true;
      let created = false;
      let instance;

      const fail = message => {
        if (!active) return;
        active = false;
        clearTimeout(timeout);
        instance?.destroy?.();
        if (player === instance) player = null;
        reject(new Error(message));
      };

      const timeout = setTimeout(() => fail('YouTube tarda en cargar. Comprueba la conexión y vuelve a intentarlo.'), 15000);

      function create() {
        if (!active || created) return;
        created = true;
        if (!q('#youtube-player')) {
          const slot = document.createElement('div');
          slot.id = 'youtube-player';
          const track = q('.music-track');
          if (track) dock.insertBefore(slot, track);
        }
        try {
          instance = player = new YT.Player('youtube-player', {
            width: 320,
            height: 200,
            playerVars: { origin: location.origin, playsinline: 1 },
            events: {
              onReady: () => {
                if (!active) return;
                clearTimeout(timeout);
                player.setVolume(Number(q('#music-volume')?.value || 65));
                resolve(player);
              },
              onStateChange: e => {
                if (!active) return;
                if (e.data === 1 && (!wantsPlayback || dock.hidden || document.hidden)) {
                  player.pauseVideo();
                  return;
                }
                const stateText = { 1: 'SONANDO AHORA', 2: 'EN PAUSA', 0: 'FINALIZADO', 3: 'CARGANDO' };
                const stateEl = q('#music-state');
                if (stateEl) stateEl.textContent = stateText[e.data] || 'LISTO PARA REPRODUCIR';
                if (e.data === 1) status('');
              },
              onAutoplayBlocked: () => status('Pulsa Reproducir para iniciar la canción.'),
              onError: e => {
                status(e.data === 153 ? 'Abre la web desde un servidor HTTP, no como archivo local.' : 'Este vídeo no se puede reproducir aquí. Prueba otro resultado o ábrelo en YouTube.');
              }
            }
          });
        } catch {
          fail('No se ha podido iniciar el reproductor de YouTube.');
        }
      }

      if (window.YT?.Player) {
        create();
      } else {
        const old = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          try { old?.(); } catch {}
          create();
        };
        let script = document.querySelector('script[data-youtube-sdk]');
        if (!script) {
          script = document.createElement('script');
          script.dataset.youtubeSdk = 'true';
          script.src = 'https://www.youtube.com/iframe_api';
          document.head.append(script);
        }
        script.onerror = () => {
          script.remove();
          fail('No se ha podido conectar con YouTube.');
        };
      }
    }).catch(e => {
      readyPromise = null;
      throw e;
    });
    return readyPromise;
  }

  async function play(item) {
    if (!item || !/^[-\w]{11}$/.test(item.id) || typeof item.title !== 'string') {
      status('El resultado de YouTube no es válido. Prueba otra búsqueda.');
      return;
    }
    const run = ++request;
    track = item;
    wantsPlayback = true;
    dock.hidden = false;

    q('#music-title').textContent = item.title;
    q('#music-channel').textContent = item.channel || 'YouTube';
    q('#music-cover').src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
    q('#music-source').href = `https://www.youtube.com/watch?v=${item.id}`;
    q('#music-state').textContent = 'CARGANDO';
    status('Conectando con YouTube…');

    try {
      await loadPlayer();
      if (run !== request || dock.hidden) return;
      if (wantsPlayback && !document.hidden) player.loadVideoById(item.id);
      else player.cueVideoById(item.id);
      status('Pulsa Reproducir para iniciar o reanudar.');
    } catch (e) {
      if (run === request && !dock.hidden) status(e.message);
    }
  }

  function pauseMusic() {
    wantsPlayback = false;
    player?.pauseVideo?.();
    const stateEl = q('#music-state');
    if (stateEl) stateEl.textContent = 'EN PAUSA';
  }

  function resumeMusic() {
    wantsPlayback = true;
    if (!dock.hidden && !document.hidden) player?.playVideo?.();
  }

  function setVolume(v) {
    const value = Math.max(0, Math.min(100, Number(v) || 0));
    player?.setVolume?.(value);
    const input = q('#music-volume');
    if (input) input.value = String(value);
  }

  function renderResults(items) {
    const box = q('#mascot-results');
    if (!box) return;
    box.innerHTML = '';
    if (!items.length) {
      box.innerHTML = '<p>No hay resultados.</p>';
      return;
    }
    items.forEach(item => {
      const button = document.createElement('button');
      button.className = 'music-result';
      button.textContent = `${item.title} · ${item.channel || 'YouTube'}`;
      button.onclick = () => play(item);
      box.append(button);
    });
  }

  async function searchYouTube(query) {
    const b = base();
    if (!b) throw new Error('Necesitas configurar el Worker para buscar música por nombre.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${b}/api/youtube/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se ha podido buscar.');
      return validMusicItems(data.items);
    } finally {
      clearTimeout(timer);
    }
  }

  async function getWeather(city) {
    const b = base();
    if (!b) throw new Error('Necesitas configurar el Worker para consultar el clima.');
    const res = await fetch(`${b}/api/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'No se ha podido consultar el clima.');
    return data;
  }

  async function getBooks(query) {
    const b = base();
    if (!b) throw new Error('Necesitas configurar el Worker para consultar libros.');
    const res = await fetch(`${b}/api/books?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'No se ha podido consultar libros.');
    return data;
  }

  async function chatWithWorker(message) {
    const b = base();
    if (!b) throw new Error('El asistente necesita el Worker de Cloudflare.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(`${b}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history.slice(-6) }),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'El asistente no ha respondido.');
      if (typeof data.reply !== 'string') throw new Error('La respuesta del asistente está incompleta.');
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  function openApp(app) {
    if (typeof openWindow !== 'function') return;
    const desktop = q('#desktop');
    if (desktop && desktop.classList.contains('hidden') && typeof enterOS === 'function') {
      enterOS();
      setTimeout(() => openWindow(app), 600);
    } else {
      openWindow(app);
    }
  }

  function localReply(text) {
    const t = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (/(hola|quien eres|que eres|asistente)/.test(t)) return 'Soy la mascota de JOSEMI-OS. Puedo responder sobre Josemi, sus proyectos y, si el Worker está activo, música, clima y libros.';
    if (/(estudia|dam|instituto|estudios)/.test(t)) return 'Josemi estudia DAM en el IES Dr. Lluís Simarro y está aprendiendo HTML, CSS, JavaScript, Git y GitHub.';
    if (/(proyecto|portfolio|josemi-os|museu|grec)/.test(t)) return 'Puedes abrir Proyectos: JOSEMI-OS, Museu grec, DAM y roadmap IA. También están en GitHub.';
    if (/(contacto|correo|email|linkedin|github)/.test(t)) return 'Contacto: josemidev1@gmail.com, GitHub josemidev1-code, LinkedIn José Miguel Miralles Gandia.';
    if (/(gustos|aficiones|gimnasio|boxeo|cine|ciencia ficcion|lectura)/.test(t)) return 'Le gustan el gimnasio, el deporte, programar, proyectos, ciencia ficción, cine y lectura.';
    if (/(virtudes|disciplina|motivacion|aprendizaje)/.test(t)) return 'Se define con disciplina, motivación, ganas de aprender y compromiso con lo que hace.';
    if (/(pon|busca|reproduce|musica|cancion)/.test(t)) return 'Para música por nombre necesito el Worker de Cloudflare. Puedes pegar un enlace de YouTube o configurar JOSEMI_MUSIC_API.';
    if (/(clima|tiempo|weather|temperatura)/.test(t)) return 'Para clima necesito el Worker. Ejemplo: clima Madrid.';
    if (/(libros|books)/.test(t)) return 'Para libros necesito el Worker. Ejemplo: libros Isaac Asimov.';
    return null;
  }

  async function handleUser(raw) {
    const t = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    pushHistory('user', raw);

    if (/^(pausa|para|deten)( la musica)?$/.test(t)) {
      pauseMusic();
      say(track ? 'Música en pausa.' : 'Todavía no has elegido una canción.');
      return;
    }

    if (/^(continua|reanuda|play|reproduce)$/.test(t)) {
      resumeMusic();
      say(track ? 'Puedes reanudar con el botón Reproducir si el navegador lo solicita.' : 'Dime primero una canción.');
      return;
    }

    const volume = t.match(/^(?:volumen|baja el volumen a|sube el volumen a)\s*(\d{1,3})\s*%?$/);
    if (volume) {
      const value = Math.min(100, Number(volume[1]));
      setVolume(value);
      say(`Volumen: ${value}%.`);
      return;
    }

    const id = videoId(raw);
    if (id) {
      say('Abro ese vídeo.');
      await play({ id, title: 'Vídeo de YouTube', channel: 'Enlace elegido por ti' });
      return;
    }

    const weatherMatch = raw.match(/(?:clima|tiempo|weather|temperatura)\s+(?:en|de|para)?\s*(.+)/i);
    if (weatherMatch) {
      try {
        const w = await getWeather(weatherMatch[1]);
        say(`Clima en ${w.city}: ${w.weather}, ${w.temperatureC}°C, viento ${w.windKmh} km/h.`);
      } catch (e) {
        say(e.message);
      }
      return;
    }

    const bookMatch = raw.match(/(?:libros|books)\s+(.+)/i);
    if (bookMatch) {
      try {
        const b = await getBooks(bookMatch[1]);
        say(b.summary || 'Libros encontrados.');
      } catch (e) {
        say(e.message);
      }
      return;
    }

    if (base()) {
      try {
        const data = await chatWithWorker(raw);
        say(data.reply);

        const action = data.action || 'reply';

        if (action === 'pause') pauseMusic();
        if (action === 'resume') resumeMusic();
        if (action === 'volume') setVolume(data.volume);
        if (action === 'open' && allowedApps.includes(data.app)) openApp(data.app);

        if (action === 'music') {
          const items = validMusicItems(data.items || []);
          renderResults(items);
          if (items.length) await play(items[0]);
        }

        if (action === 'weather') {
          if (data.weather) {
            say(`Clima en ${data.weather.city}: ${data.weather.weather}, ${data.weather.temperatureC}°C, viento ${data.weather.windKmh} km/h.`);
          } else if (data.query) {
            const w = await getWeather(data.query);
            say(`Clima en ${w.city}: ${w.weather}, ${w.temperatureC}°C, viento ${w.windKmh} km/h.`);
          }
        }

        if (action === 'books' && data.books) {
          say(data.books.summary || 'Libros encontrados.');
        }
      } catch (e) {
        const local = localReply(raw);
        say(local || e.message);
      }
      return;
    }

    const local = localReply(raw);
    if (local) {
      say(local);
      return;
    }

    say('No tengo esa información local. Configura el Worker o usa contacto: josemidev1@gmail.com.');
  }

  q('#mascot-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = q('#mascot-input');
    const raw = input?.value.trim();
    if (!raw) return;
    input.value = '';
    say(raw, 'user');
    await handleUser(raw);
  });

  q('#music-stop')?.addEventListener('click', () => {
    request++;
    wantsPlayback = false;
    player?.stopVideo?.();
    dock.hidden = true;
  });

  q('#music-play')?.addEventListener('click', () => {
    wantsPlayback = true;
    if (!dock.hidden && !document.hidden && player) {
      player.playVideo();
    } else {
      loadPlayer().then(() => player?.playVideo?.()).catch(e => status(e.message));
    }
  });

  q('#music-pause')?.addEventListener('click', pauseMusic);
  q('#music-volume')?.addEventListener('input', e => setVolume(e.target.value));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseMusic();
  });

  const shutdown = q('#shutdown');
  if (shutdown) {
    new MutationObserver(() => {
      if (!shutdown.classList.contains('hidden') && !dock.hidden) q('#music-stop')?.click();
    }).observe(shutdown, { attributes: true, attributeFilter: ['class'] });
  }

  const saver = q('#os-screensaver');
  function updateMascotVisibility() {
    const shutdownVisible = shutdown && !shutdown.classList.contains('hidden');
    const saverVisible = saver && !saver.hidden;
    mascot.style.display = shutdownVisible || saverVisible ? 'none' : '';
  }
  if (shutdown) new MutationObserver(updateMascotVisibility).observe(shutdown, { attributes: true, attributeFilter: ['class'] });
  if (saver) new MutationObserver(updateMascotVisibility).observe(saver, { attributes: true, attributeFilter: ['hidden'] });

  window.JOSEMI_MUSIC = {
    play,
    pause: pauseMusic,
    resume: resumeMusic,
    volume: setVolume,
    search: searchYouTube,
    weather: getWeather,
    books: getBooks
  };

  say('Dime qué quieres: música, clima, libros o preguntas sobre Josemi.');
})();
/* === END music.js === */