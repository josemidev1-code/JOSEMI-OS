/* Additional local apps and original, deterministic pixel-art landscapes. */
(() => {
  const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function spriteIcon(kind){
    const pixels={
      gallery:[[3,5,26,23,'#b9cbd7'],[5,7,22,18,'#172b37'],[7,19,8,4,'#608f89'],[10,15,7,8,'#608f89'],[16,17,9,6,'#80b49a'],[21,10,4,4,'#f3cc80']],
      notes:[[6,3,21,27,'#e9d9a7'],[4,5,3,25,'#a89066'],[11,9,12,2,'#897b60'],[11,14,12,2,'#897b60'],[11,19,8,2,'#897b60'],[21,23,9,3,'#789d7f'],[25,19,3,10,'#789d7f']],
      calculator:[[6,2,21,28,'#a3b4b1'],[9,5,15,7,'#213d35'],[11,8,11,2,'#b5e4b5'],...[0,1,2].flatMap(y=>[0,1,2].map(x=>[9+x*5,15+y*4,3,2,x===2?'#ddb083':'#394d4b']))],
      focus:[[11,2,10,3,'#e4c49c'],[14,5,4,3,'#a0b4b3'],[7,8,18,2,'#a0b4b3'],[5,10,22,15,'#a0b4b3'],[7,25,18,3,'#a0b4b3'],[8,11,16,13,'#253f37'],[15,12,2,8,'#bde7aa'],[16,18,6,2,'#bde7aa']],
      launchpad:[...Array(9)].map((_,i)=>[4+(i%3)*9,4+Math.floor(i/3)*9,6,6,['#8cbe9f','#dcbf83','#8aa9c6'][i%3]])
    };
    return `<svg class="os-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shape-rendering="crispEdges">${pixels[kind].map(([x,y,w,h,c])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join('')}</svg>`;
  }
  const newWalls=[['orbital','Estación orbital','Órbita, estrellas y un planeta lejano'],['floating','Islas del cielo','Jardines suspendidos sobre las nubes'],['desert','Templo del desierto','Arena, ruinas y un sol de cobre'],['library','Biblioteca nocturna','Libros, luz cálida y una noche de lluvia'],['cabin','Refugio de invierno','Un bosque nevado y una cabaña encendida'],['sunsetCity','Ciudad al atardecer','Azoteas, antenas y el último sol']];
  function landscape(kind){
    const art=[];
    const r=(x,y,w,h,c)=>art.push(`<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(h)}" fill="${c}"/>`);
    let seed=kind.split('').reduce((n,c)=>n+c.charCodeAt(0),71);
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const stars=(n=100)=>{for(let i=0;i<n;i++)r(random()*480,random()*190,i%11?1:2,i%11?1:2,i%3?'#608298':'#d7dfbf');};
    const pine=(x,y,s=1,snow=false)=>{r(x-2*s,y,4*s,18*s,'#473f45');for(let i=0;i<4;i++){r(x-(5+i*3)*s,y-(25-i*6)*s,(10+i*6)*s,8*s,i%2?'#294849':'#355b58');if(snow)r(x-(4+i*3)*s,y-(25-i*6)*s,(8+i*6)*s,2*s,'#b5d0cf');}};
    const cloud=(x,y,w=65)=>{r(x,y,w,6,'#d9dfd3');r(x+12,y-5,w-25,5,'#eaf0e1');r(x+8,y+6,w-12,3,'#a9c1c4');};
    if(kind==='orbital'){
      r(0,0,480,270,'#0c1527');stars(150);
      for(let y=0;y<94;y++){const w=Math.floor(Math.sqrt(Math.max(0,47*47-(y-47)**2)));r(352-w,19+y,w*2,1,y<45?'#659798':'#476e88');}
      r(310,63,80,4,'#aac0a5');r(332,92,40,3,'#9cb595');
      r(0,199,480,71,'#192a3c');r(0,199,480,3,'#7e9eab');
      for(let i=0;i<13;i++){r(i*40,220,30,3,'#355365');r(i*40+4,240,3,15,'#355365');}
      r(148,131,165,47,'#9aa9b1');r(143,143,175,20,'#c5cec7');r(164,143,128,15,'#203f55');
      for(let i=0;i<7;i++)r(170+i*17,146,9,7,'#71b7bf');
      r(117,140,25,34,'#425774');r(73,127,42,58,'#274a69');r(319,140,25,34,'#425774');r(346,127,42,58,'#274a69');
      for(let x=76;x<389;x+=9)if(x<115||x>345)r(x,130,1,52,'#5b91ad');
      r(218,110,4,21,'#91a9ad');r(202,109,39,3,'#a9bab4');r(235,102,2,8,'#dca9a6');
    }else if(kind==='floating'){
      r(0,0,480,270,'#608eab');r(0,100,480,90,'#80adbb');r(0,190,480,80,'#a2c5c6');
      for(let i=0;i<12;i++)cloud(random()*500-40,30+random()*210,45+random()*80);
      [[75,152,95],[258,112,125],[163,211,72]].forEach(([x,y,w],i)=>{r(x,y,w,8,'#678d68');r(x+5,y-5,w-10,5,'#a9c584');for(let j=0;j<8;j++)r(x+j*5,y+8+j*4,w-j*10,4,j%2?'#715c68':'#8b7277');pine(x+w*.7,y-6,.8);r(x+w*.25,y-34,17,29,'#b7ba9a');r(x+w*.25-3,y-37,23,5,'#d5d4b1');r(x+w*.25+5,y-28,6,10,'#626a6a');});
      r(279,69,19,3,'#d9dbbc');r(287,63,3,15,'#d9dbbc');
    }else if(kind==='desert'){
      r(0,0,480,270,'#6e5967');r(0,90,480,90,'#a27675');r(0,180,480,90,'#c79d7b');
      r(353,38,46,30,'#e3be8d');r(359,32,34,42,'#e3be8d');
      for(let i=0;i<16;i++)r(i*32,175+Math.sin(i*.7)*20,50,95,'#a67e71');
      for(let i=0;i<12;i++)r(i*45,223+Math.cos(i)*12,58,47,'#c39b78');
      r(158,120,165,85,'#c2a587');r(151,109,179,11,'#d2b797');r(165,99,150,10,'#b79881');
      for(let i=0;i<4;i++){r(169+i*40,125,15,72,'#ddbf95');r(166+i*40,122,21,6,'#a88778');r(166+i*40,196,21,7,'#a88778');}
      r(220,153,33,52,'#493f51');r(227,143,19,10,'#493f51');r(119,205,243,6,'#dbb68e');r(107,211,267,6,'#ba927a');
      for(let i=0;i<32;i++)r(random()*480,230+random()*40,3+random()*10,1,'#9f7968');
    }else if(kind==='library'){
      r(0,0,480,270,'#272b35');r(18,15,444,183,'#34343b');
      for(let shelf=0;shelf<4;shelf++){const y=35+shelf*38;r(29,y+27,208,5,'#765846');for(let i=0;i<24;i++){const h=13+random()*13;r(33+i*8.3,y+27-h,6,h,['#91745c','#66817c','#8a6672','#9c9474'][i%4]);r(34+i*8.3,y+21-h,4,1,'#b7ab86');}}
      r(285,23,151,135,'#706057');r(291,29,139,123,'#13253b');for(let i=0;i<16;i++)r(294+random()*130,33+random()*110,1,1,'#a2b4bf');
      r(335,48,18,18,'#d9d7bb');r(342,45,11,23,'#d9d7bb');
      for(let i=0;i<35;i++)r(294+random()*130,34+random()*110,1,5,'#58758a');
      r(356,29,5,123,'#7e6c5f');r(291,89,139,5,'#7e6c5f');
      r(0,201,480,69,'#29282f');for(let i=0;i<12;i++)r(i*43,202,2,68,'#4a3a35');
      r(131,180,238,12,'#a27c58');r(142,192,10,70,'#59483d');r(346,192,10,70,'#59483d');
      r(292,144,4,36,'#d7ba82');r(277,140,34,10,'#e1c88a');r(284,129,20,11,'#c4a776');
      r(188,173,55,7,'#9eaf9b');r(195,166,45,7,'#c3b397');r(246,166,15,14,'#cbb998');r(260,169,5,8,'#a58769');
    }else if(kind==='cabin'){
      r(0,0,480,270,'#253d59');stars(120);r(0,150,480,120,'#78999c');r(0,210,480,60,'#b7caca');
      for(let i=0;i<22;i++)pine(i*24-10,172+random()*55,1.3,true);
      r(170,151,125,66,'#765748');for(let i=0;i<8;i++)r(170,153+i*8,125,2,'#4e4240');
      for(let i=0;i<12;i++){r(150+i*6,150-i*4,164-i*12,4,'#c0d3d0');r(156+i*6,154-i*4,152-i*12,3,'#5a5961');}
      r(220,178,27,39,'#343943');r(181,169,23,22,'#e2b978');r(260,169,23,22,'#e2b978');r(191,169,3,22,'#88674f');r(181,179,23,2,'#88674f');
      r(273,105,10,30,'#715f5a');r(272,102,12,4,'#e0e5d7');r(278,91,9,6,'#82969c');r(283,78,13,7,'#607e8c');
      for(let i=0;i<100;i++)r(random()*480,random()*270,1,1,'#e1e6dc');
      r(198,224,72,3,'#d5ddd2');r(177,239,103,3,'#d5ddd2');
    }else{
      r(0,0,480,270,'#544a72');r(0,71,480,75,'#a56f86');r(0,146,480,124,'#d69d8c');
      r(327,75,51,35,'#ebc396');r(334,68,37,49,'#ebc396');
      for(let i=0;i<23;i++){const h=25+random()*85;r(i*23,200-h,21,h,'#5c5670');}
      for(let i=0;i<11;i++){const x=i*50-10,h=50+random()*85;r(x,235-h,44,h,'#2b344b');r(x+4,231-h,36,4,'#4d5067');r(x+32,215-h,2,18,'#303f53');for(let y=245-h;y<227;y+=10)for(let wx=x+6;wx<x+39;wx+=8)if(random()>.3)r(wx,y,3,4,random()>.5?'#c1a181':'#69888d');}
      r(0,237,480,33,'#182a3e');r(0,235,480,3,'#6b6474');r(120,201,79,4,'#687179');r(125,205,3,30,'#3c4c5d');r(190,205,3,30,'#3c4c5d');
      r(221,215,10,19,'#152132');r(223,207,6,8,'#152132');
    }
    return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" shape-rendering="crispEdges">${art.join('')}</svg>`);
  }
  newWalls.forEach(([id,name,detail])=>PIXEL_WALLPAPERS[id]={name,detail,url:landscape(id)});

  Apps.gallery={title:'Fondos',icon:spriteIcon('gallery'),size:[900,680],render:()=>'<section class="wall-gallery"><div class="extra-heading"><span class="card-kicker">PERSONALIZA TU UNIVERSO</span><h2>Un escritorio. Muchos mundos.</h2><p>Fondos originales en pixel art. Elige uno o guarda tus favoritos.</p></div><div class="wall-controls"><input type="search" aria-label="Buscar fondo" placeholder="Buscar un mundo…"><div><button class="btn" data-wall-filter="all" aria-pressed="true">TODOS</button><button class="btn" data-wall-filter="new" aria-pressed="false">NUEVOS</button><button class="btn" data-wall-filter="favorite" aria-pressed="false">FAVORITOS</button></div></div><p class="wall-count" role="status"></p><div class="wall-gallery-grid"></div></section>',bind(body){
    let filter='all',favorites=read('josemi-wall-favorites',[]);if(!Array.isArray(favorites))favorites=[];
    const grid=body.querySelector('.wall-gallery-grid'),input=body.querySelector('input');
    const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    function render(){
      const query=normalize(input.value),items=Object.entries(PIXEL_WALLPAPERS).filter(([id,w])=>(filter!=='new'||newWalls.some(v=>v[0]===id))&&(filter!=='favorite'||favorites.includes(id))&&normalize(w.name+' '+w.detail).includes(query));
      body.querySelector('.wall-count').textContent=items.length+(items.length===1?' fondo':' fondos')+' · se guarda en este navegador';
      grid.innerHTML=items.length?items.map(([id,w])=>`<article class="wall-tile ${state.wallpaper===id?'selected':''}"><button class="wall-select" data-select-wall="${id}" aria-label="Usar fondo ${escape(w.name)}" aria-pressed="${state.wallpaper===id}"><span class="wall-tile-preview" style="background-image:url('${w.url}')"></span><strong>${escape(w.name)}</strong><small>${escape(w.detail)}</small><span class="wall-tile-state">${state.wallpaper===id?'EN TU ESCRITORIO':'APLICAR FONDO →'}</span></button><button class="wall-favorite" data-wall-favorite="${id}" aria-label="${favorites.includes(id)?'Quitar de favoritos':'Guardar favorito'}: ${escape(w.name)}" aria-pressed="${favorites.includes(id)}">${favorites.includes(id)?'★':'☆'}</button></article>`).join(''):'<p class="extra-empty">Aquí aún no hay mundos. Prueba otra búsqueda o guarda un favorito.</p>';
    }
    input.addEventListener('input',render);
    body.addEventListener('click',e=>{
      const button=e.target.closest('button');if(!button)return;
      if(button.dataset.wallFilter){filter=button.dataset.wallFilter;body.querySelectorAll('[data-wall-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}
      if(button.dataset.selectWall){selectPixelWallpaper(button.dataset.selectWall);render();toast('Fondo aplicado: '+PIXEL_WALLPAPERS[button.dataset.selectWall].name);}
      if(button.dataset.wallFavorite){const id=button.dataset.wallFavorite;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];if(!write('josemi-wall-favorites',favorites))toast('No se ha podido guardar el favorito.');render();}
    });render();
  }};

  Apps.notes={title:'Bloc de notas',icon:spriteIcon('notes'),size:[680,570],render:()=>'<section class="pixel-notes"><div class="extra-heading"><span class="card-kicker">CAPTURA UNA IDEA</span><h2>Tu bloc de notas.</h2><p>Solo en este navegador. Escribir aquí no envía tus notas a Milo ni a un servidor.</p></div><label class="sr-only" for="pixel-note">Escribe tu nota</label><textarea id="pixel-note" maxlength="60000" placeholder="Una idea, una lista, algo que no quieres olvidar…" spellcheck="true"></textarea><div class="notes-footer"><span class="notes-status" role="status"></span><span class="notes-count"></span><button class="btn" data-note-download>DESCARGAR .TXT</button></div></section>',bind(body,win){
    const input=body.querySelector('textarea'),status=body.querySelector('.notes-status'),count=body.querySelector('.notes-count');let debounce;
    const saved=read('josemi-pixel-note','');input.value=typeof saved==='string'?saved:'';
    function updateCount(){count.textContent=input.value.length.toLocaleString('es-ES')+' caracteres';}
    function saveNote(){clearTimeout(debounce);status.textContent=write('josemi-pixel-note',input.value)?'GUARDADO EN ESTE NAVEGADOR':'NO SE HA PODIDO GUARDAR';}
    input.addEventListener('input',()=>{updateCount();status.textContent='GUARDANDO…';clearTimeout(debounce);debounce=setTimeout(saveNote,350);});
    body.querySelector('[data-note-download]').onclick=()=>{saveNote();const url=URL.createObjectURL(new Blob([input.value],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='nota-josemi.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    window.addEventListener('pagehide',saveNote);win.__cleanup=()=>{saveNote();window.removeEventListener('pagehide',saveNote);};updateCount();status.textContent='SOLO EN ESTE NAVEGADOR';
  }};

  Apps.calculator={title:'Calculadora',icon:spriteIcon('calculator'),size:[410,575],render:()=>`<section class="pixel-calculator"><span class="card-kicker">CUENTAS SIN SALIR DEL ESCRITORIO</span><label for="calc-operation">OPERACIÓN</label><input id="calc-operation" aria-label="Operación" readonly value="0"><p class="calc-message" role="status">Teclado o botones. % equivale a dividir entre 100.</p><div class="calc-keys">${[['AC','clear'],['⌫','back'],['%','%'],['÷','/'],['7','7'],['8','8'],['9','9'],['×','*'],['4','4'],['5','5'],['6','6'],['−','-'],['1','1'],['2','2'],['3','3'],['+','+'],['0','0'],['.','.'],['(','('],[')',')']].map(([text,value])=>`<button class="btn" data-calc="${value}" aria-label="${{'clear':'Borrar operación','back':'Borrar último carácter','/':'Dividir','*':'Multiplicar'}[value]||text}">${text}</button>`).join('')}<button class="btn btn--accent calc-equals" data-calc="equals" aria-label="Calcular resultado">=</button></div></section>`,bind(body,win){
    let expression='',fresh=false;const display=body.querySelector('input'),message=body.querySelector('.calc-message');
    function act(value){
      if(value==='clear'){expression='';fresh=false;message.textContent='Lista para otra operación.';}
      else if(value==='back'){expression=expression.slice(0,-1);fresh=false;}
      else if(value==='equals'){try{expression=String(PixelTools.calculate(expression));fresh=true;message.textContent='RESULTADO';}catch(error){message.textContent=error.message;}}
      else if(expression.length<150){if(fresh&&/[\d.(]/.test(value))expression='';fresh=false;expression+=value;message.textContent='';}
      display.value=expression||'0';
    }
    body.addEventListener('click',e=>{const b=e.target.closest('[data-calc]');if(b)act(b.dataset.calc);});
    win.addEventListener('keydown',e=>{let key=e.key;if(key==='Enter'||key==='=')key='equals';else if(key==='Backspace')key='back';else if(key==='Escape'||key==='Delete')key='clear';else if(!/^[\d.+\-*/()%]$/.test(key))return;e.preventDefault();act(key);});
  }};

  Apps.focus={title:'Concentración',icon:spriteIcon('focus'),size:[580,555],render:()=>'<section class="pixel-focus"><div class="extra-heading"><span class="card-kicker">UNA COSA CADA VEZ</span><h2>Tiempo para crear.</h2><p>Trabaja un rato. Descansa. Vuelve con otra idea.</p></div><div class="focus-modes"><button class="btn" data-focus-mode="work" aria-pressed="true">TRABAJO · 25</button><button class="btn" data-focus-mode="short" aria-pressed="false">PAUSA · 5</button><button class="btn" data-focus-mode="long" aria-pressed="false">PAUSA · 15</button></div><output class="focus-clock" aria-label="Tiempo restante">25:00</output><p class="focus-status" role="status">LISTO PARA EMPEZAR</p><div class="focus-actions"><button class="btn btn--accent" data-focus-start>INICIAR</button><button class="btn" data-focus-reset>REINICIAR</button></div><label class="focus-duration">Duración personalizada<input type="number" min="1" max="180" value="25" aria-label="Duración en minutos"><span>minutos</span></label><p class="focus-note">Puedes minimizar la ventana. Cerrar la ventana detiene el temporizador.</p></section>',bind(body,win){
    let duration=25*60000,remaining=duration,deadline=0,running=false,mode='work';const clock=body.querySelector('output'),status=body.querySelector('.focus-status'),start=body.querySelector('[data-focus-start]'),input=body.querySelector('input');
    function draw(){const seconds=Math.ceil(remaining/1000);clock.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
    function reset(){running=false;remaining=duration;start.textContent='INICIAR';input.disabled=false;status.textContent='LISTO PARA EMPEZAR';draw();}
    function tick(){if(!running)return;remaining=Math.max(0,deadline-Date.now());draw();if(!remaining){running=false;input.disabled=false;start.textContent='REPETIR';status.textContent=mode==='work'?'SESIÓN COMPLETADA. TÓMATE UN DESCANSO.':'DESCANSO COMPLETADO.';toast(mode==='work'?'Buen trabajo. Es hora de descansar.':'Descanso terminado. ¿Seguimos?');if(state.sound)beep();}}
    start.onclick=()=>{if(running){tick();if(!running)return;running=false;input.disabled=false;start.textContent='CONTINUAR';status.textContent='EN PAUSA';}else{if(!remaining)remaining=duration;deadline=Date.now()+remaining;running=true;input.disabled=true;start.textContent='PAUSAR';status.textContent=mode==='work'?'CONCENTRACIÓN EN MARCHA':'DESCANSO EN MARCHA';}};
    body.querySelector('[data-focus-reset]').onclick=reset;
    body.querySelectorAll('[data-focus-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.focusMode;duration={work:25,short:5,long:15}[mode]*60000;input.value=duration/60000;body.querySelectorAll('[data-focus-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));reset();});
    function changeDuration(report){if(running)return;const value=Number(input.value);if(!Number.isInteger(value)||value<1||value>180){if(report)input.value=duration/60000;status.textContent='ELIGE ENTRE 1 Y 180 MINUTOS.';return;}duration=value*60000;body.querySelectorAll('[data-focus-mode]').forEach(b=>b.setAttribute('aria-pressed',String({work:25,short:5,long:15}[b.dataset.focusMode]===value&&b.dataset.focusMode===mode)));reset();}
    input.addEventListener('input',()=>changeDuration(false));input.addEventListener('change',()=>changeDuration(true));
    const timer=setInterval(tick,250);win.__cleanup=()=>clearInterval(timer);draw();
  }};

  const extras=['gallery','notes','calculator','focus'];
  Apps.launchpad={title:'Aplicaciones',icon:spriteIcon('launchpad'),size:[760,610],render:()=>`<section class="pixel-launchpad"><div class="extra-heading"><span class="card-kicker">TODO TU SISTEMA, EN UN LUGAR</span><h2>¿Qué quieres hacer?</h2><p>También puedes buscar cualquier aplicación con Ctrl + K.</p></div><div class="pixel-app-grid">${['welcome',...new Set([...currentUser.apps,...extras])].filter(id=>Apps[id]&&id!=='trash').map(id=>`<button data-extra-open="${id}">${Apps[id].icon}<strong>${escape(Apps[id].title)}</strong></button>`).join('')}</div></section>`,bind(body){body.addEventListener('click',e=>{const id=e.target.closest('[data-extra-open]')?.dataset.extraOpen;if(id)openWindow(id);});}};
  [...extras,'launchpad'].forEach(id=>{if(!currentUser.apps.includes(id))currentUser.apps.push(id);if(!ICONS.includes(id))ICONS.push(id);});
  const appsButton=document.createElement('button');appsButton.textContent='APPS';appsButton.onclick=()=>openWindow('launchpad');document.querySelector('.pixel-system-bar nav').prepend(appsButton);
  const originalHome=Apps.welcome.render;
  Apps.welcome.render=()=>originalHome().replace('<div class="pixel-home-footer">',`<nav class="pixel-extra-shortcuts" aria-label="Herramientas personales">${extras.map(id=>`<button data-extra-open="${id}">${Apps[id].icon}<span>${escape(Apps[id].title)}</span></button>`).join('')}</nav><div class="pixel-home-footer">`);
  const homeBind=Apps.welcome.bind;Apps.welcome.bind=(body,win)=>{homeBind?.(body,win);body.addEventListener('click',e=>{const id=e.target.closest('[data-extra-open]')?.dataset.extraOpen;if(id)openWindow(id);});};
  buildIcons();buildMenu();
})();
