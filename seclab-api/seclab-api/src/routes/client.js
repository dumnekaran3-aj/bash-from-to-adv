const router = require('express').Router();
const crypto = require('crypto');
const { z } = require('zod');
const db = require('../db');
const { HttpError, asyncHandler, validate, paginate, publicUser } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const { sha256 } = require('../services/tokens');
const audit = require('../services/audit');

router.use(authenticate, authorize('client', 'admin'));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const orders = await db.orders.find({ userId: req.user.id });
  const tenant = await db.tenants.findOne({ id: req.user.tenantId });
  res.json({
    tenant: tenant && { id: tenant.id, name: tenant.name, plan: tenant.plan },
    orders: orders.length,
    spent: orders.reduce((s, o) => s + o.total, 0),
  });
}));

// Same-tenant teammates (public fields only)
router.get('/team', asyncHandler(async (req, res) => {
  const mates = await db.users.find({ tenantId: req.user.tenantId, status: 'active' });
  res.json({ data: mates.map(publicUser) });
}));

// ---- orders: hamesha userId + tenantId se scoped ----
const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(64), qty: z.number().int().min(1).max(100) }).strict())
    .min(1).max(20),
}).strict(); // price client se nahi aata

router.get('/orders', asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  const o = await db.orders.find({ userId: req.user.id, tenantId: req.user.tenantId });
  res.json({ page, limit, total: o.length, data: o.slice(skip, skip + limit) });
}));

router.post('/orders', validate(orderSchema), asyncHandler(async (req, res) => {
  let total = 0;
  const items = [];
  for (const { productId, qty } of req.body.items) {
    const p = await db.products.findOne({ id: productId, visibility: 'public' });
    if (!p) throw new HttpError(400, `Unknown product: ${productId}`);
    if (p.stock < qty) throw new HttpError(409, `Insufficient stock: ${p.name}`);
    items.push({ productId, name: p.name, qty, unitPrice: p.price });
    total += p.price * qty;
  }
  for (const it of items) { // stock deduct
    const p = await db.products.findOne({ id: it.productId });
    await db.products.updateOne({ id: p.id }, { stock: p.stock - it.qty });
  }
  const order = await db.orders.create({
    userId: req.user.id, tenantId: req.user.tenantId, items, total: Math.round(total * 100) / 100, status: 'pending',
  });
  await audit(req, 'order.create', { id: order.id });
  res.status(201).json({ order });
}));

router.get('/orders/:id', asyncHandler(async (req, res) => {
  const o = await db.orders.findOne({ id: String(req.params.id), userId: req.user.id, tenantId: req.user.tenantId });
  if (!o) throw new HttpError(404, 'Order not found');
  res.json({ order: o });
}));

router.patch('/orders/:id/cancel', asyncHandler(async (req, res) => {
  const o = await db.orders.findOne({ id: String(req.params.id), userId: req.user.id, tenantId: req.user.tenantId });
  if (!o) throw new HttpError(404, 'Order not found');
  if (o.status !== 'pending') throw new HttpError(409, 'Only pending orders can be cancelled');
  res.json({ order: await db.orders.updateOne({ id: o.id }, { status: 'cancelled' }) });
}));

// ---- API keys (PaaS access) ----
const keySchema = z.object({
  name: z.string().trim().min(2).max(60),
  scopes: z.array(z.enum(['read', 'write'])).min(1).max(2),
  expiresInDays: z.number().int().min(1).max(365).optional(),
}).strict();

router.post('/api-keys', validate(keySchema), asyncHandler(async (req, res) => {
  if ((await db.apiKeys.count({ userId: req.user.id, revoked: false })) >= 5) throw new HttpError(409, 'API key limit reached');
  const raw = `sk_${crypto.randomBytes(24).toString('base64url')}`;
  const rec = await db.apiKeys.create({
    userId: req.user.id, tenantId: req.user.tenantId, name: req.body.name, scopes: [...new Set(req.body.scopes)],
    hash: sha256(raw), prefix: raw.slice(0, 7), revoked: false,
    expiresAt: req.body.expiresInDays ? new Date(Date.now() + req.body.expiresInDays * 864e5).toISOString() : null,
  });
  await audit(req, 'apikey.create', { id: rec.id });
  res.status(201).json({ id: rec.id, apiKey: raw, note: 'Store it now, it is shown only once' });
}));

router.get('/api-keys', asyncHandler(async (req, res) => {
  const keys = await db.apiKeys.find({ userId: req.user.id });
  res.json({ data: keys.map(({ hash, ...k }) => k) });
}));

router.delete('/api-keys/:id', asyncHandler(async (req, res) => {
  const k = await db.apiKeys.updateOne({ id: String(req.params.id), userId: req.user.id }, { revoked: true });
  if (!k) throw new HttpError(404, 'API key not found');
  await audit(req, 'apikey.revoke', { id: k.id });
  res.status(204).end();
}));

module.exports = router;
