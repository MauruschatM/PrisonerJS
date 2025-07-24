import { NextRequest, NextResponse } from "next/server";
import {
	startTournamentScheduler,
	startDevelopmentScheduler,
	runWeeklyTournament,
} from "@/server/lib/scheduler";

let schedulerStarted = false;

export async function POST(request: NextRequest) {
	try {
		const { action, development } = await request.json();

		switch (action) {
			case "start":
				if (schedulerStarted) {
					return NextResponse.json({ message: "Scheduler is already running" });
				}

				if (development) {
					startDevelopmentScheduler();
					schedulerStarted = true;
					return NextResponse.json({
						message: "Development scheduler started (tournaments every 10 minutes)",
					});
				} else {
					startTournamentScheduler();
					schedulerStarted = true;
					return NextResponse.json({
						message: "Tournament scheduler started (weekly on Saturdays at 8 PM)",
					});
				}

			case "run-now":
				await runWeeklyTournament();
				return NextResponse.json({
					message: "Tournament executed successfully",
				});

			case "status":
				return NextResponse.json({
					schedulerRunning: schedulerStarted,
				});

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Scheduler API error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		schedulerRunning: schedulerStarted,
	});
}
