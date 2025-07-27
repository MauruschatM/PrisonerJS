"use server";
import db from "@/server/lib/db";
import { tournaments, strategies, tournamentParticipants } from "@/server/lib/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { Tournament } from "@/app/lib/types";
import { auth } from "../auth/config";
import { headers } from "next/headers";
import { create } from "domain";

export async function fetchTournaments(): Promise<Tournament[]> {
    //TODO: Remove!
    // artificially delay to simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        const response = await db
            .select()
            .from(tournaments)
            .orderBy(desc(tournaments.createdAt))
            .limit(20);
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Tournaments.');
    }
}

export async function fetchOldTournaments(): Promise<Tournament[]> {
    try {
        const response = await db
            .select()
            .from(tournaments)
            .where(
                or(
                    eq(tournaments.status, "completed"),
                    eq(tournaments.status, "failed")
                )
            )
            .orderBy(desc(tournaments.createdAt))
            .limit(20);
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch old tournaments.');
    }
}

export async function fetchUpcomingTournaments(): Promise<Tournament[]> {
    try {
        const response = await db
            .select() // Selects all columns
            .from(tournaments)
            .where(eq(tournaments.status, "pending"))
            .orderBy(tournaments.scheduledAt)
            .limit(20); 
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch upcoming tournaments.');
    }
}

export async function fetchStrategyNameAndIdList(): Promise<{ name: string, id: string }[]> {
    //TODO: Remove!
    // artificially delay to simulate loading
    await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        const user = session?.user;
        if (!user) throw new Error("Not authenticated");

        const response = await db
            .select({ id: strategies.id ,name: strategies.name })
            .from(strategies)
            .where(eq(strategies.userId, user.id));
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch strategies.');
    }
}


export async function fetchUsersParticipatingStrategy(tournamentId: string): Promise<{ name: string, id: string }[]> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        const user = session?.user;
        if (!user) throw new Error("Not authenticated");

        const response = await db
            .select({ id: strategies.id ,name: strategies.name })
            .from(strategies)
            .innerJoin(tournamentParticipants, eq(strategies.id, tournamentParticipants.strategyId))
            .where(
                and(
                    eq(tournamentParticipants.userId, user.id),
                    eq(tournamentParticipants.tournamentId, tournamentId)
                )
            )
            .orderBy(strategies.name);

        if (response.length === 0) {
            return [{ id: "-1", name: "No strategies found"}];
        }
        return response;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch participating strategies.');
    }
}
