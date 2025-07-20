CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`salt` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`tournamentId` text NOT NULL,
	`strategy1Id` text NOT NULL,
	`strategy2Id` text NOT NULL,
	`user1Id` text NOT NULL,
	`user2Id` text NOT NULL,
	`rounds` integer NOT NULL,
	`strategy1Score` integer NOT NULL,
	`strategy2Score` integer NOT NULL,
	`winner` text,
	`moves` text,
	`errorMessage` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`strategy1Id`) REFERENCES `strategy`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`strategy2Id`) REFERENCES `strategy`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user1Id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user2Id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_tournament_id_idx` ON `game` (`tournamentId`);--> statement-breakpoint
CREATE INDEX `game_strategy1_id_idx` ON `game` (`strategy1Id`);--> statement-breakpoint
CREATE INDEX `game_strategy2_id_idx` ON `game` (`strategy2Id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `strategy` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`code` text NOT NULL,
	`userId` text NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `strategy_user_id_idx` ON `strategy` (`userId`);--> statement-breakpoint
CREATE TABLE `tournament` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`roundsPerMatch` integer DEFAULT 200 NOT NULL,
	`scheduledAt` integer,
	`startedAt` integer,
	`completedAt` integer,
	`errorMessage` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tournament_participant` (
	`id` text PRIMARY KEY NOT NULL,
	`tournamentId` text NOT NULL,
	`strategyId` text NOT NULL,
	`userId` text NOT NULL,
	`totalScore` integer DEFAULT 0,
	`wins` integer DEFAULT 0,
	`losses` integer DEFAULT 0,
	`draws` integer DEFAULT 0,
	`averageScore` real DEFAULT 0,
	`rank` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`strategyId`) REFERENCES `strategy`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tournament_participant_tournament_id_idx` ON `tournament_participant` (`tournamentId`);--> statement-breakpoint
CREATE INDEX `tournament_participant_strategy_id_idx` ON `tournament_participant` (`strategyId`);--> statement-breakpoint
CREATE INDEX `tournament_participant_user_id_idx` ON `tournament_participant` (`userId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
