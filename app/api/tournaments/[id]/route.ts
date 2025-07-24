import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  tournaments,
  tournamentParticipants,
  strategies,
  users,
  games,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    // Get tournament details
    const tournamentData = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1);

    if (tournamentData.length === 0) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Get participants with rankings
    const participants = await db
      .select({
        id: tournamentParticipants.id,
        totalScore: tournamentParticipants.totalScore,
        wins: tournamentParticipants.wins,
        losses: tournamentParticipants.losses,
        draws: tournamentParticipants.draws,
        averageScore: tournamentParticipants.averageScore,
        rank: tournamentParticipants.rank,
        strategyName: strategies.name,
        strategyDescription: strategies.description,
        userName: users.name,
        userId: users.id,
      })
      .from(tournamentParticipants)
      .innerJoin(
        strategies,
        eq(tournamentParticipants.strategyId, strategies.id)
      )
      .innerJoin(users, eq(tournamentParticipants.userId, users.id))
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(tournamentParticipants.rank);

    // Get recent games
    const gamesData = await db
      .select({
        id: games.id,
        rounds: games.rounds,
        strategy1Score: games.strategy1Score,
        strategy2Score: games.strategy2Score,
        winner: games.winner,
        createdAt: games.createdAt,
        strategy1Name: strategies.name,
        strategy2Name: strategies.name, // This will be overwritten by the second join
      })
      .from(games)
      .innerJoin(strategies, eq(games.strategy1Id, strategies.id))
      .where(eq(games.tournamentId, tournamentId))
      .orderBy(desc(games.createdAt))
      .limit(10);

    return NextResponse.json({
      tournament: tournamentData[0],
      participants,
      recentGames: gamesData,
    });
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
