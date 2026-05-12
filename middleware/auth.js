const crypto = require('crypto');

const SECRET = 'zenith_secret_key_2026';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verify;
}

function createToken(userId) {
  const payload = JSON.stringify({ userId, ts: Date.now() });
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  const token = Buffer.from(payload).toString('base64') + '.' + signature;
  return token;
}

function verifyToken(token) {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (signature !== expected) return null;
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.slice(7);
  const data = verifyToken(token);
  if (!data || !data.userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.userId = data.userId;
  next();
}

module.exports = { hashPassword, verifyPassword, createToken, requireAuth };
