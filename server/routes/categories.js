import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import pool from '../lib/db.js';

const router = Router();

// Get all categories
router.get('/categories', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching categories:', e);
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

// Create new category
router.post('/categories', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const [result] = await pool.execute(
      'INSERT INTO categories (name, description) VALUES (?,?)',
      [name, description || null]
    );

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Error creating category:', e);
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

// Delete category
router.delete('/categories/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Check if category has apps
    const [apps] = await pool.query('SELECT COUNT(*) as count FROM apps WHERE category_id = ?', [id]);
    if (apps[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing apps' });
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Error deleting category:', e);
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

export default router;