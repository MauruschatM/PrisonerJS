import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { tournaments } from "./tournaments";
import { strategies } from "./strategies";
import { users } from "../auth";

export const games = pgTable(
  "game",
  {
    id: text().primaryKey(),
    tournamentId: text()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    strategy1Id: text()
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    strategy2Id: text()
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    user1Id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    user2Id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rounds: integer().notNull(),
    strategy1Score: integer().notNull(),
    strategy2Score: integer().notNull(),
    winner: text(), // "strategy1", "strategy2", or "draw"
    moves: text(), // JSON array of all moves
    errorMessage: text(),
    createdAt: timestamp()
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    tournamentIdIdx: index("game_tournament_id_idx").on(table.tournamentId),
    strategy1IdIdx: index("game_strategy1_id_idx").on(table.strategy1Id),
    strategy2IdIdx: index("game_strategy2_id_idx").on(table.strategy2Id),
  })
);
