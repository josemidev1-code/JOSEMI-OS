import assert from 'node:assert/strict';import {handle} from '../cloudflare/worker.mjs';
const env={ALLOWED_ORIGIN:'https://josemidev1-code.github.io',GEMINI_API_KEY:'secret-g',YOUTUBE_API_KEY:'secret-y'};
let n=0;function req(message,origin=env.ALLOWED_ORIGIN){return new Request('https://example.workers.dev/api/chat',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':String(++n)},body:JSON.stringify({message})});}
assert.equal((await handle(req('hola','https://other.test'),env)).status,403);
const missing=await handle(req('hola'),{ALLOWED_ORIGIN:env.ALLOWED_ORIGIN});assert.equal(missing.status,503);
const preflight=await handle(new Request('https://example.workers.dev/api/chat',{method:'OPTIONS',headers:{Origin:env.ALLOWED_ORIGIN}}),env);assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),env.ALLOWED_ORIGIN);
let calls=0;const fake=async(url,options)=>{calls++;if(String(url).includes('generativelanguage')){assert.equal(options.headers['x-goog-api-key'],'secret-g');return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({reply:'Busco tu canción.',action:'music',query:'test song',volume:65,app:''})}]}}]});}assert.equal(new URL(url).searchParams.get('videoEmbeddable'),'true');return Response.json({items:[{id:{videoId:'aBcDeFgHi12'},snippet:{title:'Song',channelTitle:'Artist'}}]});};
const response=await handle(req('Pon test song'),env,fake),data=await response.json();assert.equal(response.status,200);assert.equal(data.items[0].id,'aBcDeFgHi12');assert.equal(calls,2);assert(!JSON.stringify(data).includes('secret-'));
const unsafe=async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({reply:'Open',action:'open',app:'arbitrary-script'})}]}}]});assert.equal((await handle(req('abre'),env,unsafe)).status,502);
assert.equal((await handle(req('x'.repeat(161)),env,fake)).status,400);
assert.equal((await handle(req('hola'),env,async()=>new Response('',{status:429}))).status,502);
const nullBody=new Request('https://example.workers.dev/api/chat',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json','CF-Connecting-IP':String(++n)},body:'null'});
assert.equal((await handle(nullBody,env,fake)).status,400);
const badVolume=async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({reply:'Volumen',action:'volume',volume:'no-es-un-numero'})}]}}]});
assert.equal((await handle(req('volumen'),env,badVolume)).status,502);
console.log('PASS: origen, preflight, secretos ausentes, IA → búsqueda, acciones permitidas, entrada y errores.');
