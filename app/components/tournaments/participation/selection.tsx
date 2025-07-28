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
    initialSelectedStrategy: Promise<Strategy>,
    tournamentId: string
}) {
    const allStrategies = use(strategyList);
    const initialSelectedS = use(initialSelectedStrategy);
    const [selectedStrategy, setSelectedStrategy] = useState(initialSelectedS);

    function handleSelectionChange(keys: SharedSelection) {
        const key = keys.currentKey;
        if (!key) return;
        const selectedStrategy = allStrategies.find(strategy => strategy.id === key);
        if (selectedStrategy) {
            setSelectedStrategy(selectedStrategy);
        }
        updateUsersParticipatingStrategy(tournamentId, key);
    }

    return (
        <div>
            <Select
                selectedKeys={selectedStrategy ? new Set([selectedStrategy.id]) : new Set()}
                className="max-w-xs"
                items={allStrategies}
                label="Participating with strategy"
                placeholder="Select a strategy"
                isClearable={true}
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