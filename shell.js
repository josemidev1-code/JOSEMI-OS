'use strict';
// Browser-native interpretation of per-character terminal animation.
const SHELL_DEFAULTS={theme:'violet',cursor:'system',cursorSize:24,bootEffect:'cinematic',intensity:'full',idle:0,grain:true,atmosphere:'storm',weatherDensity:55,weatherSpeed:1,welcomeVisible:true};
for(const [key,value] of Object.entries(SHELL_DEFAULTS))if(state[key]===undefined)state[key]=value;
const THEMES={night:{name:'Terminal nocturna',accent:'#8be9a8',bg:'#090e14'},paper:{name:'Estudio de papel',accent:'#a65d24',bg:'#eee8d8'},violet:{name:'Órbita violeta',accent:'#c3a6ff',bg:'#100e1a'},ocean:{name:'Océano profundo',accent:'#75d5ec',bg:'#08161d'}};
Object.assign(THEMES,{sunset:{name:'Atardecer coral',accent:'#ffae91',bg:'#302133'},glacier:{name:'Glaciar azul',accent:'#3879b5',bg:'#e0edf2'},copper:{name:'Cobre cálido',accent:'#f5bc7c',bg:'#292119'}});
const EFFECTS={cinematic:'Órbita → láser → firma',storm:'Tormenta eléctrica //',orbit:'Anillos orbitales',laser:'Grabado láser',decrypt:'Descifrado',beams:'Barrido de luz',rain:'Lluvia de caracteres',gather:'Convergencia',random:'Aleatorio'};
const ATMOSPHERES={none:'Sin animación',storm:'Tormenta //',rain:'Lluvia diagonal',aurora:'Aurora de ondas',stars:'Constelaciones',terrain:'Paisaje topográfico',matrix:'Código en cascada'};
if(state.shellVersion!==4){if(state.theme==='night'||state.theme===undefined){state.theme='violet';state.accent=THEMES.violet.accent;state.bg=THEMES.violet.bg;}state.bootEffect='cinematic';state.shellVersion=4;}
if(!ATMOSPHERES[state.atmosphere])state.atmosphere='storm';
state.weatherDensity=Math.max(15,Math.min(90,Number(state.weatherDensity)||55));state.weatherSpeed=[.5,1,1.5].includes(Number(state.weatherSpeed))?Number(state.weatherSpeed):1;
const CURSORS={system:'Sistema',pixel:'Pixel',terminal:'Terminal',crosshair:'Mira',arrow:'Flecha clara'};
if(!THEMES[state.theme])state.theme='night';if(!CURSORS[state.cursor])state.cursor='system';if(!EFFECTS[state.bootEffect])state.bootEffect='beams';
state.cursorSize=[20,24,32].includes(Number(state.cursorSize))?Number(state.cursorSize):24;
if(!['full','calm'].includes(state.intensity))state.intensity='full';state.idle=[0,60,180].includes(Number(state.idle))?Number(state.idle):0;
const ICON_PATHS={
 readme:'<path d="M13 8h23l9 9v34H13z" fill="#dfe5d6"/><path d="M36 8v10h9M20 26h18M20 33h18M20 40h11"/>',
 about:'<rect x="8" y="11" width="48" height="40" rx="5" fill="#b9d3bc"/><circle cx="23" cy="27" r="7" fill="#edf0de"/><path d="M13 43q10-16 20 0M38 25h10M38 33h10M38 41h7"/>',
 projects:'<path d="M7 17h19l5 6h26v29H7z" fill="#d9a555"/><path d="M7 29l6-5h45l-5 28H7z" fill="#f3c778"/>',
 skills:'<path d="M34 6L12 34h17l-3 24 25-33H34z" fill="#edc16c"/>',
 terminal:'<rect x="7" y="10" width="50" height="43" rx="5" fill="#213a36"/><path d="M7 21h50M17 30l8 7-8 7M31 44h14" stroke="#adf0b7"/><circle cx="14" cy="16" r="1" fill="#ffd080"/>',
 contact:'<rect x="7" y="15" width="50" height="35" rx="4" fill="#a9c6dd"/><path d="M8 17l24 19 24-19M8 49l17-17M56 49L39 32"/>',
 arcade:'<path d="M18 8h30l-2 23 8 21H10l8-21z" fill="#bda9d5"/><rect x="23" y="14" width="20" height="15" rx="2" fill="#203032"/><path d="M22 42h10M27 37v10"/><circle cx="41" cy="41" r="3" fill="#e6aa64"/>',
 settings:'<path d="M27 7h10l2 8 7 3 8-2 5 9-6 6v8l6 5-5 9-8-2-7 4-2 7H27l-2-7-7-4-8 2-5-9 6-5v-8l-6-6 5-9 8 2 7-3z" fill="#a7b9c3"/><circle cx="32" cy="34" r="10" fill="#e8eadc"/>',
 system:'<rect x="6" y="10" width="52" height="35" rx="4" fill="#aec9bc"/><rect x="11" y="15" width="42" height="25" fill="#243b39"/><path d="M17 32h6l4-9 7 13 5-8h9M27 45v9M37 45v9M20 55h24" stroke="#9adeaa"/>',
 trash:'<path d="M17 19h30l-3 35H20z" fill="#9fb2b5"/><path d="M13 19h38M25 11h14v8M26 26v20M37 26v20"/>',
 easter:'<rect x="10" y="24" width="44" height="31" rx="4" fill="#d4b073"/><path d="M21 24v-8a11 11 0 0122 0v8" fill="none"/><circle cx="32" cy="38" r="4" fill="#263733"/><path d="M32 42v6"/>',
 screensaver:'<rect x="7" y="10" width="50" height="36" rx="4" fill="#aac7d3"/><path d="M17 23l6 5-6 5M30 34h15M27 46v8M37 46v8M21 55h22"/>',
 doom:'<path d="M11 16l21-9 21 9v24L32 57 11 40z" fill="#cf9870"/><path d="M22 27h20M24 37h16M32 20v25"/>',
 pacman:'<path d="M48 17A23 23 0 1048 47L32 32z" fill="#efcb64"/><circle cx="31" cy="18" r="3" fill="#29312f"/>',
 tetris:'<path d="M12 12h14v14h14V12h14v28H40v14H26V40H12z" fill="#c1a4d9"/><path d="M12 26h42M26 26v14M40 26v14"/>'
};
function osIcon(id){return `<svg class="os-icon os-icon--${id}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#293934" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">${ICON_PATHS[id]||ICON_PATHS.projects}</g></svg>`;}
for(const id of Object.keys(ICON_PATHS))if(Apps[id])Apps[id].icon=osIcon(id);

function cursorSVG(kind,size){const color=THEMES[state.theme].accent;const paths={pixel:`<path d="M3 2h4v4h4v4h4v4h4v4h-8v8H7V14H3z" fill="${color}" stroke="#17251f" stroke-width="2"/>`,terminal:`<path d="M10 3h12M16 3v26M10 29h12" stroke="${color}" stroke-width="3"/><path d="M11 5h10M18 5v22" stroke="#07100b"/>`,crosshair:`<path d="M16 1v10M16 21v10M1 16h10M21 16h10" stroke="${color}" stroke-width="2"/><rect x="13" y="13" width="6" height="6" fill="${color}"/>`,arrow:'<path d="M5 2v25l7-7 6 10 5-3-6-10h10z" fill="#f4f0df" stroke="#17241e" stroke-width="2"/>'};return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${paths[kind]}</svg>`;}
function applyShell(){
  document.body.dataset.theme=state.theme;document.body.dataset.intensity=state.intensity;document.body.classList.toggle('with-grain',!!state.grain);document.body.classList.toggle('immersive-desktop',!state.welcomeVisible);
  const value=state.cursor==='system'?'auto':`url("data:image/svg+xml,${encodeURIComponent(cursorSVG(state.cursor,state.cursorSize))}") ${state.cursor==='crosshair'||state.cursor==='terminal'?Math.round(state.cursorSize/2):2} ${state.cursor==='crosshair'?Math.round(state.cursorSize/2):2}, auto`;
  document.documentElement.style.setProperty('--os-cursor',value);document.documentElement.style.setProperty('--os-pointer',state.cursor==='system'?'pointer':value);document.documentElement.style.setProperty('--motion-ms',state.intensity==='calm'?'180ms':'400ms');
  $('#shell-theme-name')?.replaceChildren(document.createTextNode(THEMES[state.theme].name));
  syncAtmosphere();
}
const baseApplyTheme=applyTheme;applyTheme=function(){baseApplyTheme();applyShell();};
function chooseTheme(id){if(!THEMES[id])return;state.theme=id;state.accent=THEMES[id].accent;state.bg=THEMES[id].bg;applyTheme();save();}

function minimizeWithMotion(win,finish){
  if(win.classList.contains('minimizing'))return;
  if(state.motion||!win.animate){finish();return;}
  const dock=$(`.tb-app[data-id="${win.dataset.id}"]`),start=win.getBoundingClientRect(),end=dock?.getBoundingClientRect();
  if(!end){finish();return;}win.classList.add('minimizing');
  win.__transition=win.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${end.x-start.x}px,${end.y-start.y}px) scale(${end.width/start.width},${end.height/start.height})`,opacity:0}],{duration:state.intensity==='calm'?180:360,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  win.__transition.finished.catch(()=>{}).then(()=>{finish();win.__transition?.cancel();win.__transition=null;win.classList.remove('minimizing');});
}
function maximizeWithMotion(win){
  win.__transition?.cancel();const before=win.getBoundingClientRect();win.classList.toggle('maximized');const after=win.getBoundingClientRect();
  if(state.motion||!win.animate)return;
  win.__transition=win.animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px) scale(${before.width/after.width},${before.height/after.height})`},{transform:'none'}],{duration:state.intensity==='calm'?180:420,easing:'cubic-bezier(.16,1,.3,1)'});
}

// Text coordinates stay on a fixed grid. Animation is based on elapsed time,
// so 60 Hz and 120 Hz displays settle at the same moment.
function seededNoise(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function signatureFrame(art,effect,p){
  const h=art.length,w=Math.max(...art.map(l=>l.length)),grid=Array.from({length:h},()=>Array(w).fill(' '));
  if(p>=1)return art.join('\n');
  const put=(x,y,ch)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<w&&y>=0&&y<h)grid[y][x]=ch;};
  if(effect==='cinematic'){if(p<.46){effect='orbit';p=p/.46*.82;}else{effect='laser';p=(p-.46)/.54;}}
  if(effect==='storm'){
    for(let i=0;i<w;i++){const y=Math.floor((p*24+seededNoise(i)*h*3)%h);if(seededNoise(i)> .62)put(i,y,'/');}
    const strike=Math.floor(p*4),phase=(p*4)%1,root=seededNoise(strike+400)*w;
    if(phase<.35)for(let y=0;y<h;y++){const x=root+Math.sin(y*2+strike)*3;put(x,y,'/');put(x+1,y,'/');}
  }
  const scan=p*(w+9);
  for(let y=0;y<h;y++)for(let x=0;x<art[y].length;x++){
    const ch=art[y][x];if(ch===' ')continue;const seed=y*w+x,n=seededNoise(seed);
    if(effect==='orbit'){
      const q=Math.max(0,Math.min(1,(p-n*.16)/.78)),ease=q*q*(3-2*q),angle=n*Math.PI*2+(1-q)*Math.PI*3;
      const ox=w/2+Math.cos(angle)*(w*.46),oy=h/2+Math.sin(angle)*(h*.43);
      put(ox+(x-ox)*ease,oy+(y-oy)*ease,q>.84?ch:['.','+','*'][seed%3]);
    }else if(effect==='laser'){
      if(x<scan-3)put(x,y,ch);else if(Math.abs(x-scan)<2)put(x,y,'#');
      else if(x<scan+7&&n>.76)put(x,y,['.','+','*'][seed%3]);
    }else if(effect==='decrypt'){
      const threshold=n*.65+y/h*.13;put(x,y,p>threshold?ch:'01/+<>*'[Math.floor(seededNoise(seed+Math.floor(p*60))*7)]);
    }else if(effect==='storm'&&(p>.82||n<p*.85))put(x,y,ch);
  }
  if(effect==='laser'&&scan<w)for(let y=0;y<h;y++)put(scan,y,'|');
  return grid.map(row=>row.join('')).join('\n');
}
function asciiFrame(art,effect,progress){
  const height=art.length,width=Math.max(...art.map(l=>l.length)),grid=Array.from({length:height},()=>Array(width).fill(' '));progress=Math.max(0,Math.min(1,progress));
  if(['cinematic','storm','orbit','laser','decrypt'].includes(effect))return signatureFrame(art,effect,progress);
  for(let y=0;y<height;y++)for(let x=0;x<art[y].length;x++){
    const ch=art[y][x];if(ch===' ')continue;const seed=y*width+x,delay=seededNoise(seed)*.22,p=Math.max(0,Math.min(1,(progress-delay)/.72));
    if(effect==='gather'){const ease=1-(1-p)**3,ox=Math.round(x+(seededNoise(seed+9)*width-x)*(1-ease)),oy=Math.round(y+(seededNoise(seed+21)*height-y)*(1-ease));grid[Math.max(0,Math.min(height-1,oy))][Math.max(0,Math.min(width-1,ox))]=p>.9?ch:'·';}
    else if(effect==='rain'){const fall=Math.max(0,Math.min(1,(progress-x/width*.2)/.72));const cy=Math.round(-height+(y+height)*fall);if(cy>=0)grid[cy][x]=fall>.97?ch:['0','1','│','╎'][Math.floor(seededNoise(seed+Math.floor(progress*35))*4)];}
    else{const sweep=progress*(width+8);grid[y][x]=x<sweep-5?ch:x<sweep?['░','▒','▓'][Math.min(2,Math.floor((sweep-x)/2))]:' ';}
  }
  return progress>=1?art.join('\n'):grid.map(row=>row.join('')).join('\n');
}
function animateAscii(el,effect,{duration=1900,signal=()=>false}={}){
  if(effect==='random')effect=['cinematic','storm','orbit','laser','decrypt','beams','rain','gather'][Math.floor(Math.random()*8)];let handle=0,resolveDone,settled=false,start=null,last=0;
  const done=new Promise(resolve=>resolveDone=resolve);const end=value=>{if(settled)return;settled=true;cancelAnimationFrame(handle);resolveDone(value);};
  const frame=now=>{if(signal()||!el.isConnected){end(false);return;}if(state.motion){el.textContent=NAME_ART.join('\n');end(true);return;}if(start===null)start=now;const p=Math.min(1,(now-start)/duration);if(now-last>28||p===1){el.textContent=asciiFrame(NAME_ART,effect,p);last=now;}if(p===1)end(true);else handle=requestAnimationFrame(frame);};
  handle=requestAnimationFrame(frame);return {done,cancel:()=>end(false)};
}
let currentBootAnimation=null;
typeLoginArt=async function(){
  currentBootAnimation?.cancel();const run=++bootRun;enteringOS=false;const login=$('#login'),out=$('#bootTerminalOutput'),command=$('#bootCommand');login.classList.remove('hidden','out');login.classList.add('boot-v3');out.innerHTML='';command.textContent='';
  appendBoot('PERSONAL COMPUTING / JOSEMI-OS','boot-dim');appendBoot('');const logo=appendBoot('','boot-logo boot-logo--hero');
  currentBootAnimation=animateAscii(logo,state.bootEffect,{duration:state.intensity==='calm'?2000:4200,signal:()=>run!==bootRun});
  if(!await currentBootAnimation.done||run!==bootRun)return;appendBoot('\nJOSÉ MIGUEL MIRALLES GANDIA','boot-accent');appendBoot('DEVELOPMENT · CURIOSITY · PLAY','boot-dim');
  for(const text of ['[ OK ] Portfolio y proyectos','[ OK ] Escritorio, temas y cursores','[ OK ] Arcade y Secret Vault']){if(run!==bootRun)return;appendBoot(text,'boot-ok');if(!state.motion)await bootDelay(120);}
  command.textContent='Bienvenido a tu próxima idea.';if(!state.motion)await bootDelay(600);if(run===bootRun)enterOS();
};

Apps.settings={title:'Ajustes',icon:osIcon('settings'),size:[850,710],render:()=>`<div class="preferences"><aside class="preferences-nav"><span class="card-kicker">PERSONALIZA TU ESPACIO</span><h2>Ajustes</h2><a href="#pref-theme">01 / Apariencia</a><a href="#pref-cursor">02 / Cursor</a><a href="#pref-motion">03 / Movimiento</a><a href="#pref-screen">04 / Salvapantallas</a><div class="preferences-note">Se guarda en este navegador.<br>Tu escritorio, a tu manera.</div></aside><div class="preferences-main">
  <section id="pref-theme"><span class="card-kicker">01 / APARIENCIA</span><h3>Un ambiente para cada idea.</h3><div class="theme-picker">${Object.entries(THEMES).map(([id,t])=>`<button data-theme="${id}" class="theme-option ${state.theme===id?'selected':''}" aria-pressed="${state.theme===id}"><span class="theme-mini" style="--sample-bg:${t.bg};--sample-color:${t.accent}"><i></i><b>J</b><em></em></span>${t.name}</button>`).join('')}</div><label class="pref-row">Color de acento<input class="accent-input" type="color" value="${state.accent}" aria-label="Color de acento"></label><div class="weather-preferences"><span class="card-kicker">LIENZOS ASCII VIVOS</span><label class="pref-row">Fondo animado<select data-setting="atmosphere">${Object.entries(ATMOSPHERES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label class="pref-row">Densidad<input type="range" min="15" max="90" step="5" data-setting="weatherDensity" aria-label="Densidad del fondo"></label><label class="pref-row">Velocidad<select data-setting="weatherSpeed"><option value="0.5">Contemplativa</option><option value="1">Natural</option><option value="1.5">Enérgica</option></select></label><label class="pref-row">Mostrar bienvenida del escritorio<input type="checkbox" data-setting="welcomeVisible" ${state.welcomeVisible?"checked":""}></label><p>Los rayos se dibujan con // y se ramifican entre la lluvia. El fondo descansa mientras juegas o cambias de pestaña.</p></div><label class="pref-row">Base del fondo<select data-setting="wp"><option value="0">Aurora</option><option value="1">Bosque</option><option value="2">Azul profundo</option><option value="3">Violeta</option><option value="4">Matrix</option></select></label></section>
  <section id="pref-cursor"><span class="card-kicker">02 / CURSOR</span><h3>Elige cómo señalar el mundo.</h3><div class="cursor-picker">${Object.entries(CURSORS).map(([id,label])=>`<button data-cursor="${id}" class="cursor-option ${state.cursor===id?'selected':''}" aria-pressed="${state.cursor===id}"><span>${id==='system'?'↖':cursorSVG(id,30)}</span>${label}</button>`).join('')}</div><label class="pref-row">Tamaño<select data-setting="cursorSize"><option value="20">Pequeño</option><option value="24">Mediano</option><option value="32">Grande</option></select></label><div class="cursor-test">Prueba el cursor aquí. No hay círculo ni rastro.</div></section>
  <section id="pref-motion"><span class="card-kicker">03 / MOVIMIENTO</span><h3>Que el sistema respire.</h3><label class="pref-row">Animación ASCII<select data-setting="bootEffect">${Object.entries(EFFECTS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label class="pref-row">Intensidad<select data-setting="intensity"><option value="full">Expresiva</option><option value="calm">Suave</option></select></label><label class="pref-row">Reducir movimiento<input type="checkbox" data-setting="motion" ${state.motion?'checked':''}></label><label class="pref-row">Textura de papel<input type="checkbox" data-setting="grain" ${state.grain?'checked':''}></label><label class="pref-row">Sonidos del sistema<input type="checkbox" data-setting="sound" ${state.sound?'checked':''}></label><button class="btn preview-ascii">VER ANIMACIÓN ASCII ↗</button></section>
  <section id="pref-screen"><span class="card-kicker">04 / SALVAPANTALLAS</span><h3>Arte cuando te tomas un descanso.</h3><label class="pref-row">Iniciar tras inactividad<select data-setting="idle"><option value="0">Solo manualmente</option><option value="60">1 minuto</option><option value="180">3 minutos</option></select></label><button class="btn start-saver">ABRIR SALVAPANTALLAS ↗</button></section></div></div>`,bind(body){
  for(const el of $$('[data-setting]',body)){const key=el.dataset.setting;if(el.type!=='checkbox')el.value=String(state[key]);el.addEventListener(el.type==='range'?'input':'change',()=>{state[key]=el.type==='checkbox'?el.checked:['idle','wp','cursorSize','weatherDensity','weatherSpeed'].includes(key)?Number(el.value):el.value;applyTheme();save();});}
  $$('[data-theme]',body).forEach(button=>button.onclick=()=>{chooseTheme(button.dataset.theme);$$('[data-theme]',body).forEach(b=>{const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});$('.accent-input',body).value=state.accent;});
  $$('[data-cursor]',body).forEach(button=>button.onclick=()=>{state.cursor=button.dataset.cursor;applyShell();save();$$('[data-cursor]',body).forEach(b=>{const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});});
  $('.accent-input',body).oninput=e=>{state.accent=e.target.value;applyTheme();save();};$('.preview-ascii',body).onclick=()=>openWindow('screensaver');$('.start-saver',body).onclick=()=>showScreensaver();
}};
Apps.screensaver={title:'ASCII Studio',icon:osIcon('screensaver'),size:[780,560],render:()=>`<div class="ascii-studio"><span class="card-kicker">JOSEMI-OS / CHARACTER MOTION</span><h2>El texto también se mueve.</h2><pre class="ascii-stage" aria-label="Animación del nombre JOSEMI-OS"></pre><div class="ascii-actions">${Object.entries(EFFECTS).filter(([id])=>id!=='random').map(([id,name])=>`<button class="btn" data-effect="${id}">${name}</button>`).join('')}</div><p>Selecciona un efecto. Cada carácter encuentra su sitio.</p></div>`,bind(body,win){let animation;const play=effect=>{animation?.cancel();animation=animateAscii($('.ascii-stage',body),effect,{duration:state.intensity==='calm'?2200:4200});};$$('[data-effect]',body).forEach(b=>b.onclick=()=>play(b.dataset.effect));win.__cleanup=()=>animation?.cancel();play(state.bootEffect);}};
ICONS.push('screensaver');currentUser.apps.push('screensaver');

// Desktop icons use one consistent illustrated SVG family.
buildIcons=function(){const container=$('#icons');container.innerHTML='';currentUser.apps.forEach((id,i)=>{const app=Apps[id];if(!app)return;const button=document.createElement('button');button.type='button';button.className='icon';button.dataset.id=id;button.style.setProperty('--icon-index',i);button.setAttribute('aria-label',`Abrir ${app.title}`);button.innerHTML=`<span class="glyph">${app.icon}</span><span class="lbl">${app.title}</span>`;button.onclick=()=>{if(matchMedia('(pointer: coarse)').matches)openWindow(id);else{$$('.icon').forEach(el=>el.classList.remove('sel'));button.classList.add('sel');}};button.ondblclick=()=>openWindow(id);button.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();openWindow(id);}};container.append(button);});};

let saverAnimation=null,saverCycle=0,idleTimer=0,lastInput=Date.now();
function hideScreensaver(){const overlay=$('#os-screensaver');if(!overlay||overlay.hidden)return;overlay.hidden=true;saverCycle++;saverAnimation?.cancel();lastInput=Date.now();$('#launch-saver')?.focus({preventScroll:true});}
async function showScreensaver(){if($('#desktop').classList.contains('hidden')||!$('#shutdown').classList.contains('hidden'))return;const overlay=$('#os-screensaver');overlay.hidden=false;overlay.focus();const cycle=++saverCycle;let effectIndex=0;
  do{saverAnimation=animateAscii($('.saver-art',overlay),['cinematic','storm','orbit','laser','decrypt'][effectIndex++%5],{duration:4200,signal:()=>cycle!==saverCycle||document.hidden});if(!await saverAnimation.done)break;if(state.motion)break;await bootDelay(1700);}while(cycle===saverCycle&&!overlay.hidden);
}
function setupDesktop(){
  const welcome=document.createElement('section');welcome.className='desktop-welcome';welcome.innerHTML=`<div class="welcome-meta"><span class="welcome-dot"></span>JOSEMI / PERSONAL DESKTOP<span>EST. 2026</span></div><div class="welcome-body"><div class="welcome-small">BIENVENIDO A MI PEQUEÑO UNIVERSO</div><h1>Ideas en marcha.<br><em>Sistema en vivo.</em></h1><p>Soy José Miguel. Estoy aprendiendo a construir software, automatizaciones y cosas que merecen un doble clic.</p><div class="welcome-actions"><button class="btn btn--accent" data-open="projects">EXPLORAR PROYECTOS ↗</button><button class="btn" data-open="about">CONOCERME</button></div><div class="welcome-bottom"><span>DESARROLLO · IA · CURIOSIDAD</span><span id="shell-theme-name"></span></div></div><div class="welcome-seal" aria-hidden="true"><span>JM</span><small>BUILD<br>LEARN<br>REPEAT</small></div>`;$('#desktop').insertBefore(welcome,$('#icons'));$$('[data-open]',welcome).forEach(b=>b.onclick=()=>openWindow(b.dataset.open));
  const toolbar=document.createElement('div');toolbar.className='shell-tools';toolbar.innerHTML='<button id="launch-search" title="Buscar aplicaciones · Ctrl+K">⌕ <span>Buscar</span><kbd>Ctrl K</kbd></button><button id="launch-saver" title="Salvapantallas ASCII">✦</button><button id="launch-settings" title="Ajustes">'+osIcon('settings')+'</button>';$('.desktop__topbar').insertBefore(toolbar,$('.desktop__status'));$('#launch-search').onclick=()=>togglePalette(true);$('#launch-saver').onclick=showScreensaver;$('#launch-settings').onclick=()=>openWindow('settings');
  const saver=document.createElement('section');saver.id='os-screensaver';saver.hidden=true;saver.tabIndex=-1;saver.setAttribute('role','dialog');saver.setAttribute('aria-modal','true');saver.setAttribute('aria-label','Salvapantallas de JOSEMI');saver.innerHTML='<span class="saver-caption">JOSEMI-OS / AFTER HOURS</span><pre class="saver-art" aria-label="JOSEMI-OS"></pre><p>BUILD · LEARN · REPEAT</p><button class="btn saver-exit">VOLVER AL ESCRITORIO</button>';document.body.append(saver);$('.saver-exit',saver).onclick=hideScreensaver;saver.addEventListener('keydown',e=>{e.preventDefault();hideScreensaver();});saver.addEventListener('pointerdown',hideScreensaver);
  document.addEventListener('pointermove',()=>{lastInput=Date.now();if(!saver.hidden)hideScreensaver();},{passive:true});document.addEventListener('keydown',()=>lastInput=Date.now());document.addEventListener('pointerdown',()=>lastInput=Date.now(),{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)hideScreensaver();lastInput=Date.now();});
  idleTimer=setInterval(()=>{if(state.idle&&!document.hidden&&!$('#desktop').classList.contains('hidden')&&saver.hidden&&Date.now()-lastInput>state.idle*1000&&!document.activeElement?.closest('.game')&&!$$('.window').some(w=>!w.classList.contains('minimized')&&w.querySelector('.game')))showScreensaver();},5000);
  $('#desktop').addEventListener('pointermove',e=>{if(state.motion||state.intensity==='calm')return;const target=e.target.closest('.icon');if(!target)return;const rect=target.getBoundingClientRect();target.style.setProperty('--tilt-x',`${(e.clientY-rect.top-rect.height/2)/16}deg`);target.style.setProperty('--tilt-y',`${-(e.clientX-rect.left-rect.width/2)/16}deg`);},{passive:true});$('#icons').addEventListener('pointerout',e=>{const icon=e.target.closest('.icon');if(icon){icon.style.setProperty('--tilt-x','0deg');icon.style.setProperty('--tilt-y','0deg');}});
}

let paletteFocus=null,paletteIndex=0;
function togglePalette(show){const modal=$('#command-palette');if(show){if($('#desktop').classList.contains('hidden'))return;paletteFocus=document.activeElement;modal.hidden=false;$('#palette-query').value='';paletteIndex=0;renderPalette();$('#palette-query').focus();}else{modal.hidden=true;paletteFocus?.focus({preventScroll:true});}}
function renderPalette(){const query=$('#palette-query').value.trim().toLowerCase(),ids=[...currentUser.apps,'doom','pacman','tetris'].filter(id=>`${Apps[id].title} ${id}`.toLowerCase().includes(query));paletteIndex=Math.min(paletteIndex,Math.max(0,ids.length-1));const list=$('#palette-results');list.innerHTML=ids.length?ids.map((id,i)=>`<button role="option" aria-selected="${i===paletteIndex}" class="${i===paletteIndex?'current':''}" data-launch="${id}">${Apps[id].icon}<span>${Apps[id].title}</span><small>ABRIR ↵</small></button>`).join(''):'<p class="palette-empty">No hay aplicaciones con ese nombre.</p>';$$('[data-launch]',list).forEach(b=>b.onclick=()=>{const id=b.dataset.launch;togglePalette(false);openWindow(id);});}
function setupPalette(){const overlay=document.createElement('div');overlay.id='command-palette';overlay.hidden=true;overlay.innerHTML='<section role="dialog" aria-modal="true" aria-label="Buscar aplicaciones"><div class="palette-head"><span>⌕</span><input id="palette-query" placeholder="Busca en tu escritorio…" aria-label="Buscar aplicación" autocomplete="off"><button class="btn palette-close">ESC</button></div><div id="palette-results" role="listbox" aria-label="Aplicaciones"></div><footer>↑ ↓ seleccionar · ENTER abrir · ESC cerrar</footer></section>';document.body.append(overlay);$('.palette-close',overlay).onclick=()=>togglePalette(false);overlay.onclick=e=>{if(e.target===overlay)togglePalette(false);};const query=$('#palette-query');query.oninput=()=>{paletteIndex=0;renderPalette();};query.onkeydown=e=>{const count=$$('[data-launch]',$('#palette-results')).length;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();paletteIndex=Math.max(0,Math.min(count-1,paletteIndex+(e.key==='ArrowDown'?1:-1)));renderPalette();}if(e.key==='Enter'){e.preventDefault();$$('[data-launch]',$('#palette-results'))[paletteIndex]?.click();}};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();togglePalette(overlay.hidden);}if(e.key==='Escape'&&!overlay.hidden){e.preventDefault();togglePalette(false);}if(e.key==='Tab'&&!overlay.hidden){const nodes=$$('input,button',overlay);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});}

// Animate the desktop only on entry, not endlessly behind work windows.
const shellEnterOS=enterOS;enterOS=function(){if(enteringOS)return;currentBootAnimation?.cancel();shellEnterOS();};
const windowObserver=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&node.classList.contains('window')){const originalClose=$('.close',node).onclick;$('.close',node).onclick=()=>{node.classList.add('closing');originalClose();};$('.win__bar',node).addEventListener('dblclick',e=>{if(!e.target.closest('button'))maximizeWithMotion(node);});}});
// A single bounded character canvas; no per-particle DOM or accumulating timers.
function atmosphereFrame(kind,w,h,t,density=55){
  const cells=Array.from({length:h},()=>Array.from({length:w},()=>({ch:' ',light:0}))),put=(x,y,ch,light=.4)=>{x=Math.floor(x);y=Math.floor(y);if(x>=0&&x<w&&y>=0&&y<h)cells[y][x]={ch,light:Math.max(0,Math.min(1,light))};};
  if(kind==='storm'||kind==='rain'){
    for(let i=0;i<Math.floor(w*h*density/1400);i++){
      const speed=6+seededNoise(i+32)*9,y=(seededNoise(i+20)*h+t*speed)%(h+8)-4,x=(seededNoise(i+1)*w-t*speed*.36+w*100)%w;
      for(let tail=0;tail<3;tail++)put(x+tail*.4,y-tail,'/',.22+(3-tail)*.08);
    }
    if(kind==='storm'){
      const cycle=Math.floor(t/6),phase=t%6;
      if(phase>.7&&phase<1.45){
        const root=w*(.15+seededNoise(cycle+88)*.7),growth=Math.min(h,(phase-.7)*h*5),light=Math.max(.3,1-(phase-1)*1.8);
        for(let y=0;y<growth;y++){
          const x=root+Math.sin(y*.6+cycle)*3-y*.28;put(x,y,'/',light);put(x+1,y,'/',light);
          if(y>h*.24&&y<h*.7&&y%5===0)for(let b=0;b<7;b++)put(x+b,y+b*.55,'/',light*.7);
        }
        const impactX=root+Math.sin((h-1)*.6+cycle)*3-(h-1)*.28;
        if(growth>=h)for(let s=0;s<18;s++){const angle=s*.7,r=(phase-.9)*20;put(impactX+Math.cos(angle)*r,h-2-Math.abs(Math.sin(angle)*r*.35),s%2?'*':'+',light*.7);}
      }
    }
  }else if(kind==='aurora'||kind==='terrain'){
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const value=kind==='aurora'?Math.sin(x*.09+t*.35)+Math.cos(y*.23+x*.03-t*.5)+Math.sin(x*.035+y*.12+t*.3):Math.sin(x*.08+t*.06)*1.8+Math.cos(y*.16-t*.04)+Math.sin(x*.05+y*.09);
      const band=Math.abs(Math.sin(value*(kind==='terrain'?5:2)));
      if(band<density/700)put(x,y,kind==='terrain'?(band<.04?'+':'.'):'~',.22+Math.abs(value)*.13);
    }
  }else if(kind==='stars'){
    for(let i=0;i<Math.floor(w*h*density/1100);i++){
      const x=seededNoise(i+3)*w,y=seededNoise(i+7)*h,light=.28+(Math.sin(t*.8+i)+1)*.2;put(x,y,i%6===0?'+':'.',light);
      if(i%9===0)for(let j=1;j<5;j++)put(x+j,y+j*.2,'.',.16);
    }
    const cycle=Math.floor(t/9),phase=t%9;if(phase<2)for(let tail=0;tail<7;tail++)put(w-phase*w*.4+tail,seededNoise(cycle+300)*h+phase*4-tail*.15,tail?'·':'*',.8-tail*.09);
  }else if(kind==='matrix'){
    for(let x=0;x<w;x+=2){const head=(t*(5+seededNoise(x)*5)+seededNoise(x+90)*h)%h;
      for(let tail=0;tail<Math.floor(density/6);tail++)put(x,(head-tail+h)%h,'01<>/{}'[Math.floor(seededNoise(x*10+tail+Math.floor(t*5))*7)],.7-tail*.045);}
  }
  return cells;
}
let atmosphereCanvas=null,atmosphereContext=null,atmosphereRAF=0,atmosphereTime=0,atmosphereLast=null,atmosphereDrawn=-Infinity,atmosphereSize='',atmosphereColors=[];
function atmosphereActive(){return !document.hidden&&!state.motion&&state.atmosphere!=='none'&&!$('#desktop').classList.contains('hidden')&&$('#shutdown').classList.contains('hidden')&&$('#os-screensaver')?.hidden&&!$$('.window').some(w=>!w.classList.contains('minimized')&&w.querySelector('.game'));}
function drawAtmosphere(){
  if(!atmosphereContext)return;const width=innerWidth,height=innerHeight,cell=Math.max(innerWidth<600?13:15,width/180),line=Math.max(19,height/65),cols=Math.ceil(width/cell),rows=Math.ceil(height/line),dpr=Math.min(devicePixelRatio||1,1.5),size=`${width}:${height}:${dpr}`;
  if(size!==atmosphereSize){atmosphereSize=size;atmosphereCanvas.width=Math.round(width*dpr);atmosphereCanvas.height=Math.round(height*dpr);atmosphereContext.setTransform(dpr,0,0,dpr,0,0);}
  atmosphereContext.clearRect(0,0,width,height);atmosphereContext.font='12px monospace';atmosphereContext.textBaseline='top';
  const cells=atmosphereFrame(state.atmosphere,Math.min(cols,180),Math.min(rows,65),state.motion?3.5:atmosphereTime,state.weatherDensity);
  for(let y=0;y<cells.length;y++)for(let x=0;x<cells[y].length;x++){const c=cells[y][x];if(c.ch===' ')continue;atmosphereContext.globalAlpha=c.light*(state.intensity==='calm'?.65:1);atmosphereContext.fillStyle=atmosphereColors[Math.floor(x/cols*3)%3];atmosphereContext.fillText(c.ch,x*cell,y*line);}
  atmosphereContext.globalAlpha=1;
}
function atmosphereTick(now){
  atmosphereRAF=0;if(!atmosphereActive()){atmosphereLast=null;return;}
  if(atmosphereLast!==null)atmosphereTime+=Math.min(.1,(now-atmosphereLast)/1000)*state.weatherSpeed;atmosphereLast=now;
  if(now-atmosphereDrawn>(state.intensity==='calm'?83:42)){drawAtmosphere();atmosphereDrawn=now;}atmosphereRAF=requestAnimationFrame(atmosphereTick);
}
function syncAtmosphere(){
  if(!atmosphereCanvas){atmosphereCanvas=document.createElement('canvas');atmosphereCanvas.id='ascii-wall';atmosphereCanvas.setAttribute('aria-hidden','true');$('#bg').append(atmosphereCanvas);atmosphereContext=atmosphereCanvas.getContext('2d');}
  atmosphereCanvas.hidden=state.atmosphere==='none';if(state.atmosphere!=='none'||state.motion)stopMatrix();
  atmosphereColors=[state.accent,THEMES[state.theme].accent,['paper','glacier'].includes(state.theme)?'#647f95':'#b7a7ec'];
  document.body.dataset.atmosphere=state.atmosphere;drawAtmosphere();
  if(!atmosphereActive()){cancelAnimationFrame(atmosphereRAF);atmosphereRAF=0;atmosphereLast=null;}else if(!atmosphereRAF)atmosphereRAF=requestAnimationFrame(atmosphereTick);
}
setupDesktop();setupPalette();windowObserver.observe($('#desktop'),{childList:true});
new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&(r.target.id==='desktop'||r.target.classList.contains('window'))||r.type==='childList'&&[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&n.classList.contains('window'))))syncAtmosphere();}).observe($('#desktop'),{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
new MutationObserver(syncAtmosphere).observe($('#shutdown'),{attributes:true,attributeFilter:['class']});
new MutationObserver(syncAtmosphere).observe($('#os-screensaver'),{attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',syncAtmosphere);window.addEventListener('resize',syncAtmosphere);
applyTheme();save();buildIcons();buildMenu();buildClock();buildParallax();buildStart();buildContext();buildKonami();initDirectAccess();typeLoginArt();
