CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"code" text NOT NULL,
	"userId" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"roundsPerMatch" integer DEFAULT 200 NOT NULL,
	"scheduledAt" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"errorMessage" text,
	"createdBy" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"tournamentId" text NOT NULL,
	"strategyId" text NOT NULL,
	"userId" text NOT NULL,
	"totalScore" integer DEFAULT 0,
	"wins" integer DEFAULT 0,
	"losses" integer DEFAULT 0,
	"draws" integer DEFAULT 0,
	"averageScore" real DEFAULT 0,
	"rank" integer,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" text PRIMARY KEY NOT NULL,
	"tournamentId" text NOT NULL,
	"strategy1Id" text NOT NULL,
	"strategy2Id" text NOT NULL,
	"user1Id" text NOT NULL,
	"user2Id" text NOT NULL,
	"rounds" integer NOT NULL,
	"strategy1Score" integer NOT NULL,
	"strategy2Score" integer NOT NULL,
	"winner" text,
	"moves" text,
	"errorMessage" text,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_tournamentId_tournament_id_fk" FOREIGN KEY ("tournamentId") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_strategyId_strategies_id_fk" FOREIGN KEY ("strategyId") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_tournamentId_tournament_id_fk" FOREIGN KEY ("tournamentId") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_strategy1Id_strategies_id_fk" FOREIGN KEY ("strategy1Id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_strategy2Id_strategies_id_fk" FOREIGN KEY ("strategy2Id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_user1Id_users_id_fk" FOREIGN KEY ("user1Id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_user2Id_users_id_fk" FOREIGN KEY ("user2Id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategy_user_id_idx" ON "strategies" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "tournament_participant_tournament_id_idx" ON "tournament_participant" USING btree ("tournamentId");--> statement-breakpoint
CREATE INDEX "tournament_participant_strategy_id_idx" ON "tournament_participant" USING btree ("strategyId");--> statement-breakpoint
CREATE INDEX "tournament_participant_user_id_idx" ON "tournament_participant" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "game_tournament_id_idx" ON "game" USING btree ("tournamentId");--> statement-breakpoint
CREATE INDEX "game_strategy1_id_idx" ON "game" USING btree ("strategy1Id");--> statement-breakpoint
CREATE INDEX "game_strategy2_id_idx" ON "game" USING btree ("strategy2Id");