import db from "@/server/lib/db";
import { tournaments } from "@/server/lib/db/schema";
import { runTournament } from "@/server/lib/tournament-engine";
import { generateId } from "@/shared/utils";

export async function createWeeklyTournament(): Promise<string> {
	try {
		const now = new Date();
		const tournamentName = `Wöchentliches Tournament ${now.toLocaleDateString("de-DE")}`;

		const newTournament = {
			id: generateId(),
			name: tournamentName,
			description: "Automatisches wöchentliches Tournament - jeden Samstag um 20:00 Uhr",
			roundsPerMatch: 200,
			scheduledAt: now,
			status: "pending" as const,
		};

		await db.insert(tournaments).values(newTournament);

		console.log(`Weekly tournament created: ${newTournament.id}`);
		return newTournament.id;
	} catch (error) {
		console.error("Failed to create weekly tournament:", error);
		throw error;
	}
}

export async function runWeeklyTournament(): Promise<void> {
	try {
		console.log("Starting weekly tournament execution...");

		// Create and immediately run tournament
		const tournamentId = await createWeeklyTournament();
		await runTournament(tournamentId);

		console.log("Weekly tournament completed successfully");
	} catch (error) {
		console.error("Weekly tournament failed:", error);
		throw error;
	}
}

// Calculate next Saturday at 8 PM
export function getNextSaturdayEvening(): Date {
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
	const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;

	const nextSaturday = new Date(now);
	nextSaturday.setDate(now.getDate() + (daysUntilSaturday || 7)); // If it's already Saturday, schedule for next week
	nextSaturday.setHours(20, 0, 0, 0); // 8 PM

	// If it's Saturday but past 8 PM, schedule for next week
	if (dayOfWeek === 6 && now.getHours() >= 20) {
		nextSaturday.setDate(nextSaturday.getDate() + 7);
	}

	return nextSaturday;
}

// Development helper - run tournament in 1 minute for testing
export function getNextMinute(): Date {
	const nextMinute = new Date();
	nextMinute.setMinutes(nextMinute.getMinutes() + 1);
	nextMinute.setSeconds(0, 0);
	return nextMinute;
}

export function startTournamentScheduler(): void {
	console.log("Starting tournament scheduler...");

	const scheduleNext = () => {
		const nextRun = getNextSaturdayEvening();
		const now = new Date();
		const timeUntilNext = nextRun.getTime() - now.getTime();

		console.log(`Next tournament scheduled for: ${nextRun.toLocaleString("de-DE")}`);
		console.log(
			`Time until next tournament: ${Math.round(timeUntilNext / (1000 * 60 * 60))} hours`
		);

		setTimeout(async () => {
			try {
				await runWeeklyTournament();
			} catch (error) {
				console.error("Scheduled tournament failed:", error);
			} finally {
				// Schedule the next tournament
				scheduleNext();
			}
		}, timeUntilNext);
	};

	scheduleNext();
}

// For development/testing - start a tournament in 1 minute
export function startDevelopmentScheduler(): void {
	console.log("Starting development tournament scheduler (1 minute intervals)...");

	const scheduleNext = () => {
		const nextRun = getNextMinute();
		const now = new Date();
		const timeUntilNext = nextRun.getTime() - now.getTime();

		console.log(`Next development tournament in: ${Math.round(timeUntilNext / 1000)} seconds`);

		setTimeout(async () => {
			try {
				console.log("Running development tournament...");
				await runWeeklyTournament();
			} catch (error) {
				console.error("Development tournament failed:", error);
			} finally {
				// Schedule the next tournament in 10 minutes for development
				setTimeout(
					() => {
						scheduleNext();
					},
					10 * 60 * 1000
				); // 10 minutes
			}
		}, timeUntilNext);
	};

	scheduleNext();
}
