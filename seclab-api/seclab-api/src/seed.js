const db = require('./db');
const { createUser } = require('./services/users');

// Idempotent: users already hain to skip
async function seed({ reset = false, log = console.log } = {}) {
  if (reset) {
    for (const n of ['users', 'tenants', 'products', 'orders', 'records', 'refreshTokens', 'apiKeys', 'auditLogs']) {
      await db[n].deleteMany({});
    }
  }
  if (await db.users.count()) { log('[seed] data already present, skipping (use --reset)'); return; }

  const acme = await db.tenants.create({ name: 'Acme Corp', plan: 'pro' });
  const globex = await db.tenants.create({ name: 'Globex Inc', plan: 'free' });
  const root = await db.tenants.create({ name: 'Platform', plan: 'internal' });

  const admin = await createUser({ name: 'Super Admin', email: 'admin@lab.local', password: 'Admin@12345', role: 'admin', tenantId: root.id,
    extra: { pin: '1234', internalNotes: 'Has access to everything', apiSecret: 'adm_live_9f8e7d6c5b4a' } });
  const alice = await createUser({ name: 'Alice', email: 'alice@acme.test', password: 'Alice@12345', tenantId: acme.id,
    extra: { pin: '1111', internalNotes: 'VIP customer' } });
  const bob = await createUser({ name: 'Bob', email: 'bob@acme.test', password: 'Bob@12345', tenantId: acme.id, extra: { pin: '2222' } });
  const carol = await createUser({ name: 'Carol', email: 'carol@globex.test', password: 'Carol@12345', tenantId: globex.id, extra: { pin: '3333' } });

  const prods = [];
  for (const p of [
    ['Basic Plan', 'Starter SaaS subscription', 9.99, 1000, 'public'],
    ['Pro Plan', 'Advanced SaaS subscription', 29.99, 500, 'public'],
    ['API Credits 10k', 'PaaS API credits pack', 49, 200, 'public'],
    ['Dedicated Server', 'Single-tenant hosting', 299, 10, 'public'],
    ['Internal Audit Pack', 'Internal only item', 1, 1, 'private'],
  ]) prods.push(await db.products.create({ name: p[0], description: p[1], price: p[2], stock: p[3], visibility: p[4] }));

  const mk = (u, p, qty) => db.orders.create({
    userId: u.id, tenantId: u.tenantId, status: 'pending', total: p.price * qty,
    items: [{ productId: p.id, name: p.name, qty, unitPrice: p.price }],
  });
  await mk(alice, prods[1], 1); await mk(alice, prods[2], 2); await mk(bob, prods[0], 3); await mk(carol, prods[3], 1);

  await db.records.create({ tenantId: acme.id, key: 'acme_config', value: '{"theme":"dark"}' });
  await db.records.create({ tenantId: acme.id, key: 'acme_secret_note', value: 'acme-only-data' });
  await db.records.create({ tenantId: globex.id, key: 'globex_config', value: '{"theme":"light"}' });
  await db.records.create({ tenantId: globex.id, key: 'globex_secret_note', value: 'globex-only-data' });

  log('[seed] done. users: admin@lab.local/Admin@12345, alice@acme.test/Alice@12345, bob@acme.test/Bob@12345, carol@globex.test/Carol@12345');
  return { admin, alice, bob, carol };
}

module.exports = seed;
