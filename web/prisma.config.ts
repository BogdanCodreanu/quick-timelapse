import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// A prisma.config.ts disables Prisma's automatic .env loading, so load it here.
// Next.js stores secrets in .env.local; load that first, then .env as fallback.
loadEnv({ path: '.env.local' });
loadEnv();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Migrations/introspection use the DIRECT (non-pooled) Neon connection.
  // The runtime client connects via @prisma/adapter-neon (pooled DATABASE_URL).
  // Use process.env (not Prisma's throwing env()) so `prisma generate` still
  // works on a fresh clone without env vars (e.g. in postinstall).
  datasource: { url: process.env.DIRECT_URL },
});
