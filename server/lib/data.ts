"use server";
import db from "@/server/lib/db";
import { tournaments, strategies, tournamentParticipants, users, games } from "@/server/lib/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { Game, Tournament, TournamentParticipant } from "@/app/lib/types";
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
        throw new Error("Tournament: " + tournamentId + " Failed to fetch participating strategies.");
    }
}


export async function fetchTournamentFromId(tournamentId: string) : Promise<Tournament> {
    try{

        const tournamentData = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .limit(1);
        
        if (tournamentData.length === 0) {
            throw new Error("No Tournament Found");
        }

        return tournamentData[0];
    } catch(error) {
        console.error("Error fetching Tournament Data", error);
        throw new Error("Tournament: " + tournamentId + " Error fetching Tournament Data " + error)
    }
}

export async function fetchTournamentParticipants(tournamentId: string) : Promise<TournamentParticipant[]> {
    try {
        const participants = await db
			.select()
			.from(tournamentParticipants)
			.innerJoin(strategies, eq(tournamentParticipants.strategyId, strategies.id))
			.innerJoin(users, eq(tournamentParticipants.userId, users.id))
			.where(eq(tournamentParticipants.tournamentId, tournamentId))
			.orderBy(tournamentParticipants.rank);
        
        return participants.map((p: any) => p.tournament_participant);

    } catch(error) {
        console.error("Error fetching Tournament Participants");
        throw new Error("Error fetching Tournament Participants TournamentId: " + tournamentId);
    }
}

export async function fetchTournamentGames(tournamentId: string) : Promise<Game[]> {
    try {

        
        // Get recent games
        const gamesData = await db
        .select()
        .from(games)
        .innerJoin(strategies, eq(games.strategy1Id, strategies.id))
        .where(eq(games.tournamentId, tournamentId))
        .orderBy(desc(games.createdAt))
        .limit(10);
        
        return gamesData.map((p: any) => p.games);
    } catch(error) {
        throw new Error("Tournament: " + tournamentId + " Error fetching Tournament Games" + error)
    }
}