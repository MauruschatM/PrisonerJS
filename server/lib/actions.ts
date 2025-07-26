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
import { runTournament } from "@/server/lib/tournament-engine";
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
        runTournament(tournamentId);
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

export async function updateUsersParticipatingStrategy(strategyId: string, tournamentId: string) {
    try {
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

        await db
            .update(tournamentParticipants)
            .set({ strategyId: strategyId })
            .where(
                and(
                    eq(tournamentParticipants.userId, userId),
                    eq(tournamentParticipants.tournamentId, tournamentId)
                )
            );

    } catch (error) {
        console.error("Error fetching strategies:", error);
        throw new Error("Failed to fetch strategies");
    }
}