const config = require('../config');

// Singleton: connect() isko fill karta hai, baaki modules `require('../db')` se use karte hain.
const db = {};

db.connect = async function connect() {
  const conn = config.db.mode === 'mongo'
    ? await require('./mongo')()
    : await require('./memory')();
  Object.assign(db, conn);
  return db;
};

module.exports = db;
