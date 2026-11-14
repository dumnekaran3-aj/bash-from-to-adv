const db = require('../db');
const { HttpError, asyncHandler } = require('../utils');
const { verifyAccess, sha256 } = require('../services/tokens');

// JWT bearer: token valid + user exist + active + tokenVersion match
const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');
  let payload;
  try { payload = verifyAccess(token); } catch { throw new HttpError(401, 'Invalid or expired token'); }
  const user = await db.users.findOne({ id: String(payload.sub) });
  if (!user || user.status !== 'active' || user.tokenVersion !== payload.tv) {
    throw new HttpError(401, 'Invalid or expired token');
  }
  req.user = user;
  next();
});

// Role DB se aata hai, token claim pe trust nahi
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new HttpError(403, 'Forbidden'));

// API key auth (PaaS side)
const apiKeyAuth = (scope) => asyncHandler(async (req, res, next) => {
  const raw = req.headers['x-api-key'];
  if (typeof raw !== 'string' || !raw.startsWith('sk_')) throw new HttpError(401, 'API key required');
  const key = await db.apiKeys.findOne({ hash: sha256(raw) });
  if (!key || key.revoked) throw new HttpError(401, 'Invalid API key');
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) throw new HttpError(401, 'API key expired');
  if (scope && !key.scopes.includes(scope)) throw new HttpError(403, `Missing scope: ${scope}`);
  const owner = await db.users.findOne({ id: key.userId });
  if (!owner || owner.status !== 'active') throw new HttpError(401, 'Invalid API key');
  req.apiKey = key;
  req.tenantId = key.tenantId;
  next();
});

module.exports = { authenticate, authorize, apiKeyAuth };
