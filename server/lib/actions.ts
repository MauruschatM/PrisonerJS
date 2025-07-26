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
import { runTournament } from "@/server/lib/tournament-engine";

export async function createTournament(
    name: string, 
    description: string, 
    roundsPerMatch = 200, 
    scheduledAt?: string
) {
    console.log("Creating tournament...");

    try {
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