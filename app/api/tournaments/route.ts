import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { headers } from "next/headers";
import db from "@/server/lib/db";
import { tournaments, tournamentParticipants, strategies, users } from "@/server/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const tournamentsData = await db
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

		return NextResponse.json({ tournaments: tournamentsData });
	} catch (error) {
		console.error("Error fetching tournaments:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log("Creating tournament...");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only allow admins to create tournaments manually
		// For now, anyone can create tournaments for testing
		const { name, description, roundsPerMatch = 200, scheduledAt } = await request.json();

		if (!name) {
			return NextResponse.json({ error: "Tournament name is required" }, { status: 400 });
		}

		const newTournament = {
			id: Math.random().toString(36).substring(2) + Date.now().toString(36),
			name,
			description: description || null,
			roundsPerMatch,
			scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
			status: "pending",
		};

		await db.insert(tournaments).values(newTournament);

		return NextResponse.json({ tournament: newTournament }, { status: 201 });
	} catch (error) {
		console.error("Error creating tournament:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
