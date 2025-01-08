import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import * as schema from './schema';

const connectionString = 'postgresql://neondb_owner:CR6pmJWu3DvU@ep-little-scene-a1vql8go-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Check if we have a connection string
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });