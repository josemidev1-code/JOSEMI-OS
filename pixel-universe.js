/* Pixel Universe: ilustración, entrada del arcade y controles del escritorio.
   No ejecuta código ni órdenes del ordenador: sus acciones se limitan a esta web. */
(() => {
  'use strict';
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const svg=(parts,cls='')=>`<svg class="os-icon ${cls}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">${parts}</svg>`;
  const palettes={ink:'#101e24',light:'#e9f1d7',mint:'#8ce6ac',gold:'#ffce74',blue:'#78cbe2',pink:'#f49ac1'};
  const art={
    computer:svg(rect(3,3,26,20,'#172b30')+rect(4,4,24,17,'#87adad')+rect(6,6,20,13,'#0a2026')+rect(8,8,3,7,'#8ce6ac')+rect(9,13,8,2,'#8ce6ac')+rect(18,9,5,1,'#539b92')+rect(18,12,5,1,'#539b92')+rect(13,23,6,3,'#78969b')+rect(9,26,14,2,'#b4d6ca')+rect(4,29,24,2,'#596f79')),
    temple:svg(rect(3,25,26,4,'#b99c6c')+rect(2,29,28,2,'#e8cca0')+rect(5,10,22,3,'#f1ddae')+rect(7,7,18,3,'#d6bd8c')+rect(10,5,12,2,'#efd8aa')+rect(14,3,4,2,'#f8e8bf')+[7,14,21].map(x=>rect(x,14,4,11,'#ddc498')+rect(x,14,1,11,'#fff0cb')+rect(x-1,23,6,2,'#b99c6c')).join('')),
    code:svg(rect(2,4,28,24,'#213a42')+rect(4,6,24,20,'#0b1a22')+rect(5,7,22,2,'#4c6e78')+[0,1,2].map(i=>rect(10-i*2,12+i*2,2,2,'#8ce6ac')+rect(8+i*2,18+i*2,2,2,'#8ce6ac')+rect(20+i*2,12+i*2,2,2,'#f5c476')+rect(22-i*2,18+i*2,2,2,'#f5c476')).join('')+rect(16,12,1,10,'#a2b7f2')),
    ai:svg(rect(8,5,16,21,'#7fa4b7')+rect(10,7,12,17,'#273f51')+rect(12,10,3,3,'#8ce6ac')+rect(18,10,3,3,'#8ce6ac')+rect(12,18,9,2,'#f49ac1')+rect(15,2,2,4,'#f3d184')+rect(14,1,4,2,'#f3d184')+[6,12,18,24].map(y=>rect(5,y,3,2,'#b8d7d9')+rect(24,y,3,2,'#b8d7d9')).join('')+rect(12,27,2,4,'#698b9c')+rect(20,27,2,4,'#698b9c')),
    pacman:svg([ [10,3,12,2],[6,5,20,3],[4,8,20,3],[2,11,17,3],[2,14,13,4],[2,18,17,3],[4,21,20,3],[6,24,20,3],[10,27,12,2] ].map(a=>rect(...a,'#ffdc59')).join('')+rect(14,7,3,3,'#1b2635')+rect(26,15,3,3,'#f8edca')),
    tetris:svg([[3,18,'#62d8df'],[11,18,'#ab88ed'],[19,18,'#ab88ed'],[11,10,'#ab88ed'],[19,26,'#f8cf66'],[27,26,'#f8cf66'],[3,26,'#62d8df'],[11,26,'#62d8df']].map(([x,y,c])=>rect(x,y-3,7,7,'#122730')+rect(x+1,y-2,5,5,c)+rect(x+1,y-2,4,1,'#e4eddf')).join('')),
    minesweeper:svg(rect(13,3,6,26,'#87a4ad')+rect(3,13,26,6,'#87a4ad')+rect(7,7,18,18,'#2c4653')+rect(10,10,12,12,'#142b35')+rect(11,10,4,4,'#e3f2dc')+rect(25,3,2,7,'#ffb6a0')+rect(22,6,8,2,'#ffb6a0')),
    coin:svg(rect(10,2,12,2,'#ffe9a2')+rect(6,4,20,3,'#ffdf75')+rect(4,7,24,18,'#eaa83c')+rect(6,25,20,3,'#ad6324')+rect(10,28,12,2,'#8a4920')+rect(7,7,18,17,'#ffd363')+rect(10,8,12,2,'#fff1ad')+rect(14,11,4,10,'#b9782f')+rect(12,12,2,3,'#b9782f')),
    lock:svg('<g class="pixel-lock-shackle">'+rect(8,3,16,3,'#b7dbe0')+rect(6,6,5,10,'#648d9a')+rect(21,6,5,10,'#a4c9cc')+'</g>'+rect(4,14,24,16,'#d29a45')+rect(6,16,20,11,'#f0c16a')+rect(14,18,4,4,'#3f4541')+rect(15,22,2,4,'#3f4541')),
  };
  window.PixelArt=art;
  for(const id of ['tetris','pacman','minesweeper']) Apps[id].icon=art[id];
  Apps.welcome.icon=art.computer;
  Apps.motivation.icon=art.ai;
  Apps.motivation.render=()=>`<section class="pixel-project-detail"><span class="project-large-art">${art.ai}</span><span class="card-kicker">UNA IDEA PARA SEGUIR</span><h2>Sigue construyendo.</h2><p>No hace falta saberlo todo para empezar. Aprende algo, pruébalo y mejora la siguiente versión.</p></section>`;

  Apps.education={title:'DAM · Mi formación',icon:art.code,size:[720,570],render:()=>`<section class="pixel-project-detail"><span class="project-large-art">${art.code}</span><span class="card-kicker">FORMACIÓN / EN CURSO</span><h2>Aprendiendo a construir software.</h2><p>Estudio <strong>Desarrollo de Aplicaciones Multiplataforma (DAM)</strong> en el <strong>IES Dr. Lluís Simarro, en Xàtiva</strong>.</p><p>Mi formación gira en torno a la programación, las bases de datos y la creación de aplicaciones. En JOSEMI-OS pongo en práctica HTML, CSS, JavaScript, Git y GitHub.</p><div class="pixel-study-line"><span>APRENDER</span><i></i><span>CONSTRUIR</span><i></i><span>MEJORAR</span></div></section>`};
  Apps.roadmap={title:'IA + software',icon:art.ai,size:[720,570],render:()=>`<section class="pixel-project-detail"><span class="project-large-art">${art.ai}</span><span class="card-kicker">ÁREA DE EXPLORACIÓN</span><h2>Código con nuevas posibilidades.</h2><p>Estoy explorando cómo integrar inteligencia artificial en aplicaciones y automatizaciones útiles.</p><p>Milo es una parte real de ese aprendizaje: conecta esta interfaz con un asistente, búsqueda web y meteorología. Esta sección reúne lo que quiero seguir aprendiendo; no presenta proyectos futuros como terminados.</p><button class="btn btn--accent" data-project-milo>HABLAR CON MILO</button></section>`,bind:b=>q('[data-project-milo]',b).onclick=()=>toggleMilo(true)};
  Apps.portfolio={title:'JOSEMI-OS',icon:art.computer,size:[760,580],render:()=>`<section class="pixel-project-detail"><span class="project-large-art">${art.computer}</span><span class="card-kicker">PROYECTO PERSONAL / EN EVOLUCIÓN</span><h2>Un PC dentro de tu navegador.</h2><p>JOSEMI-OS es mi portfolio interactivo: un escritorio con ventanas, aplicaciones, juegos y Milo, mi ajolote con IA. Todo está construido con HTML, CSS y JavaScript.</p><div class="proj"><span class="chip">JavaScript</span><span class="chip">Pixel art</span><span class="chip">APIs</span><span class="chip">Aprendizaje</span></div><a class="btn btn--accent" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener">VER REPOSITORIO ↗</a></section>`};
  Apps.projects.render=()=>`<section class="pixel-projects"><span class="card-kicker">/PROYECTOS Y APRENDIZAJE</span><h2>Código que puedes explorar.</h2><p class="bio">Lo que construyo, dónde aprendo y lo que quiero explorar después.</p><div class="folder-grid universe-projects"><button class="folder" data-project-app="portfolio"><span class="g">${art.computer}</span><span class="n">JOSEMI-OS</span><small>Mi escritorio interactivo</small><span class="project-go">EXPLORAR →</span></button><a class="folder" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener"><span class="g">${art.temple}</span><span class="n">Museu grec</span><small>Portfolio web · formación</small><span class="project-go">VER GITHUB ↗</span></a><button class="folder" data-project-app="education"><span class="g">${art.code}</span><span class="n">DAM</span><small>IES Dr. Lluís Simarro</small><span class="project-go">MI FORMACIÓN →</span></button><button class="folder" data-project-app="roadmap"><span class="g">${art.ai}</span><span class="n">IA + software</span><small>Exploración y aprendizaje</small><span class="project-go">DESCUBRIR →</span></button></div></section>`;
  Apps.projects.size=[860,760];
  Apps.projects.bind=b=>b.addEventListener('click',e=>{const id=e.target.closest('[data-project-app]')?.dataset.projectApp;if(id)openWindow(id);});

  // Una moneda física en pantalla, con la misma alternativa mediante teclado.
  const cabinet=()=>`<svg class="coin-machine" viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><defs><pattern id="machine-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#1d5262" stroke-width="1"/></pattern></defs><path d="M27 5H151V19H161V116L173 148V232H7V148L19 116V19H27Z" fill="#0b1526"/><path d="M27 9H147V19H155V116L167 148V226H13V148L25 116V19H27Z" fill="#604982"/><path d="M27 11H147V39H27Z" fill="#d786a8"/><path d="M32 15H142V35H32Z" fill="#211a36"/><text x="87" y="29" text-anchor="middle" fill="#ffde91" font-family="VT323,monospace" font-size="15">JOSEMI ARCADE</text><path d="M32 47H148V122H32Z" fill="#0c1122"/><path d="M38 53H142V113H38Z" fill="#102a3c"/><path d="M38 53H142V113H38Z" fill="url(#machine-grid)"/><g class="machine-stars" fill="#ffe4a4"><path d="M58 62H61V65H58ZM120 68H123V71H120ZM101 57H104V60H101Z"/><path d="M75 80H109V84H75ZM82 73H102V92H82Z" fill="#8ee5bd"/><path d="M82 84H89V88H82ZM96 84H102V88H96Z" fill="#102a3c"/></g><path d="M25 126H155L165 151H15Z" fill="#8c6ba7"/><path d="M32 138H52V143H32Z" fill="#1b1b36"/><path d="M40 126H44V140H40Z" fill="#d6e1dc"/><path d="M37 123H47V129H37Z" fill="#f38da6"/><path d="M112 136H120V143H112Z" fill="#84dcce"/><path d="M128 136H136V143H128Z" fill="#f1c674"/><path d="M21 157H159V219H21Z" fill="#392a55"/><path d="M26 161H72V213H26Z" fill="#46315b"/><path d="M90 170H146V204H90Z" fill="#1a2035"/><path d="M99 179H137V194H99Z" fill="#5c5b74"/><path d="M104 184H132V189H104Z" fill="#0a1520"/><path d="M30 219H52V225H30ZM124 219H146V225H124Z" fill="#a877a2"/><path d="M16 227H166V233H16Z" fill="#161a2c"/></svg>`;
  const gameIds=['tetris','pacman','minesweeper'];
  let arcadeReady=false;
  const launchWindow=openWindow;
  openWindow=function(id,...args){return launchWindow(gameIds.includes(id)&&!arcadeReady?'arcade':id,...args);};
  window.openWindow=openWindow;
  const baseArcadeRender=Apps.arcade.render, baseArcadeBind=Apps.arcade.bind;
  Apps.arcade.render=()=>`<section class="arcade-entry"><div class="arcade-entry-heading"><span class="card-kicker">JOSEMI / ARCADE</span><h2>La próxima partida empieza aquí.</h2><p>Arrastra la moneda hasta la ranura de la máquina.</p></div><div class="arcade-machine-stage">${cabinet()}<div class="coin-target" aria-label="Ranura para la moneda"></div><div class="arcade-floor"></div></div><button class="arcade-coin" aria-label="Insertar moneda">${art.coin}</button><p class="coin-instruction" role="status">ARRASTRA LA MONEDA · O PULSA ENTER</p><button class="btn coin-accessible">INSERTAR MONEDA</button></section>`;
  Apps.arcade.bind=(body,win)=>{
    const root=q('.arcade-entry',body),coin=q('.arcade-coin',root),slot=q('.coin-target',root),status=q('[role="status"]',root);let entered=false,drag=null,timer=0,justDragged=false;
    function enter(){if(entered)return;entered=true;root.classList.add('coin-inserted');status.textContent='CRÉDITO ACEPTADO · PREPARANDO LOS JUEGOS';if(state.sound)beep();timer=setTimeout(()=>{if(!win.isConnected)return;arcadeReady=true;body.innerHTML=baseArcadeRender();qa('[data-game]',body).forEach(b=>{q('.game-card__number',b).innerHTML=Apps[b.dataset.game].icon;});baseArcadeBind?.(body,win);body.classList.add('arcade-revealed');},state.motion?0:1100);}
    coin.addEventListener('pointerdown',e=>{if(entered)return;e.preventDefault();const r=coin.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};coin.setPointerCapture(e.pointerId);coin.classList.add('dragging');});
    coin.addEventListener('pointermove',e=>{if(!drag)return;coin.style.transform=`translate(${e.clientX-drag.x}px,${e.clientY-drag.y}px)`;const s=slot.getBoundingClientRect();root.classList.toggle('coin-over',e.clientX>s.left-28&&e.clientX<s.right+28&&e.clientY>s.top-28&&e.clientY<s.bottom+28);});
    coin.addEventListener('pointerup',e=>{if(!drag)return;const moved=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>10;drag=null;coin.classList.remove('dragging');const s=slot.getBoundingClientRect();if(e.clientX>s.left-28&&e.clientX<s.right+28&&e.clientY>s.top-28&&e.clientY<s.bottom+28)enter();else{coin.style.transform='';root.classList.remove('coin-over');if(moved)status.textContent='ACÉRCALA A LA RANURA ILUMINADA';}justDragged=moved;});
    coin.addEventListener('pointercancel',()=>{drag=null;coin.style.transform='';coin.classList.remove('dragging');root.classList.remove('coin-over');});
    coin.addEventListener('click',e=>{if(!justDragged||e.detail===0)enter();justDragged=false;});
    q('.coin-accessible',root).onclick=enter;win.__cleanup=()=>clearTimeout(timer);
  };

  // Puerta y cerraduras de la Vault. Los acertijos y sus desbloqueos se conservan.
  const vaultRender=Apps.easter.render,vaultBind=Apps.easter.bind;
  const door=`<svg class="vault-pixel-door" viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="3" width="152" height="90" fill="#10252e"/><rect x="8" y="7" width="144" height="82" fill="#7396a0"/><rect x="14" y="13" width="132" height="70" fill="#16313e"/><g class="vault-door-half vault-door-left"><rect x="16" y="15" width="64" height="66" fill="#4b707f"/><path d="M22 21H74V75H22Z" fill="#365564"/><path d="M26 25H70V29H26Z" fill="#84a4ac"/></g><g class="vault-door-half vault-door-right"><rect x="80" y="15" width="64" height="66" fill="#4b707f"/><path d="M86 21H138V75H86Z" fill="#365564"/><path d="M90 25H134V29H90Z" fill="#84a4ac"/><path d="M85 39H95V59H85Z" fill="#d2b56f"/></g><g class="vault-wheel"><rect x="64" y="35" width="32" height="26" fill="#a3c1bf"/><rect x="68" y="39" width="24" height="18" fill="#284a58"/><path d="M78 33H82V63H78ZM62 46H98V50H62Z" fill="#e1d6a7"/></g><path d="M21 10H25V13H21ZM135 10H139V13H135ZM21 83H25V86H21ZM135 83H139V86H135Z" fill="#e8e0b6"/></svg>`;
  Apps.easter.render=()=>vaultRender().replace('<div class="vault-opening"',`<div class="vault-engine">${door}<span>ACCESO A LA CÁMARA DE SECRETOS</span></div><div class="vault-opening"`);
  Apps.easter.bind=(body,win)=>{vaultBind(body,win);qa('.vault-lock',body).forEach(b=>{b.insertAdjacentHTML('afterbegin',`<span class="vault-lock-pixel">${art.lock}<i></i><i></i><i></i><i></i></span>`);});let t=setTimeout(()=>q('.vault-engine',body)?.classList.add('vault-engine-open'),state.motion?0:180);win.__cleanup=()=>clearTimeout(t);};

  // Más herramientas para señalar, dibujadas en la misma rejilla que los iconos.
  Object.assign(CURSORS,{sword:'Espada',axe:'Hacha nórdica',coin:'Moneda',ghost:'Fantasma',leaf:'Hoja',circuit:'Circuito',star:'Estrella',axolotl:'Ajolote'});
  const cursorBase=cursorSVG;
  const cursorDraw={
    sword:rect(5,2,4,18,'#e5e8d8')+rect(4,3,1,15,'#79b4bd')+rect(2,19,12,3,'#f6cc73')+rect(6,22,3,8,'#935e44'),
    axe:rect(13,4,4,27,'#9d6848')+rect(6,4,16,3,'#acd4d7')+rect(3,7,10,9,'#d1e5db')+rect(3,16,6,3,'#7baebc')+rect(17,8,9,6,'#acd4d7'),
    ghost:rect(7,3,18,4,'#a3c8fd')+rect(4,7,24,19,'#a3c8fd')+rect(4,26,5,4,'#a3c8fd')+rect(14,26,4,4,'#a3c8fd')+rect(23,26,5,4,'#a3c8fd')+rect(8,11,5,6,'#f7f4e4')+rect(20,11,5,6,'#f7f4e4')+rect(9,13,3,4,'#213d65')+rect(21,13,3,4,'#213d65'),
    leaf:rect(18,3,10,7,'#b1ed91')+rect(10,10,17,8,'#79c77c')+rect(5,18,17,7,'#539865')+rect(3,25,5,5,'#d3b77d')+rect(12,15,3,3,'#def1b3')+rect(18,9,3,3,'#def1b3'),
    circuit:rect(12,8,12,16,'#9ce2bb')+rect(15,11,6,10,'#1e4c49')+[4,10,16,22].map(y=>rect(6,y+2,6,2,'#c8e9cf')+rect(24,y+2,6,2,'#c8e9cf')).join(''),
    star:rect(14,2,4,10,'#fff0ab')+rect(3,12,26,5,'#ffd073')+rect(8,17,16,6,'#ffd073')+rect(5,23,8,6,'#e6a44e')+rect(19,23,8,6,'#e6a44e')+rect(12,12,8,7,'#fff0ab'),
    axolotl:rect(7,9,19,16,'#ffc7df')+rect(3,6,4,6,'#e88caf')+rect(1,13,6,4,'#e88caf')+rect(26,6,4,6,'#e88caf')+rect(26,13,6,4,'#e88caf')+rect(10,14,3,3,'#513b53')+rect(21,14,3,3,'#513b53')+rect(15,20,4,2,'#a96c91'),
  };
  cursorSVG=function(kind,size){if(kind==='coin')return art.coin.replace('<svg ',`<svg width="${size}" height="${size}" `);return cursorDraw[kind]?`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges">${cursorDraw[kind]}</svg>`:cursorBase(kind,size);};

  // Conserva los paisajes existentes y añade textura propia de cada escenario.
  const wet=new Set(['reef','lighthouse','auroraLake','godOfWarPixel','floating','minecraft','sonicCoast']);
  const space=new Set(['orbital','matrixCity','matrixCode','cyberpunk']);
  const detailLayer=(id)=>{
    let seed=[...id].reduce((n,c)=>n+c.charCodeAt(0),17);const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};let out='';
    for(let i=0;i<110;i++){const x=Math.floor(rand()*480),y=Math.floor(225+rand()*45);out+=rect(x,y,1+Math.floor(rand()*3),1,id==='reef'?'#f7dfaf66':'#b6d7c322');}
    if(!['reef','library','arcadeRoom','matrixCode'].includes(id))for(let i=0;i<55;i++){const x=Math.floor(rand()*480),y=Math.floor(rand()*85);out+=rect(x,y,1,1,space.has(id)?'#b4f5e0':'#e6e3df66');}
    if(wet.has(id))for(let i=0;i<20;i++)out+=rect(Math.floor(rand()*480),Math.floor(212+rand()*54),Math.floor(4+rand()*14),1,'#c0e7ee45');
    if(['library','cabin','sunsetCity','cyberpunk','matrixCity','arcadeRoom'].includes(id))for(let i=0;i<24;i++)out+=rect(Math.floor(rand()*480),Math.floor(100+rand()*100),2,3,'#ffd48a55');
    const r=(x,y,w,h,c)=>{out+=rect(x,y,w,h,c);};
    const flower=(x,y,c)=>{r(x,y,1,6,'#4c9566');r(x-1,y-2,3,3,c);r(x,y-1,1,1,'#f6e6a2');};
    const lantern=(x,y)=>{r(x,y,3,13,'#455667');r(x-4,y-7,11,2,'#79918e');r(x-3,y-5,9,5,'#e6c779');r(x-4,y,11,2,'#506976');r(x-2,y+13,7,2,'#7e9a99');};
    const crate=(x,y)=>{r(x,y,16,14,'#765643');r(x+1,y+1,14,2,'#caa371');r(x+1,y+10,14,2,'#caa371');r(x+3,y+3,2,7,'#b49365');r(x+11,y+3,2,7,'#b49365');};
    const lamp=(x,y)=>{r(x,y,2,38,'#233e4c');r(x-7,y,9,2,'#487882');r(x-8,y+2,5,3,'#e6d58a');r(x-5,y+36,11,2,'#193646');};
    if(['minecraft','zeldaForest','sonicCoast','floating','sakura'].includes(id))for(let i=0;i<20;i++)flower(Math.floor(rand()*480),Math.floor(222+rand()*40),i%3?'#e6b4ce':'#f3cf8b');
    if(id==='minecraft'){crate(54,222);r(318,207,13,8,'#ead9bf');r(328,210,6,6,'#a18f81');r(319,215,2,5,'#574d47');r(327,215,2,5,'#574d47');for(let i=0;i<5;i++)r(290+i*8,235,2,16,'#9c7651');r(290,239,36,2,'#bb9363');}
    if(id==='matrixCity'||id==='cyberpunk'){lamp(54,184);lamp(414,195);r(80,213,42,10,'#182a3c');r(89,206,22,7,'#29475a');r(84,214,4,2,'#f9c28a');r(115,214,4,2,'#f48aaf');r(89,223,6,3,'#10222f');r(109,223,6,3,'#10222f');r(336,180,37,22,'#172533');for(let i=0;i<5;i++){r(339+i*6,184,3,2,'#d490cb');r(339+i*6,190,3,2,'#79cfca');}}
    if(id==='matrixCode')for(let j=0;j<7;j++)for(let i=0;i<12;i++)r(42+j*61,30+i*18,1+i%3,3,'#8ae6b033');
    if(id==='jetpack'){crate(22,230);crate(40,230);r(332,88,22,11,'#6c94a1');r(336,91,4,4,'#f0c76a');r(348,91,4,4,'#f0c76a');r(327,85,32,2,'#b8d6d5');r(24,200,59,3,'#bda661');for(let i=0;i<9;i++)r(26+i*6,201,3,3,'#283e49');}
    if(id==='platformWorld'){for(let i=0;i<7;i++){r(168+i*18,128,5,9,'#ffe08a');r(170+i*18,130,1,5,'#ab732c');}r(368,195,3,36,'#d1e5da');r(371,196,16,10,'#86c28b');}
    if(id==='zeldaForest'){lantern(57,211);lantern(412,210);for(let i=0;i<24;i++)r(102+(i*23)%290,172+(i*13)%74,2,1,'#b7d7a24a');}
    if(id==='sonicCoast'){for(let i=0;i<7;i++){r(39+i*17,203,8,2,'#f8d374');r(39+i*17,211,8,2,'#c7973b');r(38+i*17,205,2,6,'#f8d374');r(45+i*17,205,2,6,'#f8d374');}}
    if(id==='hollowCavern'){lantern(76,211);lantern(405,214);for(let i=0;i<20;i++){const x=Math.floor(rand()*480),y=235+Math.floor(rand()*30);r(x,y,6,2,'#416d7d');r(x+2,y-5,2,5,'#7aa3aa');}}
    if(id==='godOfWarPixel'){r(64,220,25,19,'#435b69');r(68,224,2,9,'#8fcecf');r(70,226,5,2,'#8fcecf');r(75,224,2,9,'#8fcecf');crate(359,232);}
    if(id==='orbital'){r(361,62,14,11,'#a9bdc7');r(344,63,16,9,'#447b9c');r(376,63,17,9,'#447b9c');for(let i=0;i<3;i++){r(347+i*4,63,1,9,'#94ced8');r(379+i*4,63,1,9,'#94ced8');}r(367,57,1,5,'#c2d8d7');r(366,55,3,2,'#f1ce97');}
    if(id==='floating'){for(let i=0;i<12;i++){r(168+i*5,194+Math.floor(Math.sin(i/11*Math.PI)*9),3,2,'#bc986c');}r(167,184,2,12,'#89633f');r(227,184,2,12,'#89633f');for(let i=0;i<9;i++)r(174+i*6,193+Math.floor(Math.sin(i/8*Math.PI)*7),1,6,'#806855');}
    if(id==='desert'){for(let i=0;i<12;i++){r(37+i*3,229+Math.floor(Math.sin(i)*2),3,1,'#e0b87f');}crate(349,236);r(72,191,4,28,'#9f7e54');r(67,191,14,3,'#d7b582');r(70,214,8,3,'#b59463');}
    if(id==='library'){r(163,228,112,18,'#6a4950');for(let i=0;i<16;i++)r(167+i*6,231,3,2,'#b79a77');r(321,174,11,2,'#a97855');r(323,166,6,8,'#e0cda0');r(329,168,4,4,'#b6a47e');r(325,162,1,3,'#e0d8bf88');r(82,210,14,9,'#39333c');r(80,208,5,5,'#39333c');r(89,210,2,2,'#daca8a');}
    if(id==='cabin'){for(let i=0;i<5;i++){r(150+i*7,235,6,7,'#816450');r(151+i*7,236,3,5,'#bd9b71');}r(381,214,14,3,'#f7f0de');r(383,217,10,7,'#c9d9db');r(387,224,2,8,'#c9d9db');}
    if(id==='sunsetCity'){r(391,138,2,30,'#563847');r(384,143,17,1,'#563847');r(380,148,26,1,'#563847');r(382,153,21,1,'#563847');r(50,215,30,3,'#75505c');for(let i=0;i<4;i++)r(52+i*7,218,2,12,'#75505c');}
    if(id==='sakura'){lantern(124,221);lantern(371,228);r(222,236,66,3,'#a27789');r(220,230,3,13,'#72556d');r(287,230,3,13,'#72556d');for(let i=0;i<11;i++)r(225+i*5,228,2,10,'#b28c9d');}
    if(id==='lighthouse'){for(let i=0;i<15;i++){const x=Math.floor(rand()*260);r(x,235+Math.floor(rand()*25),8+Math.floor(rand()*20),4,'#3a4e62');r(x+2,234+Math.floor(rand()*25),5,1,'#8ea8b3');}}
    if(id==='reef'){for(let i=0;i<18;i++){const x=13+i*26,y=235+Math.floor(rand()*24);r(x,y,2,7,'#e99caa');r(x-2,y+2,6,2,'#e99caa');}r(290,205,3,3,'#ffeeb8');r(298,214,3,3,'#ffeeb8');}
    if(id==='volcano'){for(let i=0;i<9;i++){const x=54+i*47;r(x,246,16,6,'#402c32');r(x+3,244,8,2,'#67433a');r(x+7,247,3,1,'#eb7647');}}
    if(id==='arcadeRoom'){for(let i=0;i<12;i++){const x=Math.floor(rand()*480),y=241+Math.floor(rand()*26);r(x,y,3,2,i%2?'#c9a861':'#a25d99');}r(9,23,49,39,'#372346');r(13,27,41,31,'#171528');r(19,34,28,3,'#74cbbb');r(24,43,18,3,'#e8b776');}
    if(id==='auroraLake'){r(63,239,50,2,'#496b7e');r(72,246,43,1,'#638394');r(325,247,19,1,'#d3b98288');r(316,257,37,1,'#b5a98755');}
    return out;
  };
  for(const [id,wall] of Object.entries(PIXEL_WALLPAPERS)){if(!wall.url.startsWith('data:image/svg+xml,'))continue;const source=decodeURIComponent(wall.url.split(',').slice(1).join(','));wall.url='data:image/svg+xml,'+encodeURIComponent(source.replace('</svg>',`<g class="universe-details">${detailLayer(id)}</g></svg>`));}

  // Matrix ilumina sus propios píxeles: no añade otro alfabeto ni partículas.
  const matrixPixels={};
  for(const id of ['matrixCity','matrixCode']){
    const source=decodeURIComponent(PIXEL_WALLPAPERS[id].url.split(',').slice(1).join(','));matrixPixels[id]=[];
    for(const path of source.matchAll(/<path fill="(#[a-fA-F0-9]+)" d="([^"]+)"/g)){
      if(!['#a1efc1','#164c57','#18523b'].includes(path[1]))continue;
      for(const p of path[2].matchAll(/M(-?[\d.]+) (-?[\d.]+)h([\d.]+)v([\d.]+)/g))matrixPixels[id].push({x:+p[1],y:+p[2],w:+p[3],h:+p[4]});
    }
  }

  // Una única capa animada, pequeña y sin interacción. Se pausa al ocultar la pestaña.
  const canvas=document.createElement('canvas');canvas.id='pixel-scene';canvas.setAttribute('aria-hidden','true');canvas.width=960;canvas.height=540;q('#bg').append(canvas);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  let raf=0,last=0,sceneTime=0;const particles=Array.from({length:54},(_,i)=>({x:(i*173+37)%960,y:(i*97+71)%540,s:1+i%3,v:8+i%15}));
  function drawScene(t){
    ctx.clearRect(0,0,960,540);const id=state.wallpaper;
    if(matrixPixels[id]){for(const p of matrixPixels[id]){if(id==='matrixCity'&&p.y>=130||id==='matrixCode'&&p.x>=150&&p.x<=330&&p.y>=46)continue;const head=(t*18+Math.floor(p.x/12)*17)%170,delta=(head-p.y+170)%170;ctx.globalAlpha=delta<9?.75:delta<28?.3:0;if(!ctx.globalAlpha)continue;ctx.fillStyle='#a1efc1';ctx.fillRect(p.x*2,p.y*2,p.w*2,p.h*2);}ctx.globalAlpha=1;return;}
    const petals=id==='sakura',underwater=id==='reef',snow=['cabin','auroraLake','godOfWar','godOfWarPixel'].includes(id),embers=['volcano','arcadeRoom'].includes(id),digital=space.has(id)||id==='matrix',rain=id==='lighthouse'||id==='library';
    for(const [i,p] of particles.slice(0,Math.max(9,Math.round(state.weatherDensity*.6))).entries()){
      let x=(p.x+t*(underwater?4:petals?12:rain?25:3))%960,y=(p.y+t*p.v*(underwater||embers?-1:1)+1080)%540;
      ctx.globalAlpha=.25+(Math.sin(t*1.6+i)+1)*.23;
      ctx.fillStyle=petals?'#ffc8dc':underwater?'#b6ecf5':snow?'#d4effb':embers?'#ffc16e':digital?'#8cebc0':rain?'#b3d5e9':'#d3e5a5';
      if(petals){x+=Math.sin(t+i)*14;ctx.fillRect(x,y,p.s*2,p.s);ctx.fillRect(x+1,y-1,p.s,p.s);}
      else if(underwater){ctx.strokeStyle='#b6ecf5';ctx.strokeRect(x,y,p.s*2,p.s*2);}
      else if(rain)ctx.fillRect(x,y,1,7+p.s*3);
      else if(digital){ctx.fillRect(x,y,2,p.s*2);if(i%4===0)ctx.fillRect(x+3,y+3,2,2);}
      else ctx.fillRect(x,y,p.s,p.s);
    }
    ctx.globalAlpha=1;
    if(wet.has(id)||['sonic','godOfWar'].includes(id))for(let i=0;i<18;i++){ctx.fillStyle=i%2?'#b6d8db33':'#dce9e533';ctx.fillRect((i*67+t*5)%960,440+(i*11)%90,10+Math.sin(t+i)*7,1);}
    if(id==='reef'){for(let i=0;i<5;i++){const x=(i*210+t*(12+i*2))%1080-60,y=150+i*45+Math.sin(t+i)*9;ctx.fillStyle=['#f9cf61','#ef926d','#99dcce'][i%3];ctx.fillRect(x,y,18,8);ctx.fillRect(x-6,y-2,6,12);ctx.fillStyle='#163046';ctx.fillRect(x+12,y+1,2,2);}}
    if(id==='volcano'){ctx.globalAlpha=.15+Math.sin(t*2)*.06;ctx.fillStyle='#ff8844';ctx.fillRect(430,120,100,12);ctx.globalAlpha=1;}
    if(['minecraft','sonicCoast','floating'].includes(id))for(let i=0;i<3;i++){const x=(i*317+t*7)%1050-45,y=60+i*23+Math.sin(t*.7+i)*6;ctx.fillStyle='#e4ecde77';ctx.fillRect(x,y,18,1);ctx.fillRect(x+7,y-2,4,2);}
  }
  function sceneFrame(now){raf=0;if(document.hidden||canvas.hidden)return;if(now-last>65){const dt=last?Math.min(.15,(now-last)/1000):0;last=now;if(!state.motion)sceneTime+=dt*state.weatherSpeed;drawScene(sceneTime);}if(!state.motion)raf=requestAnimationFrame(sceneFrame);}
  function syncScene(){cancelAnimationFrame(raf);raf=0;last=0;canvas.hidden=!Object.hasOwn(PIXEL_WALLPAPERS,state.wallpaper);if(canvas.hidden){ctx.clearRect(0,0,960,540);return;}drawScene(sceneTime);if(!state.motion&&!document.hidden)raf=requestAnimationFrame(sceneFrame);}
  const applyBefore=applyTheme;applyTheme=function(){if(Object.hasOwn(PIXEL_WALLPAPERS,state.wallpaper)||state.wallpaper==='godOfWar')state.atmosphere='none';applyBefore();document.body.classList.toggle('universe-photo',state.wallpaper==='godOfWar');syncScene();};
  document.addEventListener('visibilitychange',syncScene);

  // Catálogo completo; el escritorio muestra solo los accesos esenciales.
  const desktopApps=['welcome','readme','about','projects','portfolio','education','skills','terminal','contact','arcade','tetris','pacman','minesweeper','settings','system','easter','screensaver','gallery','notes','calculator','focus','roadmap','launchpad','motivation','trash'];
  desktopApps.forEach(id=>{if(!currentUser.apps.includes(id))currentUser.apps.push(id);if(!ICONS.includes(id))ICONS.push(id);});
  function arrangeIcons(){const rows=Math.max(2,Math.floor((innerHeight-185)/99));q('#icons').style.setProperty('--desktop-rows',rows);}
  const essentialApps=['about','projects','arcade','notes','gallery','contact'];
  const originalIcons=buildIcons;buildIcons=function(){const catalog=currentUser.apps;try{currentUser.apps=essentialApps;originalIcons();}finally{currentUser.apps=catalog;}};
  const originalMenu=buildMenu;buildMenu=function(){const catalog=currentUser.apps;try{currentUser.apps=catalog.filter(id=>!gameIds.includes(id));originalMenu();}finally{currentUser.apps=catalog;}};
  arrangeIcons();window.addEventListener('resize',arrangeIcons);buildIcons();buildMenu();window.refreshPixelDock?.();

  // Expresiones y comentarios breves de Milo, sin enviar datos a ningún servidor.
  const face=q('#mascot-button .mascot-svg');
  face.insertAdjacentHTML('beforeend','<g class="milo-extra-face"><path class="milo-happy-eyes" d="M14 18h1v-2h4v2h1v2h-2v-2h-2v2h-2zM29 18h1v-2h4v2h1v2h-2v-2h-2v2h-2z" fill="#513b53"/><path class="milo-surprised-mouth" d="M22 21h4v5h-4z" fill="#9d4e77"/><path class="milo-thinking" d="M29 15h6v2h-6z" fill="#513b53"/></g>');
  const bubble=document.createElement('button');bubble.className='milo-dialogue';bubble.type='button';bubble.setAttribute('aria-label','Abrir conversación con Milo');bubble.textContent='¡Hola! Puedo abrir las apps y cambiar tu escritorio.';q('#mascot-button').after(bubble);bubble.onclick=()=>toggleMilo(true);let bubbleTimer=0;
  function speak(text,mood='happy'){bubble.textContent=text;bubble.classList.add('is-speaking');q('#mascot-button').dataset.mood=mood;clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>{bubble.classList.remove('is-speaking');q('#mascot-button').dataset.mood='idle';},6500);}
  let dialogueIndex=0;const idleLines=['¿Una partida? La máquina del Arcade acepta monedas pixel.','Prueba: «Milo, abre la calculadora».','Puedo cambiar el fondo sin salir del chat.','Tus notas se guardan aquí, en este navegador.','Código, una idea y un poquito de constancia.'];
  setInterval(()=>{if(!document.hidden&&q('#mascot-chat').hidden&&!q('#desktop').classList.contains('hidden'))speak(idleLines[dialogueIndex++%idleLines.length]);},42000);
  q('#mascot-input').addEventListener('input',()=>{q('#mascot-button').dataset.mood='thinking';});
  new MutationObserver(()=>{if(chatBusy)q('#mascot-button').dataset.mood='thinking';else q('#mascot-button').dataset.mood='happy';}).observe(q('#mascot-log'),{childList:true,subtree:true});

  const aliases={welcome:['inicio','escritorio','home'],readme:['readme','ayuda'],about:['sobre mi','sobre josemi','perfil'],projects:['proyectos'],education:['dam','estudios','formacion'],skills:['habilidades'],terminal:['terminal','consola'],contact:['contacto'],arcade:['arcade','recreativa'],tetris:['tetris'],pacman:['pacman','pac man','pac-man'],minesweeper:['buscaminas','minas'],settings:['ajustes','configuracion'],system:['monitor del sistema','monitor','informacion del sistema'],easter:['secret vault','vault','secretos'],screensaver:['salvapantallas','ascii studio','ascii'],gallery:['fondos','galeria'],notes:['bloc de notas','notas'],calculator:['calculadora'],focus:['concentracion','temporizador','pomodoro'],roadmap:['ia y software','ia + software','roadmap'],launchpad:['aplicaciones','apps'],portfolio:['josemi-os','josemi os'],motivation:['motivacion'],trash:['papelera']};
  function findApp(text){return Object.entries(aliases).sort((a,b)=>Math.max(...b[1].map(x=>x.length))-Math.max(...a[1].map(x=>x.length))).find(([,list])=>list.some(a=>text.includes(a)))?.[0];}
  function perform(action,value){
    const id=String(value||'');
    if(['open','close','minimize','maximize'].includes(action)){
      if(!Object.hasOwn(Apps,id))return {ok:false,text:'No encuentro esa aplicación.'};
      if(action==='open'&&gameIds.includes(id)&&!arcadeReady){openWindow('arcade');return {ok:true,text:'Te he abierto Arcade. Inserta la moneda para entrar a los juegos.'};}
      if(action==='open')openWindow(id);else {const win=q(`.window[data-id="${id}"]`);if(!win)return {ok:false,text:`${Apps[id].title} no está abierta.`};q(action==='close'?'.close':action==='minimize'?'.min':'.max',win).click();}
      return {ok:true,text:`${Apps[id].title}: ${ {open:'abierta',close:'cerrada',minimize:'minimizada',maximize:'tamaño cambiado'}[action]}.`};
    }
    if(action==='wallpaper'){
      if(id==='godOfWar'){if(!state.vault.gof)return {ok:false,text:'El fondo de God of War se desbloquea en Secret Vault.'};state.wallpaper=id;applyTheme();save();}
      else if(!Object.hasOwn(PIXEL_WALLPAPERS,id)||!selectPixelWallpaper(id))return {ok:false,text:'Ese fondo no existe en la galería.'};
      return {ok:true,text:`Fondo cambiado a ${PIXEL_WALLPAPERS[id]?.name||'God of War'}.`};
    }
    if(action==='theme'&&Object.hasOwn(THEMES,id)){chooseTheme(id);return {ok:true,text:`Tema ${THEMES[id].name} aplicado.`};}
    if(action==='cursor'&&Object.hasOwn(CURSORS,id)){state.cursor=id;applyShell();save();return {ok:true,text:`Puntero ${CURSORS[id]} aplicado.`};}
    if(action==='sound'){state.sound=id==='on';applyShell();save();return {ok:true,text:state.sound?'Sonidos activados.':'Sonidos desactivados.'};}
    if(action==='motion'){state.motion=id==='off';applyTheme();save();return {ok:true,text:state.motion?'Movimiento reducido.':'Animaciones activadas.'};}
    if(action==='atmosphere'&&Object.hasOwn(ATMOSPHERES,id)){if(Object.hasOwn(PIXEL_WALLPAPERS,state.wallpaper)||state.wallpaper==='godOfWar')return {ok:false,text:'Este fondo conserva su propia animación. Para usar un efecto ASCII, elige primero un fondo de color en Ajustes.'};if(id==='matrixBlue'&&!state.vault.matrix)return {ok:false,text:'Ese efecto se desbloquea en Secret Vault.'};state.atmosphere=id;state.universeUserAtmosphere=true;applyTheme();save();return {ok:true,text:`Animación: ${ATMOSPHERES[id]}.`};}
    if(action==='note'){openWindow('notes');const input=q('.window[data-id="notes"] textarea');input.value=(input.value?input.value+'\n':'')+id.slice(0,2000);input.dispatchEvent(new Event('input',{bubbles:true}));return {ok:true,text:'He añadido el texto a tus notas de este navegador.'};}
    if(action==='calculate'){try{const result=PixelTools.calculate(id);const win=openWindow('calculator');win.calculateExpression(id);return {ok:true,text:`${id} = ${result}`};}catch{return {ok:false,text:'No he podido calcular esa operación.'};}}
    if(action==='timer'){const mins=Number(id);if(!Number.isInteger(mins)||mins<1||mins>180)return {ok:false,text:'Elige entre 1 y 180 minutos.'};openWindow('focus');const b=q('.window[data-id="focus"]'),input=q('input',b);if(input.disabled)q('[data-focus-reset]',b).click();input.value=mins;input.dispatchEvent(new Event('change',{bubbles:true}));q('[data-focus-start]',b).click();return {ok:true,text:`Temporizador iniciado: ${mins} minutos.`};}
    return {ok:false,text:'No he realizado esa acción. Puedo abrir, cerrar, minimizar y maximizar apps, cambiar fondos, temas, punteros y animaciones, tomar notas, calcular e iniciar temporizadores.'};
  }
  function command(message){
    const text=norm(message).replace(/^milo[, :]+/,'');let result=null;
    const app=findApp(text),opening=/^(?:(?:por favor|me puedes|puedes|podrias|quiero que|quiero)[, ]+)?(abre|abrir|open|muestra|lanzar|inicia)\b/.test(text);
    if(/^(pon|inicia|activa).*(temporizador|pomodoro|concentracion)/.test(text)&&/\b\d{1,3}\b/.test(text))result=perform('timer',text.match(/\b(\d{1,3})\b/)[1]);
    else if(app&&opening){const batch=text.split(/\s+(?:y|and)\s+|,\s*/).map(findApp);if(batch.length>1&&batch.every(Boolean))result={ok:true,text:[...new Set(batch)].map(id=>perform('open',id).text).join(' ')};else result=perform('open',app);}
    else if(app&&/\b(cierra|cerrar|close)\b/.test(text))result=perform('close',app);
    else if(app&&/\b(minimiza|minimizar)\b/.test(text))result=perform('minimize',app);
    else if(app&&/\b(maximiza|maximizar)\b/.test(text))result=perform('maximize',app);
    else if(/^(pon|cambia|activa|elige|usar|usa|quiero).*(fondo|wallpaper)/.test(text)){
      const found=Object.entries(PIXEL_WALLPAPERS).find(([id,w])=>text.includes(norm(w.name))||text.includes(norm(id))||text.includes(norm(w.name.split(' · ')[0])));if(found)result=perform('wallpaper',found[0]);else if(/god of war/.test(text))result=perform('wallpaper','godOfWar');else{openWindow('gallery');result={ok:true,text:'Aquí tienes todos los fondos. Dime el nombre del que prefieres.'};}
    }else if(/^(pon|cambia|activa|elige|usa).*(tema)/.test(text)){
      const found=Object.entries(THEMES).find(([id,t])=>text.includes(norm(t.name))||text.includes(id));if(found)result=perform('theme',found[0]);
    }else if(/^(pon|cambia|activa|elige|usa).*(puntero|cursor)/.test(text)){
      const found=Object.entries(CURSORS).find(([id,name])=>text.includes(norm(name))||text.includes(id));if(found)result=perform('cursor',found[0]);
    }else if(/^(silencia|quita el sonido|desactiva.*sonido)/.test(text))result=perform('sound','off');
    else if(/^activa.*sonido/.test(text))result=perform('sound','on');
    else if(/^(reduce|desactiva|quita).*(movimiento|animaciones)/.test(text))result=perform('motion','off');
    else if(/^activa.*(animaciones|movimiento)/.test(text))result=perform('motion','on');
    else if(/^(pon|cambia|activa).*(lluvia|tormenta|nieve|particulas|matrix|estrellas)/.test(text)){
      const found=Object.entries(ATMOSPHERES).find(([id,name])=>text.includes(norm(name))||text.includes(norm(id)));if(found)result=perform('atmosphere',found[0]);
    }else if(/^calcula\s+/.test(text))result=perform('calculate',message.replace(/^.*?calcula\s+/i,''));
    else if(/^anota\s+/.test(text))result=perform('note',message.replace(/^.*?anota\s+/i,''));
    else if(/^(pon|inicia|activa).*(temporizador|pomodoro|concentracion)/.test(text)){const n=text.match(/\b(\d{1,3})\b/);if(n)result=perform('timer',n[1]);}
    if(result){speak(result.text,result.ok?'happy':'surprised');return {text:result.text};}return null;
  }
  window.PixelOS={perform,command,apps:desktopApps.slice(),speak};
  q('.saver-exit').textContent='Pulsa Escape o haz clic para volver ↵';
  const studioBind=Apps.screensaver.bind;
  Apps.screensaver.bind=(body,win)=>{studioBind(body,win);let effect=state.bootEffect;body.addEventListener('click',e=>{if(e.target.closest('[data-effect]'))effect=e.target.closest('[data-effect]').dataset.effect;});const timer=setInterval(()=>{if(!state.motion&&!document.hidden&&!win.classList.contains('minimized'))q(`[data-effect="${effect}"]`,body)?.click();},7200);const cleanup=win.__cleanup;win.__cleanup=()=>{clearInterval(timer);cleanup?.();};};
  // Los ajustes muestran la foto oficial y su procedencia sin depender de enlaces de terceros.
  const settingsRender=Apps.settings.render;
  Apps.settings.render=()=>settingsRender().replace('God of War<small>',`<span class="wallpaper-preview gow-preview"></span>God of War<small>`).replace('Imagen personalizada','Imagen oficial · Ragnarök').replace('Animación ASCII','Efecto de ASCII Studio');
  const settingsBind=Apps.settings.bind;
  Apps.settings.bind=(body,win)=>{
    settingsBind(body,win);
    const effect=q('[data-setting="atmosphere"]',body),note=document.createElement('p');
    note.className='wallpaper-motion-note';effect.closest('label').after(note);
    function sync(){const own=Object.hasOwn(PIXEL_WALLPAPERS,state.wallpaper)||state.wallpaper==='godOfWar';effect.disabled=own;effect.value=state.atmosphere;note.textContent=own?'Este paisaje usa su propia animación, sin efectos superpuestos. Los efectos ASCII están disponibles con los fondos de color.':'Elige un efecto para animar este fondo de color.';}
    body.addEventListener('click',e=>{if(e.target.closest('[data-wallpaper]'))sync();});sync();
  };
  applyTheme();save();syncScene();
})();
