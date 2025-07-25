"use server";

import { revalidatePath } from "next/cache";

export async function createTestTournament() {
    try {
        //setRunningTournament(true);
        const response = await fetch("/api/tournaments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: `Test Tournament ${new Date().toLocaleDateString()}`,
                description: "Manuell gestartetes Test-Tournament",
                roundsPerMatch: 100,
            }),
        });
        console.log("Tournament creation response:", response);
        
        if (response.ok) {
            const data = await response.json();
            await runTournament(data.tournament.id);
        }
    } catch (error) {
        console.error("Error creating tournament:", error);
    } finally {
        //setRunningTournament(false);
    }
	
}

async function runTournament(tournamentId: string) {
    try {
        const response = await fetch("/api/tournaments/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tournamentId }),
        });

        if (response.ok) {
            revalidatePath("/tournaments");
        }
    } catch (error) {
        console.error("Error running tournament:", error);
    }
}