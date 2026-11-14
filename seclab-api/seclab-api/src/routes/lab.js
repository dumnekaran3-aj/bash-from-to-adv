// ================================================================
//  INTENTIONALLY VULNERABLE. Sirf local practice ke liye.
//  LAB_MODE=true aur loopback request ho tabhi chalta hai.
//  Isko kabhi public network pe expose mat karna.
// ================================================================
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { asyncHandler } = require('../utils');

const WEAK_SECRET = 'secret123'; // crack-me
const isLoopback = (ip = '') => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);

router.use((req, res, next) => {
  if (!config.labMode || !isLoopback(req.socket.remoteAddress)) return res.status(404).json({ error: 'Not found' });
  next();
});

// Lab index
router.get('/', (req, res) => {
  res.json({
    name: 'seclab practice targets',
    credentials: [
      { email: 'admin@lab.local', password: 'Admin@12345', role: 'admin' },
      { email: 'alice@acme.test', password: 'Alice@12345', role: 'client', tenant: 'acme' },
      { email: 'bob@acme.test', password: 'Bob@12345', role: 'client', tenant: 'acme' },
      { email: 'carol@globex.test', password: 'Carol@12345', role: 'client', tenant: 'globex' },
    ],
    secureTargets_shouldResist: [
      'BOLA/IDOR: GET /api/client/orders/:id (dusre user ka order)',
      'BFLA: client token se /api/admin/*',
      'Mass assignment: POST /api/signup {"role":"admin"}, POST /api/public/api/user/:id/profile',
      'Brute force + lockout: POST /api/auth/signin',
      'JWT tampering (alg none / weak secret / role claim edit)',
      'Refresh token reuse: POST /api/auth/refresh',
      'Tenant isolation: x-api-key ke saath /api/paas/v1/records/:id',
      'NoSQL operator injection: signin/query params me {"$ne":null}',
      'Rate limiting, header checks (helmet), CORS',
    ],
    vulnerableTargets_should_be_found: [
      'GET  /api/test/v1/user/:id            -> IDOR + excessive data exposure (hash, pin, secrets)',
      'PUT  /api/test/v1/user/:id            -> mass assignment, no auth (role=admin)',
      'POST /api/test/v1/legacy-login        -> NoSQL operator injection ({"pin":{"$ne":null}})',
      'POST /api/test/v1/login               -> user enumeration + no lockout/rate limit',
      'GET  /api/test/v1/token  /whoami      -> weak JWT secret + trusts role claim',
      'GET  /api/test/v1/search?q=           -> reflected XSS',
      'GET  /api/test/v1/redirect?url=       -> open redirect',
      'GET  /api/test/v1/file?name=          -> path traversal',
      'GET  /api/test/v1/error               -> stack trace / info leak',
      'GET  /api/test/v1/debug               -> verbose config leak',
    ],
  });
});

// 1. IDOR + data exposure: pura record, hash ke saath, bina auth
router.get('/user/:id', asyncHandler(async (req, res) => {
  const u = await db.users.findOne({ id: String(req.params.id) });
  if (!u) return res.status(404).json({ error: `No user with id ${req.params.id}` });
  res.json(u);
}));

// 2. Mass assignment: body seedha update me
router.put('/user/:id', asyncHandler(async (req, res) => {
  const u = await db.users.updateOne({ id: String(req.params.id) }, req.body);
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json(u);
}));

// 3. NoSQLi: body ka object seedha query me
router.post('/legacy-login', asyncHandler(async (req, res) => {
  const user = await db.users.findOne({ email: req.body.email, pin: req.body.pin });
  if (!user) return res.status(401).json({ error: 'bad email or pin' });
  res.json({ message: `welcome ${user.name}`, role: user.role, id: user.id });
}));

// 4. Enumeration + no lockout
router.post('/login', asyncHandler(async (req, res) => {
  const user = await db.users.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!user) return res.status(404).json({ error: 'user not found' });
  if (!(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) {
    return res.status(401).json({ error: 'wrong password' });
  }
  res.json({ message: 'ok', token: jwt.sign({ sub: user.id, role: user.role }, WEAK_SECRET) });
}));

// 5. Weak JWT
router.get('/token', (req, res) => res.json({ token: jwt.sign({ sub: 'guest', role: 'guest' }, WEAK_SECRET) }));
router.get('/whoami', (req, res) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const p = jwt.verify(t, WEAK_SECRET);
    res.json({ claims: p, admin: p.role === 'admin', secret: p.role === 'admin' ? 'FLAG{weak_jwt_admin}' : undefined });
  } catch (e) { res.status(401).json({ error: e.message }); }
});

// 6. Reflected XSS
router.get('/search', (req, res) => {
  res.type('html').send(`<html><body><h1>Results for: ${req.query.q || ''}</h1></body></html>`);
});

// 7. Open redirect
router.get('/redirect', (req, res) => res.redirect(String(req.query.url || '/')));

// 8. Path traversal
router.get('/file', (req, res) => {
  const p = path.join(__dirname, '../../lab-files', String(req.query.name || 'readme.txt'));
  fs.readFile(p, 'utf8', (err, data) => (err ? res.status(404).send(err.message) : res.type('text').send(data)));
});

// 9. Info leaks
router.get('/error', (req, res, next) => next(new Error('Boom: DB connection string mongodb://root:toor@10.0.0.5')));
router.get('/debug', (req, res) => res.json({
  node: process.version, env: config.env, db: config.db.mode, cwd: process.cwd(),
  jwtAccessSecretPreview: config.jwt.accessSecret.slice(0, 6) + '...',
}));

// Vulnerable error handler (stack leak) sirf is router ke liye
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => res.status(500).json({ error: err.message, stack: err.stack }));

module.exports = router;
