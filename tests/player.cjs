// Ejecuta el reproductor real con un SDK simulado: no consume cuota ni descarga vídeos.
const assert=require('node:assert/strict'),vm=require('node:vm'),section=require('./source.cjs');
const source=section('music.js');
function setup(){
  const elements=new Map(),listeners={},timers=new Map(),instances=[];let timerId=0;
  const element=()=>({hidden:false,value:'65',dataset:{},textContent:'',setAttribute(){},insertBefore(){},remove(){},classList:{contains:()=>true}});
  const document={hidden:false,body:{append(){}},head:{append(){}},createElement:element,querySelector(s){if(s==='script[data-youtube-sdk]')return null;if(!elements.has(s))elements.set(s,element());return elements.get(s);},addEventListener(name,cb){listeners[name]=cb;}};
  const window={YT:{Player:function(id,options){this.calls=[];this.options=options;for(const method of ['setVolume','pauseVideo','playVideo','stopVideo','destroy','loadVideoById','cueVideoById'])this[method]=arg=>this.calls.push([method,arg]);instances.push(this);}}};
  const context={document,window,YT:window.YT,location:{origin:'http://localhost'},MutationObserver:class{observe(){}},setTimeout(fn){timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);},URL,AbortController,Number,Error};
  vm.createContext(context);vm.runInContext(source.slice(0,source.indexOf('  const icon='))+'window.test={play,pauseMusic,resumeMusic,chat,validMusicItems};})();',context);
  return {context,window,document,elements,listeners,timers,instances,test:window.test};
}
const item={id:'aBcDeFgHi12',title:'Vídeo de prueba'};
(async()=>{
  const a=setup(),pending=a.test.play(item);a.elements.get('#music-volume').value='30';a.test.pauseMusic();a.instances[0].options.events.onReady();await pending;
  assert(a.instances[0].calls.some(([method,n])=>method==='setVolume'&&n===30));
  assert(a.instances[0].calls.some(([method])=>method==='cueVideoById'));
  assert(!a.instances[0].calls.some(([method])=>method==='loadVideoById'));
  a.test.resumeMusic();assert(a.instances[0].calls.some(([method])=>method==='playVideo'));
  a.document.hidden=true;a.listeners.visibilitychange();const calls=a.instances[0].calls.length;
  a.instances[0].options.events.onStateChange({data:1});assert.equal(a.instances[0].calls.length,calls+1);assert.equal(a.instances[0].calls.at(-1)[0],'pauseVideo');
  const b=setup(),closed=b.test.play(item);b.elements.get('#music-stop').onclick();b.instances[0].options.events.onReady();await closed;
  assert(!b.instances[0].calls.some(([method])=>method==='loadVideoById'||method==='cueVideoById'));
  const c=setup(),expired=c.test.play(item);[...c.timers.values()][0]();await expired;assert(c.instances[0].calls.some(([method])=>method==='destroy'));
  const retry=c.test.play(item);c.instances[0].options.events.onReady();c.instances[1].options.events.onReady();await retry;
  assert(c.instances[1].calls.some(([method])=>method==='loadVideoById'));assert(!c.instances[0].calls.some(([method])=>method==='loadVideoById'));
  const d=setup();d.context.fetch=async()=>({ok:true,json:async()=>({reply:'Hola',action:'reply'})});assert.equal((await d.test.chat('hola',[])).reply,'Hola');
  d.context.fetch=async()=>({ok:true,json:async()=>({reply:'Volumen',action:'volume',volume:NaN})});await assert.rejects(d.test.chat('volumen',[]),/volumen inválido/);
  d.context.fetch=async()=>({ok:true,json:async()=>{throw new Error('HTML');}});await assert.rejects(d.test.chat('hola',[]),/respuesta válida/);
  assert.equal(d.test.validMusicItems([item,{id:'bad',title:'X'},null]).length,1);assert.throws(()=>d.test.validMusicItems(null),/lista/);
  console.log('PASS: pausa durante carga, volumen, pestaña oculta, cierre, caducidad/reintento y respuestas del chatbot.');
})().catch(error=>{console.error(error);process.exitCode=1;});
