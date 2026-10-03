/* ====== CONFIGURAÇÃO ====== */
const WHATSAPP = '5511989421345'; // +55 11 98942-1345 – número que recebe os pedidos (DDI+DDD+número)

const IMG = {   // fotos: arquivos da pasta imagens/ (troque o arquivo ou o caminho)
 morango:'imagens/morango.jpg',
 uva_gota_mel:'imagens/uva_gota_mel.jpg',
 uva_cotton_candy:'imagens/uva_cotton_candy.jpg',
 blueberry:'imagens/blueberry.jpg',
 uva_vitoria:'imagens/uva_vitoria.jpg',
 melao:'imagens/melao.jpg',
 pera:'imagens/pera.jpg',
 goiaba:'imagens/goiaba.jpg',
 pitaya:'imagens/pitaya.jpg',
 nozes:'imagens/nozes.jpg',
 atemoia:'imagens/atemoia.jpg',
 kiwi:'imagens/kiwi.jpg',
 maca:'imagens/maca.jpg',
 laranja:'imagens/laranja.jpg',
 jabuticaba_1kg:'imagens/jabuticaba_1kg.jpg',
 manga:'imagens/manga.jpg',
 caju:'imagens/caju.jpg',
 uva_thompson:'imagens/uva_thompson.jpg',
 mamao_papaia:'imagens/mamao_papaia.jpg',
 roma:'imagens/roma.jpg',
 carambola:'imagens/carambola.jpg',
 acerola:'imagens/acerola.jpg',
 coco:'imagens/coco.jpg',
 mamao_formosa:'imagens/mamao_formosa.jpg',
 abacaxi:'imagens/abacaxi.jpg',
 sweetgrape:'imagens/sweetgrape.jpg',
 melancia:'imagens/melancia.jpg',
 jabuticaba_450:'imagens/jabuticaba_450.jpg',
 pessego:'imagens/pessego.jpg',
 tamara:'imagens/tamara.jpg',
 banana:'imagens/banana.jpg',
 limao:'imagens/limao.jpg',
 nespera:'imagens/nespera.jpg'
};

/* Produtos agora vêm do banco de dados (api/products.js, carregado antes deste arquivo).
   Mesmo formato de antes: nome, img, desc e op (l = rótulo, p = preço). Edite pelo painel /admin. */
const PRODUCTS = (window.__AF__ && window.__AF__.products) || [];
/* Mais vendidos: ordem definida no banco (produtos excluídos simplesmente saem da lista) */
const BEST_IDS = (window.__AF__ && window.__AF__.best) || [];
const FAQ = [
 ['Vocês entregam as frutas?','Sim. Consulte a disponibilidade e a região de entrega pelo WhatsApp.',1],
 ['As frutas são vendidas por peso?','Sim. Cada produto informa o peso exato ou a embalagem anunciada, como 300g, 1 cumbuca ou 2 unidades.',1],
 ['Como as frutas são selecionadas?','Escolhemos uma a uma, priorizando frutas frescas, no ponto certo de maturação e com boa aparência.'],
 ['Quais formas de pagamento vocês aceitam?','PIX (sem acréscimo), cartão de crédito e cartão de débito (com acréscimo da taxa da maquininha).'],
 ['Como faço para comprar?','Adicione os produtos ao carrinho, marque os que deseja, clique em "Continuar pelo WhatsApp" e envie o pedido pronto para confirmarmos.'],
 ['O pagamento é feito pelo site?','Não. O site monta o seu pedido e o envia pelo WhatsApp. Lá confirmamos a disponibilidade, a entrega e a forma de pagamento.'],
 ['Quais os dias e horários de entrega?','Entregamos às terças e quintas, das 8h às 20h, e aos sábados, das 8h às 16h.'],
 ['Qual o horário de atendimento?','Atendemos pelo WhatsApp às segundas, quartas e sextas, das 8h às 12h. Mensagens fora desse horário são respondidas no próximo dia de atendimento.'],
 ['Existe taxa de entrega ou pedido mínimo?','Isso pode variar conforme a região e o tamanho do pedido. Consulte os valores pelo WhatsApp antes de finalizar.'],
 ['Por que devo fazer o pedido com antecedência?','Para garantirmos a disponibilidade das frutas. Quanto antes você pedir, maior a chance de receber exatamente o que escolheu.'],
 ['Os preços e a disponibilidade podem mudar?','Sim. Algumas frutas são sazonais e podem ficar indisponíveis ou ter alteração de preço. O valor final é sempre confirmado no WhatsApp.'],
 ['Posso pedir a fruta fatiada?','Algumas frutas, como abacaxi, melancia, melão, mamão e manga, têm a opção "Fatiado" na página de produtos, com valor diferente da unidade inteira.'],
 ['Posso alterar ou cancelar meu pedido?','Sim, desde que você avise o quanto antes pelo WhatsApp. Conforme o andamento do pedido, alguns ajustes podem não ser possíveis.'],
 ['E se a fruta chegar com algum problema?','Fale com a gente pelo WhatsApp o quanto antes, de preferência enviando uma foto, para analisarmos e encontrarmos a melhor solução.'],
 ['Como devo conservar as frutas?','Mantenha as frutas em local fresco e arejado. As já maduras podem ir para a geladeira, e as fatiadas devem ser refrigeradas e consumidas logo.'],
 ['A fruta que eu quero não está no site. E agora?','Chame a gente no WhatsApp ou no Instagram e conte o que procura. Vamos verificar se conseguimos incluir no seu pedido.']
];

/* ====== UTILITÁRIOS ====== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const brl = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}).replace(/\u00a0/g,' ');
const prod = id => PRODUCTS.find(p => p.id === id);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const thumb = (p,extra='') => p.img
  ? `<div class="th ${extra}"><img src="${esc(p.img)}" alt="${esc(p.nome)}"></div>`
  : `<div class="th ${extra}" style="background:linear-gradient(135deg,${p.cor[0]},${p.cor[1]})" aria-hidden="true">${p.emoji}</div>`;
let toastT; function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),1800)}

/* ====== LOGO (árvore araucária) ====== */
$('#ldTitle').innerHTML=[...'Araucária Frutas'].map((c,i)=>`<span style="animation-delay:${(1.2+i*.07).toFixed(2)}s">${c===' '?'&nbsp;':c}</span>`).join('');
setTimeout(()=>{const l=$('#loader');l.classList.add('out');setTimeout(()=>l.remove(),800)},3000);

/* ====== CARRINHO ====== */
let cart=[];
try{cart=(JSON.parse(localStorage.getItem('af_cart')||'[]')).filter(i=>prod(i.id)&&prod(i.id).op[i.op]&&i.qtd>0)}catch(e){}
const save=()=>{try{localStorage.setItem('af_cart',JSON.stringify(cart))}catch(e){}};
const keyOf=(id,op)=>id+'|'+op;

function addToCart(id,op){
 const k=keyOf(id,op),it=cart.find(i=>i.key===k);
 if(it) it.qtd++; else cart.push({key:k,id,op,qtd:1,sel:true});
 update(); toast('✓ Adicionado ao carrinho');
}
function changeQty(k,d){
 const it=cart.find(i=>i.key===k); if(!it) return;
 it.qtd+=d;
 if(it.qtd<=0) cart=cart.filter(i=>i.key!==k); // zerou → some do carrinho
 update();
}
function update(){save();renderCart();
 const n=cart.reduce((s,i)=>s+i.qtd,0),b=$('#badge');
 b.textContent=n;b.style.display=n?'flex':'none';
}
function renderCart(){
 const box=$('#items');
 if(!cart.length){
  box.innerHTML='<div class="empty"><div style="font-size:3rem">🛒</div><p>Seu carrinho está vazio.</p><a class="btn" href="#produtos" style="display:inline-block">Ver produtos</a></div>';
 } else {
  box.innerHTML=cart.map(it=>{const p=prod(it.id),o=p.op[it.op];
   return `<div class="item">
    <input type="checkbox" class="chk" data-k="${it.key}" ${it.sel?'checked':''} aria-label="Selecionar ${esc(p.nome)}">
    ${thumb({...p,img:o.img||p.img})}
    <div class="info"><h4>${esc(p.nome)} – ${esc(o.l)}</h4><span class="pr">${brl(o.p)}</span>
    Quantidade:<span class="stp"><button data-a="dec" data-k="${it.key}" aria-label="Diminuir">−</button><b>${it.qtd}</b><button data-a="inc" data-k="${it.key}" aria-label="Aumentar">+</button></span></div>
   </div>`}).join('');
 }
 const sel=cart.filter(i=>i.sel);
 let total=0;
 $('#lines').innerHTML=sel.length?sel.map(i=>{const p=prod(i.id),o=p.op[i.op],st=o.p*i.qtd;total+=st;
  return `<p>${esc(p.nome)} (${esc(o.l)}) – ${i.qtd} x ${brl(o.p)} = <b>${brl(st)}</b></p>`}).join(''):'<p style="color:var(--muted)">Selecione os produtos que deseja comprar.</p>';
 $('#total').textContent=brl(total);
 const bb=$('#buy');bb.classList.toggle('off',!sel.length);bb.href=sel.length?waUrl(sel):'#';
}
function orderText(sel){
 let total=0,qtdTotal=0;
 const itens=sel.map((i,n)=>{const p=prod(i.id),o=p.op[i.op],st=o.p*i.qtd;total+=st;qtdTotal+=i.qtd;
  return `*${n+1}. ${p.nome}*\n    Opção: ${o.l}\n    Quantidade: ${i.qtd}\n    Valor unitário: ${brl(o.p)}\n    Subtotal: ${brl(st)}`}).join('\n\n');
 const resumo=sel.map(i=>{const p=prod(i.id),o=p.op[i.op];return `• ${p.nome} (${o.l}) – ${i.qtd} x ${brl(o.p)} = ${brl(o.p*i.qtd)}`}).join('\n');
 return `🛒 *NOVO PEDIDO – Araucária Frutas*\n\nOlá! Gostaria de fazer o seguinte pedido:\n\n${itens}\n\n━━━━━━━━━━━━━━\n*RESUMO DA COMPRA*\n${resumo}\n\nTotal de itens: ${qtdTotal}\n*VALOR TOTAL: ${brl(total)}*\n━━━━━━━━━━━━━━\n\nAguardo a confirmação da disponibilidade, da entrega e da forma de pagamento. Obrigado!`;
}
const waUrl=sel=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(orderText(sel))}`;

/* ====== RENDER DAS PÁGINAS ====== */
$('#grid').innerHTML=PRODUCTS.map(p=>`<article class="card" data-id="${p.id}">${thumb(p)}<h3>${esc(p.nome)}</h3>
 <ul>${p.desc.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>
 <div class="ops">${p.op.map((o,i)=>`<button class="op${i?'':' on'}" data-i="${i}"><span>${esc(o.l)}</span><b>${brl(o.p)}</b></button>`).join('')}</div>
 <button class="btn add">Adicionar ao carrinho</button></article>`).join('');
$('#best').innerHTML=BEST_IDS.map(prod).filter(Boolean).map(p=>`<article class="card best">${thumb(p)}<h3>${esc(p.best||p.nome)}</h3><a class="btn" href="#produtos" data-go="${p.id}" style="text-align:center">Ver mais</a></article>`).join('');
$('#faq').innerHTML=FAQ.map(f=>`<div class="qa${f[2]?' on':''}"><button><span>${f[0]}</span><i>${f[2]?'×':'+'}</i></button><p>${f[1]}</p></div>`).join('');

$('#h1').src=IMG.kiwi;$('#h2').src=IMG.manga;

/* ====== EVENTOS ====== */
document.addEventListener('click',e=>{
 const g=e.target.closest('[data-go]');
 if(g){e.preventDefault();location.hash='#produtos';setTimeout(()=>{const c=$(`.card[data-id="${g.dataset.go}"]`);if(c){c.scrollIntoView({behavior:'smooth',block:'center'});c.classList.add('hl');setTimeout(()=>c.classList.remove('hl'),1800)}},80);return}
 const op=e.target.closest('.op'); if(op){const cd=op.closest('.card'),pp=prod(cd.dataset.id),oi=pp&&pp.op[+op.dataset.i];if(oi&&oi.img){const im=cd.querySelector('.th img');if(im)im.src=oi.img}
 [...op.parentNode.children].forEach(c=>c.classList.remove('on'));op.classList.add('on');return}
 const add=e.target.closest('.add'); if(add){const c=add.closest('.card'),o=c.querySelector('.op.on');addToCart(c.dataset.id,+o.dataset.i);return}
 const st=e.target.closest('[data-a]'); if(st){changeQty(st.dataset.k,st.dataset.a==='inc'?1:-1);return}
 const q=e.target.closest('.qa button'); if(q){const d=q.parentNode;d.classList.toggle('on');q.querySelector('i').textContent=d.classList.contains('on')?'×':'+';return}
});
document.addEventListener('change',e=>{
 if(e.target.classList.contains('chk')){const it=cart.find(i=>i.key===e.target.dataset.k);if(it){it.sel=e.target.checked;save();renderCart()}}
});
$('#buy').addEventListener('click',e=>{if(e.currentTarget.classList.contains('off'))e.preventDefault()});
$('#burger').addEventListener('click',()=>$('#nav').classList.toggle('open'));

/* ====== NAVEGAÇÃO ====== */
function route(){
 let v=(location.hash||'#inicio').slice(1); if(!$('#v-'+v)) v='inicio';
 $$('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
 $$('[data-v]').forEach(a=>a.classList.toggle('on',a.dataset.v===v));
 $('#nav').classList.remove('open');
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
route(); update();
