# seclab-api

Local security practice lab. Do hisse:

1. **Secure API** (SaaS + PaaS): tumhari offensive scripts isse *todne mein fail* honi chahiye.
2. **Vulnerable targets** (`/api/test/v1/*`, `/api/lab`): jaan-boojhkar kamzor, scripts ko ye *dhoondhne* chahiye.

Vulnerable routes sirf `LAB_MODE=true` + loopback (127.0.0.1) request pe chalte hain. Server default HOST=127.0.0.1 pe bind hota hai. Ise kabhi public network pe expose mat karna.

## Run
```bash
npm install
npm start              # DB_MODE=memory: auto seed, restart pe reset
bash test/smoke.sh     # 12 quick checks (server chalte hue)
```
MongoDB mode: `.env` me `DB_MODE=mongo`, `mongod` chalao, phir `npm run seed` (`node scripts/seed.js --reset` for fresh).

## Seed users
| email | password | role | tenant |
|---|---|---|---|
| admin@lab.local | Admin@12345 | admin | Platform |
| alice@acme.test | Alice@12345 | client | Acme |
| bob@acme.test | Bob@12345 | client | Acme |
| carol@globex.test | Carol@12345 | client | Globex |

User ids sequential (1001..) jaan-boojhkar, taaki IDOR enumeration test ho sake. Secure routes ownership check se rokte hain.

## Endpoints
**Public:** GET /api/health, /api/public/user, /api/products, /api/products/:id, POST /api/signup, /api/auth/signin, /auth/refresh, /auth/logout
**Auth:** GET /api/user, POST /api/auth/logout-all, /auth/change-password, POST /api/public/api/user/:id/profile (owner/admin, sirf name+bio)
**Client area:** /api/client/dashboard, /team, /orders (GET/POST), /orders/:id, /orders/:id/cancel (PATCH), /api-keys (GET/POST/DELETE)
**Admin area:** GET /api/users, GET /api/Admin/dashboard, POST /api/public/api/admin/dashboard, /api/admin/users/:id/role|status (PATCH), DELETE users/:id, /admin/products CRUD, /admin/orders, /admin/tenants, /admin/audit-logs
**PaaS (x-api-key):** /api/paas/v1/whoami, /records (GET/POST), /records/:id (GET/DELETE). Tenant-isolated, scope read/write.
**Lab (vulnerable):** GET /api/lab (index + checklist), /api/test/v1/user/:id (GET/PUT), POST /legacy-login, POST /login, GET /token, /whoami, /search?q=, /redirect?url=, /file?name=, /error, /debug

## Security controls (secure side)
bcrypt (rounds from env) + timing-equalized login, generic error, lockout, JWT HS256 pinned + iss/aud + tokenVersion, refresh rotation + reuse detection, role from DB (not token), zod strict validation (no mass assignment, no operator injection), server-side price calc, tenant + owner scoped queries (404 not 403), hashed API keys shown once, helmet, CORS allowlist, rate limits, 10kb body limit, audit log, no stack traces.

## Tips for your scripts
- Rate limit bruteforce ko rokta hai. Testing ke liye `.env` me `RATE_LIMIT_ENABLED=false` aur `MAX_FAILED_LOGINS=1000`.
- Weak JWT secret for lab token: wordlist se crackable (`secret123`).
- Memory mode me restart karte hi data reset: destructive tests ke baad bas restart.
