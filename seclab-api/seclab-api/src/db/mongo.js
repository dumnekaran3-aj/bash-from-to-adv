const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const config = require('../config');

class MongoCollection {
  constructor(col) { this.col = col; }
  async create(doc) {
    const d = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc };
    await this.col.insertOne({ ...d });
    return d;
  }
  find(filter = {}) { return this.col.find(filter, { projection: { _id: 0 } }).toArray(); }
  findOne(filter = {}) { return this.col.findOne(filter, { projection: { _id: 0 } }); }
  count(filter = {}) { return this.col.countDocuments(filter); }
  async updateOne(filter, patch) {
    return this.col.findOneAndUpdate(
      filter,
      { $set: { ...patch, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
  }
  async deleteOne(filter) { return (await this.col.deleteOne(filter)).deletedCount > 0; }
  async deleteMany(filter = {}) { return (await this.col.deleteMany(filter)).deletedCount; }
}

module.exports = async function connectMongo() {
  const client = new MongoClient(config.db.uri, { serverSelectionTimeoutMS: 4000 });
  await client.connect();
  const mdb = client.db();
  const names = ['users', 'tenants', 'products', 'orders', 'records', 'refreshTokens', 'apiKeys', 'auditLogs'];
  const db = {};
  names.forEach((n) => { db[n] = new MongoCollection(mdb.collection(n)); });
  await mdb.collection('users').createIndex({ email: 1 }, { unique: true });
  await mdb.collection('users').createIndex({ id: 1 }, { unique: true });
  await mdb.collection('refreshTokens').createIndex({ hash: 1 });
  await mdb.collection('apiKeys').createIndex({ hash: 1 });
  db.close = () => client.close();
  return db;
};
