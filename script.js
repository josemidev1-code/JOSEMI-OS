/* JOSEMI-OS · JavaScript sin librerías.
   1. Datos y preferencias. 2. Aplicaciones. 3. Ventanas.
   4. Fondos. 5. Milo. 6. Juegos conservados del proyecto original. */
'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const escapeHTML = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const GOW_URL = 'https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg';
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let state = {wallpaper:'default', vault:{matrix:false,gof:false}, motion:motionPreference.matches};
try {
  const stored = JSON.parse(localStorage.getItem('josemi-os-v6') || 'null');
  if (stored && typeof stored === 'object') {
    state.vault.matrix = stored.vault?.matrix === true;
    state.vault.gof = stored.vault?.gof === true;
    if (['default','matrix','godOfWar'].includes(stored.wallpaper)) state.wallpaper = stored.wallpaper;
    state.motion = stored.motion === true || motionPreference.matches;
  }
} catch {}
if (state.wallpaper === 'matrix' && !state.vault.matrix || state.wallpaper === 'godOfWar' && !state.vault.gof) state.wallpaper = 'default';
function save() { try { localStorage.setItem('josemi-os-v6', JSON.stringify(state)); } catch {} }
function toast(message) {
  const item = document.createElement('p'); item.textContent = message; $('#toasts').append(item);
  setTimeout(() => item.remove(), 4200);
}
// Los iconos se dibujan como cuadrículas. Cambia los colores o los píxeles aquí.
const ICON_GRIDS = {
  about:['....AAAA....','...ABBBBA...','...ABCCBA...','....BBBB....','.....BB.....','...DDDDDD...','..DDDDDDDD..','..BDDDDDDB..','..BDEEEEDB..','...EE..EE...','...EE..EE...'],
  projects:['............','..AAAA......','.ABBBBA.....','.ABBBBBAAAA.','.ABBBBBBBBA.','.ACCCCCCCCA.','.ACCCCCCCCA.','.ACCCCCCCCA.','.ACCCCCCCCA.','.AAAAAAAAAA.','............'],
  contact:['............','.AAAAAAAAAA.','.ABBBBBBBBA.','.ACBBBBBBCA.','.ABCCBBCCBA.','.ABBBCCBBBA.','.ABBBBBBBBA.','.ABBBBBBBBA.','.AAAAAAAAAA.','............','............'],
  terminal:['............','.AAAAAAAAAA.','.ABBBBBBBBA.','.ABCB BBBBA.'.replace(' ', 'B'),'.ABB CBBBBA.'.replace(' ', 'B'),'.ABCBBDDDBA.','.ABBBBBBBBA.','.ABBBBBBBBA.','.AAAAAAAAAA.','............','............'],
  arcade:['.....AA.....','....ABBA....','....ABBA....','.....AA.....','.....CC.....','.....CC.....','..DDDDDDDD..','.DEEEEEEEED.','.DEFFEEF EED.'.replace(' ', ''),'.DDDDDDDDDD.','............'],
  easter:['....AAAA....','...ABBBBA...','...AB..BA...','...AB..BA...','.CCCCCCCCCC.','.CDDDDDDDDC.','.CDDD A DDC.'.replaceAll(' ', 'D'),'.CDDDABDDDC.','.CDDDABDDDC.','.CCCCCCCCCC.','............'],
  settings:['.....AA.....','...AAAAAA...','..AABBBBAA..','.AABBCCBBAA.','.ABBCCCCBBA.','.ABBCCCCBBA.','.AABBCCBBAA.','..AABBBBAA..','...AAAAAA...','.....AA.....','............'],
  tetris:['............','..AAAAAA....','..ABABAB....','..AAAAAA....','....AA......','....AB......','....AA......','............'],
  pacman:['............','....AAAA....','..AAAAAAA...','.AAAAAB.....','.AAAA.......','.AAAA.......','..AAAAAAA...','....AAAA....','............'],
  mario:['............','....AAAA....','..AAAAAAAA..','.AABBAABBAA.','.AAAAAAAAAA.','....CCCC....','....CBBC....','....CCCC....','............']
};
const PALETTES = {
  about:['#31453d','#e8bc92','#4d3a31','#88bda5','#42686d'],
  projects:['#8d6a31','#edbf67','#f6d58b'], contact:['#496e87','#b4d2de','#81a8c5'],
  terminal:['#5c8170','#10231c','#9df4b5','#9df4b5'], arcade:['#984e49','#f39488','#a1adb2','#40535b','#8aaba7','#f6d280'],
  easter:['#b39158','#1c3028','#9b7136','#e4bb70'], settings:['#657c83','#abc5cb','#1e332f'],
  tetris:['#b095e2','#ddcaf5'], pacman:['#f6d16b','#1c3028'], mario:['#de857a','#fce6cb','#e7c08d']
};
function pixelIcon(id) {
  const grid = ICON_GRIDS[id] || ICON_GRIDS.projects, palette = PALETTES[id] || PALETTES.projects;
  let rects = '';
  grid.forEach((row,y) => [...row].forEach((cell,x) => { if (cell !== '.') rects += '<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+(palette[cell.charCodeAt(0)-65] || palette[0])+'"/>'; }));
  return '<svg class="os-icon" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">'+rects+'</svg>';
}
// Mascota original de coral, hecha con bloques; no necesita un archivo de imagen.
const MILO = '<svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path fill="#cf7766" d="M8 3h2v3h4V3h2v3h3v3h3v7h-3v3h-2v3h-3v-3h-4v3H7v-3H5v-3H2V9h3V6h3z"/><path fill="#e89a85" d="M7 7h10v2h3v6h-3v2H7v-2H4V9h3z"/><path fill="#242e28" d="M8 10h2v3H8zm6 0h2v3h-2zM10 15h4v1h-4z"/><path fill="#f8c5a5" d="M5 13h2v2H5zm12 0h2v2h-2z"/></svg>';
$$('.mascot-art').forEach(element => element.innerHTML = MILO);
const Apps = {};
const BIO = 'Desde pequeño me apasiona la tecnología. Empecé jugando a videojuegos y quise entender cómo funcionaban. La tele, el móvil y el ordenador tienen código detrás: ahora quiero aprender a crear mis propias ideas.';
Apps.about = {title:'Sobre mí', render:() => '<p class="eyebrow">EL CREADOR DEL SISTEMA</p><h2>Hola, soy Josemi.</h2><p>'+BIO+'</p><div class="content-grid"><article><h3>Ahora</h3><p>Estudio DAM en el IES Dr. Lluís Simarro. Practico HTML, CSS, JavaScript y Git construyendo webs y proyectos de formación.</p></article><article><h3>Cómo trabajo</h3><p>Disciplina, motivación, ganas de aprender y compromiso con lo que hago.</p></article><article><h3>Me gusta</h3><p>El gimnasio, hacer deporte, programar, trabajar en proyectos, la ciencia ficción, ir al cine y leer.</p></article><article><h3>Mi siguiente paso</h3><p>Aprender a conectar APIs y dar una voz de IA a Milo, el asistente de esta web.</p></article></div>'};
Apps.projects = {title:'Proyectos', render:() => '<p class="eyebrow">CÓDIGO QUE PUEDES EXPLORAR</p><h2>Mis proyectos.</h2><div class="content-grid"><article>'+pixelIcon('projects')+'<h3>JOSEMI-OS</h3><p>Un portfolio que convierte la visita en un escritorio interactivo. HTML, CSS y JavaScript sin librerías; sigo iterando su diseño y sus aplicaciones.</p><a class="btn" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener noreferrer">VER REPOSITORIO ↗</a></article><article>'+pixelIcon('projects')+'<h3>Museu grec</h3><p>Proyecto de formación para practicar diseño web y organizar información sobre el mundo griego.</p><a class="btn" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener noreferrer">VER REPOSITORIO ↗</a></article></div>'};
Apps.contact = {title:'Contacto', render:() => '<p class="eyebrow">SIN COMPLICACIONES</p><h2>¿Construimos algo?</h2><p>Para oportunidades, ideas o feedback, puedes escribirme directamente.</p><div class="contact-options"><a href="mailto:josemidev1@gmail.com">josemidev1@gmail.com ↗</a><a href="https://github.com/josemidev1-code" target="_blank" rel="noopener noreferrer">GitHub / josemidev1-code ↗</a><a href="https://www.linkedin.com/in/jose-miguel-miralles-gandia-74347b43a/" target="_blank" rel="noopener noreferrer">LinkedIn / José Miguel Miralles Gandia ↗</a></div>'};
Apps.arcade = {title:'Arcade', size:[940,650], render:() => '<p class="eyebrow">JOSEMI / ARCADE COLLECTION</p><h2>Una partida más.</h2><p>Tres juegos conservados del proyecto. Récords guardados en este navegador.</p><div class="arcade-grid">'+[['mario','JOSEMI Run','Tres mundos originales de plataformas.','← → · Espacio · Shift'],['pacman','Pac-Man','Un laberinto, fantasmas y energía.','Flechas · P pausa'],['tetris','Tetris','Piezas, líneas y un nivel más.','Flechas · Espacio · P']].map(([id,title,desc,keys]) => '<button class="game-card game-card--'+id+'" data-open="'+id+'">'+pixelIcon(id)+'<h3>'+title+'</h3><p>'+desc+'</p><small>'+keys+'</small><span class="game-card__bottom">JUGAR ↗ <span>RÉCORD '+bestScore(id)+'</span></span></button>').join('')+'</div><p class="arcade-footnote">Se pausan al cambiar de ventana o pestaña. Haz clic en el juego para recuperar el teclado.</p>'};
const CHALLENGES = [
  {id:'matrix', name:'Matrix', question:'¿Quién ayuda a Neo a escapar de Matrix?', hint:'Le ofrece elegir entre la pastilla roja y la azul.', answer:['morfeo','morpheus'], reward:'Lluvia Matrix verde + azul', number:'01'},
  {id:'gof', name:'God of War', question:'¿Cuál es el videojuego favorito de Josemi?', hint:'Kratos es su protagonista. También hay una pista en mis aficiones.', answer:['god of war','godofwar'], reward:'Fondo de God of War', number:'02'}
];
Apps.easter = {title:'Secret Vault', size:[850,690], render:() => '<section class="vault"><div class="vault-heading"><p class="eyebrow">DOS PISTAS. DOS MUNDOS.</p><span class="vault-status"></span></div><h2>Detrás de la puerta.</h2><p>Conóceme un poco más y desbloquea un nuevo aspecto para tu escritorio.</p><div class="vault-cards">'+CHALLENGES.map(c => '<article class="vault-card" data-challenge="'+c.id+'"><div class="vault-symbol">'+(c.id==='matrix'?'&gt;_':'Ω')+'</div><span class="eyebrow">LLAVE '+c.number+' / '+c.name.toUpperCase()+'</span><h3>'+c.question+'</h3><form data-key="'+c.id+'"><label class="sr-only" for="answer-'+c.id+'">Respuesta para '+c.name+'</label><input id="answer-'+c.id+'" autocomplete="off" maxlength="100" placeholder="Tu respuesta…" required><button class="btn btn--accent">DESBLOQUEAR ↗</button></form><button class="hint-button" data-hint="'+c.id+'">Necesito una pista</button><p class="vault-feedback" data-feedback="'+c.id+'" role="status"></p><button class="btn reward" data-reward="'+c.id+'">'+c.reward+'</button></article>').join('')+'</div><p class="vault-note">Tus llaves se guardan aquí, en este navegador. Es un juego de curiosidad.</p></section>', bind(body) {
  const refresh = () => {
    $('.vault-status',body).textContent = Number(state.vault.matrix)+Number(state.vault.gof)+'/2 LLAVES';
    CHALLENGES.forEach(c => {
      $('[data-challenge="'+c.id+'"]',body).classList.toggle('unlocked',state.vault[c.id]);
      $('[data-reward="'+c.id+'"]',body).disabled = !state.vault[c.id];
    });
  };
  CHALLENGES.forEach(c => {
    $('[data-key="'+c.id+'"]',body).onsubmit = event => {
      event.preventDefault(); const input = $('input',event.target);
      if (c.answer.includes(normalize(input.value).replace(/\s+/g,' '))) {
        state.vault[c.id] = true; save(); refresh();
        $('[data-feedback="'+c.id+'"]',body).textContent = '¡Llave correcta! Ya puedes activar tu fondo.'; input.value = '';
      } else $('[data-feedback="'+c.id+'"]',body).textContent = 'Todavía no. Prueba otra respuesta o pide una pista.';
    };
    $('[data-hint="'+c.id+'"]',body).onclick = () => $('[data-feedback="'+c.id+'"]',body).textContent = c.hint;
    $('[data-reward="'+c.id+'"]',body).onclick = () => selectWallpaper(c.id==='gof'?'godOfWar':'matrix');
  }); refresh();
}};
Apps.settings = {title:'Ajustes', render:() => '<p class="eyebrow">TU ESCRITORIO, A TU MANERA</p><h2>Cambia el ambiente.</h2><p>Los fondos especiales se consiguen en la Secret Vault.</p><div class="wallpaper-picker">'+[['default','Terminal nocturna','Siempre disponible'],['matrix','Matrix verde + azul',state.vault.matrix?'Desbloqueado':'Bloqueado · llave Matrix'],['godOfWar','God of War',state.vault.gof?'Desbloqueado':'Bloqueado · llave Kratos']].map(([id,name,note])=>'<button class="wallpaper-option" data-wallpaper="'+id+'" aria-pressed="'+(state.wallpaper===id)+'" '+(id==='matrix'&&!state.vault.matrix||id==='godOfWar'&&!state.vault.gof?'disabled':'')+'><span class="wallpaper-swatch swatch-'+id+'"></span><strong>'+name+'</strong><small>'+note+'</small></button>').join('')+'</div><label class="motion-setting"><input type="checkbox" id="motion-setting" '+(state.motion?'checked':'')+' '+(motionPreference.matches?'disabled':'')+'> Reducir movimiento</label><p class="muted">Se respeta también la preferencia de tu sistema.</p><button class="btn" data-open="easter">ABRIR SECRET VAULT ↗</button>', bind(body) {
  $$('[data-wallpaper]',body).forEach(button => button.onclick = () => {
    selectWallpaper(button.dataset.wallpaper).then(()=>{
      $$('[data-wallpaper]',body).forEach(b => b.setAttribute('aria-pressed',b.dataset.wallpaper===state.wallpaper));
    });
  });
  $('#motion-setting',body).onchange = event => { state.motion=event.target.checked; save(); syncMatrix(); };
}};
Apps.terminal = {title:'Terminal', render:() => '<div class="terminal"><p>JOSEMI-OS / Terminal local</p><p>Escribe ayuda para ver los comandos.</p><div class="term-output" role="log" aria-live="polite"></div><form class="term-form"><label for="term-input">josemi ~ &gt;</label><input id="term-input" class="term-input" autocomplete="off" spellcheck="false" maxlength="200" aria-label="Comando de terminal"></form></div>', bind(body) {
  $('.term-form',body).onsubmit = event => {
    event.preventDefault(); const input=$('.term-input',body), cmd=normalize(input.value), output=$('.term-output',body);
    const replies={ayuda:'Comandos: sobre-mi, proyectos, contacto, arcade, vault, matrix, fecha, limpiar',fecha:new Date().toLocaleDateString('es-ES',{timeZone:'Europe/Madrid'}),matrix:'La llave Matrix te espera en la Secret Vault.'};
    const routes={'sobre-mi':'about',proyectos:'projects',contacto:'contact',arcade:'arcade',vault:'easter'};
    if(cmd==='limpiar')output.replaceChildren();else {
      const line=document.createElement('p');line.textContent='> '+input.value+'\n'+(replies[cmd]||(routes[cmd]?'Abriendo '+Apps[routes[cmd]].title+'…':'Comando desconocido. Escribe ayuda.'));output.append(line);
      if(routes[cmd])openWindow(routes[cmd]);
    } input.value=''; if(cmd==='matrix')openWindow('easter');
  };
}};
// Ventanas: una instancia por aplicación, con arrastre, minimizar y maximizar.
const openWindows = new Map(); let topLayer=10;
function focusWindow(win) { win.style.zIndex=++topLayer; win.focus({preventScroll:true}); }
function openWindow(id) {
  if (!Apps[id]) return;
  if ($('#desktop').hidden) enterDesktop(false);
  if (openWindows.has(id)) { const win=openWindows.get(id);win.classList.remove('minimized');focusWindow(win);syncMatrix();return win; }
  const app=Apps[id], win=document.createElement('section');
  win.className='window open'; win.dataset.id=id; win.tabIndex=-1;
  win.setAttribute('aria-label',app.title);
  win.style.width=Math.min(app.size?.[0]||740,innerWidth-32)+'px';
  win.style.height=Math.min(app.size?.[1]||570,innerHeight-125)+'px';
  win.style.left=Math.max(16,(innerWidth-parseInt(win.style.width))/2+(openWindows.size%3)*14)+'px';
  win.style.top=Math.max(16,Math.min(55+(openWindows.size%3)*22,innerHeight-parseInt(win.style.height)-100))+'px';
  win.innerHTML='<div class="win__bar"><div class="win__title">'+pixelIcon(id)+'<span>'+app.title+'</span></div><div class="win__btns"><button class="win-btn min" aria-label="Minimizar">−</button><button class="win-btn max" aria-label="Maximizar">□</button><button class="win-btn close" aria-label="Cerrar">×</button></div></div><div class="win__body"></div><div class="win__resize"></div>';
  $('#windows').append(win); openWindows.set(id,win); $('.win__body',win).innerHTML=app.render();
  const chip=document.createElement('button');chip.dataset.window=id;chip.title=app.title;chip.setAttribute('aria-label','Mostrar '+app.title);chip.innerHTML=pixelIcon(id);
  chip.onclick=()=>{win.classList.remove('minimized');focusWindow(win);syncMatrix();};$('#open-apps').append(chip);
  $('.close',win).onclick=()=>closeWindow(id);
  $('.min',win).onclick=()=>{win.classList.add('minimized');syncMatrix();chip.focus();};
  $('.max',win).onclick=()=>{win.classList.toggle('maximized');syncMatrix();};
  $('.win__bar',win).ondblclick=e=>{if(!e.target.closest('button'))$('.max',win).click();};
  win.addEventListener('pointerdown',()=>focusWindow(win));
  $('.win__bar',win).addEventListener('pointerdown',event=>{
    if(event.target.closest('button')||win.classList.contains('maximized')||innerWidth<700)return;
    event.preventDefault();const handle=event.currentTarget, rect=win.getBoundingClientRect(), dx=event.clientX-rect.left,dy=event.clientY-rect.top;
    handle.setPointerCapture(event.pointerId);
    handle.onpointermove=e=>{win.style.left=Math.max(0,Math.min(innerWidth-win.offsetWidth,e.clientX-dx))+'px';win.style.top=Math.max(0,Math.min(innerHeight-130,e.clientY-dy))+'px';};
    handle.onpointerup=handle.onlostpointercapture=()=>{handle.onpointermove=null;};
  });
  focusWindow(win); if(app.bind)app.bind($('.win__body',win),win);syncMatrix();return win;
}
function closeWindow(id) {
  const win=openWindows.get(id);if(!win)return;win.__cleanup?.();win.remove();openWindows.delete(id);
  $('[data-window="'+id+'"]')?.remove();syncMatrix();
  const next=[...openWindows.values()].filter(w=>!w.classList.contains('minimized')).pop();
  if(next)focusWindow(next);else $('.icon')?.focus();
}
const WM={closeWindow,openWindow};
const DESKTOP_APPS=['about','projects','contact','terminal','arcade','easter','settings'];
let landingScroll=0;
function enterDesktop(focus=true) {
  if(!$('#landing').hidden)landingScroll=scrollY;
  $('#landing').hidden=true;$('#desktop').hidden=false;document.body.classList.add('desktop-mode');
  if(focus)$('.desktop-title h1').focus();syncMatrix();
}
function showLanding() {
  [...openWindows.keys()].forEach(closeWindow);
  $('#desktop').hidden=true;$('#landing').hidden=false;document.body.classList.remove('desktop-mode');
  scrollTo(0,landingScroll);$('#landing-title').focus({preventScroll:true});syncMatrix();
}
function searchApps() {
  const query=normalize($('#search-input').value), list=$('#search-results');list.replaceChildren();
  DESKTOP_APPS.filter(id=>normalize(Apps[id].title+' '+id).includes(query)).forEach(id=>{
    const button=document.createElement('button');button.innerHTML=pixelIcon(id)+'<span>'+Apps[id].title+'</span><span>↗</span>';
    button.onclick=()=>{$('#search-dialog').close();openWindow(id);};list.append(button);
  });if(!list.children.length)list.textContent='No hay aplicaciones con ese nombre.';
}
function initDesktop() {
  DESKTOP_APPS.forEach(id=>{
    const button=document.createElement('button');button.className='icon';button.dataset.id=id;button.setAttribute('aria-label','Abrir '+Apps[id].title);
    button.innerHTML=pixelIcon(id)+'<span>'+Apps[id].title+'</span>';button.onclick=()=>openWindow(id);$('#icons').append(button);
  });
}
// Fondo Matrix: estático en la landing; animado solo tras desbloquearlo.
let matrixRAF=0,lastFrame=0,drops=[],matrixWidth=0,matrixHeight=0;
const matrixCanvas=$('#matrix'), matrixContext=matrixCanvas.getContext('2d');
function drawMatrix(staticFrame=false) {
  if(!matrixContext)return;
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.5);
  if(w!==matrixWidth||h!==matrixHeight) {
    matrixWidth=w;matrixHeight=h;matrixCanvas.width=w*dpr;matrixCanvas.height=h*dpr;
    matrixContext.setTransform(dpr,0,0,dpr,0,0);drops=Array.from({length:Math.ceil(w/24)},()=>Math.random()*h/22);
    matrixContext.clearRect(0,0,w,h);
  }
  if(staticFrame)matrixContext.clearRect(0,0,w,h);
  else {matrixContext.fillStyle='rgba(8,14,13,.14)';matrixContext.fillRect(0,0,w,h);}
  matrixContext.font='14px monospace';
  const glyphs='01アイウエオカキクケコ<>/';
  drops.forEach((drop,x)=>{
    const count=staticFrame?8:1;
    for(let t=0;t<count;t++){matrixContext.fillStyle=x%5===0?'#54c9e7':'#62c68b';matrixContext.fillText(glyphs[Math.floor(Math.random()*glyphs.length)],x*24,(drop-t)*22);}
    if(!staticFrame)drops[x]=drop*22>h&&Math.random()>.97?0:drop+.7;
  });
}
function matrixActive() { return !document.hidden&&!$('#desktop').hidden&&state.wallpaper==='matrix'&&!state.motion&&!$$('.window').some(w=>!w.classList.contains('minimized')&&w.querySelector('.game')); }
function matrixTick(time) {matrixRAF=0;if(!matrixActive())return;if(time-lastFrame>65){drawMatrix();lastFrame=time;}matrixRAF=requestAnimationFrame(matrixTick);}
function syncMatrix() {
  cancelAnimationFrame(matrixRAF);matrixRAF=0;
  document.body.classList.toggle('reduce-motion',state.motion);
  const gow=!$('#desktop').hidden&&state.wallpaper==='godOfWar';
  matrixCanvas.hidden=gow;document.body.classList.toggle('gow-wallpaper',gow);
  drawMatrix(true);if(matrixActive())matrixRAF=requestAnimationFrame(matrixTick);
}
async function selectWallpaper(id) {
  if(!['default','matrix','godOfWar'].includes(id)||id==='matrix'&&!state.vault.matrix||id==='godOfWar'&&!state.vault.gof)return;
  if(id==='godOfWar') {
    toast('Cargando fondo de God of War…');
    try {
      // Una única imagen externa, solo al elegir el premio. La web funciona sin ella.
      const image=new Image();
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Tiempo agotado')),12000);
        image.onload=()=>{clearTimeout(timer);resolve();};
        image.onerror=()=>{clearTimeout(timer);reject(new Error('Imagen no disponible'));};
        image.src=GOW_URL;
      });
      document.body.style.setProperty('--gow-image','url("'+GOW_URL+'")');
    } catch {toast('El fondo no está disponible ahora. Conservamos tu fondo actual.');return;}
  }
  state.wallpaper=id;save();syncMatrix();toast('Fondo activado. Tu elección se guarda en este navegador.');
}
// Milo: respuestas locales verificables. La futura API se conectará en getAssistantReply.
// Nunca añadas una clave secreta al HTML ni al JavaScript público.
const RAMAS=[
  {keys:['proyecto','project','repositorio'],text:'Josemi está construyendo JOSEMI-OS y una web del Museu grec. Son proyectos para aprender y demostrar lo que puede crear.',app:'projects'},
  {keys:['sobre mi','josemi','estudia','estudio','dam','curso','study'],text:'Josemi estudia DAM en el IES Dr. Lluís Simarro. Aprende HTML, CSS, JavaScript y Git, y practica construyendo proyectos reales.',app:'about'},
  {keys:['contacto','correo','email','contact','escribir','presupuesto','horario'],text:'Puedes escribir a Josemi en josemidev1@gmail.com. Para horarios, oportunidades o presupuestos, consúltale directamente.',app:'contact'},
  {keys:['vault','secreto','matrix','morfeo','kratos'],text:'La Secret Vault guarda dos llaves: Matrix y God of War. Las pistas te ayudarán a desbloquear fondos para el escritorio.',app:'easter'},
  {keys:['juego','arcade','tetris','pacman','mario'],text:'El Arcade tiene JOSEMI Run, Pac-Man y Tetris. Los récords se guardan en este navegador.',app:'arcade'},
  {keys:['gusta','aficion','deporte','gimnasio','cine','lectura','god of war','motivacion'],text:'Le gusta entrenar, hacer deporte, programar, trabajar en proyectos, ver ciencia ficción, ir al cine y leer. Su videojuego favorito es God of War.',app:'about'},
  {keys:['quien eres','creado','milo','asistente','bot'],text:'Soy Milo, el asistente local de la web de Josemi. Respondo con frases preparadas y te ayudo a explorar; todavía no estoy conectado a un modelo de IA.'},
  {keys:['hola','hello','hi'],text:'¡Hola! Soy Milo. Puedes preguntarme por los estudios, proyectos y aficiones de Josemi, o pedirme su contacto.'}
];
function getLocalReply(message) {
  const question=normalize(message);
  if(/direccion|dni|telefono|madre|padre|edad|instrucciones|ignora|olvida/.test(question))return {text:'Solo comparto los datos públicos de este portfolio. Para cualquier otra consulta, escribe a Josemi en josemidev1@gmail.com.'};
  const match=RAMAS.map(branch=>({...branch,score:branch.keys.filter(key=>question.includes(key)).length})).sort((a,b)=>b.score-a.score)[0];
  return match?.score?match:{text:'Eso no lo sé. Puedo ayudarte con sus estudios, proyectos, aficiones y contacto. Para algo más concreto, escribe a josemidev1@gmail.com.'};
}
/* PUNTO DE CONEXIÓN PARA CLASE:
   getLocalReply contesta sin red. getAssistantReply será el lugar para llamar
   a la API del centro o enrutar una pregunta sobre el tiempo a Open-Meteo.
   Devuelve siempre {text: 'respuesta', app: 'id opcional'}.
   sendChat ya muestra la respuesta con textContent y recupera el campo al fallar. */
async function getAssistantReply(message) {
  return getLocalReply(message);
}
let chatBusy=false;
function chatMessage(text,role) {const p=document.createElement('p');p.className=role;p.textContent=text;$('#chat-log').append(p);while($('#chat-log').children.length>30)$('#chat-log').firstElementChild.remove();$('#chat-log').scrollTop=$('#chat-log').scrollHeight;return p;}
function toggleChat(show) {$('#mascot-chat').hidden=!show;$('#mascot-button').setAttribute('aria-expanded',show);if(show)$('#chat-input').focus();else $('#mascot-button').focus();}
async function sendChat(message) {
  message=message.trim().slice(0,500);if(!message||chatBusy)return;
  chatBusy=true;chatMessage(message,'user');$('#chat-input').value='';
  const pending=chatMessage('Milo está escribiendo…','assistant');
  try {
    const reply=await getAssistantReply(message);pending.textContent=reply.text;
    if(reply.app){const button=document.createElement('button');button.className='chat-app';button.textContent='Abrir '+Apps[reply.app].title+' ↗';button.onclick=()=>{toggleChat(false);openWindow(reply.app);};pending.append(button);}
  } catch {pending.textContent='Ahora no puedo responder. Puedes escribir a Josemi en josemidev1@gmail.com.';}
  finally {chatBusy=false;$('#chat-log').scrollTop=$('#chat-log').scrollHeight;}
}
function beep() {} // Los juegos mantienen este gancho de sonido, desactivado por defecto.
function initialize() {
  initDesktop();$('#dock [data-open="settings"]').innerHTML=pixelIcon('settings');
  $$('[data-enter]').forEach(b=>b.onclick=()=>enterDesktop());
  $('#home-button').onclick=showLanding;
  document.addEventListener('click',event=>{const button=event.target.closest('[data-open]');if(button)openWindow(button.dataset.open);});
  $('#search-button').onclick=()=>{searchApps();$('#search-dialog').showModal();$('#search-input').focus();};
  $('#search-input').oninput=searchApps;
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#search-button').click();}
    if(event.key==='Escape'&&!$('#mascot-chat').hidden)toggleChat(false);
  });
  $('#mascot-button').onclick=()=>toggleChat($('#mascot-chat').hidden);
  $('#close-chat').onclick=()=>toggleChat(false);
  $$('[data-chat-open]').forEach(button=>button.onclick=()=>toggleChat(true));
  $('#chat-form').onsubmit=event=>{event.preventDefault();sendChat($('#chat-input').value);};
  $$('[data-chat]').forEach(button=>button.onclick=()=>sendChat(button.dataset.chat));
  addEventListener('resize',syncMatrix);document.addEventListener('visibilitychange',syncMatrix);
  motionPreference.addEventListener('change',()=>{state.motion=motionPreference.matches;save();syncMatrix();});
  syncMatrix();
  if(state.wallpaper==='godOfWar')selectWallpaper('godOfWar');
}

/* JUEGOS: motores conservados de JOSEMI-OS. */
function recordScore(id,n){try{const key='josemi-best-'+id,best=Math.max(n,Number(localStorage.getItem(key))||0);localStorage.setItem(key,best);const label=document.querySelector(`.game-card--${id} .game-card__bottom span`);if(label)label.textContent='RÉCORD '+best;}catch{}}
function bestScore(id){try{return Number(localStorage.getItem('josemi-best-'+id))||0;}catch{return 0;}}
// PANTALLA DE JUEGO: dibuja un velo oscuro y un mensaje de inicio, pausa o final sobre el Canvas.
function gameOverlay(ctx,cv,title,sub){ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(0,0,cv.width,cv.height);ctx.textAlign='center';ctx.fillStyle='#6dff9b';ctx.font='bold 17px monospace';ctx.fillText(title,cv.width/2,cv.height/2-10);ctx.font='10px monospace';ctx.fillStyle='#dbe8df';ctx.fillText(sub,cv.width/2,cv.height/2+16);}
// PAUSA AUTOMÁTICA: observa minimizar, cambiar pestaña o perder foco. El cierre retira todos los listeners.
function attachGameLifecycle(win,pause){
  const check=()=>{if(win.classList.contains('minimized')||win.classList.contains('minimizing')||document.hidden||!win.contains(document.activeElement))pause();};
  const observer=new MutationObserver(check);observer.observe(win,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',check);document.addEventListener('focusin',check);window.addEventListener('blur',pause);
  const cleanup=win.__cleanup;win.__cleanup=()=>{cleanup?.();observer.disconnect();document.removeEventListener('visibilitychange',check);document.removeEventListener('focusin',check);window.removeEventListener('blur',pause);};
}
// CONTROLES TÁCTILES: botones que envían las mismas teclas que utiliza el juego.
function addGameControls(body,win,keys){
  const row=document.createElement('div');row.className='game-controls';const names={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',' ':'CAÍDA',p:'PAUSA'};
  keys.forEach(key=>{const b=document.createElement('button');b.className='btn';b.textContent=names[key]||key.toUpperCase();b.type='button';b.addEventListener('click',()=>{win.focus();win.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));});row.append(b);});body.querySelector('.game').append(row);
}


Object.assign(Apps, {
 tetris:{title:'Tetris',icon:pixelIcon('tetris'),render:()=>`
   <div class="game game--tetris">
     <div class="tetris-layout">
       <canvas class="tetris-canvas" width="200" height="400" aria-label="Tablero de Tetris"></canvas>
       <div class="game-side">
         <div class="game-panel"><span>SIGUIENTE</span><canvas class="tetris-next" width="96" height="96"></canvas></div>
         <div class="game-panel"><span>PUNTOS</span><b class="tetris-score">0</b></div>
         <div class="game-panel"><span>LÍNEAS</span><b class="tetris-lines">0</b></div>
         <div class="game-panel"><span>NIVEL</span><b class="tetris-level">1</b></div>
         <button class="btn tetris-start">NUEVA PARTIDA</button>
         <button class="btn tetris-pause" disabled>PAUSA</button>
       </div>
     </div>
     <div class="game-help">← → mover · ↓ bajar · ↑/X girar · Z giro inverso · ESPACIO caída · P pausa</div>
   </div>`,
   bind(b,win){
     win=win||b.closest('.window');
     const cv=$('.tetris-canvas',b),ctx=cv.getContext('2d'),nextCv=$('.tetris-next',b),nextCtx=nextCv.getContext('2d');
     const scoreEl=$('.tetris-score',b),linesEl=$('.tetris-lines',b),levelEl=$('.tetris-level',b);
     const startBtn=$('.tetris-start',b),pauseBtn=$('.tetris-pause',b);
     const COLS=10,ROWS=20,S=20;
     const PIECES={
       I:{c:'#00d7ff',s:[[1,1,1,1]]},O:{c:'#ffd21f',s:[[1,1],[1,1]]},T:{c:'#b84cff',s:[[0,1,0],[1,1,1]]},
       J:{c:'#3155ff',s:[[1,0,0],[1,1,1]]},L:{c:'#ff8a1f',s:[[0,0,1],[1,1,1]]},
       S:{c:'#41d85a',s:[[0,1,1],[1,1,0]]},Z:{c:'#ff4141',s:[[1,1,0],[0,1,1]]}
     };
     let board=[],piece=null,next=null,bag=[],score=0,lines=0,level=1,timer=null,running=false,paused=false;

     const cloneShape=s=>s.map(r=>r.slice());
     function refillBag(){bag=['I','O','T','J','L','S','Z'];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
     function take(){if(!bag.length)refillBag();const id=bag.pop();return{id,x:3,y:0,shape:cloneShape(PIECES[id].s),color:PIECES[id].c};}
     function reset(){board=Array.from({length:ROWS},()=>Array(COLS).fill(null));bag=[];score=0;lines=0;level=1;next=take();piece=null;scoreEl.textContent=0;linesEl.textContent=0;levelEl.textContent=1;paused=false;pauseBtn.textContent='PAUSA';}
     function spawn(){piece=next;piece.x=Math.floor((COLS-piece.shape[0].length)/2);piece.y=0;next=take();drawNext();if(collide(piece)){gameOver();}}
     function collide(p,dx=0,dy=0,shape=p.shape){for(let y=0;y<shape.length;y++)for(let x=0;x<shape[y].length;x++){if(!shape[y][x])continue;const nx=p.x+x+dx,ny=p.y+y+dy;if(nx<0||nx>=COLS||ny>=ROWS)return true;if(ny>=0&&board[ny][nx])return true;}return false;}
     function rotateShape(shape,dir=1){return dir>0?shape[0].map((_,i)=>shape.map(r=>r[i]).reverse()):shape[0].map((_,i)=>shape.map(r=>r[shape[0].length-1-i]));}
     function rotate(dir=1){const r=rotateShape(piece.shape,dir);for(const kick of [0,-1,1,-2,2]){if(!collide(piece,kick,0,r)){piece.x+=kick;piece.shape=r;return;}}}
     function drawBlock(g,x,y,c,alpha=1,size=S){g.globalAlpha=alpha;g.fillStyle=c;g.fillRect(x*size+1,y*size+1,size-2,size-2);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(x*size+2,y*size+2,size-4,3);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x*size+2,y*size+size-5,size-4,3);g.globalAlpha=1;}
     function ghostY(){let dy=0;while(!collide(piece,0,dy+1))dy++;return piece.y+dy;}
     function draw(){
       ctx.fillStyle='#050505';ctx.fillRect(0,0,cv.width,cv.height);
       ctx.strokeStyle='rgba(255,255,255,.045)';for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*S,0);ctx.lineTo(x*S,cv.height);ctx.stroke();}for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*S);ctx.lineTo(cv.width,y*S);ctx.stroke();}
       board.forEach((r,y)=>r.forEach((c,x)=>{if(c)drawBlock(ctx,x,y,c);}));
       if(piece){
         const gy=ghostY();piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)drawBlock(ctx,piece.x+x,gy+y,piece.color,.2);}));
         piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)drawBlock(ctx,piece.x+x,piece.y+y,piece.color);}));
       }
       if(!running){gameOverlay(ctx,cv,piece?'FIN DE PARTIDA':'LISTO PARA JUGAR','Pulsa NUEVA PARTIDA');}
       if(paused){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('PAUSA',cv.width/2,cv.height/2);}
     }
     function drawNext(){nextCtx.fillStyle='#050505';nextCtx.fillRect(0,0,nextCv.width,nextCv.height);if(!next)return;const size=18,w=next.shape[0].length*size,h=next.shape.length*size,ox=(nextCv.width-w)/2/size,oy=(nextCv.height-h)/2/size;next.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)drawBlock(nextCtx,ox+x,oy+y,next.color,1,size);}));}
     function lock(){piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v&&piece.y+y>=0)board[piece.y+y][piece.x+x]=piece.color;}));let cleared=0;
       for(let y=ROWS-1;y>=0;y--){if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(null));cleared++;y++;}}
       if(cleared){lines+=cleared;score+=[0,100,300,500,800][cleared]*level;level=Math.floor(lines/10)+1;scoreEl.textContent=score;linesEl.textContent=lines;levelEl.textContent=level;restartTimer();}
       spawn();
     }
     function restartTimer(){if(timer)clearInterval(timer);if(running&&!paused)timer=setInterval(tick,Math.max(80,700-(level-1)*55));}
     function tick(){if(!running||paused||!piece)return;if(!collide(piece,0,1))piece.y++;else lock();draw();}
     function hardDrop(){let n=0;while(!collide(piece,0,1)){piece.y++;n++;}score+=n*2;scoreEl.textContent=score;lock();}
     function gameOver(){running=false;if(timer)clearInterval(timer);timer=null;pauseBtn.disabled=true;recordScore('tetris',score);toast('Tetris: fin de la partida.');draw();}
     function start(){recordScore('tetris',score);if(timer)clearInterval(timer);reset();running=true;pauseBtn.disabled=false;spawn();restartTimer();draw();win.focus();}
     function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?'CONTINUAR':'PAUSA';restartTimer();draw();}
     function key(e){if(!running)return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowdown','arrowup',' ','x','z','p'].includes(k))e.preventDefault();if(k==='p'){if(!e.repeat)togglePause();return;}if(paused)return;
       if(k==='arrowleft'&&!collide(piece,-1,0))piece.x--;if(k==='arrowright'&&!collide(piece,1,0))piece.x++;if(k==='arrowdown'&&!collide(piece,0,1)){piece.y++;score++;scoreEl.textContent=score;}if(k==='arrowup'||k==='x')rotate(1);if(k==='z')rotate(-1);if(k===' ')hardDrop();draw();}
     win.tabIndex=0;win.addEventListener('keydown',key);cv.addEventListener('click',()=>win.focus());
     startBtn.addEventListener('click',start);pauseBtn.addEventListener('click',togglePause);
     win.__cleanup=()=>{recordScore('tetris',score);if(timer)clearInterval(timer);win.removeEventListener('keydown',key);};
     attachGameLifecycle(win,()=>{if(running&&!paused)togglePause();});addGameControls(b,win,['ArrowLeft','ArrowUp','ArrowRight','ArrowDown',' ','p']);reset();draw();drawNext();
   }},

// PAC-MAN: el mapa es una matriz de paredes. Los puntos viven en conjuntos y los fantasmas buscan caminos libres.
 pacman:{title:'Pac-Man',icon:pixelIcon('pacman'),render:()=>`
   <div class="game game--pacman">
     <div class="pac-hud">
       <span>PUNTOS <b class="pac-score">0</b></span>
       <span>VIDAS <b class="pac-lives">3</b></span>
       <span>NIVEL <b class="pac-level">1</b></span>
       <button class="btn pac-start">NUEVA PARTIDA</button>
       <button class="btn pac-pause" disabled>PAUSA</button>
     </div>
     <canvas class="pac-canvas" width="380" height="340" aria-label="Laberinto de Pac-Man"></canvas>
     <div class="game-help">Flechas para moverte · come los puntos · las bolas grandes vuelven vulnerables a los fantasmas · P pausa</div>
   </div>`,
   bind(b,win){
     win=win||b.closest('.window');
     const cv=$('.pac-canvas',b),ctx=cv.getContext('2d'),scoreEl=$('.pac-score',b),livesEl=$('.pac-lives',b),levelEl=$('.pac-level',b),startBtn=$('.pac-start',b),pauseBtn=$('.pac-pause',b);
     const CELL=20;
     const template=[
       '###################',
       '#o.......#.......o#',
       '#.###.##.#.##.###.#',
       '#.................#',
       '#.###.#.#####.#.###',
       '#.....#...#...#...#',
       '#####.###.#.###.###',
       '...................',
       '#####.#.###.#.#####',
       '#........P........#',
       '#.###.##.#.##.###.#',
       '#o..#....#....#..o#',
       '###.#.#######.#.###',
       '#.................#',
       '#.#####.###.#####.#',
       '#.................#',
       '###################'
     ];
     const ROWS=template.length,COLS=template[0].length;
     let map=[],dots=new Set(),powers=new Set(),player,ghosts=[],score=0,lives=3,level=1,timer=null,running=false,paused=false,queued={x:0,y:0},tickNo=0,frightenedUntil=0,mouth=0,invulnerableUntil=0;

     const key=(x,y)=>`${x},${y}`;
     function walkable(x,y){if(y<0||y>=ROWS)return false;if(x<0||x>=COLS)return y===7;return map[y][x]!=='#';}
     function wrapX(x){if(x<0)return COLS-1;if(x>=COLS)return 0;return x;}
     function buildLevel(){
       map=template.map(r=>(level%2===0?[...r].reverse().join(''):r).split(''));dots.clear();powers.clear();
       let px=9,py=9;
       for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=map[y][x];if(c==='P'){px=x;py=y;map[y][x]=' ';}if(c==='.')dots.add(key(x,y));if(c==='o')powers.add(key(x,y));}
       player={x:px,y:py,dir:{x:0,y:0}};
       const spawn=[[9,7,'#ff3b3b'],[8,7,'#ff8de1'],[10,7,'#39d9ff']];
       ghosts=spawn.map(([x,y,color],i)=>({x,y,sx:x,sy:y,color,dir:{x:i===1?-1:1,y:0}}));
       queued={x:0,y:0};frightenedUntil=0;tickNo=0;invulnerableUntil=14;
     }
     function resetPositions(){invulnerableUntil=tickNo+14;frightenedUntil=0;player.x=9;player.y=9;player.dir={x:0,y:0};queued={x:0,y:0};ghosts.forEach(g=>{g.x=g.sx;g.y=g.sy;g.dir={x:1,y:0};});}
     function drawWall(x,y){ctx.fillStyle='#0d2cff';ctx.fillRect(x*CELL,y*CELL,CELL,CELL);ctx.fillStyle='#02040c';ctx.fillRect(x*CELL+4,y*CELL+4,CELL-8,CELL-8);}
     function drawPac(){const cx=player.x*CELL+10,cy=player.y*CELL+10;mouth=(mouth+.18)%(Math.PI/2);const open=.18+Math.abs(Math.sin(mouth))*.36;let ang=0;if(player.dir.x<0)ang=Math.PI;if(player.dir.y<0)ang=-Math.PI/2;if(player.dir.y>0)ang=Math.PI/2;ctx.fillStyle='#ffd51f';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,8,ang+open,ang+Math.PI*2-open);ctx.closePath();ctx.fill();}
     function drawGhost(g,fright){const x=g.x*CELL+10,y=g.y*CELL+10;ctx.fillStyle=fright?'#194cff':g.color;ctx.beginPath();ctx.arc(x,y-1,8,Math.PI,0);ctx.lineTo(x+8,y+7);ctx.lineTo(x+4,y+4);ctx.lineTo(x,y+7);ctx.lineTo(x-4,y+4);ctx.lineTo(x-8,y+7);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x-5,y-2,4,5);ctx.fillRect(x+2,y-2,4,5);ctx.fillStyle=fright?'#fff':'#182050';ctx.fillRect(x-4,y,2,3);ctx.fillRect(x+3,y,2,3);}
     function draw(){ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]==='#')drawWall(x,y);
       ctx.fillStyle='#f6d7a7';dots.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.beginPath();ctx.arc(x*CELL+10,y*CELL+10,2,0,Math.PI*2);ctx.fill();});
       powers.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.beginPath();ctx.arc(x*CELL+10,y*CELL+10,5,0,Math.PI*2);ctx.fill();});
       drawPac();const fright=tickNo<frightenedUntil;ghosts.forEach(g=>drawGhost(g,fright));
       if(!running){gameOverlay(ctx,cv,lives<=0?'FIN DE PARTIDA':'LISTO PARA JUGAR','Pulsa NUEVA PARTIDA');}
       if(paused){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('PAUSA',cv.width/2,cv.height/2);}
     }
     function eat(){const k=key(player.x,player.y);if(dots.delete(k)){score+=10;scoreEl.textContent=score;}if(powers.delete(k)){score+=50;scoreEl.textContent=score;frightenedUntil=tickNo+52;beep();}if(!dots.size&&!powers.size){level++;levelEl.textContent=level;toast('Pac-Man: nivel completado.');buildLevel();restartTimer();}}
     function canDir(pos,dir){let nx=pos.x+dir.x,ny=pos.y+dir.y;if(ny===7)nx=wrapX(nx);return walkable(nx,ny);}
     function moveEntity(ent,dir){let nx=ent.x+dir.x,ny=ent.y+dir.y;if(ny===7)nx=wrapX(nx);if(walkable(nx,ny)){ent.x=nx;ent.y=ny;ent.dir={...dir};return true;}return false;}
     function chooseGhost(g){
       const dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>canDir(g,d));
       const noBack=dirs.filter(d=>!(d.x===-g.dir.x&&d.y===-g.dir.y));const pool=noBack.length?noBack:dirs;if(!pool.length)return g.dir;
       // BFS measures actual corridor distance, so ghosts never chase through walls.
       const distances=new Map([[key(player.x,player.y),0]]),queue=[{x:player.x,y:player.y}];
       for(let i=0;i<queue.length;i++){const p=queue[i];for(const d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){if(!canDir(p,d))continue;const x=wrapX(p.x+d.x),y=p.y+d.y,k=key(x,y);if(!distances.has(k)){distances.set(k,distances.get(key(p.x,p.y))+1);queue.push({x,y});}}}
       const fright=tickNo<frightenedUntil,scatter=tickNo%160<35&&g.color!=='#ff3b3b';
       if(scatter)return pool[Math.floor(Math.random()*pool.length)];
       return pool.reduce((best,d)=>{const dist=distances.get(key(wrapX(g.x+d.x),g.y+d.y))??999;return (fright?dist>best.dist:dist<best.dist)?{d,dist}:best;},{d:pool[0],dist:fright?-1:Infinity}).d;
     }
     function collision(){if(tickNo<invulnerableUntil)return false;for(const g of ghosts){if(g.x===player.x&&g.y===player.y){if(tickNo<frightenedUntil){score+=200;scoreEl.textContent=score;g.x=g.sx;g.y=g.sy;toast('+200 · fantasma capturado');}else{lives--;livesEl.textContent=lives;if(lives<=0){gameOver();}else{toast(`Te quedan ${lives} vidas.`);resetPositions();}return true;}}}return false;}
     function step(){if(!running||paused)return;if(canDir(player,queued))player.dir={...queued};if(player.dir.x||player.dir.y)moveEntity(player,player.dir);eat();if(collision()){draw();return;}tickNo++;if(tickNo%2===0){ghosts.forEach(g=>moveEntity(g,chooseGhost(g)));collision();}draw();}
     function restartTimer(){if(timer)clearInterval(timer);if(running&&!paused)timer=setInterval(step,Math.max(80,125-(level-1)*5));}
     function start(){recordScore('pacman',score);if(timer)clearInterval(timer);score=0;lives=3;level=1;scoreEl.textContent=0;livesEl.textContent=3;levelEl.textContent=1;running=true;paused=false;pauseBtn.disabled=false;pauseBtn.textContent='PAUSA';buildLevel();restartTimer();draw();win.focus();}
     function gameOver(){running=false;if(timer)clearInterval(timer);timer=null;pauseBtn.disabled=true;recordScore('pacman',score);toast('Pac-Man: fin de la partida.');draw();}
     function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?'CONTINUAR':'PAUSA';restartTimer();draw();}
     function keydown(e){if(!running)return;const k=e.key.toLowerCase();const dirs={arrowleft:{x:-1,y:0},arrowright:{x:1,y:0},arrowup:{x:0,y:-1},arrowdown:{x:0,y:1}};if(dirs[k]){e.preventDefault();queued=dirs[k];}else if(k==='p'){e.preventDefault();if(!e.repeat)togglePause();}}
     win.tabIndex=0;win.addEventListener('keydown',keydown);cv.addEventListener('click',()=>win.focus());startBtn.addEventListener('click',start);pauseBtn.addEventListener('click',togglePause);
     win.__cleanup=()=>{recordScore('pacman',score);if(timer)clearInterval(timer);win.removeEventListener('keydown',keydown);};
     attachGameLifecycle(win,()=>{if(running&&!paused)togglePause();});addGameControls(b,win,['ArrowLeft','ArrowUp','ArrowRight','ArrowDown','p']);buildLevel();draw();
   }},


});
const PLATFORM_LEVELS=[
  {name:'01 / Jardines del amanecer',sky:['#9ce2ef','#e9f9d3'],ground:'#b67545',grass:'#72bc61',gaps:[[24,27],[47,50],[76,79]],pipes:[18,38,64,86],platforms:[[9,7,4],[30,7,4],[53,6,4],[69,7,3]],enemies:[14,33,42,59,70,88]},
  {name:'02 / La mina de cristal',sky:['#111c37','#31516c'],ground:'#536780',grass:'#80e7d0',gaps:[[22,25],[43,46],[67,70],[83,86]],pipes:[16,36,58,91],platforms:[[8,7,4],[28,6,4],[49,7,4],[74,6,4]],enemies:[12,30,39,52,63,77,92]},
  {name:'03 / Observatorio nocturno',sky:['#171c3b','#765387'],ground:'#785875',grass:'#e7acaa',gaps:[[23,26],[44,47],[65,68],[85,88]],pipes:[17,36,57,78,93],platforms:[[8,7,4],[29,6,4],[50,7,4],[72,6,4]],enemies:[13,31,41,53,61,74,81,94]}
];
// COLISIÓN AABB: dos rectángulos se tocan si sus intervalos horizontal y vertical se superponen.
function platformOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
// CREAR MUNDO: convierte los datos en objetos jugables; al pasar nivel conserva puntos, monedas y vidas.
function createPlatformWorld(level=0,carry={}){
  const spec=PLATFORM_LEVELS[level],tiles=[];
  for(let x=0;x<100;x++)if(!spec.gaps.some(([a,b])=>x>=a&&x<b))tiles.push({x:x*32,y:320,w:32,h:64,type:'ground'});
  for(const x of spec.pipes)tiles.push({x:x*32,y:256,w:48,h:64,type:'pipe'});
  for(const [x,y,len] of spec.platforms)for(let i=0;i<len;i++)tiles.push({x:(x+i)*32,y:y*32,w:32,h:24,type:i===1?'question':'brick',used:false});
  const coins=[];for(let x=7;x<95;x+=3)if(!spec.gaps.some(([a,b])=>x>=a&&x<b))coins.push({x:x*32+8,y:spec.pipes.some(p=>Math.abs(x-p)<2)?208:270,w:16,h:22,taken:false});
  for(const [x,y,len] of spec.platforms)for(let i=0;i<len;i++)coins.push({x:(x+i)*32+8,y:y*32-40,w:16,h:22,taken:false});
  return {level,spec,tiles,coins,enemies:spec.enemies.map(x=>({x:x*32,y:294,w:26,h:26,vx:-45-level*10,alive:true})),player:{x:64,y:270,w:22,h:30,vx:0,vy:0,ground:false,coyote:0,buffer:0,invincible:0,shield:false},score:carry.score||0,lives:carry.lives??3,coinCount:carry.coinCount||0,checkpoint:64,checkpointSet:false,time:180,elapsed:0,camera:0,status:'ready',jumpHeld:false,particles:[]};
}
// DAÑO: el escudo absorbe un golpe; sin escudo se pierde una vida y se vuelve al punto de control.
function platformDamage(world){
  const p=world.player;if(p.invincible>0)return;
  if(p.shield){p.shield=false;p.invincible=2;return;}
  world.lives--;if(world.lives<=0){world.status='lost';return;}
  Object.assign(p,{x:world.checkpoint,y:260,vx:0,vy:0,ground:false,coyote:0,buffer:0,invincible:2});world.time=Math.max(60,world.time);
}
// FÍSICA: un paso pequeño aplica aceleración, gravedad, colisiones, monedas, enemigos y meta.
function stepPlatform(world,input,dt){
  if(world.status!=='playing')return;dt=Math.min(dt,.025);world.elapsed+=dt;world.time-=dt;
  const p=world.player,wasY=p.y;
  p.invincible=Math.max(0,p.invincible-dt);p.coyote=p.ground?.1:Math.max(0,p.coyote-dt);p.buffer=Math.max(0,p.buffer-dt);
  if(input.jump&&!world.jumpHeld)p.buffer=.12;world.jumpHeld=!!input.jump;
  const direction=(input.right?1:0)-(input.left?1:0),target=direction*(input.run?310:245);
  // Aceleración suavizada: acercamos velocidad actual a la deseada, evitando empezar y frenar de golpe.
  p.vx+=Math.max(-1500*dt,Math.min(1500*dt,target-p.vx));
  // Coyote time permite saltar justo al salir del borde; buffer recuerda una pulsación poco antes de aterrizar.
  if(p.buffer>0&&p.coyote>0){p.vy=-700;p.ground=false;p.buffer=0;p.coyote=0;}
  if(!input.jump&&p.vy<-250)p.vy=-250;p.vy=Math.min(820,p.vy+1700*dt);
  // Resolvemos primero el eje horizontal y después el vertical: así distinguimos pared, suelo y techo.
  p.x+=p.vx*dt;p.x=Math.max(0,Math.min(3180-p.w,p.x));
  for(const tile of world.tiles)if(platformOverlap(p,tile)){if(p.vx>0)p.x=tile.x-p.w;else if(p.vx<0)p.x=tile.x+tile.w;p.vx=0;}
  p.y+=p.vy*dt;p.ground=false;
  for(const tile of world.tiles)if(platformOverlap(p,tile)){
    if(p.vy>=0){p.y=tile.y-p.h;p.ground=true;}else{p.y=tile.y+tile.h;if(tile.type==='question'&&!tile.used){tile.used=true;p.shield=true;world.score+=200;}}
    p.vy=0;
  }
  // Monedas: se marcan como tomadas; nunca suman dos veces. Cada 50 monedas regalan una vida.
  for(const coin of world.coins)if(!coin.taken&&platformOverlap(p,coin)){coin.taken=true;world.score+=100;world.coinCount++;world.particles.push({x:coin.x,y:coin.y,life:.6});if(world.coinCount%50===0)world.lives++;}
  // Enemigos: patrullan entre bordes y tuberías. Caer sobre ellos rebota; tocarlos de lado causa daño.
  for(const e of world.enemies){if(!e.alive)continue;const nx=e.x+e.vx*dt,next={...e,x:nx};
    const hasFloor=world.tiles.some(t=>t.type==='ground'&&nx+e.w/2>=t.x&&nx+e.w/2<t.x+t.w);
    if(!hasFloor||world.tiles.some(t=>t.type==='pipe'&&platformOverlap(next,t)))e.vx=-e.vx;else e.x=nx;
    if(platformOverlap(p,e)){if(p.vy>0&&wasY+p.h<=e.y+10){e.alive=false;p.vy=-420;world.score+=200;}else platformDamage(world);}
  }
  // Progresión: bandera intermedia fija el punto de control y la final completa el mundo.
  if(p.x>1600&&!world.checkpointSet){world.checkpoint=1600;world.checkpointSet=true;world.score+=250;}
  if(p.y>440){p.shield=false;p.invincible=0;platformDamage(world);}
  if(world.time<=0){p.shield=false;p.invincible=0;platformDamage(world);world.time=180;}
  if(p.x>3100&&world.status==='playing'){world.score+=Math.floor(world.time)*5+500;world.status=world.level===2?'won':'complete';}
  world.camera=Math.max(0,Math.min(3200-704,p.x-240));world.particles=world.particles.filter(s=>(s.life-=dt)>0);world.particles.forEach(s=>s.y-=dt*65);
}
// APLICACIÓN: registra el juego en Apps. render crea la ventana; bind conecta Canvas, botones y teclado.
Apps.mario={title:'Mario Bros · JOSEMI Run',icon:'🍄',size:[920,720],render:()=>`<div class="game platform-game"><header class="platform-header"><div><span class="card-kicker">JOSEMI ARCADE / ORIGINAL FAN GAME</span><h2>JOSEMI RUN<span>Inspirado en Super Mario Bros.</span></h2></div><span class="platform-world">01 / 03</span></header><div class="platform-hud" aria-live="off"></div><canvas class="platform-canvas" width="704" height="384" aria-label="Juego de plataformas: flechas para moverse, espacio para saltar"></canvas><div class="platform-actions"><button class="btn btn--accent platform-start">JUGAR</button><button class="btn platform-pause" disabled>PAUSA</button><span>← → / A D mover · ESPACIO saltar · SHIFT correr · P pausa</span></div><div class="platform-touch"><button class="btn" data-control="left">←</button><button class="btn" data-control="right">→</button><button class="btn" data-control="run">CORRER</button><button class="btn" data-control="jump">SALTAR ↑</button></div><p class="platform-note">Tres mundos originales. Pisa enemigos, busca bloques ? y alcanza la bandera. Punto de control a mitad de cada mundo. Gráficos y niveles propios; homenaje a Super Mario Bros.</p></div>`,bind(body,win){
  const cv=$('.platform-canvas',body),ctx=cv.getContext('2d'),start=$('.platform-start',body),pauseButton=$('.platform-pause',body),keys=new Set();let world=createPlatformWorld(),raf=0,last=null,accumulator=0,closed=false,hudKey='';
  const input=()=>({left:keys.has('a')||keys.has('arrowleft')||keys.has('left'),right:keys.has('d')||keys.has('arrowright')||keys.has('right'),jump:keys.has(' ')||keys.has('w')||keys.has('arrowup')||keys.has('jump'),run:keys.has('shift')||keys.has('run')});
  // MARCADOR: muestra datos del mundo sin mezclar el dibujo con la lógica de la partida.
  function hud(){const key=[world.score,world.coinCount,world.lives,Math.ceil(world.time),Math.floor(world.player.x/31),world.level].join(':');if(key===hudKey)return;hudKey=key;$('.platform-hud',body).innerHTML=`<span>PUNTOS <b>${String(world.score).padStart(6,'0')}</b></span><span>MONEDAS <b>◈ ${world.coinCount}</b></span><span>VIDAS <b>♥ ${world.lives}</b></span><span>TIEMPO <b>${Math.ceil(world.time)}</b></span><span>RUTA <b>${Math.min(100,Math.floor(world.player.x/31))}%</b></span>`;$('.platform-world',body).textContent=world.spec.name;}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  // DIBUJO: capas de cielo, montañas, suelo, objetos y personaje. La cámara resta su posición al mundo.
  function draw(){
    const gradient=ctx.createLinearGradient(0,0,0,384);gradient.addColorStop(0,world.spec.sky[0]);gradient.addColorStop(1,world.spec.sky[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,704,384);
    const camera=world.camera,t=world.elapsed;
    if(world.level>0)for(let i=0;i<40;i++)rect((i*139-camera*.12+5000)%750,12+i*37%170,2,2,'#e5fcff');
    for(let i=0;i<9;i++){const x=i*180-camera*.25;ctx.fillStyle=world.level===0?'#81caa1':world.level===1?'#314960':'#715981';ctx.beginPath();ctx.moveTo(x-120,320);ctx.lineTo(x,145+i%3*25);ctx.lineTo(x+140,320);ctx.fill();}
    if(world.level===0)for(let i=0;i<6;i++){const x=(i*210-camera*.14+1500)%1400-150;rect(x,48+i%3*24,80,15,'#f7fcf2');rect(x+16,37+i%3*24,42,16,'#f7fcf2');}
    ctx.save();ctx.translate(-Math.round(camera),0);
  // Escenario: solo dibujamos los bloques cercanos a la cámara; los demás siguen en la simulación.
    for(const tile of world.tiles){if(tile.x<camera-64||tile.x>camera+740)continue;
      if(tile.type==='ground'){rect(tile.x,tile.y,32,64,world.spec.ground);rect(tile.x,tile.y,32,7,world.spec.grass);rect(tile.x+3,tile.y+18,7,4,'#ffffff20');rect(tile.x+17,tile.y+41,9,4,'#00000020');}
      else if(tile.type==='pipe'){rect(tile.x,tile.y,48,64,'#246951');rect(tile.x+5,tile.y,9,64,'#59ba83');rect(tile.x-4,tile.y,56,14,'#43a771');rect(tile.x,tile.y+2,48,3,'#99dda0');}
      else{rect(tile.x,tile.y,31,24,tile.used?'#806e65':tile.type==='question'?'#ffcf61':'#b66b51');rect(tile.x+3,tile.y+3,25,2,'#ffffff50');ctx.fillStyle='#fff2ba';ctx.font='bold 18px monospace';if(tile.type==='question'&&!tile.used)ctx.fillText('?',tile.x+10,tile.y+19);else rect(tile.x+1,tile.y+12,29,2,'#00000025');}
    }
    for(const coin of world.coins)if(!coin.taken&&coin.x>camera-32&&coin.x<camera+740){const w=5+Math.abs(Math.sin(t*5+coin.x))*11;rect(coin.x+8-w/2,coin.y,w,20,'#ffc857');rect(coin.x+8-w/2+2,coin.y+3,2,12,'#fff4bf');}
    for(const e of world.enemies)if(e.alive){rect(e.x+2,e.y+4,22,17,'#955d54');rect(e.x+6,e.y,14,7,'#bd8b72');rect(e.x+4,e.y+10,5,5,'#fff5da');rect(e.x+17,e.y+10,5,5,'#fff5da');rect(e.x+6,e.y+11,2,3,'#292c40');rect(e.x+18,e.y+11,2,3,'#292c40');rect(e.x+Math.sin(t*9)*2,e.y+23,10,3,'#352e40');rect(e.x+16,e.y+23,10,3,'#352e40');}
    for(const [x,on] of [[1600,world.checkpointSet],[3120,true]]){rect(x,153,4,167,'#e9f8e5');rect(x+4,158,33,22,on?'#ff7479':'#8e9bab');rect(x+8,162,4,4,'#fff7de');}
    rect(3150,224,48,96,'#687584');rect(3160,209,12,16,'#687584');rect(3180,209,12,16,'#687584');rect(3165,288,18,32,'#263340');
  // Personaje: los rectángulos forman un sprite propio; el parpadeo indica inmunidad tras recibir daño.
    const p=world.player;if(!p.invincible||Math.floor(t*14)%2){const x=p.x,y=p.y,bob=p.ground&&Math.abs(p.vx)>20?Math.sin(t*18)*2:0;
      rect(x+3,y,17,5,'#ef6676');rect(x,y+5,23,4,'#ef6676');rect(x+5,y+9,14,9,'#ffd9a0');rect(x+16,y+10,3,4,'#34384a');rect(x+2,y+10,4,7,'#5e4550');rect(x+3,y+18,17,8,'#5d91c2');rect(x+1,y+18,5,6,'#ef6676');rect(x+17,y+18,5,6,'#ef6676');rect(x+4,y+26,6,4+bob,'#354359');rect(x+14,y+26,6,4-bob,'#354359');
      if(p.shield){ctx.strokeStyle='#c6fff4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+11,y+15,24,0,Math.PI*2);ctx.stroke();}}
    for(const s of world.particles){ctx.globalAlpha=s.life/.6;ctx.fillStyle='#fff4a5';ctx.font='bold 12px monospace';ctx.fillText('+100',s.x,s.y);}ctx.globalAlpha=1;ctx.restore();
    if(world.status!=='playing'){const titles={ready:'UNA NUEVA AVENTURA',paused:'PAUSA',complete:'MUNDO COMPLETADO',won:'LOS TRES MUNDOS SON TUYOS',lost:'FIN DE LA PARTIDA'};gameOverlay(ctx,cv,titles[world.status],world.status==='ready'?'JUGAR para comenzar':world.status==='complete'?'SIGUIENTE MUNDO para continuar':world.status==='paused'?'P o CONTINUAR para volver':'NUEVA PARTIDA para volver a jugar');}
    hud();
  }
  // BUCLE: acumula tiempo y simula a 120 pasos por segundo. Dibuja una vez por fotograma y se detiene en pausa.
  function loop(now){raf=0;if(closed)return;if(world.status==='playing'){if(last!==null)accumulator+=Math.min(.08,(now-last)/1000);last=now;while(accumulator>=1/120){stepPlatform(world,input(),1/120);accumulator-=1/120;}draw();if(world.status==='playing')raf=requestAnimationFrame(loop);else{keys.clear();last=null;recordScore('mario',world.score);start.textContent=world.status==='complete'?'SIGUIENTE MUNDO':'NUEVA PARTIDA';pauseButton.disabled=true;}}}
  // CONTINUAR: reinicia el reloj del bucle para que la pausa no cuente como tiempo jugado.
  function resume(){world.status='playing';last=null;accumulator=0;pauseButton.disabled=false;pauseButton.textContent='PAUSA';if(!raf)raf=requestAnimationFrame(loop);}
  // PAUSA: cancela requestAnimationFrame y limpia teclas pulsadas para no dejar al personaje moviéndose.
  function pause(){if(world.status==='playing'){world.status='paused';cancelAnimationFrame(raf);raf=0;last=null;keys.clear();pauseButton.textContent='CONTINUAR';draw();}else if(world.status==='paused')resume();}
  start.onclick=()=>{win.focus();cancelAnimationFrame(raf);raf=0;world=world.status==='complete'?createPlatformWorld(world.level+1,world):createPlatformWorld();keys.clear();resume();start.textContent='REINICIAR';draw();};pauseButton.onclick=()=>{win.focus();pause();};
  // ENTRADA: guarda teclas activas en un Set. Soltar la tecla la elimina; táctil usa el mismo mecanismo.
  function down(e){const key=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','a','d','w',' ','shift','p'].includes(key)){e.preventDefault();if(key==='p'){if(!e.repeat)pause();}else{keys.add(key);if([' ','w','arrowup'].includes(key)&&!e.repeat)world.player.buffer=.12;}}}
  const up=e=>keys.delete(e.key.toLowerCase());win.tabIndex=0;win.addEventListener('keydown',down);window.addEventListener('keyup',up);cv.onclick=()=>win.focus();
  for(const button of $$('[data-control]',body)){button.onpointerdown=e=>{e.preventDefault();win.focus();button.setPointerCapture(e.pointerId);keys.add(button.dataset.control);};for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>keys.delete(button.dataset.control));}
  win.__cleanup=()=>{closed=true;recordScore('mario',world.score);cancelAnimationFrame(raf);keys.clear();win.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};attachGameLifecycle(win,()=>{if(world.status==='playing')pause();});draw();
}};


Apps.tetris.size=[620,650];Apps.pacman.size=[650,650];
initialize();
