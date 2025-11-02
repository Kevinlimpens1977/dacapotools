import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import pool from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const validCategories = ['Personeel', 'Administratie', 'MT', 'Overzicht'];
function ensureValidCategory(category) {
  if (!validCategories.includes(category)) {
    const msg = `Invalid category. Must be one of: ${validCategories.join(', ')}`;
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }
}

// Multer storage
const uploadsDir = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `${Date.now()}_${nanoid(6)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.get('/apps', async (req, res) => {
  const category = req.query.category;
  try {
    ensureValidCategory(category);
    const [rows] = await pool.query('SELECT * FROM apps WHERE category = ? ORDER BY created_at DESC', [category]);
    res.json(rows);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  }
});

router.get('/apps/all', async (_req, res) => {
  try {
    console.log('Fetching all apps from database...');
    const [rows] = await pool.query('SELECT * FROM apps ORDER BY created_at DESC');
    console.log('Got apps from database:', rows);
    
    const grouped = {
      Personeel: [],
      Administratie: [],
      MT: [],
      Overzicht: []
    };
    
    for (const row of rows) {
      if (grouped[row.category]) {
        grouped[row.category].push(row);
      }
    }
    
    console.log('Grouped apps:', grouped);
    res.json(grouped);
  } catch (e) {
    console.error('Error fetching apps:', e);
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

router.post('/apps', requireAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('Creating new app with body:', req.body);
    console.log('File upload:', req.file);
    
    const { category, title, description, link_url } = req.body;
    ensureValidCategory(category);
    if (!title) return res.status(400).json({ error: 'Title required' });

    let image_url = null;
    if (req.file) {
      // Gebruik volledige URL voor afbeeldingen
      const baseUrl = process.env.API_URL || 'http://localhost:3001';
      image_url = `${baseUrl}/uploads/${req.file.filename}`;
      console.log('Setting image URL:', image_url);
    }

    const [result] = await pool.execute(
      'INSERT INTO apps (category, title, description, image_url, link_url) VALUES (?,?,?,?,?)',
      [category, title, description || null, image_url, link_url || null]
    );

    const [rows] = await pool.query('SELECT * FROM apps WHERE id = ?', [result.insertId]);
    console.log('Created app:', rows[0]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Error creating app:', e);
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  }
});

router.post('/paste-image', requireAuth, async (req, res) => {
  try {
    const { base64, filename } = req.body || {};
    if (!base64) return res.status(400).json({ error: 'base64 required' });

    const match = base64.match(/^data:(.+);base64,(.*)$/);
    const data = match ? match[2] : base64;

    const buf = Buffer.from(data, 'base64');
    const ext = (match ? match[1] : 'image/png').includes('jpeg') ? '.jpg' : '.png';
    const name = `${Date.now()}_${nanoid(6)}_${filename || 'pasted'}${ext}`;
    const full = path.join(uploadsDir, name);
    fs.writeFileSync(full, buf);

    res.json({ imageUrl: `/uploads/${name}` });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save image' });
  }
});

router.put('/apps/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { category, title, description, link_url } = req.body;

    if (category) ensureValidCategory(category);

    // Fetch current to maybe delete image
    const [curRows] = await pool.query('SELECT * FROM apps WHERE id = ?', [id]);
    if (!curRows.length) return res.status(404).json({ error: 'Not found' });
    const cur = curRows[0];

    let image_url = cur.image_url;
    if (req.file) {
      // delete old if under /uploads
      if (image_url && image_url.startsWith('/uploads/')) {
        const old = path.join(uploadsDir, path.basename(image_url));
        fs.existsSync(old) && fs.unlinkSync(old);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    const fields = {
      category: category || cur.category,
      title: title || cur.title,
      description: description ?? cur.description,
      link_url: link_url ?? cur.link_url,
      image_url
    };

    await pool.execute(
      'UPDATE apps SET category=?, title=?, description=?, image_url=?, link_url=? WHERE id=?',
      [fields.category, fields.title, fields.description, fields.image_url, fields.link_url, id]
    );

    const [rows] = await pool.query('SELECT * FROM apps WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  }
});

router.delete('/apps/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [curRows] = await pool.query('SELECT * FROM apps WHERE id = ?', [id]);
    if (!curRows.length) return res.status(404).json({ error: 'Not found' });
    const cur = curRows[0];

    await pool.execute('DELETE FROM apps WHERE id = ?', [id]);

    if (cur.image_url && cur.image_url.startsWith('/uploads/')) {
      const old = path.join(uploadsDir, path.basename(cur.image_url));
      fs.existsSync(old) && fs.unlinkSync(old);
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
