const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../out');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.json':'application/json'};
http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const relative=pathname.replace(/^\/+|\/+$/g,'');
  let file=path.resolve(root,relative||'index.html');
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file+'.html'))file+='.html';
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
  const size=fs.statSync(file).size;
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  let start=0,end=size-1,status=200;
  if(req.headers.range){const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!m){res.writeHead(416).end();return;}start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;if(start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
  headers['Content-Length']=end-start+1;
  res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file,{start,end}).pipe(res);
}).listen(4322,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4322'));
