import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { runTournament } from "@/lib/tournament-engine";
import { db } from "@/lib/db";
import { tournament } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json(
        { error: "Tournament ID is required" },
        { status: 400 }
      );
    }

    // Check if tournament exists and is pending
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

    if (tournamentData[0].status !== "pending") {
      return NextResponse.json(
        {
          error: `Tournament is ${tournamentData[0].status}, cannot run`,
        },
        { status: 400 }
      );
    }

    // Run tournament asynchronously
    runTournament(tournamentId).catch((error) => {
      console.error("Tournament execution failed:", error);
    });

    return NextResponse.json({
      message: "Tournament execution started",
      tournamentId,
    });
  } catch (error) {
    console.error("Error starting tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
