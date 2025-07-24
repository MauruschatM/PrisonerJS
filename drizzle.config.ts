import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_VwyKFjC4PBG7@ep-bold-butterfly-a2hnorga-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
