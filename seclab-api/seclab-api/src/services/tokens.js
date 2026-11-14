const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { HttpError } = require('../utils');

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, tid: user.tenantId, tv: user.tokenVersion },
    config.jwt.accessSecret,
    { algorithm: 'HS256', expiresIn: config.jwt.accessExpires, issuer: config.jwt.issuer, audience: config.jwt.audience }
  );
}

function verifyAccess(token) {
  return jwt.verify(token, config.jwt.accessSecret, {
    algorithms: ['HS256'], issuer: config.jwt.issuer, audience: config.jwt.audience,
  });
}

async function issueRefresh(user, family) {
  const raw = crypto.randomBytes(48).toString('base64url');
  await db.refreshTokens.create({
    userId: user.id,
    hash: sha256(raw),
    family: family || crypto.randomUUID(),
    revoked: false,
    expiresAt: new Date(Date.now() + config.jwt.refreshDays * 864e5).toISOString(),
  });
  return raw;
}

async function issuePair(user, family) {
  return {
    accessToken: signAccess(user),
    refreshToken: await issueRefresh(user, family),
    tokenType: 'Bearer',
    expiresIn: config.jwt.accessExpires,
  };
}

async function revokeWhere(filter) {
  let t;
  while ((t = await db.refreshTokens.findOne({ ...filter, revoked: false }))) {
    await db.refreshTokens.updateOne({ id: t.id }, { revoked: true });
  }
}

// Rotation + reuse detection
async function rotate(rawToken) {
  const rec = await db.refreshTokens.findOne({ hash: sha256(rawToken) });
  if (!rec) throw new HttpError(401, 'Invalid refresh token');
  if (rec.revoked) {
    await revokeWhere({ family: rec.family }); // reuse -> poori family kill
    throw new HttpError(401, 'Refresh token reuse detected');
  }
  if (new Date(rec.expiresAt) < new Date()) throw new HttpError(401, 'Refresh token expired');
  const user = await db.users.findOne({ id: rec.userId });
  if (!user || user.status !== 'active') throw new HttpError(401, 'Invalid refresh token');
  await db.refreshTokens.updateOne({ id: rec.id }, { revoked: true });
  return { user, pair: await issuePair(user, rec.family) };
}

const revokeAllForUser = (userId) => revokeWhere({ userId });

async function revokeByRaw(raw) {
  const rec = await db.refreshTokens.findOne({ hash: sha256(raw) });
  if (rec) await db.refreshTokens.updateOne({ id: rec.id }, { revoked: true });
}

module.exports = { sha256, signAccess, verifyAccess, issuePair, rotate, revokeAllForUser, revokeByRaw };
