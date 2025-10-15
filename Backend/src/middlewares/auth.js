const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization || '';
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization required' });
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.error('auth middleware error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
