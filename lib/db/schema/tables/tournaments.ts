import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const tournaments = pgTable("tournament", {
  id: text().primaryKey(),
  name: text().notNull(),
  description: text(),
  status: text().notNull().default("pending"), // pending, running, completed, failed
  roundsPerMatch: integer().notNull().default(200),
  scheduledAt: timestamp(),
  startedAt: timestamp(),
  completedAt: timestamp(),
  errorMessage: text(),
  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp()
    .notNull()
    .$defaultFn(() => new Date()),
});
