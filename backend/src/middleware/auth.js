import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Debug logging for token verification issues
  try {
    console.log(`[auth] ${req.method} ${req.path} - Authorization header: ${authHeader ? '[present]' : '[missing]'}`);
    if (token) console.log(`[auth] token (first 40 chars): ${String(token).slice(0, 40)}`);
  } catch (logErr) {
    console.warn('[auth] failed to log auth header/token', logErr);
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
    if (err) {
      console.error('Token verification error:', err && err.message ? err.message : err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Log decoded user for debugging (remove in production)
    try {
      console.log('[auth] token decoded user:', user);
    } catch (e) {
      console.warn('[auth] failed to log decoded token user', e);
    }
    req.user = user;
    next();
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}
