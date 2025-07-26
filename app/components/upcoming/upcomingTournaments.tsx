import { fetchUpcomingTournaments } from "@/server/lib/data";
import { Suspense } from "react";
import HistoryList from "../tournaments/history/historyList";
import { tournaments } from "@/server/lib/db/schema";
import { Button } from "@heroui/button";




export default async function UpcomingTournaments() {
    const upcomingTournaments = fetchUpcomingTournaments();

    return (
        
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Upcoming Tournaments</h2>
            <Suspense fallback={
                <p className="text-center text-gray-600">
                    Lade Tournaments...
                </p>
            }>
                <HistoryList tournaments={upcomingTournaments} />
            </Suspense>
        </div>
    );
}