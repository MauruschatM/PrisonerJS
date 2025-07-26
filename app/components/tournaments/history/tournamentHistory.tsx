
import { Tournament } from "@/app/lib/types";

import { fetchTournaments } from "@/server/lib/data";
import HistoryList from "./historyList";
import { Suspense } from "react";


export default async function TournamentHistory() {
    const tournaments = fetchTournaments();
    return (
        <div className="space-y-4">
				<h2 className="text-2xl font-semibold">Tournament Historie</h2>
				<Suspense fallback={
                    <p className="text-center text-gray-600">
                        Lade Tournaments... (mit künstlichem Delay für Test Zwecke in fetchTournaments())
                    </p>
                }>
                    <HistoryList tournaments={tournaments} />
                </Suspense>
			</div>
        
    );
}