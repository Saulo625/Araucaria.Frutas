// Recria SOMENTE os produtos originais que foram excluídos pelo painel (não mexe nos que existem).
// Uso (no seu computador, na pasta do projeto):
//   NETLIFY_DB_URL="<string de conexão do banco>" node scripts/restaurar-excluidos.mjs
// A string de conexão aparece em:  netlify database status --show-credentials
import { getDatabase } from '@netlify/database';
import seed from '../netlify/lib/seed-data.mjs';

const db = getDatabase();
let n = 0;
for (const [i, p] of seed.products.entries()) {
  if ((await db.sql`SELECT 1 FROM produtos WHERE id = ${p.id}`).length) continue;
  const bi = seed.best.indexOf(p.id);
  await db.sql`INSERT INTO produtos (id,nome,descricao,imagem,nome_destaque,destaque_ordem,ordem)
               VALUES (${p.id},${p.nome},${p.desc.join('\n')},${p.img},${p.best || null},${bi >= 0 ? bi : null},${i})`;
  for (const [j, o] of p.op.entries())
    await db.sql`INSERT INTO opcoes (produto_id,rotulo,preco_centavos,imagem,ordem)
                 VALUES (${p.id},${o.l},${Math.round(o.p * 100)},${o.img || null},${j})`;
  n++; console.log('restaurado:', p.nome);
}
console.log(`${n} produto(s) restaurado(s).`);
process.exit(0);
