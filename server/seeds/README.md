# Server Seed Data

This directory is the preferred home for seed data used by Prisma.

- Place a `db.json` here to seed the database without relying on the legacy `mock-server` folder.
- You can also set an absolute or relative path via the `SEED_FILE` environment variable when running the seed script.

Examples:

- Using default path:
  - server/seeds/db.json

- Using environment variable (Windows bash):
  - `SEED_FILE=./server/seeds/db.json npm run server:seed`

The seed script will still fall back to `mock-server/db.json` if present, but that path is deprecated and may be removed later.
