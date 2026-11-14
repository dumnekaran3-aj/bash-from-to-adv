const crypto = require('crypto');

// Minimal Mongo-style matcher (equality + few operators) so lab NoSQLi tests work in memory mode too.
function match(doc, filter) {
  return Object.entries(filter).every(([k, cond]) => {
    const v = doc[k];
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      return Object.entries(cond).every(([op, arg]) => {
        switch (op) {
          case '$ne': return arg === null ? v != null : v !== arg;
          case '$gt': return v > arg;
          case '$gte': return v >= arg;
          case '$lt': return v < arg;
          case '$lte': return v <= arg;
          case '$in': return Array.isArray(arg) && arg.includes(v);
          case '$nin': return Array.isArray(arg) && !arg.includes(v);
          case '$exists': return (v !== undefined) === !!arg;
          case '$regex': return new RegExp(arg).test(String(v));
          default: return false;
        }
      });
    }
    return v === cond;
  });
}

class MemCollection {
  constructor() { this.docs = []; }
  async create(doc) {
    const d = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc };
    this.docs.push(d);
    return structuredClone(d);
  }
  async find(filter = {}) { return this.docs.filter((d) => match(d, filter)).map((d) => structuredClone(d)); }
  async findOne(filter = {}) {
    const d = this.docs.find((x) => match(x, filter));
    return d ? structuredClone(d) : null;
  }
  async count(filter = {}) { return this.docs.filter((d) => match(d, filter)).length; }
  async updateOne(filter, patch) {
    const d = this.docs.find((x) => match(x, filter));
    if (!d) return null;
    Object.assign(d, patch, { updatedAt: new Date().toISOString() });
    return structuredClone(d);
  }
  async deleteOne(filter) {
    const i = this.docs.findIndex((x) => match(x, filter));
    if (i === -1) return false;
    this.docs.splice(i, 1);
    return true;
  }
  async deleteMany(filter = {}) {
    const before = this.docs.length;
    this.docs = this.docs.filter((d) => !match(d, filter));
    return before - this.docs.length;
  }
}

module.exports = async function connectMemory() {
  const names = ['users', 'tenants', 'products', 'orders', 'records', 'refreshTokens', 'apiKeys', 'auditLogs'];
  const db = {};
  names.forEach((n) => { db[n] = new MemCollection(); });
  db.close = async () => {};
  return db;
};
