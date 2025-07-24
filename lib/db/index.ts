import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const db = drizzle(
  "postgresql://neondb_owner:npg_VwyKFjC4PBG7@ep-bold-butterfly-a2hnorga-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  { schema }
);

export default db;
