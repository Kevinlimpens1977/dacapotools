import jwt from 'jsonwebtoken';

export function signToken(payload) {
  const secret = process.env.ADMIN_SECRET || '1';
  const expiresIn = process.env.TOKEN_EXPIRES || '2h';
  return jwt.sign(payload, secret, { expiresIn });
}

export function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const secret = process.env.ADMIN_SECRET || '1';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
