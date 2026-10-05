'use strict';
// Shared game lifecycle: time stops when the player leaves a game.
// SEGURIDAD DEL TEXTO: convierte símbolos HTML en entidades para mostrar lo escrito sin ejecutarlo.
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// RÉCORDS: localStorage conserva la mayor puntuación de cada juego en este navegador.
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

// Boot art is stable ASCII. Noise only reveals the glyphs, never shifts the layout.
// FIRMA: seis líneas de caracteres forman JOSEMI-OS. La animación cambia su posición o revelado, no el nombre final.
const NAME_ART=[
"     ██╗ ██████╗ ███████╗███████╗███╗   ███╗██╗       ██████╗ ███████╗",
"     ██║██╔═══██╗██╔════╝██╔════╝████╗ ████║██║      ██╔═══██╗██╔════╝",
"     ██║██║   ██║███████╗█████╗  ██╔████╔██║██║ ████╗██║   ██║███████╗",
"██   ██║██║   ██║╚════██║██╔══╝  ██║╚██╔╝██║██║ ╚═══╝██║   ██║╚════██║",
"╚█████╔╝╚██████╔╝███████║███████╗██║ ╚═╝ ██║██║      ╚██████╔╝███████║",
" ╚════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝       ╚═════╝ ╚══════╝"];
// ARCADE: tarjetas de los tres juegos. data-game identifica qué aplicación debe abrirse.
Apps.arcade.render=()=>`<div class="arcade-heading"><div><span class="card-kicker">JOSEMI / ARCADE COLLECTION</span><h2>Una partida más.</h2><p>Tres clásicos, una nueva vida dentro del sistema.</p></div><span class="arcade-badge">INSERT COIN<br>FREE PLAY</span></div><div class="arcade-grid arcade-grid--v2">${[
  ['mario','1UP','Mario Bros · JOSEMI Run','Plataformas originales: tres mundos, monedas, enemigos y puntos de control.','← → · Espacio · Shift'],
  ['pacman','●','Pac-Man','Limpia el laberinto. Tres fantasmas, energía y dificultad progresiva.','Flechas · P pausa'],
  ['tetris','▟','Tetris','Siete piezas, sombra de caída y un nuevo nivel cada diez líneas.','Flechas · Espacio · P']
].map(([id,mark,title,desc,keys])=>`<button class="game-shortcut game-card game-card--${id}" data-game="${id}"><span class="game-card__number">${mark}</span><span class="card-kicker">${id==='mario'?'3 MUNDOS':'NIVELES PROGRESIVOS'}</span><strong>${title}</strong><p>${desc}</p><small>${keys}</small><span class="game-card__bottom">JUGAR ↗ <span>RÉCORD ${bestScore(id)}</span></span></button>`).join('')}</div><p class="arcade-footnote">Las partidas se pausan al cambiar de ventana o pestaña. Haz clic en el juego para recuperar el teclado.</p>`;
// BÓVEDA: tres respuestas desbloquean fases guardadas localmente. Es un juego de pistas, no seguridad real.
Apps.easter={title:'Secret Vault',icon:'⌬',render:()=>`<section class="vault"><div class="vault-top"><span class="card-kicker">/ROOT / SECRET_VAULT</span><span class="vault-status">ACCESO LIMITADO</span></div><pre class="vault-art" aria-hidden="true">       .--------.
      / .------. \\
      | |      | |
    __| |______| |__
   [________________]
   |       /\\       |
   |      /__\\      |
   |       ||       |
   |________________|</pre><h2>Todo sistema guarda secretos.</h2><p class="vault-copy">Tres llaves. Un pequeño homenaje a quienes nunca dejan de explorar.</p><div class="vault-progress"></div><div class="vault-challenge"></div><form class="vault-form"><label for="vault-answer">CLAVE DE ACCESO</label><div><input id="vault-answer" autocomplete="off" spellcheck="false" placeholder="Escribe tu respuesta…"><button class="btn btn--accent">VALIDAR ↵</button></div></form><p class="vault-feedback" role="status"></p><button class="btn vault-hint">NECESITO UNA PISTA</button></section>`,bind(body){
  const challenges=[['01 / LA RESPUESTA','En la guía más famosa de la galaxia, ¿qué número responde a la vida, el universo y todo lo demás?','La terminal conoce un número de dos cifras.','42'],['02 / EL CÓDIGO','↑ ↑ ↓ ↓ ← → ← → B A. ¿Qué apellido da nombre a este código?','Empieza por K. Es un estudio japonés de videojuegos.','konami'],['03 / EL CREADOR','Seis letras iluminan el arranque de este sistema. ¿Cuál es el nombre?','Mira el escritorio: JOSEMI-OS.','josemi']];
  let stage=0;try{stage=Math.min(3,Math.max(0,Number(localStorage.getItem('josemi-vault'))||0));}catch{}
  const render=()=>{$('.vault-progress',body).innerHTML=[0,1,2].map(i=>`<span class="${i<stage?'unlocked':''}">${i<stage?'✓':'○'} LLAVE 0${i+1}</span>`).join('');const done=stage===3;$('.vault-form',body).hidden=done;$('.vault-hint',body).hidden=done;$('.vault-status',body).textContent=done?'ACCESO CONCEDIDO':`${stage}/3 LLAVES`;$('.vault-challenge',body).innerHTML=done?`<span class="card-kicker">EL SECRETO ES SEGUIR CONSTRUYENDO</span><h3>Build. Learn. Repeat.</h3><p>No hay atajos para aprender. Sí hay curiosidad, errores y una partida más.</p><button class="btn btn--accent vault-reward">ACTIVAR TEMA ÁMBAR</button><button class="btn vault-play">VOLVER AL ARCADE</button>`:`<span class="card-kicker">${challenges[stage][0]}</span><p>${challenges[stage][1]}</p>`;$('.vault-reward',body)?.addEventListener('click',()=>{state.accent='#ffd166';applyTheme();save();toast('Secret Vault: tema ámbar desbloqueado.');});$('.vault-play',body)?.addEventListener('click',()=>openWindow('arcade'));};
  $('.vault-form',body).addEventListener('submit',e=>{e.preventDefault();if(stage>=3)return;const input=$('#vault-answer',body);if(input.value.trim().toLowerCase()===challenges[stage][3]){stage++;try{localStorage.setItem('josemi-vault',stage);}catch{}input.value='';$('.vault-feedback',body).textContent=stage===3?'Bóveda abierta. Bienvenido al otro lado.':'Llave correcta. Siguiente cerradura.';render();}else $('.vault-feedback',body).textContent='Esa llave no encaja. Prueba con la pista.';});$('.vault-hint',body).onclick=()=>{$('.vault-feedback',body).textContent=challenges[stage]?.[2]||'';};render();
}};
ICONS.push('easter');currentUser.apps.push('easter');

// Original raycaster, no external assets or downloads required.
Apps.arcade.size=[940,650];Apps.tetris.size=[620,700];Apps.pacman.size=[650,650];Apps.easter.size=[740,740];
