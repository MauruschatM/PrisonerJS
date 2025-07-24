import {
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tournaments } from "./tournaments";
import { users } from "../auth";
import { strategies } from "./strategies";

export const tournamentParticipants = pgTable(
  "tournament_participant",
  {
    id: text().primaryKey(),
    tournamentId: text()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    strategyId: text()
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    totalScore: integer().default(0),
    wins: integer().default(0),
    losses: integer().default(0),
    draws: integer().default(0),
    averageScore: real().default(0),
    rank: integer(),
    createdAt: timestamp()
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    tournamentIdIdx: index("tournament_participant_tournament_id_idx").on(
      table.tournamentId
    ),
    strategyIdIdx: index("tournament_participant_strategy_id_idx").on(
      table.strategyId
    ),
    userIdIdx: index("tournament_participant_user_id_idx").on(table.userId),
  })
);
