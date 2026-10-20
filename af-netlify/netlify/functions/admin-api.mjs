import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import { apiAdmin } from '../lib/core.mjs';
export default async (req, context) =>
  apiAdmin(req, { db: getDatabase(), store: getStore({ name: 'fotos', consistency: 'strong' }), env: process.env, ip: context.ip });
export const config = { path: '/admin/api/*' };
