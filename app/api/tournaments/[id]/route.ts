import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tournament,
  tournamentParticipant,
  strategy,
  user,
  game,
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
      .from(tournament)
      .where(eq(tournament.id, tournamentId))
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
        id: tournamentParticipant.id,
        totalScore: tournamentParticipant.totalScore,
        wins: tournamentParticipant.wins,
        losses: tournamentParticipant.losses,
        draws: tournamentParticipant.draws,
        averageScore: tournamentParticipant.averageScore,
        rank: tournamentParticipant.rank,
        strategyName: strategy.name,
        strategyDescription: strategy.description,
        userName: user.name,
        userId: user.id,
      })
      .from(tournamentParticipant)
      .innerJoin(strategy, eq(tournamentParticipant.strategyId, strategy.id))
      .innerJoin(user, eq(tournamentParticipant.userId, user.id))
      .where(eq(tournamentParticipant.tournamentId, tournamentId))
      .orderBy(tournamentParticipant.rank);

    // Get recent games
    const games = await db
      .select({
        id: game.id,
        rounds: game.rounds,
        strategy1Score: game.strategy1Score,
        strategy2Score: game.strategy2Score,
        winner: game.winner,
        createdAt: game.createdAt,
        strategy1Name: strategy.name,
        strategy2Name: strategy.name, // This will be overwritten by the second join
      })
      .from(game)
      .innerJoin(strategy, eq(game.strategy1Id, strategy.id))
      .where(eq(game.tournamentId, tournamentId))
      .orderBy(desc(game.createdAt))
      .limit(10);

    return NextResponse.json({
      tournament: tournamentData[0],
      participants,
      recentGames: games,
    });
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
