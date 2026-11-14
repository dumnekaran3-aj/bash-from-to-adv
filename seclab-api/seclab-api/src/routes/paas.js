const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const { HttpError, asyncHandler, validate, paginate } = require('../utils');
const { apiKeyAuth } = require('../middleware/auth');

// PaaS side: x-api-key header, tenant-scoped data
router.get('/v1/whoami', apiKeyAuth(), (req, res) =>
  res.json({ tenantId: req.tenantId, keyId: req.apiKey.id, scopes: req.apiKey.scopes }));

router.get('/v1/records', apiKeyAuth('read'), asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  const r = await db.records.find({ tenantId: req.tenantId });
  res.json({ page, limit, total: r.length, data: r.slice(skip, skip + limit) });
}));

router.post('/v1/records', apiKeyAuth('write'),
  validate(z.object({ key: z.string().trim().min(1).max(80), value: z.string().max(2000) }).strict()),
  asyncHandler(async (req, res) => {
    res.status(201).json({ record: await db.records.create({ tenantId: req.tenantId, ...req.body }) });
  }));

router.get('/v1/records/:id', apiKeyAuth('read'), asyncHandler(async (req, res) => {
  const r = await db.records.findOne({ id: String(req.params.id), tenantId: req.tenantId });
  if (!r) throw new HttpError(404, 'Record not found');
  res.json({ record: r });
}));

router.delete('/v1/records/:id', apiKeyAuth('write'), asyncHandler(async (req, res) => {
  if (!(await db.records.deleteOne({ id: String(req.params.id), tenantId: req.tenantId }))) throw new HttpError(404, 'Record not found');
  res.status(204).end();
}));

module.exports = router;
