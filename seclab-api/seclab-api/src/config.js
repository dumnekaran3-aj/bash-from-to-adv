require('dotenv').config();

const need = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env var: ${k}`);
  return v;
};
const num = (k, d) => (process.env[k] !== undefined ? Number(process.env[k]) : d);
const bool = (k, d) => (process.env[k] !== undefined ? process.env[k] === 'true' : d);

const config = {
  port: num('PORT', 3000),
  host: process.env.HOST || '127.0.0.1',
  env: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  db: {
    mode: process.env.DB_MODE || 'memory',
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/seclab',
    seedOnBoot: bool('SEED_ON_BOOT', true),
  },
  jwt: {
    accessSecret: need('JWT_ACCESS_SECRET'),
    refreshSecret: need('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshDays: num('JWT_REFRESH_EXPIRES_DAYS', 7),
    issuer: process.env.JWT_ISSUER || 'seclab-api',
    audience: process.env.JWT_AUDIENCE || 'seclab-clients',
  },
  bcryptRounds: num('BCRYPT_SALT_ROUNDS', 12),
  rate: {
    enabled: bool('RATE_LIMIT_ENABLED', true),
    max: num('RATE_LIMIT_MAX', 300),
    authMax: num('AUTH_RATE_LIMIT_MAX', 20),
    maxFailed: num('MAX_FAILED_LOGINS', 5),
    lockoutMinutes: num('LOCKOUT_MINUTES', 15),
  },
  labMode: bool('LAB_MODE', false),
};

if (config.jwt.accessSecret.length < 32 || config.jwt.refreshSecret.length < 32) {
  throw new Error('JWT secrets must be at least 32 chars');
}
module.exports = config;
