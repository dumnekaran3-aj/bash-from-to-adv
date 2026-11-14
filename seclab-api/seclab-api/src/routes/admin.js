const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const { HttpError, asyncHandler, validate, paginate, sanitizeUser } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const tokens = require('../services/tokens');
const audit = require('../services/audit');

const adminOnly = [authenticate, authorize('admin')];

const dashboard = asyncHandler(async (req, res) => {
  const range = req.body?.range || req.query.range || 'all';
  const days = { '7d': 7, '30d': 30 }[range];
  const since = days ? new Date(Date.now() - days * 864e5).toISOString() : null;
  const inRange = (x) => !since || x.createdAt >= since;
  const [users, orders, products, tenants, logs] = await Promise.all([
    db.users.find(), db.orders.find(), db.products.find(), db.tenants.find(), db.auditLogs.find(),
  ]);
  res.json({
    range,
    stats: {
      users: users.filter(inRange).length,
      admins: users.filter((u) => u.role === 'admin').length,
      tenants: tenants.length,
      products: products.length,
      orders: orders.filter(inRange).length,
      revenue: orders.filter(inRange).reduce((s, o) => s + o.total, 0),
    },
    recentAudit: logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
  });
});

router.get('/dashboard', ...adminOnly, dashboard);

// ---- users ----
router.patch('/users/:id/role', ...adminOnly, validate(z.object({ role: z.enum(['admin', 'client']) }).strict()),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id) throw new HttpError(400, 'Cannot change your own role');
    const u = await db.users.updateOne({ id: String(req.params.id) }, { role: req.body.role });
    if (!u) throw new HttpError(404, 'User not found');
    await db.users.updateOne({ id: u.id }, { tokenVersion: u.tokenVersion + 1 }); // purane tokens invalid
    await audit(req, 'admin.user.role', { target: u.id, role: req.body.role });
    res.json({ user: sanitizeUser(u) });
  }));

router.patch('/users/:id/status', ...adminOnly, validate(z.object({ status: z.enum(['active', 'disabled']) }).strict()),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id) throw new HttpError(400, 'Cannot disable yourself');
    const u = await db.users.updateOne({ id: String(req.params.id) }, { status: req.body.status });
    if (!u) throw new HttpError(404, 'User not found');
    if (req.body.status === 'disabled') await tokens.revokeAllForUser(u.id);
    await audit(req, 'admin.user.status', { target: u.id, status: req.body.status });
    res.json({ user: sanitizeUser(u) });
  }));

router.delete('/users/:id', ...adminOnly, asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new HttpError(400, 'Cannot delete yourself');
  if (!(await db.users.deleteOne({ id: String(req.params.id) }))) throw new HttpError(404, 'User not found');
  await tokens.revokeAllForUser(req.params.id);
  await audit(req, 'admin.user.delete', { target: req.params.id });
  res.status(204).end();
}));

// ---- products ----
const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).default(''),
  price: z.number().positive().max(1e7),
  stock: z.number().int().min(0).max(1e6).default(0),
  visibility: z.enum(['public', 'private']).default('public'),
}).strict();

router.get('/products', ...adminOnly, asyncHandler(async (req, res) => {
  res.json({ data: await db.products.find() }); // admin ko private bhi dikhte hain
}));
router.post('/products', ...adminOnly, validate(productSchema), asyncHandler(async (req, res) => {
  const p = await db.products.create(req.body);
  await audit(req, 'admin.product.create', { id: p.id });
  res.status(201).json({ product: p });
}));
router.put('/products/:id', ...adminOnly, validate(productSchema), asyncHandler(async (req, res) => {
  const p = await db.products.updateOne({ id: String(req.params.id) }, req.body);
  if (!p) throw new HttpError(404, 'Product not found');
  await audit(req, 'admin.product.update', { id: p.id });
  res.json({ product: p });
}));
router.delete('/products/:id', ...adminOnly, asyncHandler(async (req, res) => {
  if (!(await db.products.deleteOne({ id: String(req.params.id) }))) throw new HttpError(404, 'Product not found');
  await audit(req, 'admin.product.delete', { id: req.params.id });
  res.status(204).end();
}));

// ---- orders / tenants / audit ----
router.get('/orders', ...adminOnly, asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  const o = await db.orders.find();
  res.json({ page, limit, total: o.length, data: o.slice(skip, skip + limit) });
}));
router.get('/tenants', ...adminOnly, asyncHandler(async (req, res) => res.json({ data: await db.tenants.find() })));
router.get('/audit-logs', ...adminOnly, asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  const logs = (await db.auditLogs.find()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ page, limit, total: logs.length, data: logs.slice(skip, skip + limit) });
}));

module.exports = { router, dashboard, adminOnly };
