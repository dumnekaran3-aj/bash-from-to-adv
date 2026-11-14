const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const config = require('../config');
const db = require('../db');
const { HttpError, asyncHandler, validate, sanitizeUser } = require('../utils');
const { authenticate } = require('../middleware/auth');
const tokens = require('../services/tokens');
const audit = require('../services/audit');
const { createUser, hashPassword } = require('../services/users');

const DUMMY_HASH = bcrypt.hashSync('dummy-password', config.bcryptRounds); // timing equalizer

const password = z.string().min(8).max(72)
  .regex(/[a-z]/, 'needs lowercase').regex(/[A-Z]/, 'needs uppercase').regex(/\d/, 'needs digit');
const email = z.string().trim().toLowerCase().email().max(254);

const signupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email,
  password,
  organization: z.string().trim().min(2).max(80).optional(),
}); // role/tenantId jaisi extra fields zod strip kar deta hai (mass assignment safe)

const signinSchema = z.object({ email, password: z.string().min(1).max(72) });
const refreshSchema = z.object({ refreshToken: z.string().min(20).max(200) });
const changePwSchema = z.object({ currentPassword: z.string().min(1).max(72), newPassword: password });

const signup = asyncHandler(async (req, res) => {
  const { name, email: em, password: pw, organization } = req.body;
  if (await db.users.findOne({ email: em })) throw new HttpError(409, 'Email already registered');
  const tenant = await db.tenants.create({ name: organization || `${name}'s workspace`, plan: 'free' });
  const user = await createUser({ name, email: em, password: pw, role: 'client', tenantId: tenant.id });
  await audit({ ...req, user }, 'auth.signup');
  res.status(201).json({ user: sanitizeUser(user), ...(await tokens.issuePair(user)) });
});

const signin = asyncHandler(async (req, res) => {
  const { email: em, password: pw } = req.body;
  const user = await db.users.findOne({ email: em });
  if (user?.lockUntil && new Date(user.lockUntil) > new Date()) {
    throw new HttpError(429, 'Account temporarily locked. Try later.');
  }
  const ok = await bcrypt.compare(pw, user ? user.passwordHash : DUMMY_HASH); // hamesha compare chalta hai
  if (!user || !ok) {
    if (user) {
      const failed = (user.failedAttempts || 0) + 1;
      const lock = failed >= config.rate.maxFailed
        ? new Date(Date.now() + config.rate.lockoutMinutes * 60000).toISOString() : null;
      await db.users.updateOne({ id: user.id }, { failedAttempts: lock ? 0 : failed, lockUntil: lock });
      await audit({ ...req, user }, 'auth.signin.failed');
    }
    throw new HttpError(401, 'Invalid credentials'); // enumeration-safe generic message
  }
  if (user.status !== 'active') throw new HttpError(403, 'Account disabled');
  await db.users.updateOne({ id: user.id }, { failedAttempts: 0, lockUntil: null });
  await audit({ ...req, user }, 'auth.signin');
  res.json({ user: sanitizeUser(user), ...(await tokens.issuePair(user)) });
});

router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);

router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
  const { user, pair } = await tokens.rotate(req.body.refreshToken);
  res.json({ user: sanitizeUser(user), ...pair });
}));

router.post('/logout', validate(refreshSchema), asyncHandler(async (req, res) => {
  await tokens.revokeByRaw(req.body.refreshToken);
  res.json({ message: 'Logged out' });
}));

router.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  await tokens.revokeAllForUser(req.user.id);
  await db.users.updateOne({ id: req.user.id }, { tokenVersion: req.user.tokenVersion + 1 });
  await audit(req, 'auth.logout_all');
  res.json({ message: 'All sessions revoked' });
}));

router.post('/change-password', authenticate, validate(changePwSchema), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!(await bcrypt.compare(currentPassword, req.user.passwordHash))) throw new HttpError(401, 'Invalid credentials');
  const updated = await db.users.updateOne({ id: req.user.id }, {
    passwordHash: await hashPassword(newPassword), tokenVersion: req.user.tokenVersion + 1,
  });
  await tokens.revokeAllForUser(req.user.id);
  await audit(req, 'auth.change_password');
  res.json({ message: 'Password changed', ...(await tokens.issuePair(updated)) });
}));

module.exports = { router, signup, signin, signupSchema, signinSchema };
