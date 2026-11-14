const bcrypt = require('bcryptjs');
const config = require('../config');
const db = require('../db');

const hashPassword = (p) => bcrypt.hash(p, config.bcryptRounds);

// Sequential id (1001, 1002...) jaan-boojhkar: IDOR/BOLA testing ke liye. Secure routes ko ise authz se rokna hai.
async function createUser({ name, email, password, role = 'client', tenantId, extra = {} }) {
  const id = String(1001 + (await db.users.count()));
  return db.users.create({
    id, name, email: email.toLowerCase(), passwordHash: await hashPassword(password),
    role, tenantId, status: 'active', bio: '', tokenVersion: 0,
    failedAttempts: 0, lockUntil: null, ...extra,
  });
}

module.exports = { createUser, hashPassword };
