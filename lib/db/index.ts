import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("auth-drizzle.db");

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

export * from "./schema";
