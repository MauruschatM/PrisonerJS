"use client";
import {Select, SelectItem, SelectSection} from "@heroui/select";
import { use, useState } from "react";


export default function StrategySelection({ 
    strategyList,
    initialSelectedStrategy
}: { 
    strategyList: Promise<{ id: string, name: string }[]>,
    initialSelectedStrategy: Promise<{ id: string, name: string }[]>
}) {
    const allStrategies = use(strategyList);
    const initialSelectedS = use(initialSelectedStrategy);
    const [selectedStrategy, setSelectedStrategy] = useState(initialSelectedStrategy)

    return (
        <div>
            <Select
                className="max-w-xs"
                items={allStrategies}
                label="Participating with strategy"
                placeholder="Select a strategy"
                isClearable={true} 
                onSelectionChange={async () => {
                    //const updatedSelection = await
                }}
                >
                {(strategy) => (
                    <SelectItem key={strategy.name}>
                        {strategy.name}
                    </SelectItem>
                )}
            </Select>
        </div>
    );
}