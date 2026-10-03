'use strict';
// Shared game lifecycle: time stops when the player leaves a game.
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function recordScore(id,n){try{const key='josemi-best-'+id,best=Math.max(n,Number(localStorage.getItem(key))||0);localStorage.setItem(key,best);const label=document.querySelector(`.game-card--${id} .game-card__bottom span`);if(label)label.textContent='RÉCORD '+best;}catch{}}
function bestScore(id){try{return Number(localStorage.getItem('josemi-best-'+id))||0;}catch{return 0;}}
function gameOverlay(ctx,cv,title,sub){ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(0,0,cv.width,cv.height);ctx.textAlign='center';ctx.fillStyle='#6dff9b';ctx.font='bold 17px monospace';ctx.fillText(title,cv.width/2,cv.height/2-10);ctx.font='10px monospace';ctx.fillStyle='#dbe8df';ctx.fillText(sub,cv.width/2,cv.height/2+16);}
function attachGameLifecycle(win,pause){
  const check=()=>{if(win.classList.contains('minimized')||win.classList.contains('minimizing')||document.hidden||!win.contains(document.activeElement))pause();};
  const observer=new MutationObserver(check);observer.observe(win,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',check);document.addEventListener('focusin',check);window.addEventListener('blur',pause);
  const cleanup=win.__cleanup;win.__cleanup=()=>{cleanup?.();observer.disconnect();document.removeEventListener('visibilitychange',check);document.removeEventListener('focusin',check);window.removeEventListener('blur',pause);};
}
function addGameControls(body,win,keys){
  const row=document.createElement('div');row.className='game-controls';const names={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',' ':'CAÍDA',p:'PAUSA'};
  keys.forEach(key=>{const b=document.createElement('button');b.className='btn';b.textContent=names[key]||key.toUpperCase();b.type='button';b.addEventListener('click',()=>{win.focus();win.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));});row.append(b);});body.querySelector('.game').append(row);
}

// Boot art is stable ASCII. Noise only reveals the glyphs, never shifts the layout.
const NAME_ART=[
'     ██╗ ██████╗ ███████╗███████╗███╗   ███╗██╗',
'     ██║██╔═══██╗██╔════╝██╔════╝████╗ ████║██║',
'     ██║██║   ██║███████╗█████╗  ██╔████╔██║██║',
'██   ██║██║   ██║╚════██║██╔══╝  ██║╚██╔╝██║██║',
'╚█████╔╝╚██████╔╝███████║███████╗██║ ╚═╝ ██║██║',
' ╚════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝'];
typeLoginArt=async function(){
  const run=++bootRun;enteringOS=false;const login=$('#login'),out=$('#bootTerminalOutput'),cmd=$('#bootCommand');
  login.classList.remove('hidden','out');out.innerHTML='';cmd.textContent='';login.classList.add('boot-v2');
  appendBoot('JOSEMI / PERSONAL SYSTEM  ───────────────────────────────','boot-dim');
  appendBoot('');const logo=appendBoot('','boot-logo boot-logo--hero');
  const width=Math.max(...NAME_ART.map(s=>s.length));
  for(let frame=0;frame<=width;frame++){
    if(run!==bootRun)return;
    logo.textContent=NAME_ART.map(line=>[...line].map((ch,x)=>x<frame?ch:ch===' '?' ':x<frame+4?'░':' ').join('')).join('\n');
    if(!state.motion)await bootDelay(24);
  }
  appendBoot('\n  JOSÉ MIGUEL MIRALLES GANDIA','boot-accent');
  appendBoot('  DEVELOPER IN PROGRESS / BUILD · LEARN · REPEAT','boot-dim');appendBoot('');
  await typeBootText(cmd,'start josemi-os',state.motion?0:30,run);if(run!==bootRun)return;
  for(const line of ['[ OK ] Identidad y portfolio','[ OK ] Gestor de ventanas y terminal','[ OK ] Arcade / Tetris · Pac-Man · Sector 13','[ OK ] Secret Vault / esperando explorador']){
    if(run!==bootRun)return;appendBoot(line,'boot-ok');if(!state.motion)await bootDelay(160);
  }
  if(run!==bootRun)return;cmd.textContent='';appendBoot('\n  SYSTEM READY  ▰▰▰▰▰▰▰▰▰▰  100%','boot-accent');
  if(!state.motion)await bootDelay(700);if(run===bootRun)enterOS();
};

Apps.arcade.render=()=>`<div class="arcade-heading"><div><span class="card-kicker">JOSEMI / ARCADE COLLECTION</span><h2>Una partida más.</h2><p>Tres clásicos, una nueva vida dentro del sistema.</p></div><span class="arcade-badge">INSERT COIN<br>FREE PLAY</span></div><div class="arcade-grid arcade-grid--v2">${[
  ['doom','13','DOOM · Sector 13','Shooter propio inspirado en DOOM. Tres sectores, portales, enemigos y suministros.','WASD · ← → · Espacio'],
  ['pacman','●','Pac-Man','Limpia el laberinto. Tres fantasmas, energía y dificultad progresiva.','Flechas · P pausa'],
  ['tetris','▟','Tetris','Siete piezas, sombra de caída y un nuevo nivel cada diez líneas.','Flechas · Espacio · P']
].map(([id,mark,title,desc,keys])=>`<button class="game-shortcut game-card game-card--${id}" data-game="${id}"><span class="game-card__number">${mark}</span><span class="card-kicker">${id==='doom'?'3 SECTORES':'NIVELES PROGRESIVOS'}</span><strong>${title}</strong><p>${desc}</p><small>${keys}</small><span class="game-card__bottom">JUGAR ↗ <span>RÉCORD ${bestScore(id)}</span></span></button>`).join('')}</div><p class="arcade-footnote">Las partidas se pausan al cambiar de ventana o pestaña. Haz clic en el juego para recuperar el teclado.</p>`;
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
const SECTOR_MAPS=[
 ['############','#..........#','#..##......#','#..##..##..#','#......##..#','#..........#','#.###..#...#','#......#...#','#..........#','############'],
 ['############','#..........#','#.##...##..#','#......##..#','#..##......#','#..##..##..#','#......##..#','#.##.......#','#..........#','############'],
 ['############','#..........#','#..##..##..#','#..##......#','#......##..#','#.###......#','#......##..#','#..##......#','#..........#','############']
];
Apps.doom={title:'DOOM · Sector 13',icon:'▣',render:()=>`<div class="game game--doom"><div class="doom-header"><span>SECTOR 13</span><small>UN SHOOTER ORIGINAL / HOMENAJE A DOOM</small></div><div class="doom-hud"><span>SECTOR <b data-hud="level">1 / 3</b></span><span>SALUD <b data-hud="hp">100</b></span><span>MUNICIÓN <b data-hud="ammo">24</b></span><span>HOSTILES <b data-hud="enemies">0</b></span><span>PUNTOS <b data-hud="score">0</b></span></div><canvas width="640" height="360" class="doom-canvas" aria-label="Vista en primera persona de Sector 13"></canvas><div class="doom-actions"><button class="btn btn--accent doom-start">NUEVA CAMPAÑA</button><button class="btn doom-pause" disabled>PAUSA</button></div><p class="game-help">WASD mover · ← → girar · ESPACIO disparar · P pausa<br>Elimina los hostiles y entra en el portal verde. + suministros · cruz roja salud.</p><div class="doom-touch"></div></div>`,bind(body,win){
  const canvas=$('.doom-canvas',body),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,held=new Set();
  let level=0,player,hp=100,ammo=24,enemies=[],items=[],score=0,running=false,paused=false,won=false,last=0,raf=0,cooldown=0,flash=0,hurt=0,elapsed=0;
  const pauseButton=$('.doom-pause',body);const zbuffer=new Float32Array(W);
  const wall=(x,y)=>SECTOR_MAPS[level][Math.floor(y)]?.[Math.floor(x)]!=='.';
  const clearLine=(x,y,tx,ty)=>{const d=Math.hypot(tx-x,ty-y),steps=Math.ceil(d/.08);for(let i=1;i<steps;i++)if(wall(x+(tx-x)*i/steps,y+(ty-y)*i/steps))return false;return true;};
  function move(entity,dx,dy,r=.19){if(!wall(entity.x+dx+Math.sign(dx)*r,entity.y-r)&&!wall(entity.x+dx+Math.sign(dx)*r,entity.y+r))entity.x+=dx;if(!wall(entity.x-r,entity.y+dy+Math.sign(dy)*r)&&!wall(entity.x+r,entity.y+dy+Math.sign(dy)*r))entity.y+=dy;}
  function loadLevel(){player={x:1.5,y:1.5,a:0};enemies=[[5.5,1.5],[10.5,4.5],[5.5,8.5],[10.5,7.5],[1.5,8.5]].slice(0,3+level).map(([x,y])=>({x,y,hp:2+level,attack:1}));items=[{x:4.5,y:1.5,type:'ammo'},{x:8.5,y:8.5,type:'ammo'},{x:1.5,y:5.5,type:'health'}];ammo=Math.max(ammo,24+level*8);hp=Math.min(100,hp+25);cooldown=0;elapsed=0;held.clear();}
  function hud(){for(const [key,value] of Object.entries({level:`${level+1} / 3`,hp:Math.ceil(hp),ammo,enemies:enemies.filter(e=>e.hp>0).length,score}))$(`[data-hud="${key}"]`,body).textContent=value;}
  function fire(){if(!running||paused||cooldown>0||!ammo)return;ammo--;cooldown=.28;flash=.12;const targets=enemies.filter(e=>e.hp>0).map(e=>({e,d:Math.hypot(e.x-player.x,e.y-player.y),angle:Math.atan2(e.y-player.y,e.x-player.x)-player.a})).map(t=>({...t,angle:Math.atan2(Math.sin(t.angle),Math.cos(t.angle))})).filter(t=>Math.abs(t.angle)<Math.atan(.3/t.d)&&clearLine(player.x,player.y,t.e.x,t.e.y)).sort((a,b)=>a.d-b.d);if(targets.length){const e=targets[0].e;e.hp--;if(e.hp<=0){score+=100*(level+1);items.push({x:e.x,y:e.y,type:'ammo'});}}hud();}
  function finish(victory){running=false;won=victory;held.clear();pauseButton.disabled=true;recordScore('doom',score);hud();}
  function tick(dt){elapsed+=dt;cooldown=Math.max(0,cooldown-dt);flash=Math.max(0,flash-dt);hurt=Math.max(0,hurt-dt);const turn=(held.has('arrowright')?1:0)-(held.has('arrowleft')?1:0);player.a+=turn*dt*2.2;const f=(held.has('w')||held.has('arrowup')?1:0)-(held.has('s')||held.has('arrowdown')?1:0),side=(held.has('d')?1:0)-(held.has('a')?1:0),scale=dt*2.6/Math.max(1,Math.hypot(f,side));move(player,(Math.cos(player.a)*f-Math.sin(player.a)*side)*scale,(Math.sin(player.a)*f+Math.cos(player.a)*side)*scale);if(held.has(' '))fire();
    for(const e of enemies){if(e.hp<=0)continue;const d=Math.hypot(player.x-e.x,player.y-e.y);e.attack-=dt;if(d<7&&clearLine(e.x,e.y,player.x,player.y)){if(d>.7)move(e,(player.x-e.x)/d*dt*(.55+level*.12),(player.y-e.y)/d*dt*(.55+level*.12),.16);else if(e.attack<=0){hp-=8+level*3;e.attack=1;hurt=.22;if(hp<=0){hp=0;finish(false);return;}}}}
    items=items.filter(item=>{if(Math.hypot(player.x-item.x,player.y-item.y)>.45)return true;if(item.type==='health'){if(hp>=100)return true;hp=Math.min(100,hp+35);}else ammo+=12;return false;});
    if(enemies.every(e=>e.hp<=0)&&Math.hypot(player.x-10.5,player.y-8.5)<.6){score+=500*(level+1);if(level===2)finish(true);else{level++;loadLevel();toast(`Sector ${level+1}: nuevo perímetro.`);}}hud();
  }
  function render(){
    ctx.fillStyle='#172028';ctx.fillRect(0,0,W,H/2);const ground=ctx.createLinearGradient(0,H/2,0,H);ground.addColorStop(0,'#171a18');ground.addColorStop(1,'#3b342b');ctx.fillStyle=ground;ctx.fillRect(0,H/2,W,H/2);
    for(let x=0;x<W;x+=2){const angle=player.a+Math.atan((2*x/W-1)*.66),dx=Math.cos(angle),dy=Math.sin(angle);let mx=Math.floor(player.x),my=Math.floor(player.y),sx=dx<0?-1:1,sy=dy<0?-1:1,ddx=Math.abs(1/dx),ddy=Math.abs(1/dy),tx=(dx<0?player.x-mx:mx+1-player.x)*ddx,ty=(dy<0?player.y-my:my+1-player.y)*ddy,side=0;for(let step=0;step<40;step++){if(tx<ty){tx+=ddx;mx+=sx;side=0;}else{ty+=ddy;my+=sy;side=1;}if(SECTOR_MAPS[level][my]?.[mx]!=='.')break;}const dist=Math.max(.05,(side?ty-ddy:tx-ddx)*Math.cos(angle-player.a));zbuffer[x]=zbuffer[x+1]=dist;const height=Math.min(H*4,H/dist),top=(H-height)/2,hit=(side?player.x+(ty-ddy)*dx:player.y+(tx-ddx)*dy),u=hit-Math.floor(hit),shade=Math.max(.13,1/(1+dist*.16))*(side?.7:1);for(let row=0;row<8;row++){const mortar=row%2?u<.025:Math.abs(u-.5)<.025;ctx.fillStyle=`rgb(${Math.floor((mortar?40:105)*shade)},${Math.floor((mortar?42:118)*shade)},${Math.floor((mortar?35:102)*shade)})`;ctx.fillRect(x,top+height*row/8,2,Math.max(1,height/8-2));}}
    const portal={x:10.5,y:8.5,type:'portal',open:enemies.every(e=>e.hp<=0)};const sprites=[...enemies.filter(e=>e.hp>0),...items,portal].map(e=>({...e,d:Math.hypot(e.x-player.x,e.y-player.y)})).sort((a,b)=>b.d-a.d);
    for(const e of sprites){let angle=Math.atan2(e.y-player.y,e.x-player.x)-player.a;angle=Math.atan2(Math.sin(angle),Math.cos(angle));const depth=e.d*Math.cos(angle);if(depth<.15||Math.abs(angle)>1.05)continue;const cx=W/2+Math.tan(angle)/.66*W/2,size=Math.min(H*3,H/depth*(e.type?.45:.8)),left=cx-size/2,top=H/2-size/2;for(let col=Math.max(0,Math.floor(left));col<Math.min(W,left+size);col++){if(depth>zbuffer[col])continue;const u=(col-left)/size;if(e.type==='portal'){ctx.fillStyle=e.open?'#65ff9c':'#c66538';ctx.fillRect(col,top,size/W+1,size);if(u>.12&&u<.88){ctx.fillStyle=e.open?'#133a28':'#271712';ctx.fillRect(col,top+size*.12,1,size*.8);}}else if(e.type){ctx.fillStyle=e.type==='health'?'#dddfca':'#cca34b';ctx.fillRect(col,H/2+size*.2,1,size*.5);if(e.type==='health'&&u>.38&&u<.62){ctx.fillStyle='#dc4949';ctx.fillRect(col,H/2+size*.26,1,size*.38);}}else{ctx.fillStyle='#a44632';if(u>.18&&u<.82)ctx.fillRect(col,top+size*.2,1,size*.65);if(u>.27&&u<.73){ctx.fillStyle='#d08f62';ctx.fillRect(col,top,1,size*.28);}if((u>.3&&u<.4)||(u>.6&&u<.7)){ctx.fillStyle='#ffe86b';ctx.fillRect(col,top+size*.1,1,size*.045);}ctx.fillStyle='#49251e';if((u>.2&&u<.4)||(u>.6&&u<.8))ctx.fillRect(col,top+size*.8,1,size*.2);}}}
    // Weapon silhouette and crosshair.
    const bob=running&&!paused&&(held.has('w')||held.has('s'))?Math.sin(elapsed*12)*3:0;ctx.fillStyle='#141718';ctx.fillRect(W/2-28,H-86+bob,56,90);ctx.fillStyle='#626761';ctx.fillRect(W/2-12,H-112+bob,24,80);ctx.fillStyle='#282e2b';ctx.fillRect(W/2-7,H-108+bob,14,16);if(flash){ctx.fillStyle='#ffdb75';ctx.beginPath();ctx.moveTo(W/2,H-149);ctx.lineTo(W/2+23,H-102);ctx.lineTo(W/2-20,H-100);ctx.fill();}ctx.strokeStyle='#c6e5bf';ctx.beginPath();ctx.moveTo(W/2-6,H/2);ctx.lineTo(W/2+6,H/2);ctx.moveTo(W/2,H/2-6);ctx.lineTo(W/2,H/2+6);ctx.stroke();
    if(hurt){ctx.fillStyle='rgba(230,40,30,.25)';ctx.fillRect(0,0,W,H);}if(!running)gameOverlay(ctx,canvas,won?'CAMPAÑA COMPLETADA':hp<=0?'HAS CAÍDO':'SECTOR 13',won?`3 sectores / ${score} puntos`:hp<=0?'Pulsa NUEVA CAMPAÑA':'Elimina hostiles. Encuentra el portal.');else if(paused)gameOverlay(ctx,canvas,'PAUSA','Pulsa CONTINUAR o P');
  }
  function loop(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;if(running&&!paused)tick(dt);render();raf=requestAnimationFrame(loop);}
  function start(){recordScore('doom',score);level=0;hp=100;ammo=24;score=0;won=false;running=true;paused=false;flash=0;hurt=0;loadLevel();hud();pauseButton.disabled=false;pauseButton.textContent='PAUSA';win.focus();}
  function pause(){if(!running)return;paused=!paused;held.clear();pauseButton.textContent=paused?'CONTINUAR':'PAUSA';}
  function down(e){const k=e.key.toLowerCase();if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown',' ','p'].includes(k)){e.preventDefault();if(k==='p'){if(!e.repeat)pause();}else held.add(k);}}
  const up=e=>held.delete(e.key.toLowerCase());win.tabIndex=0;win.addEventListener('keydown',down);window.addEventListener('keyup',up);canvas.addEventListener('click',()=>win.focus());$('.doom-start',body).onclick=start;pauseButton.onclick=()=>{win.focus();pause();};
  const controls=$('.doom-touch',body);[['a','STRAFE ←'],['w','AVANZAR'],['s','RETROCEDER'],['d','STRAFE →'],['arrowleft','GIRAR ←'],['arrowright','GIRAR →'],[' ','DISPARAR']].forEach(([key,label])=>{const button=document.createElement('button');button.className='btn';button.textContent=label;button.addEventListener('pointerdown',e=>{e.preventDefault();win.focus();button.setPointerCapture(e.pointerId);held.add(key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>held.delete(key));controls.append(button);});
  win.__cleanup=()=>{recordScore('doom',score);cancelAnimationFrame(raf);held.clear();win.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};attachGameLifecycle(win,()=>{if(running&&!paused)pause();});loadLevel();hud();raf=requestAnimationFrame(loop);
}};
Apps.arcade.size=[940,650];Apps.tetris.size=[620,700];Apps.pacman.size=[650,650];Apps.doom.size=[880,740];Apps.easter.size=[740,740];
