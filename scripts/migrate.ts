import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import "dotenv/config";

const sql = neon("postgresql://neondb_owner:npg_VwyKFjC4PBG7@ep-bold-butterfly-a2hnorga-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const db = drizzle(sql);

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
  process.exit(0);
}

runMigrations();
