const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'shell.js'),'utf8'),upgrade=fs.readFileSync(path.join(root,'upgrade.js'),'utf8');
const artSource=upgrade.slice(upgrade.indexOf('const NAME_ART='),upgrade.indexOf('];',upgrade.indexOf('const NAME_ART='))+2);
const engine=source.slice(source.indexOf('function seededNoise('),source.indexOf('let currentBootAnimation='));
const frames=new Map();let id=0;const context={Math,Promise,state:{motion:false},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:n=>frames.delete(n)};vm.createContext(context);vm.runInContext(artSource+engine,context);
const run=s=>vm.runInContext(s,context),art=run('NAME_ART'),tests=[];
for(const effect of ['beams','rain','gather','cinematic','storm','orbit','laser','decrypt']){
  context.effect=effect;assert.equal(run('asciiFrame(NAME_ART,effect,1)'),art.join('\n'));
  for(const p of [0,.13,.5,.82,.99]){context.progress=p;const result=run('asciiFrame(NAME_ART,effect,progress)').split('\n');assert.equal(result.length,art.length);assert(result.every(line=>line.length===Math.max(...art.map(r=>r.length))));}
}tests.push('All eight effects keep the character grid stable and settle to JOSEMI-OS');
const weather=source.slice(source.indexOf('function atmosphereFrame('),source.indexOf('let atmosphereCanvas='));vm.runInContext(weather,context);
for(const kind of ['storm','rain','aurora','terrain','stars','matrix']){
  context.kind=kind;const a=run('atmosphereFrame(kind,80,30,.95,55)'),b=run('atmosphereFrame(kind,80,30,4,55)');
  assert.equal(a.length,30);assert(a.every(row=>row.length===80));assert(a.flat().every(cell=>cell.ch.length===1&&Number.isFinite(cell.light)&&cell.light>=0&&cell.light<=1));assert.notDeepEqual(a,b);
}tests.push('Six ASCII backgrounds animate within a fixed grid and bounded brightness');
const strike=run('atmosphereFrame("storm",80,30,1,55)');assert(strike.some(row=>row.some((cell,x)=>cell.ch==='/'&&row[x+1]?.ch==='/'&&cell.light>.7)));tests.push('Storm produces bright double-slash branching lightning');
const quiet=run('atmosphereFrame("none",80,30,1,55)');assert(quiet.flat().every(c=>c.ch===' '));tests.push('Disabling the background produces an empty canvas');
const wallFrames=new Map(),wallState={motion:false,atmosphere:'storm',weatherSpeed:1,intensity:'full'},wallDocument={hidden:false},flags={desktopHidden:false,shutdownHidden:true,saverHidden:true,game:false};let wallId=0,draws=0;
const wallContext={state:wallState,document:wallDocument,Math,requestAnimationFrame:fn=>{wallFrames.set(++wallId,fn);return wallId;},drawAtmosphere:()=>draws++,$:id=>({hidden:flags.saverHidden,classList:{contains:()=>id==='#desktop'?flags.desktopHidden:flags.shutdownHidden}}),$$:()=>flags.game?[{classList:{contains:()=>false},querySelector:()=>true}]:[]};vm.createContext(wallContext);
vm.runInContext('let atmosphereRAF=0,atmosphereTime=0,atmosphereLast=null,atmosphereDrawn=-Infinity;'+source.slice(source.indexOf('function atmosphereActive('),source.indexOf('function drawAtmosphere('))+source.slice(source.indexOf('function atmosphereTick('),source.indexOf('function syncAtmosphere(')),wallContext);
const wallRun=s=>vm.runInContext(s,wallContext);assert(wallRun('atmosphereActive()'));wallRun('atmosphereTick(0)');assert.equal(wallFrames.size,1);wallFrames.clear();flags.game=true;wallRun('atmosphereTick(1000)');assert.equal(wallFrames.size,0);assert.equal(wallRun('atmosphereTime'),0);flags.game=false;wallRun('atmosphereTick(4000)');assert.equal(wallRun('atmosphereTime'),0);assert.equal(wallFrames.size,1);wallFrames.clear();
for(const mode of ['hidden','motion','saver','desktop','shutdown']){wallDocument.hidden=mode==='hidden';wallState.motion=mode==='motion';flags.saverHidden=mode!=='saver';flags.desktopHidden=mode==='desktop';flags.shutdownHidden=mode!=='shutdown';assert.equal(wallRun('atmosphereActive()'),false);}
tests.push('Background pauses for games, hidden tabs, reduced motion, saver and shutdown; resuming avoids a time jump');
const flush=now=>{const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(now));};
(async()=>{context.el={isConnected:true,textContent:''};const animation=run('animateAscii(el,"rain",{duration:1000})');flush(0);flush(500);assert.notEqual(context.el.textContent,art.join('\n'));flush(1000);assert(await animation.done);assert.equal(context.el.textContent,art.join('\n'));assert.equal(frames.size,0);tests.push('Elapsed time controls duration and completed animations release the frame loop');
  const cancelled=run('animateAscii(el,"gather")');cancelled.cancel();assert.equal(await cancelled.done,false);assert.equal(frames.size,0);tests.push('Cancellation releases frames and resolves the waiting boot');
  const detached=run('animateAscii(el,"beams")');context.el.isConnected=false;flush(0);assert.equal(await detached.done,false);context.el.isConnected=true;tests.push('Detached windows stop their animation');
  context.state.motion=true;const reduced=run('animateAscii(el,"gather")');flush(0);assert(await reduced.done);assert.equal(context.el.textContent,art.join('\n'));assert.equal(frames.size,0);tests.push('Reduced motion draws the final name immediately');
  for(const file of ['style.css','shell.css']){const css=fs.readFileSync(path.join(root,file),'utf8');assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);}tests.push('Both stylesheets have balanced rules');
  console.log(JSON.stringify({result:'PASS',tests},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
