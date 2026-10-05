// Servidor local Node 12+: sirve la web y guarda la clave de YouTube fuera del navegador.
const http=require('http'),https=require('https'),fs=require('fs').promises,path=require('path');
const root=path.resolve(__dirname,'../..'),cache=new Map(),rates=new Map();
const publicFiles=new Set(['index.html','assets/favicon.svg','style.css','script.js']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
// HTTPS nativo: Node 12 no incluye fetch ni AbortSignal.timeout.
function youtubeFetch(url){return new Promise((resolve,reject)=>{
 const request=https.get(url,response=>{let text='',bytes=0;response.setEncoding('utf8');response.on('data',chunk=>{bytes+=Buffer.byteLength(chunk);if(bytes>1000000){request.destroy();reject(new Error('Respuesta demasiado grande.'));return;}text+=chunk;});response.on('error',reject);response.on('end',()=>resolve({ok:response.statusCode>=200&&response.statusCode<300,json:()=>Promise.resolve(JSON.parse(text))}));});
 request.setTimeout(10000,()=>request.destroy(new Error('Tiempo agotado.')));request.on('error',reject);
});}
function createServer({apiKey=process.env.YOUTUBE_API_KEY,fetchImpl=youtubeFetch}={}){
 return http.createServer(async(req,res)=>{
  const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  let url;try{url=new URL(req.url,'http://localhost');}catch{return json(400,{error:'URL inválida.'});}
  if(req.method!=='GET')return json(405,{error:'Método no permitido.'});
  if(url.pathname==='/api/youtube/search'){
   const q=(url.searchParams.get('q')||'').trim();if(!q||q.length>160)return json(400,{error:'Escribe un título y artista de hasta 160 caracteres.'});
   if(!apiKey)return json(503,{error:'Falta configurar YOUTUBE_API_KEY en el servidor. Mientras tanto, pega un enlace de YouTube.'});
   const existing=cache.get(q.toLowerCase());if(existing&&existing.until>Date.now())return json(200,{items:existing.items});
   const ip=req.socket.remoteAddress,now=Date.now(),rate=rates.get(ip);if(!rate||rate.until<now)rates.set(ip,{count:1,until:now+60000});else if(++rate.count>6)return json(429,{error:'Demasiadas búsquedas. Espera un minuto.'});
   // Una cuota global limita también llamadas desde distintas direcciones.
   const global=rates.get('global');if(!global||global.until<now)rates.set('global',{count:1,until:now+3600000});else if(++global.count>30)return json(429,{error:'Se ha alcanzado el límite horario de búsquedas. Puedes usar un enlace de YouTube.'});
   const upstream=new URL('https://www.googleapis.com/youtube/v3/search');Object.entries({part:'snippet',type:'video',videoEmbeddable:'true',maxResults:'3',q,key:apiKey}).forEach(([k,v])=>upstream.searchParams.set(k,v));
   try{const response=await fetchImpl(upstream,{});if(!response.ok)return json(502,{error:'YouTube no ha aceptado la búsqueda. Comprueba la clave, la API habilitada y su cuota.'});const data=await response.json();const items=(data.items||[]).filter(x=>/^[\w-]{11}$/.test((x.id&&x.id.videoId)||'')).map(x=>({id:x.id.videoId,title:x.snippet.title,channel:x.snippet.channelTitle}));if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(q.toLowerCase(),{items,until:now+600000});return json(200,{items});}catch{return json(502,{error:'No se ha podido conectar con YouTube. Prueba otra vez.'});}
  }
  const file=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!publicFiles.has(file))return json(404,{error:'No encontrado.'});
  try{const data=await fs.readFile(path.join(root,file));res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(data);}catch{return json(404,{error:'Archivo no encontrado.'});}
 });
}
if(require.main===module){const port=Number(process.env.PORT)||3000;createServer().listen(port,'127.0.0.1',()=>console.log(`JOSEMI-OS: http://localhost:${port}`));}
module.exports={createServer};
