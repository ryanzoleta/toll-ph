import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

export const connection = new pg.Pool({
  connectionString: process.env.PRISMA_POSTGRES_URL,
});

export const db = drizzle(connection, { schema });
