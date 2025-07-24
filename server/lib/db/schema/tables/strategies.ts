import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../auth";

export const strategies = pgTable(
  "strategies",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    description: text(),
    code: text().notNull(), // JavaScript code for the strategy
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp()
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp()
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("strategy_user_id_idx").on(table.userId),
  })
);
