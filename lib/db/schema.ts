import {
  sqliteTable,
  text,
  integer,
  index,
  real,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  salt: text("salt"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// New Prisoner's Dilemma tables

export const strategy = sqliteTable(
  "strategy",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    code: text("code").notNull(), // JavaScript code for the strategy
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("strategy_user_id_idx").on(table.userId),
  })
);

export const tournament = sqliteTable("tournament", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  roundsPerMatch: integer("roundsPerMatch").notNull().default(200),
  scheduledAt: integer("scheduledAt", { mode: "timestamp" }),
  startedAt: integer("startedAt", { mode: "timestamp" }),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  errorMessage: text("errorMessage"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tournamentParticipant = sqliteTable(
  "tournament_participant",
  {
    id: text("id").primaryKey(),
    tournamentId: text("tournamentId")
      .notNull()
      .references(() => tournament.id, { onDelete: "cascade" }),
    strategyId: text("strategyId")
      .notNull()
      .references(() => strategy.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    totalScore: integer("totalScore").default(0),
    wins: integer("wins").default(0),
    losses: integer("losses").default(0),
    draws: integer("draws").default(0),
    averageScore: real("averageScore").default(0),
    rank: integer("rank"),
    createdAt: integer("createdAt", { mode: "timestamp" })
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

export const game = sqliteTable(
  "game",
  {
    id: text("id").primaryKey(),
    tournamentId: text("tournamentId")
      .notNull()
      .references(() => tournament.id, { onDelete: "cascade" }),
    strategy1Id: text("strategy1Id")
      .notNull()
      .references(() => strategy.id, { onDelete: "cascade" }),
    strategy2Id: text("strategy2Id")
      .notNull()
      .references(() => strategy.id, { onDelete: "cascade" }),
    user1Id: text("user1Id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    user2Id: text("user2Id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rounds: integer("rounds").notNull(),
    strategy1Score: integer("strategy1Score").notNull(),
    strategy2Score: integer("strategy2Score").notNull(),
    winner: text("winner"), // "strategy1", "strategy2", or "draw"
    moves: text("moves"), // JSON array of all moves
    errorMessage: text("errorMessage"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    tournamentIdIdx: index("game_tournament_id_idx").on(table.tournamentId),
    strategy1IdIdx: index("game_strategy1_id_idx").on(table.strategy1Id),
    strategy2IdIdx: index("game_strategy2_id_idx").on(table.strategy2Id),
  })
);

// Indexes for better performance
export const userEmailIndex = index("user_email_idx").on(user.email);
export const sessionUserIdIndex = index("session_userId_idx").on(
  session.userId
);
export const sessionTokenIndex = index("session_token_idx").on(session.token);
export const accountUserIdIndex = index("account_userId_idx").on(
  account.userId
);
export const verificationIdentifierIndex = index(
  "verification_identifier_idx"
).on(verification.identifier);
