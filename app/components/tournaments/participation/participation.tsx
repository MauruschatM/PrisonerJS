"use server";
import { fetchStrategyNameList } from "@/server/lib/data";
import { Select, SelectSection, SelectItem } from "@heroui/select";
import StrategySelection from "./selection";
import { Suspense } from "react";
import SelectionSkeleton from "./selectionSkeleton";

export default async function Participation() {
    //TODO: Only active strategies?
    const nameList = fetchStrategyNameList();
    
    return (
        <Suspense fallback={
            <div className="max-w-xs">
                <SelectionSkeleton />
            </div>
        }>
            <StrategySelection nameList={nameList} />
        </Suspense>
    );
}