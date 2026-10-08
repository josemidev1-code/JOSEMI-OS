/* JOSEMI-OS updates: datos personales, Secret Vault, fondos, ajustes, iconos pixel.
   Cargar después de script.js. */
(() => {
  'use strict';

  const GOW_URL = 'https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg';

  // Estado para desbloqueos y fondo personalizado.
  if (!state.vault) state.vault = { matrix: false, gof: false };
  if (!state.wallpaper) state.wallpaper = state.wp === 4 ? 'matrix' : 'static';
  if (state.wallpaper === 'godOfWar' && !state.vault.gof) state.wallpaper = 'static';
  save();

  // Datos personales confirmados.
  Object.assign(PROFILE, {
    nombre: 'José Miguel Miralles Gandia',
    corto: 'Josemi',
    rol: 'Desarrollador de software en proceso',
    estudios: 'DAM · Desarrollo de Aplicaciones Multiplataforma · IES Dr. Lluís Simarro',
    estado: 'Aprendiendo mientras construyo proyectos reales',
    ubicacion: 'España',
    bio: 'Desde pequeño me apasiona la tecnología. Empecé jugando a videojocs y me despertó la curiosidad por entender cómo funcionan las cosas. La televisión, el móvil y el ordenador tienen código detrás, y ahora quiero aprender a construir mis propias ideas.',
    aspiracion: 'Aspiro a desarrollar automatizaciones y aplicaciones para grandes empresas, combinando programación, inteligencia artificial y creatividad para construir soluciones útiles.',
    gustos: [
      'Programar',
      'Gimnasio',
      'Deporte',
      'Proyectos',
      'Ciencia ficción',
      'Cine',
      'Lectura',
      'IA',
      'Automatización'
    ]
  });

  // Proyectos.
  Object.assign(PROJECTS, {
    museo: {
      name: 'Portfolio del Museu grec',
      desc: 'Ejemplo de web que estoy construyendo para aprender a presentar información, diseño y estructura. Repositorio: portafolio-web.',
      lang: 'HTML / CSS / JavaScript',
      db: '—',
      fw: 'Vanilla',
      date: '2026',
      status: 'dev',
      tags: ['Web', 'Diseño', 'Formación'],
      github: 'https://github.com/josemidev1-code/portafolio-web'
    }
  });

  // Iconos pixel art.
  const PIXEL_ICONS = {
    readme: '<rect x="3" y="2" width="10" height="12" fill="#f2f0e2"/><rect x="11" y="2" width="2" height="2" fill="#d2c9b0"/><rect x="5" y="5" width="6" height="1" fill="#7f8a76"/><rect x="5" y="7" width="6" height="1" fill="#7f8a76"/><rect x="5" y="9" width="4" height="1" fill="#7f8a76"/>',
    about: '<rect x="6" y="2" width="4" height="4" fill="#f2d7b7"/><rect x="4" y="7" width="8" height="5" fill="#5d91c2"/><rect x="4" y="12" width="3" height="2" fill="#354359"/><rect x="9" y="12" width="3" height="2" fill="#354359"/>',
    projects: '<rect x="2" y="5" width="12" height="9" fill="#f3c778"/><rect x="2" y="3" width="6" height="2" fill="#d9a555"/><rect x="1" y="5" width="14" height="1" fill="#8d6b2f"/>',
    skills: '<rect x="8" y="2" width="3" height="3" fill="#edc16c"/><rect x="5" y="5" width="4" height="2" fill="#edc16c"/><rect x="7" y="7" width="4" height="2" fill="#edc16c"/><rect x="4" y="9" width="4" height="2" fill="#edc16c"/><rect x="6" y="11" width="4" height="3" fill="#edc16c"/>',
    terminal: '<rect x="2" y="3" width="12" height="10" fill="#0c1510" stroke="#adf0b7"/><rect x="4" y="5" width="1" height="1" fill="#adf0b7"/><rect x="5" y="6" width="1" height="1" fill="#adf0b7"/><rect x="4" y="7" width="1" height="1" fill="#adf0b7"/><rect x="7" y="7" width="4" height="1" fill="#adf0b7"/>',
    contact: '<rect x="2" y="4" width="12" height="8" fill="#a9c6dd"/><path d="M2 4l6 5 6-5" stroke="#293934" fill="none"/>',
    arcade: '<rect x="5" y="10" width="6" height="4" fill="#555"/><rect x="7" y="5" width="2" height="5" fill="#777"/><rect x="6" y="2" width="4" height="3" fill="#ff5a5a"/>',
    settings: '<rect x="7" y="1" width="2" height="2" fill="#a7b9c3"/><rect x="7" y="13" width="2" height="2" fill="#a7b9c3"/><rect x="1" y="7" width="2" height="2" fill="#a7b9c3"/><rect x="13" y="7" width="2" height="2" fill="#a7b9c3"/><rect x="4" y="4" width="8" height="8" fill="#a7b9c3"/><rect x="6" y="6" width="4" height="4" fill="#e8eadc"/>',
    system: '<rect x="2" y="2" width="12" height="8" fill="#243b39"/><rect x="3" y="3" width="10" height="6" fill="#9adeaa"/><path d="M4 7h2l1-2 2 4 1-2h2" stroke="#0c1510" fill="none"/><rect x="7" y="10" width="2" height="2" fill="#777"/><rect x="5" y="12" width="6" height="1" fill="#777"/>',
    trash: '<rect x="3" y="3" width="10" height="2" fill="#9fb2b5"/><rect x="7" y="1" width="2" height="2" fill="#9fb2b5"/><rect x="4" y="5" width="8" height="9" fill="#9fb2b5"/><rect x="6" y="6" width="1" height="7" fill="#708078"/><rect x="9" y="6" width="1" height="7" fill="#708078"/>',
    easter: '<rect x="2" y="6" width="12" height="8" fill="#d4b073"/><rect x="7" y="3" width="2" height="3" fill="#d4b073"/><rect x="6" y="2" width="4" height="1" fill="#d4b073"/><rect x="7" y="9" width="2" height="3" fill="#263733"/>',
    screensaver: '<rect x="7" y="1" width="2" height="2" fill="#fff"/><rect x="3" y="4" width="2" height="2" fill="#fff"/><rect x="11" y="4" width="2" height="2" fill="#fff"/><rect x="1" y="9" width="2" height="2" fill="#fff"/><rect x="13" y="9" width="2" height="2" fill="#fff"/><rect x="5" y="11" width="6" height="2" fill="#fff"/>',
    mario: '<rect x="4" y="4" width="8" height="4" fill="#ee8f91"/><rect x="6" y="8" width="4" height="5" fill="#f4dbb4"/><rect x="5" y="5" width="2" height="2" fill="#fff"/><rect x="9" y="5" width="2" height="2" fill="#fff"/>',
    pacman: '<path d="M8 1a7 7 0 100 14z" fill="#efcb64"/><rect x="9" y="6" width="2" height="2" fill="#29312f"/>',
    tetris: '<rect x="3" y="3" width="10" height="3" fill="#c1a4d9"/><rect x="7" y="6" width="2" height="7" fill="#c1a4d9"/>'
  };

  const pixelIcon = id => `<svg class="os-icon os-icon--${id}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${PIXEL_ICONS[id] || PIXEL_ICONS.projects}</svg>`;

  Object.keys(PIXEL_ICONS).forEach(id => {
    if (Apps[id]) Apps[id].icon = pixelIcon(id);
  });
  if (Apps.welcome) Apps.welcome.icon = pixelIcon('readme');

  // JOSEMI Music deja de ser app/icono.
if (Apps.music) delete Apps.music;
currentUser.apps = (currentUser.apps || []).filter(id => id !== 'music');
delete
  // Sobre mí.
  Apps.about = {
    title: 'Sobre mí',
    icon: pixelIcon('about'),
    render: () => `
      <section class="profile-hero">
        <div class="profile-hero__terminal"><span>josemi@portfolio</span><b>DESARROLLADOR EN PROCESO</b></div>
        <h2>${PROFILE.nombre}</h2>
        <p>${PROFILE.bio}</p>
        <div class="chips">${PROFILE.gustos.map(x => `<span class="chip">${x}</span>`).join('')}</div>
      </section>
      <div class="content-grid">
        <article class="content-card">
          <span class="card-kicker">01 / AHORA</span>
          <h3>Qué estoy haciendo</h3>
          <p>Estudio <strong>DAM</strong> en <strong>IES Dr. Lluís Simarro</strong>. Trabajo en HTML, CSS, JavaScript, Git y GitHub con este portfolio y proyectos de formación.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">02 / MOTIVACIÓN</span>
          <h3>De jugar a construir</h3>
          <p>Desde pequeño me apasiona la tecnología. Empezó con videojocs, televisión, móvil y ordenador; ahora quiero entender el código y crear mis propias ideas.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">03 / VIRTUDES</span>
          <h3>Cómo trabajo</h3>
          <p>Disciplina, motivación, ganas de aprender y compromiso con lo que hago. Prefiero progreso real y pruebas honestas antes que exagerar experiencia.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">04 / FUERA DEL CÓDIGO</span>
          <h3>Aficiones</h3>
          <p>Gimnasio, deporte, programar, proyectos, ciencia ficción, cine y lectura.</p>
        </article>
      </div>`
  };

  // Proyectos.
  Apps.projects = {
    title: 'Proyectos',
    icon: pixelIcon('projects'),
    render: () => `
      <div class="app-title">/PROYECTOS</div>
      <p class="bio">Aquí separo lo que ya estoy construyendo de las áreas en las que quiero seguir experimentando. No relleno el portfolio con proyectos inventados.</p>
      <div class="folder-grid">
        <div class="folder" tabindex="0" data-folder="web"><span class="g">⌘</span><span class="n">JOSEMI-OS</span><small>Proyecto real</small></div>
        <div class="folder" tabindex="0" data-folder="museo"><span class="g">◈</span><span class="n">Museu grec</span><small>Formación</small></div>
        <div class="folder" tabindex="0" data-folder="school"><span class="g">{ }</span><span class="n">DAM</span><small>Formación</small></div>
        <div class="folder" tabindex="0" data-folder="ai"><span class="g">✦</span><span class="n">IA + software</span><small>Roadmap</small></div>
      </div>`,
    bind(b) {
      b.querySelectorAll('.folder').forEach(f => {
        const abrir = () => openProject(f.dataset.folder);
        f.addEventListener('dblclick', abrir);
        f.addEventListener('keydown', e => { if (e.key === 'Enter') abrir(); });
      });
    }
  };

  // Contacto real.
  Apps.contact = {
    title: 'Contacto',
    icon: pixelIcon('contact'),
    render: () => `
      <div class="contact contact--modern">
        <span class="card-kicker">CONTACTO / NETWORK</span>
        <h2>¿Construimos algo?</h2>
        <p>Estoy aprendiendo y abierto a oportunidades, feedback y proyectos reales.</p>
        <div class="links">
          <a class="clink" href="https://github.com/josemidev1-code" target="_blank" rel="noopener"><span class="g">GH</span><span><b>GitHub</b><small>@josemidev1-code</small></span><i>↗</i></a>
          <a class="clink" href="https://www.linkedin.com/in/jose-miguel-miralles-gandia-74347b43a/" target="_blank" rel="noopener"><span class="g">IN</span><span><b>LinkedIn</b><small>José Miguel Miralles Gandia</small></span><i>↗</i></a>
          <a class="clink" href="mailto:josemidev1@gmail.com"><span class="g">@</span><span><b>Email</b><small>josemidev1@gmail.com</small></span><i>↗</i></a>
          <a class="clink" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener"><span class="g">OS</span><span><b>JOSEMI-OS</b><small>Repositorio del portfolio</small></span><i>↗</i></a>
          <a class="clink" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener"><span class="g">◈</span><span><b>Museu grec</b><small>portafolio-web</small></span><i>↗</i></a>
        </div>
        <button class="btn btn--accent" id="copy-email">COPIAR EMAIL</button>
      </div>`,
    bind(b) {
      $('#copy-email', b).addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('josemidev1@gmail.com');
          toast('Email copiado al portapapeles.');
        } catch {
          toast('No se ha podido acceder al portapapeles.');
        }
      });
    }
  };

  // Secret Vault personal.
  Apps.easter = {
    title: 'Secret Vault',
    icon: pixelIcon('easter'),
    size: [760, 780],
    render: () => `
      <section class="vault vault--personal">
        <div class="vault-top">
          <span class="card-kicker">/ROOT / SECRET_VAULT</span>
          <span class="vault-status">${(state.vault.matrix ? 1 : 0) + (state.vault.gof ? 1 : 0)}/2 LLAVES</span>
        </div>
        <h2>Secret Vault de Josemi</h2>
        <p class="vault-copy">Dos llaves, dos fondos. No es seguridad real: es curiosidad, memoria y easter eggs personales.</p>

        <div class="vault-keys">
          <span data-key="matrix" class="${state.vault.matrix ? 'unlocked' : ''}">${state.vault.matrix ? '✓ ' : '○ '}LLAVE MATRIX</span>
          <span data-key="gof" class="${state.vault.gof ? 'unlocked' : ''}">${state.vault.gof ? '✓ ' : '○ '}LLAVE GOD OF WAR</span>
        </div>

        <section class="vault-question">
          <span class="card-kicker">01 / MATRIX</span>
          <h3>¿Quién ayuda a Neo a escapar de Matrix?</h3>
          <form data-key="matrix">
            <input aria-label="Respuesta Matrix" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…">
            <button class="btn btn--accent" type="submit">VALIDAR ↵</button>
          </form>
          <p class="vault-feedback" data-feedback="matrix"></p>
          <button class="btn vault-reward" data-reward="matrix" ${state.vault.matrix ? '' : 'disabled'}>ACTIVAR FONDO MATRIX ↗</button>
        </section>

        <section class="vault-question">
          <span class="card-kicker">02 / GOD OF WAR</span>
          <h3>¿Cuál es el videojuego favorito de Josemi?</h3>
          <form data-key="gof">
            <input aria-label="Respuesta God of War" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…">
            <button class="btn btn--accent" type="submit">VALIDAR ↵</button>
          </form>
          <p class="vault-feedback" data-feedback="gof"></p>
          <button class="btn vault-reward" data-reward="gof" ${state.vault.gof ? '' : 'disabled'}>ACTIVAR FONDO GOD OF WAR ↗</button>
        </section>

        <div class="vault-note">
          <button class="btn vault-play">VOLVER AL ARCADE</button>
          <button class="btn vault-settings">ELEGIR FONDO EN AJUSTES</button>
        </div>
      </section>`,
    bind(body) {
      const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

      function refresh() {
        const total = (state.vault.matrix ? 1 : 0) + (state.vault.gof ? 1 : 0);
        body.querySelector('.vault-status').textContent = `${total}/2 LLAVES`;
        body.querySelectorAll('.vault-keys span').forEach(span => {
          const key = span.dataset.key;
          const unlocked = !!state.vault[key];
          span.classList.toggle('unlocked', unlocked);
          span.textContent = `${unlocked ? '✓ ' : '○ '}${key === 'matrix' ? 'LLAVE MATRIX' : 'LLAVE GOD OF WAR'}`;
        });
        body.querySelectorAll('[data-reward]').forEach(btn => {
          btn.disabled = !state.vault[btn.dataset.reward];
        });
      }

      const formMatrix = body.querySelector('form[data-key="matrix"]');
      if (formMatrix) {
        formMatrix.onsubmit = e => { 
          e.preventDefault();
          const input = formMatrix.querySelector('input');
          const a = normalize(input.value);
          const ok = ['morfeo', 'morpheus', 'morpheous'].includes(a) || a.includes('morfeo');
          if (ok) {
            state.vault.matrix = true;
            save();
            body.querySelector('[data-feedback="matrix"]').textContent = 'Llave correcta. Ya puedes activar Matrix verde/azul.';
            refresh();
            input.value = '';
          } else {
            body.querySelector('[data-feedback="matrix"]').textContent = 'Esa llave no encaja. Piensa en Matrix.';
          }
        };
      }

      const formGof = body.querySelector('form[data-key="gof"]');
      if (formGof) {
      formGof.addEventListener('submit', e => {
          e.preventDefault();
          const input = formGof.querySelector('input');
          const a = normalize(input.value);
          const compact = a.replace(/\s+/g, '');
          const ok = compact === 'godofwar' || compact === 'godsofwar' || a === 'god of war' || a === 'gods of war';
          if (ok) {
            state.vault.gof = true;
            save();
            body.querySelector('[data-feedback="gof"]').textContent = 'Llave correcta. Ya puedes activar God of War.';
            refresh();
            input.value = '';
          } else {
            body.querySelector('[data-feedback="gof"]').textContent = 'Esa llave no encaja. Es un favorito muy concreto.';
          }
        };
      }

      body.querySelector('[data-reward="matrix"]')?.addEventListener('click', () => {
        if (!state.vault.matrix) return toast('Primero desbloquea la llave Matrix.');
        state.wallpaper = 'matrix';
        state.wp = 4;
        state.atmosphere = 'matrixBlue';
        applyTheme();
        save();
        toast('Fondo Matrix verde/azul activado.');
      });

      body.querySelector('[data-reward="gof"]')?.addEventListener('click', () => {
        if (!state.vault.gof) return toast('Primero desbloquea la llave God of War.');
        state.wallpaper = 'godOfWar';
        state.atmosphere = 'none';
        applyTheme();
        save();
        toast('Fondo God of War activado.');
      });

      body.querySelector('.vault-play')?.addEventListener('click', () => openWindow('arcade'));
      body.querySelector('.vault-settings')?.addEventListener('click', () => openWindow('settings'));
    }
  };

  // Ajustes ampliados con fondo God of War y Matrix.
  Apps.settings = {
    title: 'Ajustes',
    icon: pixelIcon('settings'),
    size: [900, 760],
    render: () => `
      <div class="preferences preferences--updates">
        <aside class="preferences-nav">
          <span class="card-kicker">PERSONALIZA TU ESPACIO</span>
          <h2>Ajustes</h2>
          <a href="#pref-theme">01 / Apariencia</a>
          <a href="#pref-wallpaper">02 / Fondo</a>
          <a href="#pref-cursor">03 / Cursor</a>
          <a href="#pref-motion">04 / Movimiento</a>
          <a href="#pref-screen">05 / Salvapantallas</a>
          <div class="preferences-note">Se guarda en este navegador.<br>Tu escritorio, a tu manera.</div>
        </aside>
        <div class="preferences-main">
          <section id="pref-theme">
            <span class="card-kicker">01 / APARIENCIA</span>
            <h3>Un ambiente para cada idea.</h3>
            <div class="theme-picker">
              ${Object.entries(THEMES).map(([id, t]) => `
                <button data-theme="${id}" class="theme-option ${state.theme === id ? 'selected' : ''}" aria-pressed="${state.theme === id}">
                  <span class="theme-mini" style="--sample-bg:${t.bg};--sample-color:${t.accent}"><i></i><b>J</b><em></em></span>${t.name}
                </button>
              `).join('')}
            </div>
            <label class="pref-row">Color de acento<input class="accent-input" type="color" value="${state.accent}" aria-label="Color de acento"></label>
          </section>

          <section id="pref-wallpaper">
            <span class="card-kicker">02 / FONDO</span>
            <h3>Elige tu fondo.</h3>
            <div class="wallpaper-picker">
              ${[0, 1, 2, 3].map(i => `
                <button class="wallpaper-option ${state.wallpaper === 'static' && state.wp === i ? 'selected' : ''}" data-wallpaper="static${i}">
                  Gradiente ${i + 1}<small>${['Aurora', 'Bosque', 'Azul profundo', 'Violeta'][i]}</small>
                </button>
              `).join('')}
              <button class="wallpaper-option ${state.wallpaper === 'matrix' ? 'selected' : ''}" data-wallpaper="matrix">Matrix verde/azul<small>Animación ASCII Matrix</small></button>
              <button class="wallpaper-option ${state.wallpaper === 'godOfWar' ? 'selected' : ''}" data-wallpaper="godOfWar" ${state.vault.gof ? '' : 'disabled'}>
                God of War<small>${state.vault.gof ? 'Imagen personalizada' : 'Bloqueada en Secret Vault'}</small>
              </button>
            </div>

            <label class="pref-row" style="margin-top:18px">Fondo animado
              <select data-setting="atmosphere">
                ${Object.entries(ATMOSPHERES).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
              </select>
            </label>
            <label class="pref-row">Densidad
              <input type="range" min="15" max="90" step="5" data-setting="weatherDensity" aria-label="Densidad del fondo">
            </label>
            <label class="pref-row">Velocidad
              <select data-setting="weatherSpeed">
                <option value="0.5">Contemplativa</option>
                <option value="1">Natural</option>
                <option value="1.5">Enérgica</option>
              </select>
            </label>
          </section>

          <section id="pref-cursor">
            <span class="card-kicker">03 / CURSOR</span>
            <h3>Elige cómo señalar el mundo.</h3>
            <div class="cursor-picker">
              ${Object.entries(CURSORS).map(([id, label]) => `
                <button data-cursor="${id}" class="cursor-option ${state.cursor === id ? 'selected' : ''}" aria-pressed="${state.cursor === id}">
                  <span>${id === 'system' ? '↖' : cursorSVG(id, 30)}</span>${label}
                </button>
              `).join('')}
            </div>
            <label class="pref-row">Tamaño
              <select data-setting="cursorSize">
                <option value="20">Pequeño</option>
                <option value="24">Mediano</option>
                <option value="32">Grande</option>
              </select>
            </label>
            <div class="cursor-test">Prueba el cursor aquí. No hay círculo ni rastro.</div>
          </section>

          <section id="pref-motion">
            <span class="card-kicker">04 / MOVIMIENTO</span>
            <h3>Que el sistema respire.</h3>
            <label class="pref-row">Animación ASCII
              <select data-setting="bootEffect">
                ${Object.entries(EFFECTS).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
              </select>
            </label>
            <label class="pref-row">Intensidad
              <select data-setting="intensity">
                <option value="full">Expresiva</option>
                <option value="calm">Suave</option>
              </select>
            </label>
            <label class="pref-row">Reducir movimiento<input type="checkbox" data-setting="motion" ${state.motion ? 'checked' : ''}></label>
            <label class="pref-row">Textura de papel<input type="checkbox" data-setting="grain" ${state.grain ? 'checked' : ''}></label>
            <label class="pref-row">Sonidos del sistema<input type="checkbox" data-setting="sound" ${state.sound ? 'checked' : ''}></label>
            <button class="btn preview-ascii">VER ANIMACIÓN ASCII ↗</button>
          </section>

          <section id="pref-screen">
            <span class="card-kicker">05 / SALVAPANTALLAS</span>
            <h3>Arte cuando te tomas un descanso.</h3>
            <label class="pref-row">Iniciar tras inactividad
              <select data-setting="idle">
                <option value="0">Solo manualmente</option>
                <option value="60">1 minuto</option>
                <option value="180">3 minutos</option>
              </select>
            </label>
            <button class="btn start-saver">ABRIR SALVAPANTALLAS ↗</button>
          </section>
        </div>
      </div>`,
    bind(body) {
      for (const el of $$('[data-setting]', body)) {
        const key = el.dataset.setting;
        if (el.type !== 'checkbox') el.value = String(state[key]);
        el.addEventListener(el.type === 'range' ? 'input' : 'change', () => {
          state[key] = el.type === 'checkbox'
            ? el.checked
            : ['idle', 'wp', 'cursorSize', 'weatherDensity', 'weatherSpeed'].includes(key)
              ? Number(el.value)
              : el.value;

          if (key === 'atmosphere') {
            if (['matrixBlue', 'matrixDepth', 'matrix'].includes(el.value)) state.wallpaper = 'matrix';
            else if (el.value === 'none' && state.wallpaper === 'matrix') state.wallpaper = 'static';
          }

          if (key === 'sound' && state.sound && typeof beep === 'function') beep();
          applyTheme();
          save();
        });
      }

      $$('[data-theme]', body).forEach(button => {
        button.onclick = () => {
          chooseTheme(button.dataset.theme);
          $$('[data-theme]', body).forEach(b => {
            const on = b === button;
            b.classList.toggle('selected', on);
            b.setAttribute('aria-pressed', on);
          });
          const accentInput = $('.accent-input', body);
          if (accentInput) accentInput.value = state.accent;
        };
      });

      $$('[data-wallpaper]', body).forEach(button => {
        if (button.disabled) return;
        button.onclick = () => {
          const val = button.dataset.wallpaper;
          if (val === 'godOfWar' && !state.vault.gof) return toast('Bloquea God of War en Secret Vault.');
          if (val === 'matrix') {
            state.wallpaper = 'matrix';
            state.wp = 4;
            state.atmosphere = 'matrixBlue';
          } else if (val === 'godOfWar') {
            state.wallpaper = 'godOfWar';
            state.atmosphere = 'none';
          } else {
            state.wallpaper = 'static';
            state.wp = Number(val.replace('static', ''));
            state.atmosphere = 'none';
          }
          applyTheme();
          save();
          $$('[data-wallpaper]', body).forEach(x => x.classList.toggle('selected', x === button));
        };
      });

      $$('[data-cursor]', body).forEach(button => {
        button.onclick = () => {
          state.cursor = button.dataset.cursor;
          applyShell();
          save();
          $$('[data-cursor]', body).forEach(b => {
            const on = b === button;
            b.classList.toggle('selected', on);
            b.setAttribute('aria-pressed', on);
          });
        };
      });

      const accentInput = $('.accent-input', body);
      if (accentInput) accentInput.oninput = e => {
        state.accent = e.target.value;
        applyTheme();
        save();
      };

      $('.preview-ascii', body)?.addEventListener('click', () => openWindow('screensaver'));
      $('.start-saver', body)?.addEventListener('click', () => showScreensaver());
    }
  };

  // Aplicar fondo God of War por encima del applyTheme base.
  const previousApplyTheme = applyTheme;
  applyTheme = function () {
    previousApplyTheme();
    const bg = document.querySelector('#bg');
    if (!bg) return;
    const gof = !!state.vault?.gof && state.wallpaper === 'godOfWar';
    document.body.classList.toggle('has-god-of-war', gof);
    if (gof) {
      bg.style.background = `linear-gradient(180deg, rgba(0,0,0,.38), rgba(0,0,0,.62)), url("${GOW_URL}") center/cover no-repeat, var(--bg)`;
    }
  };

  applyTheme();
  buildIcons();
  buildMenu();
})();