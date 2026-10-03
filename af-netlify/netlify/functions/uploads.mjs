import { getStore } from '@netlify/blobs';
import { servirFoto } from '../lib/core.mjs';
export default async (req) => servirFoto(req, { store: getStore({ name: 'fotos', consistency: 'strong' }) });
export const config = { path: '/uploads/*' };
