import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  tournament,
  tournamentParticipant,
  strategy,
  user,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const tournaments = await db
      .select({
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        status: tournament.status,
        roundsPerMatch: tournament.roundsPerMatch,
        scheduledAt: tournament.scheduledAt,
        startedAt: tournament.startedAt,
        completedAt: tournament.completedAt,
        createdAt: tournament.createdAt,
      })
      .from(tournament)
      .orderBy(desc(tournament.createdAt))
      .limit(20);

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to create tournaments manually
    // For now, anyone can create tournaments for testing
    const {
      name,
      description,
      roundsPerMatch = 200,
      scheduledAt,
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Tournament name is required" },
        { status: 400 }
      );
    }

    const newTournament = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      name,
      description: description || null,
      roundsPerMatch,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: "pending",
    };

    await db.insert(tournament).values(newTournament);

    return NextResponse.json({ tournament: newTournament }, { status: 201 });
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
