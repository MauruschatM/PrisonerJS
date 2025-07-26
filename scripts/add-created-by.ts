import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_VwyKFjC4PBG7@ep-bold-butterfly-a2hnorga-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const db = drizzle(sql);

async function addCreatedByColumn() {
  try {
    // First get an existing user ID
    const result = await sql`SELECT id FROM users LIMIT 1`;
    if (result.length === 0) {
      throw new Error('No users found in the database');
    }
    const userId = result[0].id;

    // Add the column and update it before making it NOT NULL
    await sql`ALTER TABLE "tournament" ADD COLUMN IF NOT EXISTS "created_by" text`;
    await sql`UPDATE "tournament" SET "created_by" = ${userId}`;
    await sql`ALTER TABLE "tournament" ALTER COLUMN "created_by" SET NOT NULL`;
    await sql`ALTER TABLE "tournament" ADD CONSTRAINT tournament_created_by_fkey FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE`;
    console.log('Successfully added and populated created_by column');
    console.log('Successfully removed default value constraint');
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
  process.exit(0);
}

addCreatedByColumn();
