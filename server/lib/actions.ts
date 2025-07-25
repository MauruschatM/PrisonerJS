"use server";

import { Tournament } from "@/app/lib/types";
import db from "@/server/lib/db";
import { eq, desc } from "drizzle-orm";
import {
	tournaments,
	tournamentParticipants,
	strategies,
	users,
	games,
} from "@/server/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createTournament(
    name: string, 
    description: string, 
    roundsPerMatch = 200, 
    scheduledAt?: string
) {
    console.log("Creating tournament...");

    try {
        // const session = await auth.api.getSession({
        //     headers: await headers(),
        // });

        // if (!session || !session.user || !session.user.isAdmin) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        // }

		// Only allow admins to create tournaments manually
		// For now, anyone can create tournaments for testing
		
		if (!name) {
			throw new Error("Tournament name is required");
		}

		const newTournament: Tournament = {
			id: Math.random().toString(36).substring(2) + Date.now().toString(36),
			name,
			description: description || null,
			roundsPerMatch,
			scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
			status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
            startedAt: null,
            completedAt: null,
            errorMessage: null,
		};
        await db.insert(tournaments).values(newTournament);

        // Optionally, you can run the tournament immediately
        // await runTournament(newTournament.id);

        return newTournament;
    }

    catch (error) {
        console.error("Error creating tournament:", error);
        throw new Error("Failed to create tournament");
    }
}

export async function createTestTournament() {
    try {
        const response: Tournament = await createTournament(
            `Test Tournament ${new Date().toLocaleDateString()}`,
            "Manuell gestartetes Test-Tournament",
            100
        ); 
        //setRunningTournament(true);
        // const response = await fetch("/api/tournaments", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //         name: `Test Tournament ${new Date().toLocaleDateString()}`,
        //         description: "Manuell gestartetes Test-Tournament",
        //         roundsPerMatch: 100,
        //     }),
        // });
        await runTournament(response.id);
        revalidatePath("/tournaments");
        // if (response.ok) {
        //     const data = await response.json();
        //     await runTournament(data.tournament.id);
        // }
        return response
    } catch (error) {
        console.error("Error creating test tournament:", error);
        throw new Error("Failed to create test tournament");
    } finally {
        //setRunningTournament(false);
    }
	
}

async function runTournament(tournamentId: string) {
    try {
        // Get tournament details
        const tournamentData = await db
			.select()
			.from(tournaments)
			.where(eq(tournaments.id, tournamentId))
			.limit(1);

		if (tournamentData.length === 0) {
			throw new Error("Tournament not found");
		}

        // Get participants with rankings
		const participants = await db
			.select({
				id: tournamentParticipants.id,
				totalScore: tournamentParticipants.totalScore,
				wins: tournamentParticipants.wins,
				losses: tournamentParticipants.losses,
				draws: tournamentParticipants.draws,
				averageScore: tournamentParticipants.averageScore,
				rank: tournamentParticipants.rank,
				strategyName: strategies.name,
				strategyDescription: strategies.description,
				userName: users.name,
				userId: users.id,
			})
			.from(tournamentParticipants)
			.innerJoin(strategies, eq(tournamentParticipants.strategyId, strategies.id))
			.innerJoin(users, eq(tournamentParticipants.userId, users.id))
			.where(eq(tournamentParticipants.tournamentId, tournamentId))
			.orderBy(tournamentParticipants.rank);

		// Get recent games
		const gamesData = await db
			.select({
				id: games.id,
				rounds: games.rounds,
				strategy1Score: games.strategy1Score,
				strategy2Score: games.strategy2Score,
				winner: games.winner,
				createdAt: games.createdAt,
				strategy1Name: strategies.name,
				strategy2Name: strategies.name, // This will be overwritten by the second join
			})
			.from(games)
			.innerJoin(strategies, eq(games.strategy1Id, strategies.id))
			.where(eq(games.tournamentId, tournamentId))
			.orderBy(desc(games.createdAt))
			.limit(10);
    } catch (error) {
        console.error("Error running tournament:", error);
        throw new Error("Failed to run tournament");
    }
}