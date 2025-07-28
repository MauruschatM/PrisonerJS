"use client";

import { Select, SelectItem } from "@heroui/select";
import { use, useState } from "react";
import { updateUsersParticipatingStrategy } from "@/server/lib/actions";
import { SharedSelection } from "@heroui/system";


type Strategy = {
    id: string, name: string
}

export default function StrategySelection({ 
    strategyList,
    initialSelectedStrategy,
    tournamentId
}: { 
    strategyList: Promise<Strategy[]>,
    initialSelectedStrategy: Promise<Strategy[]>,
    tournamentId: string
}) {
    const allStrategies = use(strategyList);
    const initialSelectedS = use(initialSelectedStrategy);
    const [selectedStrategy, setSelectedStrategy] = useState(
      initialSelectedS.length > 0 ? initialSelectedS[0].id : undefined
    );

    function handleSelectionChange(keys: SharedSelection) {
        const key = keys.currentKey;
        if (!key) return;
        
        updateUsersParticipatingStrategy(tournamentId, key);
    }

    return (
        <div>
            <Select

                className="max-w-xs"
                items={allStrategies}
                label="Participating with strategy"
                placeholder="Select a strategy"
                isClearable={true}
                // selectedKeys={selectedStrategy ? new Set([selectedStrategy]) : undefined}
                onSelectionChange={handleSelectionChange}
            >
                {(strategy: Strategy) => (
                    <SelectItem key={strategy.id} >
                        {strategy.name}
                    </SelectItem>
                )}
            </Select>
        </div>
    );
}