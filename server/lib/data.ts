import db from "@/server/lib/db";
import { tournaments } from "@/server/lib/db/schema";
import { desc } from "drizzle-orm";

export async function fetchTournaments() {
    try {
        const response = await db
            .select({
                id: tournaments.id,
                name: tournaments.name,
                description: tournaments.description,
                status: tournaments.status,
                roundsPerMatch: tournaments.roundsPerMatch,
                scheduledAt: tournaments.scheduledAt,
                startedAt: tournaments.startedAt,
                completedAt: tournaments.completedAt,
                createdAt: tournaments.createdAt,
            })
            .from(tournaments)
            .orderBy(desc(tournaments.createdAt))
            .limit(20);
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}