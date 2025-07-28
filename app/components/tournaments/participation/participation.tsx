"use server";
import { fetchStrategyNameAndIdList, fetchUsersTournamentStrategy } from "@/server/lib/data";
import StrategySelection from "./selection";
import { Suspense } from "react";
import SelectionSkeleton from "./selectionSkeleton";

// type ParticipationProps {
//     tournamentId : string;
// }

export default async function Participation(tournamentId: string | { tournamentId: string }) {
    //TODO: Only active strategies?
    const actualTournamentId = typeof tournamentId === 'string' ? tournamentId : tournamentId.tournamentId;
    const strategyList = fetchStrategyNameAndIdList();
    const initialSelectedStrategy = fetchUsersTournamentStrategy(actualTournamentId);
    
    return (
        <Suspense fallback={
            <div className="max-w-xs">
                <SelectionSkeleton />
            </div>
        }>
            <StrategySelection 
                strategyList={strategyList} 
                initialSelectedStrategy={initialSelectedStrategy} 
                tournamentId={actualTournamentId}
            />
        </Suspense>
    );
}