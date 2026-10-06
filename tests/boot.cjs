// Prueba la secuencia REAL de arranque con un reloj controlado: no espera segundos reales.
// La intro solo usa temporizadores (bootDelay): «Wake up, Neo...» → borrado → «The Matrix has you...» → rótulo JOSEMI-OS → escritorio.
const assert=require('node:assert/strict'),vm=require('node:vm'),section=require('./source.cjs');
const core=section('script.js'),shell=section('shell.js');
function harness(motion=false,broken=false){
  let now=0,entered=0;const timers=[],lines=[];
  const output={innerHTML:'',textContent:'',isConnected:true};
  const login={classList:{remove(){},add(){}},dataset:{}};
  const context={Math,Promise,console:{error(){}},state:{motion,intensity:'full',bootEffect:'cinematic'},
    // La intro no debe pedir fotogramas: si lo hace, la prueba falla.
    requestAnimationFrame:()=>{throw new Error('La intro no debe usar requestAnimationFrame');},
    bootDelay:ms=>new Promise(resolve=>timers.push({at:now+ms,resolve})),
    $:selector=>selector==='#login'?login:output,
    appendBoot:(text='',cls='')=>{if(broken&&cls.includes('boot-logo'))throw new Error('fallo simulado');const line={textContent:text,isConnected:true,className:cls};lines.push(line);return line;},
    enterOS:()=>{entered++;context.enteringOS=true;context.bootRun++;},bootRun:0,enteringOS:false};
  vm.createContext(context);
  vm.runInContext(core.slice(core.indexOf('async function typeBootText('),core.indexOf('// ENTRAR:')),context);
  vm.runInContext('let currentBootAnimation=null;'+shell.slice(shell.indexOf('const BOOT_ART='),shell.indexOf('// AJUSTES:',shell.indexOf('typeLoginArt=async function('))),context);
  async function advance(ms,quantum=5){const end=now+ms;while(now<end){now=Math.min(end,now+quantum);for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=now){const [timer]=timers.splice(i,1);timer.resolve();}for(let i=0;i<8;i++)await Promise.resolve();}}
  return{context,lines,login,advance,entered:()=>entered};
}
(async()=>{
  // Rótulo: 5 filas del mismo ancho, hechas con barras y sin caracteres especiales.
  const ctx=harness().context,art=vm.runInContext('BOOT_ART',ctx),final=art.join('\n');
  assert.equal(art.length,5);assert(art.every(row=>row.length===art[0].length));assert(/^[\/\\_| ]+$/.test(art.join('')));assert(final.includes('/')&&final.includes('\\'));
  // Cada fotograma conserva el tamaño; el último es exactamente el rótulo, sin destellos.
  ctx.plan=ctx.bootPlan();
  for(const p of [0,.05,.12,.3,.6,.83,.95,1]){ctx.p=p;const frame=vm.runInContext('bootFrame(plan,p)',ctx);for(const layer of [frame.base,frame.hot]){const rows=layer.split('\n');assert.equal(rows.length,5);assert(rows.every(row=>row.length===art[0].length));}
    if(p===0)assert(frame.base.replace(/\s/g,'').length<=5);if(p===1){assert.equal(frame.base,final);assert.equal(frame.hot.trim(),'');}}

  // Línea de tiempo: 0,6 s espera · escribe hasta 2,25 s · pausa · borra hasta 3,9 s · escribe hasta 6,3 s · rótulo 7,6 → 11 s · entra a los 12,1 s.
  const full=harness();full.context.typeLoginArt();
  await full.advance(1200);assert.equal(full.login.dataset.phase,'matrix');assert('Wake up, Neo...'.startsWith(full.lines[0].textContent));assert(full.lines[0].textContent.length>0&&full.lines[0].textContent.length<15);
  await full.advance(1800);assert.equal(full.lines[0].textContent,'Wake up, Neo...');
  await full.advance(1100);assert.equal(full.lines[0].textContent,'');                       // la frase se ha borrado
  await full.advance(2900);assert.equal(full.lines[0].textContent,'The Matrix has you...');assert.equal(full.entered(),0);
  await full.advance(2000);assert.equal(full.login.dataset.phase,'signature');assert.equal(full.entered(),0);assert.notEqual(full.lines[2].textContent,final);
  await full.advance(2500);assert.equal(full.lines[2].textContent,final);assert.equal(full.lines[1].textContent,'');assert.equal(full.entered(),0);
  await full.advance(1000);assert.equal(full.entered(),1);

  // Sin movimiento: cada texto aparece entero, con tiempo para leerlo antes de entrar.
  const reduced=harness(true);reduced.context.typeLoginArt();await reduced.advance(500);assert.equal(reduced.lines[0].textContent,'Wake up, Neo...');
  await reduced.advance(900);assert.equal(reduced.lines[0].textContent,'The Matrix has you...');assert.equal(reduced.entered(),0);
  await reduced.advance(900);assert.equal(reduced.lines[2].textContent,final);assert.equal(reduced.entered(),0);await reduced.advance(1600);assert.equal(reduced.entered(),1);

  // Saltar en cualquiera de las fases no deja otra entrada pendiente.
  for(const when of [300,5000,9500]){const skipped=harness();skipped.context.typeLoginArt();await skipped.advance(when);skipped.context.enterOS();await skipped.advance(20000);assert.equal(skipped.entered(),1);}

  // Un error inesperado en la intro no bloquea al visitante: entra al escritorio.
  const failing=harness(false,true);failing.context.typeLoginArt();await failing.advance(12000);assert.equal(failing.entered(),1);
  console.log('PASS: frases Matrix con borrado, rótulo de barras descifrado, lectura sin movimiento, saltar en tres fases y entrada segura si la intro falla.');
})().catch(error=>{console.error(error);process.exitCode=1;});
