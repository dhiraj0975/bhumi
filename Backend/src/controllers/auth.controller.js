const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

exports.register = async (req, res) => {
  try { 
    const { username, password, full_name } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ error: 'username already exists' });
    await User.create({ username, password, full_name });
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = await User.findByUsername(username);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name } });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization required' });
    const token = authHeader.slice(7);
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    if (!payload || !payload.username) return res.status(401).json({ error: 'Invalid token' });

    const user = await require('../models/user.model').findByUsername(payload.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await require('bcryptjs').compare(old_password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Old password incorrect' });

    // Update password
    const hash = await require('bcryptjs').hash(new_password, 10);
    await new Promise((resolve, reject) => {
      require('../config/db').query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, user.id], (err, r) => (err ? reject(err) : resolve(r)));
    });
    return res.json({ message: 'Password changed' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};
