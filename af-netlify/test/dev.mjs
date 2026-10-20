// Servidor local que imita o Netlify (banco temporário). Uso: node test/dev.mjs  ->  http://localhost:3112
import { bancoTemporario, lojaEmMemoria, servidorLocal } from './helpers.mjs';
const { db } = await bancoTemporario();
const srv = await servidorLocal({ db, store: lojaEmMemoria(), env: { ADMIN_EMAIL: 'dono@teste.com', ADMIN_PASSWORD: 'senha-bem-forte-123' } }, 3112);
console.log('pronto http://localhost:3112  (admin: dono@teste.com / senha-bem-forte-123)');
