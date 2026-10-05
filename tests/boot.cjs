// Prueba la secuencia REAL de arranque con un reloj controlado: no espera segundos reales.
const assert=require('node:assert/strict'),vm=require('node:vm'),section=require('./source.cjs');
const core=section('script.js'),shell=section('shell.js');
function harness(motion=false){
  let now=0,id=0,entered=0;const frames=new Map(),timers=[],lines=[];
  const output={innerHTML:'',textContent:'',isConnected:true},command={textContent:''};
  const login={classList:{remove(){},add(){}},dataset:{}};
  const context={Math,Promise,state:{motion,intensity:'full',bootEffect:'cinematic'},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
    bootDelay:ms=>new Promise(resolve=>timers.push({at:now+ms,resolve})),
    $:selector=>selector==='#login'?login:selector==='#bootCommand'?command:output,
    appendBoot:(text='',cls='')=>{const line={textContent:text,isConnected:true,cls};lines.push(line);return line;},
    // El motor ASCII tiene su propia batería shell.cjs. Aquí controlamos su duración
    // para verificar que entrar espera su final y que Saltar invalida la continuación.
    animateAscii:(el,effect,{duration,signal})=>{let finish;const done=new Promise(r=>finish=r);timers.push({at:now+(motion?0:duration),resolve:()=>finish(!signal())});return{done,cancel:()=>finish(false)};},
    enterOS:()=>{entered++;context.enteringOS=true;context.bootRun++;},bootRun:0,enteringOS:false};
  vm.createContext(context);
  vm.runInContext(core.slice(core.indexOf('async function typeBootText('),core.indexOf('async function typeBootLine(')),context);
  vm.runInContext('let currentBootAnimation=null;'+shell.slice(shell.indexOf('typeLoginArt=async function('),shell.indexOf('// AJUSTES:',shell.indexOf('typeLoginArt=async function('))),context);
  async function advance(ms,quantum=50){const end=now+ms;while(now<end){now=Math.min(end,now+quantum);const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=now){const [timer]=timers.splice(i,1);timer.resolve();}for(let i=0;i<6;i++)await Promise.resolve();}}
  return{context,lines,login,command,advance,entered:()=>entered};
}
(async()=>{
  const full=harness();full.context.typeLoginArt();await full.advance(500);assert.equal(full.login.dataset.phase,'matrix');assert(full.lines[0].textContent.startsWith('Wake'));
  await full.advance(6200);assert.equal(full.login.dataset.phase,'signature');assert.equal(full.entered(),0);
  await full.advance(6200);assert.equal(full.entered(),1);assert.equal(full.command.textContent,'Tu universo está listo.');
  const reduced=harness(true);reduced.context.typeLoginArt();await reduced.advance(500);assert.equal(reduced.lines[0].textContent,'Wake up, Neo');assert.equal(reduced.entered(),0);
  await reduced.advance(500);assert.equal(reduced.lines[0].textContent,'The Matrix has you');assert.equal(reduced.entered(),0);
  await reduced.advance(850);assert.equal(reduced.login.dataset.phase,'signature');assert.equal(reduced.entered(),0);await reduced.advance(1500);assert.equal(reduced.entered(),1);
  for(const when of [300,6800]){const skipped=harness();skipped.context.typeLoginArt();await skipped.advance(when);skipped.context.enterOS();await skipped.advance(20000);assert.equal(skipped.entered(),1);}
  const slow=harness();const el={textContent:'',isConnected:true};const typing=slow.context.typeBootText(el,'1234567890',80,0);await slow.advance(1000,500);assert.equal(el.textContent,'1234567');await slow.advance(500,500);assert(await typing);assert.equal(el.textContent,'1234567890');
  console.log('PASS: secuencia completa, lectura sin movimiento, saltar en ambas fases y máquina de escribir con fotogramas lentos.');
})().catch(error=>{console.error(error);process.exitCode=1;});
