const router = require('express').Router();
const db = require('../db');
const { HttpError, asyncHandler, paginate, pick } = require('../utils');

const publicProduct = (p) => pick(p, ['id', 'name', 'description', 'price', 'stock', 'createdAt']);

router.get('/', asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query);
  let items = await db.products.find({ visibility: 'public' });
  if (typeof req.query.q === 'string' && req.query.q) {
    const q = req.query.q.toLowerCase().slice(0, 50);
    items = items.filter((p) => p.name.toLowerCase().includes(q)); // string includes: regex injection nahi
  }
  res.json({ page, limit, total: items.length, data: items.slice(skip, skip + limit).map(publicProduct) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const p = await db.products.findOne({ id: String(req.params.id), visibility: 'public' });
  if (!p) throw new HttpError(404, 'Product not found');
  res.json({ product: publicProduct(p) });
}));

module.exports = router;
