const db = require('../db');

module.exports = async function audit(req, action, meta = {}) {
  try {
    await db.auditLogs.create({
      actorId: req.user?.id || null,
      action,
      ip: req.ip,
      ua: (req.headers['user-agent'] || '').slice(0, 200),
      meta,
    });
  } catch { /* audit failure request ko na tode */ }
};
