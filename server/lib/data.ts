"use server";
import db from "@/server/lib/db";
import { tournaments, strategies, tournamentParticipants, users, games } from "@/server/lib/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { Game, Tournament, TournamentParticipant } from "@/app/lib/types";
import { auth } from "../auth/config";
import { headers } from "next/headers";
import { create } from "domain";
import { string } from "better-auth/*";
import { TournamentInfo } from "@/app/lib/types";

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
    //await new Promise(resolve => setTimeout(resolve, 5000));
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


export async function fetchUsersTournamentStrategy(tournamentId: string): Promise<{ name: string, id: string }[]> {
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

export async function fetchTournamentParticipants(tournamentId: string) /*: Promise<TournamentParticipant[]>*/ {
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

export async function fetchTournamentInfo(tournamentId: string): Promise<TournamentInfo> {
    // Turnierdaten holen
    const tournamentData = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .limit(1);
    if (tournamentData.length === 0) {
        throw new Error("No Tournament Found");
    }
    const t = tournamentData[0];
    // Teilnehmer holen (mit Strategie und User, aber ohne Code und Email)
    const participantsRaw = await db
        .select({
            id: tournamentParticipants.id,
            totalScore: tournamentParticipants.totalScore,
            wins: tournamentParticipants.wins,
            losses: tournamentParticipants.losses,
            draws: tournamentParticipants.draws,
            averageScore: tournamentParticipants.averageScore,
            rank: tournamentParticipants.rank,
            strategyId: strategies.id,
            strategyName: strategies.name,
            strategyDescription: strategies.description,
            userId: users.id,
            userName: users.name,
            userImage: users.image,
        })
        .from(tournamentParticipants)
        .innerJoin(strategies, eq(tournamentParticipants.strategyId, strategies.id))
        .innerJoin(users, eq(tournamentParticipants.userId, users.id))
        .where(eq(tournamentParticipants.tournamentId, tournamentId))
        .orderBy(tournamentParticipants.rank);
    const participants = participantsRaw.map(p => ({
        id: p.id,
        totalScore: p.totalScore ?? 0,
        wins: p.wins ?? 0,
        losses: p.losses ?? 0,
        draws: p.draws ?? 0,
        averageScore: p.averageScore ?? 0,
        rank: p.rank,
        strategy: {
            id: p.strategyId,
            name: p.strategyName,
            description: p.strategyDescription,
        },
        user: {
            id: p.userId,
            name: p.userName,
            image: p.userImage,
        },
    }));
    // Spiele holen (mit Strategie- und Usernamen, aber ohne Code)
    const gamesRaw = await db
        .select({
            id: games.id,
            rounds: games.rounds,
            strategy1Score: games.strategy1Score,
            strategy2Score: games.strategy2Score,
            winner: games.winner,
            createdAt: games.createdAt,
            strategy1Id: games.strategy1Id,
            strategy2Id: games.strategy2Id,
            user1Id: games.user1Id,
            user2Id: games.user2Id,
        })
        .from(games)
        .where(eq(games.tournamentId, tournamentId))
        .orderBy(desc(games.createdAt))
        .limit(10);
    // Hole Namen zu IDs (nur für die 10 Spiele)
    const strategyIds = Array.from(new Set(gamesRaw.flatMap(g => [g.strategy1Id, g.strategy2Id])));
    const userIds = Array.from(new Set(gamesRaw.flatMap(g => [g.user1Id, g.user2Id])));
    const strategiesMap = Object.fromEntries(
        (await db.select({ id: strategies.id, name: strategies.name })
            .from(strategies)
            .where(or(...strategyIds.map(id => eq(strategies.id, id)))))
            .map(s => [s.id, s.name])
    );
    const usersMap = Object.fromEntries(
        (await db.select({ id: users.id, name: users.name })
            .from(users)
            .where(or(...userIds.map(id => eq(users.id, id)))))
            .map(u => [u.id, u.name])
    );
    const recentGames = gamesRaw.map(g => ({
        id: g.id,
        rounds: g.rounds,
        strategy1Score: g.strategy1Score,
        strategy2Score: g.strategy2Score,
        winner: g.winner,
        createdAt: g.createdAt,
        strategy1: { id: g.strategy1Id, name: strategiesMap[g.strategy1Id] || "" },
        strategy2: { id: g.strategy2Id, name: strategiesMap[g.strategy2Id] || "" },
        user1: { id: g.user1Id, name: usersMap[g.user1Id] || "" },
        user2: { id: g.user2Id, name: usersMap[g.user2Id] || "" },
    }));
    return {
        tournament: {
            id: t.id,
            name: t.name,
            description: t.description,
            status: t.status,
            roundsPerMatch: t.roundsPerMatch,
            scheduledAt: t.scheduledAt,
            startedAt: t.startedAt,
            completedAt: t.completedAt,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            created_by: t.created_by,
            errorMessage: t.errorMessage ?? null,
        },
        participants,
        recentGames,
    };
}