# AlumniCo API Server (Prisma + Express)

Quickstart:

- Copy .env (already created) with DATABASE_URL and DIRECT_URL
- Install deps: from repo root run `npm install` then `npm --prefix server install`
- Generate client: `npm run server:migrate` (first-time will create migrations) or `npm --prefix server run prisma:generate`
- Seed DB: `npm run server:seed`
- Run dev server: `npm run server`

The frontend proxies `/api/*` to this server during `npm run dev:all`.
