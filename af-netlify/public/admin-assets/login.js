'use strict';
const f = document.getElementById('f'), msg = document.getElementById('msg'), btn = document.getElementById('entrar');
f.addEventListener('submit', async e => {
  e.preventDefault();
  msg.hidden = true; btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    const r = await fetch('/admin/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: f.email.value, senha: f.senha.value }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { location.replace('/admin'); return; }
    msg.textContent = d.erro || 'Não foi possível entrar.'; msg.hidden = false;
  } catch { msg.textContent = 'Sem conexão com o servidor.'; msg.hidden = false; }
  btn.disabled = false; btn.textContent = 'Entrar';
});
