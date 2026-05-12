const express = require('express');
const router = express.Router();
const { get, run } = require('../db/database');
const { hashPassword, verifyPassword, createToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  // Check existing
  const existingEmail = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

  const existingUser = get('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUser) return res.status(400).json({ error: 'Username already taken' });

  const passwordHash = hashPassword(password);
  const id = run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email.toLowerCase(), passwordHash]);

  let user = get('SELECT id, username, email FROM users WHERE id = ?', [id]);
  if (!user) user = get('SELECT id, username, email FROM users ORDER BY id DESC LIMIT 1');

  const token = createToken(user.id);
  res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = createToken(user.id);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
