import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, 'data');
const dataFile = path.join(dataDir, 'tracks.json');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8' };
const limit = 1024 * 1024;
async function getData() { try { const parsed = JSON.parse(await readFile(dataFile,'utf8')); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function respond(res, status, value, type='application/json; charset=utf-8') { res.writeHead(status, {'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}); res.end(type.startsWith('application/json') ? JSON.stringify(value) : value); }
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/tracks' && req.method === 'GET') return respond(res,200,await getData());
  if (url.pathname === '/api/tracks' && req.method === 'PUT') {
    let body='';
    try {
      for await (const chunk of req) { body += chunk; if (body.length > limit) return respond(res,413,{error:'Payload too large'}); }
      const data=JSON.parse(body);
      if (!Array.isArray(data) || data.length > 1000) return respond(res,400,{error:'Expected an array with at most 1000 tracks'});
      const valid=data.every(item => item && typeof item.id==='string' && typeof item.title==='string' && typeof item.game==='string' && /^https?:\/\//i.test(item.sourceUrl) && (!item.audioUrl || /^https?:\/\//i.test(item.audioUrl)));
      if (!valid) return respond(res,400,{error:'Invalid track data or URL'});
      await mkdir(dataDir,{recursive:true}); await writeFile(dataFile,JSON.stringify(data,null,2),'utf8'); return respond(res,200,{ok:true});
    } catch { return respond(res,400,{error:'Invalid JSON'}); }
  }
  if (url.pathname.startsWith('/api/')) return respond(res,404,{error:'Not found'});
  if (req.method !== 'GET' && req.method !== 'HEAD') return respond(res,405,{error:'Method not allowed'});
  let requested=decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const target=path.resolve(root,`.${requested}`);
  if (!target.startsWith(root + path.sep) || !existsSync(target)) return respond(res,404,'Not found','text/plain; charset=utf-8');
  try { const body=await readFile(target); res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}); res.end(req.method==='HEAD'?undefined:body); }
  catch { respond(res,404,'Not found','text/plain; charset=utf-8'); }
});
server.listen(3000,'127.0.0.1',()=>console.log('Save Point disponível em http://127.0.0.1:3000 (somente acesso local).'));
