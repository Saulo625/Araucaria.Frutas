-- Produto -> opções de venda (1 produto tem 1 ou mais opções)
CREATE TABLE produtos (
  id              TEXT PRIMARY KEY,            -- mesmo id usado pelo site/carrinho (ex.: "caju")
  nome            TEXT NOT NULL,
  descricao       TEXT NOT NULL DEFAULT '',    -- um tópico por linha
  imagem          TEXT NOT NULL,               -- "imagens/x.jpg" (original) ou "uploads/x.jpg" (enviada pelo painel)
  nome_destaque   TEXT,                        -- nome curto em "Mais Vendidos"
  destaque_ordem  INTEGER,                     -- posição em "Mais Vendidos"; NULL = fora da seção
  ordem           INTEGER NOT NULL             -- posição na página de produtos
);
CREATE TABLE opcoes (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  produto_id      TEXT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  rotulo          TEXT NOT NULL,               -- "300g", "1 unidade", "Fatiado"... (não editável pelo painel)
  preco_centavos  INTEGER NOT NULL CHECK (preco_centavos > 0),
  imagem          TEXT,                        -- só quando a opção troca a foto (ex.: Jabuticaba)
  ordem           INTEGER NOT NULL,
  UNIQUE (produto_id, ordem)
);
-- Acesso administrativo
CREATE TABLE sessoes (
  token_hash  TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  csrf        TEXT NOT NULL,
  expira_em   TIMESTAMPTZ NOT NULL
);
CREATE TABLE login_falhas (
  chave  TEXT PRIMARY KEY,
  n      INTEGER NOT NULL,
  ate    TIMESTAMPTZ NOT NULL
);
