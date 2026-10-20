import { getDatabase } from '@netlify/database';
import { produtosJs } from '../lib/core.mjs';
export default async () => produtosJs({ db: getDatabase() });
export const config = { path: '/api/products.js' };
