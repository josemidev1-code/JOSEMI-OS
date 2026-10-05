const assert=require('node:assert/strict');const {createServer}=require('../tools/local/music-server.cjs');
async function withServer(options,fn){const server=createServer(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await fn(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(r=>server.close(r));}}
(async()=>{
 await withServer({apiKey:''},async base=>{assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/music-server.cjs')).status,404);assert.equal((await fetch(base+'/api/youtube/search?q=test')).status,503);assert.equal((await fetch(base+'/api/youtube/search')).status,400);});
 let calls=0;await withServer({apiKey:'test-key',fetchImpl:async url=>{calls++;assert.equal(url.searchParams.get('videoEmbeddable'),'true');return {ok:true,json:async()=>({items:[{id:{videoId:'aBcDeFgHi12'},snippet:{title:'Song',channelTitle:'Artist'}}]})};}},async base=>{const a=await (await fetch(base+'/api/youtube/search?q=song')).json();assert.equal(a.items[0].id,'aBcDeFgHi12');assert(!JSON.stringify(a).includes('test-key'));await fetch(base+'/api/youtube/search?q=song');assert.equal(calls,1);});
 await withServer({apiKey:'test-key',fetchImpl:async()=>({ok:false})},async base=>assert.equal((await fetch(base+'/api/youtube/search?q=other')).status,502));
 console.log('PASS: configuración, entrada, búsqueda, caché, errores y archivos privados.');
})().catch(e=>{console.error(e);process.exitCode=1;});
