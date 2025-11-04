import { Router } from 'express';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_SECRET || '1';
  console.log('Login attempt - Expected:', expected, 'Received:', password);
  if (!password) return res.status(400).json({ error: 'Password required' });
  if (password.toLowerCase() !== expected.toLowerCase()) return res.status(401).json({ error: 'Invalid password' });

  const token = signToken({ role: 'admin' });
  res.json({ token });
});

export default router;
