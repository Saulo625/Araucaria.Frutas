import { getDatabase } from '@netlify/database';
import { paginaAdmin } from '../lib/core.mjs';
export default async (req) => paginaAdmin(req, { db: getDatabase() });
export const config = { path: ['/admin', '/admin/'] };
