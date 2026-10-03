const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'shell.js'),'utf8'),upgrade=fs.readFileSync(path.join(root,'upgrade.js'),'utf8');
const artSource=upgrade.slice(upgrade.indexOf('const NAME_ART='),upgrade.indexOf('];',upgrade.indexOf('const NAME_ART='))+2);
const engine=source.slice(source.indexOf('function seededNoise('),source.indexOf('let currentBootAnimation='));
const frames=new Map();let id=0;const context={Math,Promise,state:{motion:false},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:n=>frames.delete(n)};vm.createContext(context);vm.runInContext(artSource+engine,context);
const run=s=>vm.runInContext(s,context),art=run('NAME_ART'),tests=[];
for(const effect of ['beams','rain','gather']){
  context.effect=effect;assert.equal(run('asciiFrame(NAME_ART,effect,1)'),art.join('\n'));
  for(const p of [0,.13,.5,.82,.99]){context.progress=p;const result=run('asciiFrame(NAME_ART,effect,progress)').split('\n');assert.equal(result.length,art.length);assert(result.every(line=>line.length===Math.max(...art.map(r=>r.length))));}
}tests.push('All three effects keep the character grid stable and settle to the exact name');
const flush=now=>{const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(now));};
(async()=>{context.el={isConnected:true,textContent:''};const animation=run('animateAscii(el,"rain",{duration:1000})');flush(0);flush(500);assert.notEqual(context.el.textContent,art.join('\n'));flush(1000);assert(await animation.done);assert.equal(context.el.textContent,art.join('\n'));assert.equal(frames.size,0);tests.push('Elapsed time controls duration and completed animations release the frame loop');
  const cancelled=run('animateAscii(el,"gather")');cancelled.cancel();assert.equal(await cancelled.done,false);assert.equal(frames.size,0);tests.push('Cancellation releases frames and resolves the waiting boot');
  const detached=run('animateAscii(el,"beams")');context.el.isConnected=false;flush(0);assert.equal(await detached.done,false);context.el.isConnected=true;tests.push('Detached windows stop their animation');
  context.state.motion=true;const reduced=run('animateAscii(el,"gather")');flush(0);assert(await reduced.done);assert.equal(context.el.textContent,art.join('\n'));assert.equal(frames.size,0);tests.push('Reduced motion draws the final name immediately');
  for(const file of ['style.css','shell.css']){const css=fs.readFileSync(path.join(root,file),'utf8');assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);}tests.push('Both stylesheets have balanced rules');
  console.log(JSON.stringify({result:'PASS',tests},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
