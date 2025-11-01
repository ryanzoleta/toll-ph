import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/data/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PRISMA_POSTGRES_URL,
  },
} satisfies Config;
