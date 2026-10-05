const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../script.js'),'utf8');
module.exports=function section(name){const start='/* === BEGIN '+name+' === */',end='/* === END '+name+' === */';const a=source.indexOf(start),b=source.indexOf(end,a);if(a<0||b<0)throw new Error('Sección no encontrada: '+name);return source.slice(a+start.length,b);};
