'use strict';
// Juego de plataformas original: las colisiones y la simulación están separadas del dibujo.
// NIVELES: datos de tres mundos. Coordenadas en bloques de 32 píxeles, huecos, tuberías, plataformas y enemigos.
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
