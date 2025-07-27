"use server";
import { fetchStrategyNameAndIdList, fetchUsersParticipatingStrategy } from "@/server/lib/data";
import { Select, SelectSection, SelectItem } from "@heroui/select";
import StrategySelection from "./selection";
import { Suspense } from "react";
import SelectionSkeleton from "./selectionSkeleton";
import { string } from "better-auth/*";

export default async function Participation() {
    //TODO: Only active strategies?
    const strategyList = fetchStrategyNameAndIdList();
    //const initialSelectedStrategy = fetchUsersParticipatingStrategy();
    
    return (
        <Suspense fallback={
            <div className="max-w-xs">
                <SelectionSkeleton />
            </div>
        }>
            <StrategySelection strategyList={strategyList} initialSelectedStrategy={initialSelectedStrategy} />
        </Suspense>
    );
}