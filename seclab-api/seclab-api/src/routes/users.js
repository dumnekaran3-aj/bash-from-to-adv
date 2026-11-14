const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const { HttpError, asyncHandler, validate, paginate, sanitizeUser, publicUser } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const audit = require('../services/audit');

// PUBLIC: sirf safe fields
router.get('/public/user', asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  const users = (await db.users.find({ status: 'active' })).sort((a, b) => a.id.localeCompare(b.id));
  res.json({ page, limit, total: users.length, data: users.slice(skip, skip + limit).map(publicUser) });
}));

// AUTH: apni profile
router.get('/user', authenticate, (req, res) => res.json({ user: sanitizeUser(req.user) }));

// ADMIN: full user list (sanitized, no hashes)
router.get('/users', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  const filter = {};
  if (typeof req.query.role === 'string' && ['admin', 'client'].includes(req.query.role)) filter.role = req.query.role;
  const users = (await db.users.find(filter)).sort((a, b) => a.id.localeCompare(b.id));
  res.json({ page, limit, total: users.length, data: users.slice(skip, skip + limit).map(sanitizeUser) });
}));

// AUTH + owner-or-admin. Sirf name/bio badal sakte hain (role/email/tenant nahi)
const profileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(300).optional(),
}).strict();

router.post('/public/api/user/:id/profile', authenticate, validate(profileSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const target = await db.users.findOne({ id: String(id) });
  const isOwner = req.user.id === id;
  const isAdmin = req.user.role === 'admin';
  if (!target || (!isOwner && !isAdmin)) throw new HttpError(404, 'User not found'); // 404: existence leak nahi
  if (Object.keys(req.body).length === 0) throw new HttpError(400, 'Nothing to update');
  const updated = await db.users.updateOne({ id }, req.body);
  await audit(req, 'user.profile.update', { target: id });
  res.json({ user: sanitizeUser(updated) });
}));

module.exports = router;
