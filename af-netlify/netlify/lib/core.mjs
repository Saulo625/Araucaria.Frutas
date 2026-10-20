// Toda a lógica do painel/site. As funções em netlify/functions/ são só "casquinhas" em volta daqui,
// e os testes (test/test.mjs) chamam estas mesmas funções com um Postgres temporário.
import crypto from 'node:crypto';
import { loginHtml, painelHtml } from './views.mjs';

const SESSAO_MS = 8 * 60 * 60 * 1000;
const COOKIE = 'af_admin';
const MAX_BODY = 4.5 * 1024 * 1024; // Netlify Functions aceita ~6 MB por requisição

const CSP_ADMIN = "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";
const BASE_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
};
const resp = (body, init = {}, extra = {}) =>
  new Response(body, { ...init, headers: { ...BASE_HEADERS, ...extra, ...(init.headers || {}) } });
const json = (obj, status = 200, extra = {}) =>
  resp(JSON.stringify(obj), { status }, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
const erro = (msg, status = 400) => json({ erro: msg }, status);

const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const aleatorio = n => crypto.randomBytes(n).toString('hex');

/* ====================== Leitura de produtos ====================== */
export async function todosProdutos(db) {
  const prods = await db.sql`SELECT * FROM produtos ORDER BY ordem`;
  const ops = await db.sql`SELECT * FROM opcoes ORDER BY produto_id, ordem`;
  const por = new Map();
  for (const o of ops) { if (!por.has(o.produto_id)) por.set(o.produto_id, []); por.get(o.produto_id).push(o); }
  return prods.map(p => ({ ...p, opcoes: por.get(p.id) || [] }));
}
const umProduto = async (db, id) => (await todosProdutos(db)).find(p => p.id === id) || null;

export function formatoSite(lista) {
  const products = lista.map(p => {
    const o = {
      id: p.id, nome: p.nome, img: p.imagem,
      desc: p.descricao.split('\n').map(s => s.trim()).filter(Boolean),
      op: p.opcoes.map(x => { const r = { l: x.rotulo, p: x.preco_centavos / 100 }; if (x.imagem) r.img = x.imagem; return r; }),
    };
    if (p.nome_destaque) o.best = p.nome_destaque;
    return o;
  });
  const best = lista.filter(p => p.destaque_ordem != null).sort((a, b) => a.destaque_ordem - b.destaque_ordem).map(p => p.id);
  return { products, best };
}

/* ====================== Site público ====================== */
export async function produtosJs({ db }) {
  let corpo;
  try {
    const j = JSON.stringify(formatoSite(await todosProdutos(db))).replace(/</g, '\\u003c'); // nunca fecha a tag <script>
    corpo = `window.__AF__=${j};`;
  } catch (e) {
    console.error('produtos.js', e);
    return resp('window.__AF__=null;', { status: 503 }, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
  }
  return resp(corpo, {}, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
}

const TIPOS = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
export async function servirFoto(req, { store }) {
  const nome = decodeURIComponent(new URL(req.url).pathname.replace(/^\/uploads\//, ''));
  const m = /^[0-9a-f]{24}\.(jpg|png|webp)$/.exec(nome);
  if (!m) return resp('Não encontrado', { status: 404 });
  const dados = await store.get(nome, { type: 'arrayBuffer' });
  if (!dados) return resp('Não encontrado', { status: 404 });
  return resp(dados, {}, { 'Content-Type': TIPOS[m[1]], 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Security-Policy': "default-src 'none'" });
}

/* ====================== Sessão / login ====================== */
const lerCookie = req => {
  const m = (req.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
  return m ? m.slice(COOKIE.length + 1) : null;
};
async function sessaoDe(req, db) {
  const t = lerCookie(req);
  if (!t || !/^[0-9a-f]{64}$/.test(t)) return null;
  const [s] = await db.sql`SELECT email, csrf FROM sessoes WHERE token_hash = ${sha(t)} AND expira_em > now()`;
  return s || null;
}
function cookieHeader(req, token, maxAgeMs) {
  const p = [`${COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${Math.floor(maxAgeMs / 1000)}`];
  if (new URL(req.url).protocol === 'https:') p.push('Secure');
  return p.join('; ');
}
const iguais = (a, b) => crypto.timingSafeEqual(Buffer.from(sha(String(a)), 'hex'), Buffer.from(sha(String(b)), 'hex'));

const MAX_TENT = 5, MAX_TENT_EMAIL = 30;
async function tentativas(db, chave) {
  const [r] = await db.sql`SELECT n FROM login_falhas WHERE chave = ${chave} AND ate > now()`;
  return r ? r.n : 0;
}
const registraFalha = (db, chave) => db.sql`
  INSERT INTO login_falhas (chave, n, ate) VALUES (${chave}, 1, now() + interval '15 minutes')
  ON CONFLICT (chave) DO UPDATE SET
    n   = CASE WHEN login_falhas.ate > now() THEN login_falhas.n + 1 ELSE 1 END,
    ate = CASE WHEN login_falhas.ate > now() THEN login_falhas.ate ELSE now() + interval '15 minutes' END`;

async function login(req, { db, env, ip }) {
  let body; try { body = await req.json(); } catch { return erro('Requisição inválida.'); }
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 200);
  const senha = String(body?.senha || '').slice(0, 200);
  const adminEmail = String(env.ADMIN_EMAIL || '').trim().toLowerCase(), adminSenha = String(env.ADMIN_PASSWORD || '');
  if (!adminEmail || adminSenha.length < 10) return erro('Acesso administrativo ainda não configurado no Netlify (ADMIN_EMAIL / ADMIN_PASSWORD).', 503);
  const kIp = 'ip:' + sha(`${ip}|${email}`).slice(0, 32), kEm = 'em:' + sha(email).slice(0, 32);
  if ((await tentativas(db, kIp)) >= MAX_TENT || (await tentativas(db, kEm)) >= MAX_TENT_EMAIL)
    return erro('Muitas tentativas. Aguarde 15 minutos e tente novamente.', 429);
  const okEmail = iguais(email, adminEmail), okSenha = iguais(senha, adminSenha); // sem curto-circuito
  if (!(okEmail && okSenha)) { await registraFalha(db, kIp); await registraFalha(db, kEm); return erro('E-mail ou senha incorretos.', 401); }
  await db.sql`DELETE FROM login_falhas WHERE chave = ${kIp}`;
  await db.sql`DELETE FROM sessoes WHERE expira_em < now()`;
  const token = aleatorio(32), csrf = aleatorio(24);
  await db.sql`INSERT INTO sessoes (token_hash, email, csrf, expira_em) VALUES (${sha(token)}, ${adminEmail}, ${csrf}, now() + interval '8 hours')`;
  return json({ ok: true, csrf }, 200, { 'Set-Cookie': cookieHeader(req, token, SESSAO_MS) });
}

/* ====================== Página /admin ====================== */
export async function paginaAdmin(req, { db }) {
  const logado = await sessaoDe(req, db).catch(() => null);
  return resp(logado ? painelHtml : loginHtml, {}, {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': CSP_ADMIN,
  });
}

/* ====================== Imagens ====================== */
function extensao(b) {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 12 && Buffer.from(b.subarray(0, 8)).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 12 && Buffer.from(b.subarray(0, 4)).toString() === 'RIFF' && Buffer.from(b.subarray(8, 12)).toString() === 'WEBP') return 'webp';
  return null;
}
function precoParaCentavos(v) {
  const s = String(v ?? '').trim().replace(/^R\$\s*/i, '').replace(',', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(s)) return null;
  const c = Math.round(parseFloat(s) * 100);
  return c >= 1 && c <= 999999 ? c : null;
}
const nomeBlob = rel => (typeof rel === 'string' && /^uploads\/[0-9a-f]{24}\.(jpg|png|webp)$/.test(rel)) ? rel.slice(8) : null;
const apagaFotos = (store, rels) => Promise.all(rels.map(nomeBlob).filter(Boolean).map(n => store.delete(n).catch(e => console.error('apagar foto', e))));

/* ====================== API do painel ====================== */
async function alterar(req, id, { db, store }) {
  const prod = /^[a-z0-9_]{1,60}$/.test(id) ? await umProduto(db, id) : null;
  if (!prod) return erro('Produto não encontrado.', 404);
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return erro('A imagem é muito grande. Use uma foto menor.');
  let form; try { form = await req.formData(); } catch { return erro('Não foi possível receber o envio.'); }

  /* validação: nada é gravado antes de tudo estar válido */
  const nome = String(form.get('nome') || '').trim();
  if (nome.length < 2 || nome.length > 120) return erro('Informe o nome do produto (até 120 caracteres).');
  const linhas = String(form.get('descricao') || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!linhas.length || linhas.length > 8 || linhas.some(l => l.length > 200)) return erro('Os detalhes devem ter de 1 a 8 linhas, com até 200 caracteres cada.');
  let precos; try { precos = JSON.parse(String(form.get('precos') || '{}')); } catch { return erro('Preços inválidos.'); }
  if (!precos || typeof precos !== 'object' || Object.keys(precos).length !== prod.opcoes.length) return erro('Opções inválidas para este produto.');
  const novos = [];
  for (const o of prod.opcoes) {
    const c = precoParaCentavos(precos[o.id]);
    if (c == null) return erro(`Preço inválido em "${o.rotulo}". Use um valor como 17,00.`);
    novos.push({ id: o.id, c, img: null });
  }
  const envios = []; // {alvo, nome, bytes}
  for (const [campo, f] of form.entries()) {
    if (typeof f === 'string') continue;
    let alvo;
    if (campo === 'imagem') alvo = 'produto';
    else {
      const m = /^imagem_opcao_(\d+)$/.exec(campo);
      const op = m && prod.opcoes.find(o => o.id === +m[1]);
      if (!op || !op.imagem) return erro('Envio de imagem inválido.');
      alvo = op.id;
    }
    if (f.size > MAX_BODY) return erro('A imagem é muito grande. Use uma foto menor.');
    const bytes = new Uint8Array(await f.arrayBuffer());
    const ext = extensao(bytes);
    if (!ext) return erro('Arquivo de imagem inválido. Use JPG, PNG ou WEBP.');
    envios.push({ alvo, nome: `${aleatorio(12)}.${ext}`, bytes });
  }

  /* 1) grava as fotos novas (as antigas continuam intactas) */
  const gravadas = [];
  try {
    for (const e of envios) { await store.set(e.nome, e.bytes); gravadas.push(e.nome); }
  } catch (e) {
    console.error(e); await apagaFotos(store, gravadas.map(n => 'uploads/' + n));
    return erro('Não foi possível guardar a imagem. Nada foi alterado.', 500);
  }
  /* 2) grava tudo no banco numa única instrução (atômica) */
  const imgProduto = envios.find(e => e.alvo === 'produto');
  const antigas = [];
  if (imgProduto) antigas.push(prod.imagem);
  for (const n of novos) {
    const e = envios.find(x => x.alvo === n.id);
    if (e) { n.img = 'uploads/' + e.nome; antigas.push(prod.opcoes.find(o => o.id === n.id).imagem); }
  }
  try {
    await db.sql`
      WITH p AS (UPDATE produtos SET nome = ${nome}, descricao = ${linhas.join('\n')}, imagem = ${imgProduto ? 'uploads/' + imgProduto.nome : prod.imagem} WHERE id = ${prod.id} RETURNING id)
      UPDATE opcoes o SET preco_centavos = v.c, imagem = COALESCE(v.img, o.imagem)
      FROM jsonb_to_recordset(${JSON.stringify(novos)}::jsonb) AS v(id int, c int, img text)
      WHERE o.id = v.id AND o.produto_id = ${prod.id}`;
  } catch (e) {
    console.error(e); await apagaFotos(store, gravadas.map(n => 'uploads/' + n));
    return erro('Erro ao salvar. Nada foi alterado.', 500);
  }
  /* 3) só agora apaga as fotos antigas enviadas pelo painel (nunca as originais do site) */
  await apagaFotos(store, antigas);
  return json({ ok: true, produto: await umProduto(db, prod.id) });
}

async function excluir(id, { db, store }) {
  const prod = /^[a-z0-9_]{1,60}$/.test(id) ? await umProduto(db, id) : null;
  if (!prod) return erro('Produto não encontrado.', 404);
  await db.sql`DELETE FROM produtos WHERE id = ${prod.id}`; // opções saem junto (ON DELETE CASCADE)
  await apagaFotos(store, [prod.imagem, ...prod.opcoes.map(o => o.imagem)]);
  return json({ ok: true });
}

export async function apiAdmin(req, deps) {
  const { db } = deps;
  const url = new URL(req.url);
  const rota = url.pathname.replace(/^\/admin\/api/, '').replace(/\/$/, '');
  const o = req.headers.get('origin');
  if (o && o !== url.origin) return erro('Origem não permitida.', 403);

  if (rota === '/login' && req.method === 'POST') return login(req, deps);

  const sessao = await sessaoDe(req, db);
  if (!sessao) return erro('Sessão expirada. Entre novamente.', 401);
  if (rota === '/sessao' && req.method === 'GET') return json({ email: sessao.email, csrf: sessao.csrf });
  if (rota === '/produtos' && req.method === 'GET') return json(await todosProdutos(db));

  // daqui para baixo: ações que alteram dados exigem token CSRF
  const mudando = ['POST', 'PUT', 'DELETE'].includes(req.method);
  if (mudando) {
    const t = req.headers.get('x-csrf-token') || '';
    if (t.length !== sessao.csrf.length || !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(sessao.csrf)))
      return erro('Requisição inválida. Recarregue a página e tente de novo.', 403);
  }
  if (rota === '/logout' && req.method === 'POST') {
    await db.sql`DELETE FROM sessoes WHERE token_hash = ${sha(lerCookie(req))}`;
    return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader(req, '', 0) });
  }
  const m = /^\/produtos\/([^/]+)$/.exec(rota);
  if (m && req.method === 'PUT') return alterar(req, decodeURIComponent(m[1]), deps);
  if (m && req.method === 'DELETE') return excluir(decodeURIComponent(m[1]), deps);
  // (não existe criação de produto/opção)
  return erro('Não encontrado.', 404);
}
