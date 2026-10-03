'use strict';
const $ = s => document.querySelector(s);
const el = (tag, props = {}, ...filhos) => {
  const e = Object.assign(document.createElement(tag), props);
  filhos.flat().forEach(f => e.append(f));
  return e;
};
const brl = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ');
const emReais = c => (c / 100).toFixed(2).replace('.', ',');
const imgSrc = p => '/' + p;
let csrf = '', produtos = [], editando = null, excluindo = null, toastT;

function toast(msg, erro) {
  const t = $('#toast'); t.textContent = msg; t.classList.toggle('erro', !!erro); t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3500);
}
async function chamar(url, opcoes = {}) {
  const r = await fetch(url, { ...opcoes, headers: { 'X-CSRF-Token': csrf, ...(opcoes.headers || {}) } });
  if (r.status === 401) { location.replace('/admin'); throw new Error('sessão'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || 'Algo deu errado. Tente novamente.');
  return d;
}

/* ---------- Lista ---------- */
function desenha() {
  const q = $('#busca').value.trim().toLowerCase();
  const vis = produtos.filter(p => p.nome.toLowerCase().includes(q));
  $('#resumo').textContent = `${produtos.length} produto(s) cadastrado(s)` + (q ? ` · ${vis.length} encontrado(s)` : '');
  const lista = $('#lista'); lista.replaceChildren();
  if (!vis.length) lista.append(el('div', { className: 'vazio', textContent: q ? 'Nenhum produto encontrado.' : 'Não há produtos cadastrados.' }));
  for (const p of vis) {
    lista.append(el('article', { className: 'linha' },
      el('img', { src: imgSrc(p.imagem), alt: '' }),
      el('div', {},
        el('h3', { textContent: p.nome }),
        el('ul', { className: 'precos' }, p.opcoes.map(o =>
          el('li', {}, el('span', { className: 'r', textContent: o.rotulo }), el('b', { textContent: brl(o.preco_centavos) }))))),
      el('div', { className: 'acoes' },
        el('button', { className: 'btn', type: 'button', textContent: '✏️ Alterar', onclick: () => abreEditar(p.id) }),
        el('button', { className: 'btn-sec', type: 'button', textContent: '🗑️ Excluir', onclick: () => abreExcluir(p.id) }))));
  }
}
async function carregar() {
  produtos = await chamar('/admin/api/produtos');
  desenha();
}

/* ---------- Alterar ---------- */
const MAX_ORIGINAL = 25 * 1024 * 1024; // foto do celular pode ser grande: reduzimos antes de enviar
const MAX_ENVIO = 4 * 1024 * 1024;     // limite do servidor (Netlify aceita ~6 MB por requisição)
let arquivos = {}; // 'produto' | idOpcao -> File
function mostraErro(id, msg) { const m = $(id); m.textContent = msg || ''; m.hidden = !msg; }

// Reduz a foto para no máximo 1600 px e converte para JPEG (boa qualidade, arquivo leve)
async function reduz(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.86));
  if (!blob) throw new Error('falhou');
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

let pendentes = new Set(); // fotos ainda sendo preparadas: o botão Salvar espera por elas
function escolheArquivo(chave, input, img, rotulo) {
  const p = preparaArquivo(chave, input, img, rotulo);
  pendentes.add(p); p.finally(() => pendentes.delete(p));
  return p;
}
async function preparaArquivo(chave, input, img, rotulo) {
  let f = input.files[0];
  mostraErro('#eMsg', '');
  if (!f) { delete arquivos[chave]; img.src = img.dataset.atual; rotulo.textContent = ''; return; }
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { input.value = ''; return mostraErro('#eMsg', 'Use uma imagem JPG, PNG ou WEBP.'); }
  if (f.size > MAX_ORIGINAL) { input.value = ''; return mostraErro('#eMsg', 'A imagem é muito grande (máximo 25 MB).'); }
  rotulo.textContent = 'Preparando imagem…';
  try { f = await reduz(f); } catch { input.value = ''; return mostraErro('#eMsg', 'Não foi possível ler essa imagem. Tente outra.'); }
  if (f.size > MAX_ENVIO) { input.value = ''; return mostraErro('#eMsg', 'A imagem ainda ficou muito grande. Tente outra foto.'); }
  arquivos[chave] = f;
  img.src = URL.createObjectURL(f);
  rotulo.textContent = 'Nova imagem: ' + input.files[0].name + ' (será usada ao salvar)';
}

function abreEditar(id) {
  const p = produtos.find(x => x.id === id); if (!p) return;
  editando = p; arquivos = {}; pendentes = new Set();
  mostraErro('#eMsg', '');
  $('#eTitulo').textContent = p.nome;
  $('#eNome').value = p.nome;
  $('#eDesc').value = p.descricao;
  const img = $('#eImg'); img.src = img.dataset.atual = imgSrc(p.imagem);
  $('#eArq').value = ''; $('#eArqNome').textContent = '';
  const precos = $('#ePrecos'); precos.replaceChildren();
  const opImgs = $('#eOpImgs'); opImgs.replaceChildren();
  for (const o of p.opcoes) {
    precos.append(el('div', { className: 'preco-linha' },
      el('label', { className: 'r', htmlFor: 'preco' + o.id, textContent: o.rotulo }),
      el('div', { className: 'm' }, el('span', { textContent: 'R$' }),
        el('input', { type: 'text', id: 'preco' + o.id, inputMode: 'decimal', value: emReais(o.preco_centavos), required: true, autocomplete: 'off' }))));
    if (o.imagem) { // opções que já têm foto própria (ex.: Jabuticaba)
      const oi = el('img', { alt: 'Foto da opção ' + o.rotulo, src: imgSrc(o.imagem) }); oi.dataset.atual = oi.src;
      const nome = el('small', { className: 'muted' });
      const inp = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hidden: true });
      inp.addEventListener('change', () => escolheArquivo(o.id, inp, oi, nome));
      opImgs.append(el('div', { className: 'op-img' },
        el('span', { className: 'rot', textContent: 'Foto da opção "' + o.rotulo + '"' }), oi,
        el('label', { className: 'btn-sec arquivo' }, 'Escolher nova imagem', inp), nome));
    }
  }
  $('#eSalvar').disabled = false; $('#eSalvar').textContent = 'Salvar alterações';
  $('#dlgEditar').showModal();
}
$('#eArq').addEventListener('change', () => escolheArquivo('produto', $('#eArq'), $('#eImg'), $('#eArqNome')));
$('#eCancelar').addEventListener('click', () => $('#dlgEditar').close());

$('#fEditar').addEventListener('submit', async e => {
  e.preventDefault();
  if (!editando) return;
  const btn = $('#eSalvar'); btn.disabled = true; btn.textContent = 'Salvando…'; mostraErro('#eMsg', '');
  await Promise.allSettled([...pendentes]); // garante que a foto escolhida já está pronta
  if ($('#eMsg').textContent) { btn.disabled = false; btn.textContent = 'Salvar alterações'; return; } // erro ao preparar a foto
  const precos = {};
  for (const o of editando.opcoes) precos[o.id] = $('#preco' + o.id).value;
  const fd = new FormData();
  fd.append('nome', $('#eNome').value);
  fd.append('descricao', $('#eDesc').value);
  fd.append('precos', JSON.stringify(precos));
  if (arquivos.produto) fd.append('imagem', arquivos.produto);
  for (const o of editando.opcoes) if (arquivos[o.id]) fd.append('imagem_opcao_' + o.id, arquivos[o.id]);
  try {
    const r = await chamar('/admin/api/produtos/' + encodeURIComponent(editando.id), { method: 'PUT', body: fd });
    produtos = produtos.map(p => p.id === r.produto.id ? r.produto : p);
    $('#dlgEditar').close(); desenha();
    toast('Alterações salvas: ' + r.produto.nome);
  } catch (err) {
    if (err.message !== 'sessão') mostraErro('#eMsg', err.message);
    btn.disabled = false; btn.textContent = 'Salvar alterações';
  }
});

/* ---------- Excluir ---------- */
function abreExcluir(id) {
  const p = produtos.find(x => x.id === id); if (!p) return;
  excluindo = p; mostraErro('#xMsg', '');
  $('#xNome').textContent = p.nome; $('#xImg').src = imgSrc(p.imagem);
  $('#xConfirmar').disabled = false; $('#xConfirmar').textContent = 'Excluir';
  $('#dlgExcluir').showModal();
  $('#xCancelar').focus(); // foco no botão seguro
}
$('#xCancelar').addEventListener('click', () => { excluindo = null; $('#dlgExcluir').close(); });
$('#xConfirmar').addEventListener('click', async () => {
  if (!excluindo) return;
  const b = $('#xConfirmar'); b.disabled = true; b.textContent = 'Excluindo…';
  try {
    await chamar('/admin/api/produtos/' + encodeURIComponent(excluindo.id), { method: 'DELETE' });
    const nome = excluindo.nome;
    produtos = produtos.filter(p => p.id !== excluindo.id); excluindo = null;
    $('#dlgExcluir').close(); desenha();
    toast('Produto excluído com sucesso.');
  } catch (err) {
    if (err.message !== 'sessão') mostraErro('#xMsg', err.message);
    b.disabled = false; b.textContent = 'Excluir';
  }
});

/* ---------- Geral ---------- */
$('#busca').addEventListener('input', desenha);
$('#sair').addEventListener('click', async () => {
  try { await chamar('/admin/api/logout', { method: 'POST' }); } catch {}
  location.replace('/admin');
});
(async () => {
  try {
    const s = await chamar('/admin/api/sessao');
    csrf = s.csrf; $('#quem').textContent = s.email;
    await carregar();
  } catch (e) { if (e.message !== 'sessão') { $('#resumo').textContent = 'Não foi possível carregar os produtos.'; toast(e.message, true); } }
})();
