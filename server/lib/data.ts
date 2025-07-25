"use server";
import db from "@/server/lib/db";
import { tournaments } from "@/server/lib/db/schema";
import { desc } from "drizzle-orm";
import { Tournament } from "@/app/lib/types";

export async function fetchTournaments(): Promise<Tournament[]> {
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
                updatedAt: tournaments.updatedAt,
                errorMessage: tournaments.errorMessage,
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