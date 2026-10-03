// Teste de ponta a ponta do backend com um Postgres temporário. Rode: npm test
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bancoTemporario, lojaEmMemoria, servidorLocal } from './helpers.mjs';
import seed from '../netlify/lib/seed-data.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { db, parar } = await bancoTemporario();
const store = lojaEmMemoria();
const env = { ADMIN_EMAIL: 'dono@teste.com', ADMIN_PASSWORD: 'senha-bem-forte-123' };
const srv = await servidorLocal({ db, store, env });
const base = `http://127.0.0.1:${srv.address().port}`;
const ok = m => console.log('  ✓', m);
const pegaSite = async () => { const t = await (await fetch(base + '/api/products.js')).text(); const w = {}; new Function('window', t)(w); return w.__AF__; };
const loginReq = (email, senha) => fetch(base + '/admin/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });

try {
  // importação dos produtos existentes
  let site = await pegaSite();
  assert.strictEqual(site.products.length, 32); assert.strictEqual(site.best.length, 8);
  assert.deepStrictEqual(site.products, seed.products.map(p => ({ ...p })), 'site deve ser idêntico ao PRODUCTS original');
  assert.deepStrictEqual(site.best, seed.best);
  ok('banco entrega exatamente os 32 produtos originais (nome, desc, imagem, rótulos, preços, jabuticaba com 2 fotos)');

  // proteção
  for (const [m, u] of [['GET', '/admin/api/produtos'], ['GET', '/admin/api/sessao'], ['PUT', '/admin/api/produtos/caju'], ['DELETE', '/admin/api/produtos/caju'], ['POST', '/admin/api/logout']]) {
    assert.strictEqual((await fetch(base + u, { method: m })).status, 401, u);
  }
  assert((await (await fetch(base + '/admin')).text()).includes('id="f"'));
  ok('ações admin negadas sem login (401); /admin mostra só o login');

  // login
  assert.strictEqual((await loginReq('dono@teste.com', 'errada')).status, 401);
  assert.strictEqual((await loginReq('outro@teste.com', 'senha-bem-forte-123')).status, 401);
  let r = await loginReq('DONO@teste.com', 'senha-bem-forte-123'); assert.strictEqual(r.status, 200);
  const cookie = r.headers.get('set-cookie'); assert(/HttpOnly/.test(cookie) && /SameSite=Strict/.test(cookie));
  const { csrf } = await r.json(); const C = cookie.split(';')[0]; const H = { Cookie: C, 'X-CSRF-Token': csrf };
  assert((await (await fetch(base + '/admin', { headers: { Cookie: C } })).text()).includes('id="lista"'));
  ok('login: senha/e-mail errados falham; certo cria cookie HttpOnly+SameSite=Strict e /admin entrega o painel');
  const semConfig = await (await import('../netlify/lib/core.mjs')).apiAdmin(new Request(base + '/admin/api/login', { method: 'POST', body: '{"email":"a","senha":"b"}' }), { db, store, env: {}, ip: '1' });
  assert.strictEqual(semConfig.status, 503);
  ok('sem ADMIN_EMAIL/ADMIN_PASSWORD configurados ninguém entra (503)');

  // CSRF + origem
  const fd0 = () => { const f = new FormData(); f.append('nome', 'Caju Fresco'); f.append('descricao', 'a'); return f; };
  assert.strictEqual((await fetch(base + '/admin/api/produtos/caju', { method: 'PUT', headers: { Cookie: C }, body: fd0() })).status, 403);
  assert.strictEqual((await fetch(base + '/admin/api/produtos', { headers: { Cookie: C, Origin: 'https://malvado.com' } })).status, 403);
  ok('alteração sem CSRF (403) e requisição de outra origem (403) são recusadas');

  // alterar
  const lista = await (await fetch(base + '/admin/api/produtos', { headers: { Cookie: C } })).json();
  const get = id => lista.find(p => p.id === id);
  const put = (id, p, c = {}, arqs = []) => {
    const f = new FormData();
    f.append('nome', c.nome ?? p.nome); f.append('descricao', c.descricao ?? p.descricao);
    f.append('precos', JSON.stringify(c.precos ?? Object.fromEntries(p.opcoes.map(o => [o.id, String(o.preco_centavos / 100)]))));
    for (const [n, buf] of arqs) f.append(n, new Blob([buf]), 'x.bin');
    return fetch(base + '/admin/api/produtos/' + id, { method: 'PUT', headers: H, body: f });
  };
  const maca = get('maca'); assert.strictEqual(maca.opcoes[0].preco_centavos, 1699);
  r = await put('maca', maca, { precos: { [maca.opcoes[0].id]: '17,00' } }); assert.strictEqual(r.status, 200);
  site = await pegaSite(); const m2 = site.products.find(p => p.id === 'maca');
  assert.strictEqual(m2.op[0].p, 17); assert.strictEqual(m2.op[0].l, '1kg');
  ok('Maçã Gala R$ 16,99 → R$ 17,00 aparece no site; rótulo "1kg" preservado');
  for (const bad of ['0', '-3', 'abc', '10000', '1,234', '']) assert.strictEqual((await put('maca', maca, { precos: { [maca.opcoes[0].id]: bad } })).status, 400, bad);
  assert.strictEqual((await put('maca', maca, { precos: { [maca.opcoes[0].id]: '5', 999: '5' } })).status, 400);
  assert.strictEqual((await put('maca', maca, { nome: '' })).status, 400);
  assert.strictEqual((await put('maca', maca, { descricao: Array(9).fill('x').join('\n') })).status, 400);
  ok('preços/nomes/detalhes inválidos e opções inventadas são recusados');
  r = await put('maca', maca, { nome: 'Maçã <img src=x onerror=1> & Cia', precos: { [maca.opcoes[0].id]: '17' } }); assert.strictEqual(r.status, 200);
  assert(!(await (await fetch(base + '/api/products.js')).text()).includes('<img'));
  const ab = get('abacaxi');
  await put('abacaxi', ab, { precos: { [ab.opcoes[0].id]: '13', [ab.opcoes[1].id]: '15,50' } });
  assert.deepStrictEqual((await pegaSite()).products.find(p => p.id === 'abacaxi').op.map(o => [o.l, o.p]), [['1 unidade', 13], ['Fatiado', 15.5]]);
  ok('preço do Fatiado editado; texto com HTML não consegue fechar a tag <script>');

  // imagens
  const jpg = fs.readFileSync(path.join(RAIZ, 'public/imagens/caju.jpg'));
  const caju = get('caju');
  assert.strictEqual((await put('caju', caju, {}, [['imagem', Buffer.from('<?php echo 1; ?> texto')]])).status, 400);
  assert.strictEqual((await put('caju', caju, {}, [['imagem', Buffer.concat([Buffer.from('<svg onload=1>'), jpg])]])).status, 400);
  assert.strictEqual(store.m.size, 0);
  ok('arquivo que não é JPG/PNG/WEBP é recusado e nada é guardado');
  r = await put('caju', caju, {}, [['imagem', jpg]]); assert.strictEqual(r.status, 200);
  const novo = (await r.json()).produto.imagem; assert(/^uploads\/[0-9a-f]{24}\.jpg$/.test(novo));
  const fr = await fetch(base + '/' + novo); assert.strictEqual(fr.status, 200); assert.strictEqual(fr.headers.get('content-type'), 'image/jpeg');
  assert.strictEqual(Buffer.from(await fr.arrayBuffer()).length, jpg.length);
  assert.strictEqual((await fetch(base + '/uploads/..%2Fx.jpg')).status, 404);
  assert.strictEqual((await fetch(base + '/uploads/aaaaaaaaaaaaaaaaaaaaaaaa.jpg')).status, 404);
  assert(fs.existsSync(path.join(RAIZ, 'public/imagens/caju.jpg')));
  ok('nova foto guardada e servida em /uploads; foto original do site continua em imagens/');
  await put('caju', { ...caju, imagem: novo }, {}, [['imagem', jpg]]);
  assert.strictEqual(store.m.size, 1);
  ok('ao trocar de novo, a foto enviada anterior é removida (sem lixo)');
  const jab = get('jabuticaba');
  assert.strictEqual((await put('jabuticaba', jab, {}, [[`imagem_opcao_${jab.opcoes[1].id}`, jpg]])).status, 200);
  assert.strictEqual((await put('caju', caju, {}, [[`imagem_opcao_${caju.opcoes[0].id}`, jpg]])).status, 400);
  ok('foto da opção só pode ser trocada onde a opção já tem foto (Jabuticaba 1kg)');
  // falha no banco: foto nova não pode ficar órfã e a antiga não pode sumir
  const antes = store.m.size;
  const core = await import('../netlify/lib/core.mjs');
  const f = new FormData(); f.append('nome', 'X Y'); f.append('descricao', 'a'); f.append('precos', JSON.stringify(Object.fromEntries(caju.opcoes.map(o => [o.id, '9'])))); f.append('imagem', new Blob([jpg]), 'a.jpg');
  const rq = new Request(base + '/admin/api/produtos/caju', { method: 'PUT', headers: H, body: f });
  const dbf = { sql: (s, ...v) => (s.join('?').includes('WITH p AS') ? Promise.reject(new Error('boom')) : db.sql(s, ...v)) };
  const rr = await core.apiAdmin(rq, { db: dbf, store, env, ip: '1' });
  assert.strictEqual(rr.status, 500); assert.strictEqual(store.m.size, antes);
  ok('se o banco falhar ao salvar, a foto nova é descartada e nada muda');

  // não existe criação
  for (const m of ['POST', 'PUT']) assert.strictEqual((await fetch(base + '/admin/api/produtos', { method: m, headers: H })).status, 404);
  assert.strictEqual((await put('novo_produto', caju)).status, 404);
  ok('não há como criar produto novo (POST/PUT em /produtos → 404)');

  // excluir
  const n0 = store.m.size;
  assert.strictEqual((await fetch(base + '/admin/api/produtos/caju', { method: 'DELETE', headers: { Cookie: C } })).status, 403);
  assert.strictEqual((await fetch(base + '/admin/api/produtos/caju', { method: 'DELETE', headers: H })).status, 200);
  assert.strictEqual((await pegaSite()).products.length, 31);
  assert.strictEqual((await db.sql`SELECT COUNT(*)::int c FROM opcoes WHERE produto_id='caju'`)[0].c, 0);
  assert.strictEqual(store.m.size, n0 - 1);
  assert.strictEqual((await fetch(base + '/admin/api/produtos/caju', { method: 'DELETE', headers: H })).status, 404);
  ok('excluir remove produto + opções + foto enviada; some do site; exige CSRF');
  await fetch(base + '/admin/api/produtos/uva_gota_mel', { method: 'DELETE', headers: H });
  assert.strictEqual((await pegaSite()).best.length, 7);
  ok('excluir produto de "Mais Vendidos" tira da lista sem erro');

  // logout / sessão
  assert.strictEqual((await fetch(base + '/admin/api/logout', { method: 'POST', headers: H })).status, 200);
  assert.strictEqual((await fetch(base + '/admin/api/produtos', { headers: { Cookie: C } })).status, 401);
  ok('logout invalida a sessão no servidor');
  await db.sql`INSERT INTO sessoes VALUES (${'a'.repeat(64)}, 'x', 'c', now() - interval '1 minute')`;
  assert.strictEqual((await fetch(base + '/admin/api/produtos', { headers: { Cookie: 'af_admin=' + 'a'.repeat(64) } })).status, 401);
  ok('sessão expirada não vale');

  // limite de tentativas
  let ult; for (let i = 0; i < 6; i++) ult = await loginReq('x@y.com', 'a' + i);
  assert.strictEqual(ult.status, 429);
  ok('após 5 tentativas erradas o login é bloqueado (429)');

  console.log('\nTODOS OS TESTES PASSARAM');
} catch (e) { console.error('\nFALHOU:', e); process.exitCode = 1; }
finally { srv.close(); await parar(); }
