import crypto from 'crypto';
import path from 'path';
import { pool } from '../db/index.js';
import { putObject, keyToUrl } from '../services/r2.service.js';

export const uploadImages = async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'sin archivos' });

  const client = await pool.connect();
  try {
    const out = [];
    for (const f of req.files) {
      const ext = path.extname(f.originalname || '');
      const key = crypto.randomBytes(16).toString('hex') + ext;

      await putObject(process.env.R2_BUCKET, key, f.buffer, f.mimetype);

      const q = `
        INSERT INTO images (key, mime, size_bytes)
        VALUES ($1,$2,$3)
        RETURNING id, key, mime, size_bytes, created_at
      `;
      const r = await client.query(q, [key, f.mimetype, f.size]);
      const row = r.rows[0];
      out.push({ ...row, url: keyToUrl(row.key) });
    }
    res.json({ ok: true, files: out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

export const listImages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '12', 10), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    const { rows } = await pool.query(
      `SELECT id, key, mime, size_bytes, created_at
       FROM images
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ items: rows.map(r => ({ ...r, url: keyToUrl(r.key) })), limit, offset });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db_error' });
  }
};

export const getByIds = async (req, res) => {
  try {
    const ids = String(req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) return res.status(400).json({ error: 'ids requerido' });
    const { rows } = await pool.query(
      `SELECT id, key, mime, size_bytes, created_at
       FROM images
       WHERE id = ANY($1::uuid[])`,
      [ids]
    );
    res.json({ items: rows.map(r => ({ ...r, url: keyToUrl(r.key) })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db_error' });
  }
};
