"use server";
import db from "@/server/lib/db";
import { tournaments, strategies } from "@/server/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Tournament } from "@/app/lib/types";
import { auth } from "../auth/config";
import { headers } from "next/headers";



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

export async function fetchStrategyNameList(): Promise<{ name: string }[]> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        const user = session?.user;
        if (!user) throw new Error("Not authenticated");

        const response = await db
            .select({ name: strategies.name })
            .from(strategies)
            .where(eq(strategies.userId, user.id));
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch strategies.');
    }
}

