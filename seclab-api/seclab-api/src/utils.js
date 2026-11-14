class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validate = (schema, src = 'body') => (req, res, next) => {
  const r = schema.safeParse(req[src]);
  if (!r.success) {
    return next(new HttpError(400, 'Validation failed',
      r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))));
  }
  req[src] = r.data;
  next();
};

const paginate = (q) => {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

const sanitizeUser = (u) => pick(u, ['id', 'name', 'email', 'role', 'tenantId', 'status', 'bio', 'createdAt']);
const publicUser = (u) => pick(u, ['id', 'name', 'bio', 'createdAt']);

module.exports = { HttpError, asyncHandler, validate, paginate, pick, sanitizeUser, publicUser };
