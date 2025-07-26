import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../auth";

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
  created_by: text().notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp()
    .notNull()
    .$defaultFn(() => new Date()),
});
