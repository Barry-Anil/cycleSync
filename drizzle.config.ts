import { defineConfig } from "drizzle-kit";


const dbUrl =  'postgresql://neondb_owner:CR6pmJWu3DvU@ep-little-scene-a1vql8go-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:CR6pmJWu3DvU@ep-little-scene-a1vql8go-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  verbose: true,
  strict: true,
});
