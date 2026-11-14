const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const db = require('./db');
const { notFound, errorHandler } = require('./middleware/errors');
const { authenticate, authorize } = require('./middleware/auth');

const auth = require('./routes/auth');
const users = require('./routes/users');
const products = require('./routes/products');
const admin = require('./routes/admin');
const client = require('./routes/client');
const paas = require('./routes/paas');
const lab = require('./routes/lab');
const { validate } = require('./utils');

function buildApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }));
  app.use(express.json({ limit: '10kb' }));
  if (config.env !== 'test') app.use(morgan('dev'));

  const limiter = (max) => rateLimit({
    windowMs: 15 * 60 * 1000, max, standardHeaders: true, legacyHeaders: false,
    skip: () => !config.rate.enabled, message: { error: 'Too many requests' },
  });
  app.use('/api', limiter(config.rate.max));

  app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', mode: config.db.mode, uptime: Math.round(process.uptime()), time: new Date().toISOString() }));
  app.get('/', (req, res) => res.redirect('/api/health'));

  // Auth (strict limiter)
  app.post('/api/signup', limiter(config.rate.authMax), validate(auth.signupSchema), auth.signup);
  app.use('/api/auth', limiter(config.rate.authMax), auth.router);

  // Users / public / profile
  app.use('/api', users);

  // Admin area (+ odd path jo tumne diya tha)
  app.use('/api/admin', admin.router); // Express path case-insensitive: /api/Admin/dashboard bhi chalega
  app.post('/api/public/api/admin/dashboard', ...admin.adminOnly, admin.dashboard);

  // Client area, products, PaaS
  app.use('/api/client', client);
  app.use('/api/products', products);
  app.use('/api/paas', paas);

  // Lab (vulnerable) - sirf LAB_MODE
  if (config.labMode) {
    app.use('/api/lab', lab);
    app.use('/api/test/v1', lab);
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = buildApp;
