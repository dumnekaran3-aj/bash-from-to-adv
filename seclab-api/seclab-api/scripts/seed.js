// Usage: npm run seed            (mongo mode: DB_MODE=mongo in .env)
//        node scripts/seed.js --reset
const config = require('../src/config');
const db = require('../src/db');
const seed = require('../src/seed');

(async () => {
  if (config.db.mode !== 'mongo') {
    console.log('DB_MODE=memory: in-memory data process ke saath khatam ho jata hai.');
    console.log('Server boot pe auto-seed hota hai (SEED_ON_BOOT=true). Persistent data ke liye .env me DB_MODE=mongo karo.');
    return;
  }
  await db.connect();
  await seed({ reset: process.argv.includes('--reset') });
  await db.close();
})().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
