import { fetchUpcomingTournaments } from "@/server/lib/data";
import { Suspense } from "react";
import HistoryList from "../history/historyList";
import { tournaments } from "@/server/lib/db/schema";
import { Button } from "@heroui/button";
import CreateNewTournament from "./createNewTournament";
import Link from "next/link";



export default async function UpcomingTournaments() {
    const upcomingTournaments = fetchUpcomingTournaments();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Upcoming Tournaments</h2>
            <Link href="tournaments/create" className="inline-block mb-4">
                <Button>Create New Tournament</Button>
            </Link>
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