"use server";

import { Tournament } from "@/app/lib/types";
import db from "@/server/lib/db";
import { eq, desc, and } from "drizzle-orm";
import {
	tournaments,
	tournamentParticipants,
	strategies,
	users,
	games,
} from "@/server/lib/db/schema";
import { revalidatePath } from "next/cache";
import { playGame } from "@/server/lib/tournament-engine";
import { auth } from "../auth/config";
import { headers } from "next/headers";

export async function createTournament(
    name: string, 
    description: string, 
    roundsPerMatch = 200, 
    scheduledAt?: string
) {
    console.log("Creating tournament...");

    // session
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user;
    if (!user) throw new Error("Not authenticated");

    try {
		const newTournament: Tournament = {
			id: Math.random().toString(36).substring(2) + Date.now().toString(36),
			name,
			description: description || null,
			roundsPerMatch,
			scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
			status: "pending",
            created_by: user.id,
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
        const tournamentId = await startTournament(response.id);
        //somehow this one is not working
        console.log(`Running tournament ${tournamentId}...`);
        revalidatePath("/tournaments");
        runTournamentWithParticipants(tournamentId);
        //revalidatePath("/tournaments");
        // await revalidatePath("/tournaments");
        //revalidatePath(`/tournaments/${tournamentId}`);

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

export async function startTournament(tournamentId: string) {
    try {
        
		if (!tournamentId) {
			throw new Error("Tournament ID is required");
		}

		// Check if tournament exists and is pending
		const tournamentData = await db
			.select()
			.from(tournaments)
			.where(eq(tournaments.id, tournamentId))
			.limit(1);

		if (tournamentData.length === 0) {
			throw new Error("Tournament not found");
		}

		if (tournamentData[0].status !== "pending") {
			throw new Error(`Tournament is ${tournamentData[0].status}, cannot run`);
		}
        
		return tournamentId

    } catch (error) {
        console.error("Error starting tournament:", error);
        throw new Error("Error starting tournament");
    }
}

export async function updateUsersParticipatingStrategy(tournamentId: string, strategyId: string) {
    'use server'
    console.log("Updating user part strat");    
    console.log(tournamentId, strategyId);
    // try {
        // Ensure parameters are strings
        const tournamentIdStr = String(tournamentId);
        const strategyIdStr = String(strategyId);
        
        if (!tournamentIdStr) throw new Error("Missing tournamentId");
        if (!strategyIdStr) throw new Error("Missing strategyId");
        
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const user = session?.user;
        if (!user) throw new Error("Not authenticated");

        const userId = user.id;

        //if strategyId is not a users strategy, throw an error
        const matchingStrategy = await db
            .select()
            .from(strategies)
            .where(
                and(
                    eq(strategies.id, strategyId),
                    eq(strategies.userId, userId)
                )
            )
            .limit(1)

        if (matchingStrategy.length === 0) {
            console.error("Strategy not found or does not belong to user");
            throw new Error("Strategy not found or does not belong to user");
        }

        // Prüfen, ob der Teilnehmer schon existiert
        const existingParticipant = await db
            .select()
            .from(tournamentParticipants)
            .where(
                and(
                    eq(tournamentParticipants.userId, userId),
                    eq(tournamentParticipants.tournamentId, tournamentId)
                )
            )
            .limit(1);

        if (existingParticipant.length === 0) {
            // Insert, falls noch nicht vorhanden
            await db.insert(tournamentParticipants).values({
                id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                userId,
                tournamentId,
                strategyId,
                createdAt: new Date(),
            });
        } else {
            // Update, falls vorhanden
            await db
                .update(tournamentParticipants)
                .set({ strategyId: strategyId })
                .where(
                    and(
                        eq(tournamentParticipants.userId, userId),
                        eq(tournamentParticipants.tournamentId, tournamentId)
                    )
                );
        }
        revalidatePath('/tournaments/' + tournamentId);
    // } catch (error) {
    //     console.error("Error updating strategy:", error);
    //     throw new Error("Failed to update strategy: " + error);
    // }
}

export async function runTournamentWithParticipants(tournamentId: string): Promise<void> {
	try {
		console.log(`Starting tournament with participants: ${tournamentId}`);

		// Update tournament status
		await db
			.update(tournaments)
			.set({
				status: "running",
				startedAt: new Date(),
				errorMessage: null,
			})
			.where(eq(tournaments.id, tournamentId));

		// Get tournament details
		const tournamentData = await db
			.select()
			.from(tournaments)
			.where(eq(tournaments.id, tournamentId))
			.limit(1);

		if (tournamentData.length === 0) {
			throw new Error("Tournament not found");
		}

		const tournamentInfo = tournamentData[0];

		// Get tournament participants with their strategies
		const participantsData = await db
			.select({
				participantId: tournamentParticipants.id,
				tournamentId: tournamentParticipants.tournamentId,
				strategyId: tournamentParticipants.strategyId,
				userId: tournamentParticipants.userId,
				totalScore: tournamentParticipants.totalScore,
				wins: tournamentParticipants.wins,
				losses: tournamentParticipants.losses,
				draws: tournamentParticipants.draws,
				averageScore: tournamentParticipants.averageScore,
				rank: tournamentParticipants.rank,
				// Strategy details
				strategyName: strategies.name,
				strategyCode: strategies.code,
			})
			.from(tournamentParticipants)
			.innerJoin(strategies, eq(tournamentParticipants.strategyId, strategies.id))
			.where(eq(tournamentParticipants.tournamentId, tournamentId));

		if (participantsData.length < 2) {
			throw new Error("Need at least 2 participants to run tournament");
		}

		console.log(`Found ${participantsData.length} participants`);

		// Reset participant scores
		await db
			.update(tournamentParticipants)
			.set({
				totalScore: 0,
				wins: 0,
				losses: 0,
				draws: 0,
				averageScore: 0,
				rank: null,
			})
			.where(eq(tournamentParticipants.tournamentId, tournamentId));

		// Clear existing games for this tournament
		await db
			.delete(games)
			.where(eq(games.tournamentId, tournamentId));

		// Run all games (round robin)
		const gamesData: any[] = [];
		for (let i = 0; i < participantsData.length; i++) {
			for (let j = i + 1; j < participantsData.length; j++) {
				const participant1 = participantsData[i];
				const participant2 = participantsData[j];

				console.log(`Playing: ${participant1.strategyName} vs ${participant2.strategyName}`);

				const gameResult = await playGame(
					participant1.strategyCode,
					participant2.strategyCode,
					tournamentInfo.roundsPerMatch
				);

				// Record game in database
				const gameRecord = {
					id: Math.random().toString(36).substring(2) + Date.now().toString(36),
					tournamentId,
					strategy1Id: participant1.strategyId,
					strategy2Id: participant2.strategyId,
					user1Id: participant1.userId,
					user2Id: participant2.userId,
					rounds: gameResult.rounds,
					strategy1Score: gameResult.player1TotalScore,
					strategy2Score: gameResult.player2TotalScore,
					winner:
						gameResult.winner === "player1"
							? "strategy1"
							: gameResult.winner === "player2"
								? "strategy2"
								: "draw",
					moves: JSON.stringify(gameResult.moves),
				};

				gamesData.push(gameRecord);

				// Update participant scores
				await db
					.update(tournamentParticipants)
					.set({
						totalScore: (participant1.totalScore || 0) + gameResult.player1TotalScore,
						wins: gameResult.winner === "player1" ? (participant1.wins || 0) + 1 : participant1.wins || 0,
						losses: gameResult.winner === "player2" ? (participant1.losses || 0) + 1 : participant1.losses || 0,
						draws: gameResult.winner === "draw" ? (participant1.draws || 0) + 1 : participant1.draws || 0,
					})
					.where(eq(tournamentParticipants.id, participant1.participantId));

				await db
					.update(tournamentParticipants)
					.set({
						totalScore: (participant2.totalScore || 0) + gameResult.player2TotalScore,
						wins: gameResult.winner === "player2" ? (participant2.wins || 0) + 1 : participant2.wins || 0,
						losses: gameResult.winner === "player1" ? (participant2.losses || 0) + 1 : participant2.losses || 0,
						draws: gameResult.winner === "draw" ? (participant2.draws || 0) + 1 : participant2.draws || 0,
					})
					.where(eq(tournamentParticipants.id, participant2.participantId));
			}
		}

		// Insert all games
		if (gamesData.length > 0) {
			await db.insert(games).values(gamesData);
		}

		// Calculate final rankings
		const finalParticipants = await db
			.select()
			.from(tournamentParticipants)
			.where(eq(tournamentParticipants.tournamentId, tournamentId));

		// Sort by total score and assign ranks
		finalParticipants.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

		for (let i = 0; i < finalParticipants.length; i++) {
			const participant = finalParticipants[i];
			const totalGames =
				(participant.wins || 0) + (participant.losses || 0) + (participant.draws || 0);
			const averageScore = totalGames > 0 ? (participant.totalScore || 0) / totalGames : 0;

			await db
				.update(tournamentParticipants)
				.set({
					rank: i + 1,
					averageScore,
				})
				.where(eq(tournamentParticipants.id, participant.id));
		}

		// Mark tournament as completed
		await db
			.update(tournaments)
			.set({
				status: "completed",
				completedAt: new Date(),
			})
			.where(eq(tournaments.id, tournamentId));

		console.log(`Tournament ${tournamentId} completed successfully`);
	} catch (error) {
		console.error(`Tournament ${tournamentId} failed:`, error);

		// Mark tournament as failed
		await db
			.update(tournaments)
			.set({
				status: "failed",
				errorMessage: error instanceof Error ? error.message : "Unknown error",
				completedAt: new Date(),
			})
			.where(eq(tournaments.id, tournamentId));

		throw error;
	}
}
