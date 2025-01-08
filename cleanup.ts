import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:CR6pmJWu3DvU@ep-little-scene-a1vql8go-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function cleanup() {
  try {
    // Drop all tables if they exist
    await sql`
      DROP TABLE IF EXISTS 
        "account",
        "sessions",
        "user",
        "verificationToken",
        "medications",
        "cognitive_assessments",
        "bowel_movements",
        "body_changes",
        "cycle_entries" CASCADE;
    `;
    
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
}

cleanup();