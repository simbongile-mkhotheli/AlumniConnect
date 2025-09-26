# Server Seed Data

This directory is the preferred home for seed data used by Prisma.

- Place a `db.json` here to seed the database.
- You can also set an absolute or relative path via the `SEED_FILE` environment variable when running the seed script.

Examples:

- Using default path:
  - server/seeds/db.json

- Using environment variable (Windows bash):
  - `SEED_FILE=./server/seeds/db.json npm run server:seed`

The seed script prioritizes seed files in this order: SEED_FILE env var, then server/seeds/db.json.
