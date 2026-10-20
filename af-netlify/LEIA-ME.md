# Araucária Frutas – site + painel administrativo (Netlify)

O site continua igual (visual, carrinho, WhatsApp). Os produtos agora ficam num banco Postgres do
Netlify e o proprietário altera/exclui pelo painel em **`/admin`** (ex.: https://araucaria-frutas.netlify.app/admin).

## Estrutura
- `public/` – o site original. Mudaram só: `index.html` (1 linha que carrega os dados) e o início do `js/script.js` (produtos vêm do banco; textos escapados). `public/admin-assets/` = visual/JS do painel.
- `netlify/functions/` – as 4 funções: dados do site, página `/admin`, API do painel, fotos enviadas.
- `netlify/lib/core.mjs` – toda a lógica (login, validação, alterar, excluir).
- `netlify/database/migrations/` – cria as tabelas e **importa os 32 produtos existentes** (o Netlify aplica sozinho no deploy).
- `netlify.toml` – configuração.

## Como publicar (uma vez só)
> O Netlify Drop (arrastar pasta) **não instala dependências nem cria banco/funções**. Use uma destas formas:

**A) Pelo GitHub (recomendado)**
1. Crie um repositório no GitHub e envie esta pasta inteira (sem `node_modules`).
2. No Netlify: abra o site *araucaria-frutas* → *Site configuration* → *Build & deploy* → *Continuous deployment* → **Link repository** e escolha o repositório. Deixe o *Publish directory* como `public` (já vem do `netlify.toml`) e o build command vazio.

**B) Pelo computador (Netlify CLI)**
```
npm install -g netlify-cli
npm install
netlify login && netlify link      # escolha o site araucaria-frutas
netlify deploy --prod
```

**Depois, em qualquer caso:**
1. Em *Site configuration → Environment variables* crie (valores para *Functions*/todos os escopos):
   - `ADMIN_EMAIL` = e-mail do proprietário
   - `ADMIN_PASSWORD` = senha forte (mínimo 10 caracteres)
   e faça um novo deploy (*Deploys → Trigger deploy*). Para trocar a senha depois, mude a variável e faça novo deploy.
2. O banco é criado automaticamente (o projeto usa `@netlify/database`) e as migrações rodam antes de publicar. Confira em *Data & Storage → Database*; se não aparecer, crie o banco por ali e faça novo deploy.
3. Abra `/admin` e entre.

## O que o painel faz
- **Alterar**: nome, detalhes (um tópico por linha), foto, preço de cada opção já existente (inclui Fatiado). Rótulos (300g, 1 unidade…) são preservados. A foto é reduzida automaticamente (máx. 1600 px) antes de enviar. A foto antiga só é apagada depois que a nova foi salva; as fotos originais do site nunca são apagadas.
- **Excluir**: remove o produto inteiro (opções e foto enviada junto), sempre com confirmação.
- **Não existe**: criar produto ou opção.
- Excluiu sem querer? `scripts/restaurar-excluidos.mjs` recria só os originais excluídos (instruções no topo do arquivo), ou use os *snapshots* do banco no painel do Netlify.

## Segurança (resumo)
Login por e-mail/senha definidos em variáveis de ambiente (nunca no código); sessão em cookie HttpOnly + SameSite=Strict (8 h) guardada no banco, com logout real; token CSRF em toda alteração; todas as rotas `/admin/api/*` verificam a sessão no servidor; bloqueio após 5 tentativas erradas (15 min); upload só aceita JPG/PNG/WEBP (confere o conteúdo); textos escapados no site.

## Testes
`npm install` e depois `npm test` – 20 verificações do backend com um Postgres temporário (mesmas migrações). `node test/dev.mjs` abre uma cópia local em http://localhost:3112.
