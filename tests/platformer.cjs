// Pruebas de comportamiento: física, rutas jugables, daño y progresión sin depender del navegador.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'platformer.js'),'utf8');
const sandbox={Math};vm.createContext(sandbox);vm.runInContext(source.slice(0,source.indexOf('Apps.mario=')),sandbox);
const run=s=>vm.runInContext(s,sandbox),tests=[],make=level=>run(`createPlatformWorld(${level})`);
const step=(world,input={},seconds=1/120)=>{sandbox.world=world;sandbox.input=input;sandbox.dt=seconds;run('stepPlatform(world,input,dt)');};
let w=make(0);w.status='playing';for(let i=0;i<100;i++)step(w);assert.equal(w.player.y,290);assert(w.player.ground);tests.push('Gravedad y aterrizaje estable sobre el suelo');
step(w,{jump:true});assert(w.player.vy<0);let top=w.player.y;for(let i=0;i<100;i++){step(w,{jump:true});top=Math.min(top,w.player.y);}assert(top<190);assert.equal(w.player.y,290);tests.push('Salto alcanza las plataformas y vuelve al suelo');
w=make(0);w.status='playing';for(let i=0;i<40;i++)step(w);step(w,{jump:true});step(w,{jump:false});assert(w.player.vy>=-250);tests.push('Soltar salto reduce su altura');
w=make(0);w.status='playing';w.player.x=18*32-30;w.player.y=290;w.enemies=[];for(let i=0;i<90;i++)step(w,{right:true});assert(w.player.x+w.player.w<=18*32);tests.push('Las tuberías bloquean el paso lateral sin atravesarse');
w=make(0);w.player.shield=true;sandbox.world=w;run('platformDamage(world)');assert.equal(w.lives,3);assert(!w.player.shield);run('platformDamage(world)');assert.equal(w.lives,3);w.player.invincible=0;w.checkpoint=1600;run('platformDamage(world)');assert.equal(w.lives,2);assert.equal(w.player.x,1600);tests.push('Escudo, inmunidad temporal y regreso al punto de control');
w=make(0);w.status='playing';w.enemies=[];const coin=w.coins[0];Object.assign(w.player,{x:coin.x,y:coin.y});step(w);assert(coin.taken);assert.equal(w.score,100);assert.equal(w.coinCount,1);step(w);assert.equal(w.score,100);tests.push('Cada moneda puntúa una sola vez');
w=make(0);w.status='playing';const e=w.enemies[0];Object.assign(w.player,{x:e.x,y:e.y-w.player.h-1,vy:200});step(w);assert(!e.alive);assert(w.player.vy<0);assert.equal(w.score,200);tests.push('Pisar un enemigo lo elimina y hace rebotar al jugador');
w=make(0);w.status='paused';const x=w.player.x,time=w.time;step(w,{right:true,jump:true},1);assert.equal(w.player.x,x);assert.equal(w.time,time);tests.push('La pausa congela física y cronómetro');
// El bot usa las reglas reales, sin teletransportes ni invulnerabilidad. Debe completar cada ruta.
for(let level=0;level<3;level++){
  w=make(level);w.status='playing';let jumping=false;
  for(let frame=0;frame<120*75&&w.status==='playing';frame++){
    const p=w.player;
    const danger=w.spec.gaps.some(([a,b])=>p.x+p.w>a*32-80&&p.x<b*32)||w.tiles.some(t=>t.type==='pipe'&&t.x-p.x<105&&t.x+t.w>p.x)||w.enemies.some(e=>e.alive&&e.x-p.x<100&&e.x+e.w>p.x);
    if(p.ground)jumping=danger&&!w.jumpHeld;
    step(w,{right:true,run:true,jump:jumping});
  }
  assert(['complete','won'].includes(w.status),`Mundo ${level+1} termina en ${w.status} a x=${w.player.x}, vidas=${w.lives}`);assert(w.checkpointSet);tests.push(`Mundo ${level+1}: ruta completa con saltos reales, enemigos y huecos`);
}
sandbox.carry={score:1234,lives:2,coinCount:12};w=run('createPlatformWorld(1,carry)');assert.equal(w.score,1234);assert.equal(w.lives,2);assert.equal(w.coinCount,12);tests.push('El siguiente mundo conserva puntos, vidas y monedas');
w=make(0);w.status='playing';w.lives=1;w.player.y=500;step(w);assert.equal(w.status,'lost');tests.push('Sin vidas la campaña termina');
assert(!fs.readFileSync(path.join(root,'upgrade.js'),'utf8').includes('Apps.doom'));assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('platformer.js'));tests.push('El shooter se elimina y el nuevo juego se carga en la página');
console.log(JSON.stringify({result:'PASS',tests},null,2));
