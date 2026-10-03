// Utilitários de teste: Postgres temporário + loja de fotos em memória + servidor local que imita o Netlify.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NetlifyDB } from '@netlify/database-dev';
import { getDatabase } from '@netlify/database';
import * as core from '../netlify/lib/core.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function bancoTemporario() {
  const ndb = new NetlifyDB();
  const cs = await ndb.start();
  await ndb.applyMigrations(path.join(RAIZ, 'netlify/database/migrations'));
  const db = getDatabase({ connectionString: cs });
  return { db, parar: async () => { try { await db.pool.end?.(); } catch {} await ndb.stop(); } };
}
export function lojaEmMemoria() {
  const m = new Map();
  return {
    m,
    async set(k, v) { m.set(k, Buffer.from(v)); },
    async get(k) { const v = m.get(k); return v ? v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) : null; },
    async delete(k) { m.delete(k); },
  };
}
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
export function servidorLocal(deps, porta = 0) {
  const srv = http.createServer(async (rq, rs) => {
    const chunks = []; for await (const c of rq) chunks.push(c);
    const url = new URL(rq.url, `http://${rq.headers.host}`);
    const req = new Request(url, { method: rq.method, headers: rq.headers, body: ['GET', 'HEAD'].includes(rq.method) ? undefined : Buffer.concat(chunks) });
    let r;
    if (url.pathname === '/api/products.js') r = await core.produtosJs(deps);
    else if (url.pathname === '/admin' || url.pathname === '/admin/') r = await core.paginaAdmin(req, deps);
    else if (url.pathname.startsWith('/admin/api/')) r = await core.apiAdmin(req, { ...deps, ip: '127.0.0.1' });
    else if (url.pathname.startsWith('/uploads/')) r = await core.servirFoto(req, deps);
    else {
      let f = path.join(RAIZ, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
      if (!f.startsWith(path.join(RAIZ, 'public')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end('404'); }
      rs.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); return rs.end(fs.readFileSync(f));
    }
    const h = {}; r.headers.forEach((v, k) => { h[k] = v; });
    const sc = r.headers.getSetCookie?.(); if (sc?.length) h['set-cookie'] = sc;
    rs.writeHead(r.status, h); rs.end(Buffer.from(await r.arrayBuffer()));
  });
  return new Promise(ok => srv.listen(porta, '127.0.0.1', () => ok(srv)));
}
