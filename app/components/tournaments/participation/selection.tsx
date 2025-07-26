"use client";
import {Select, SelectItem, SelectSection} from "@heroui/select";
import { use } from "react";


export default function StrategySelection({ 
    nameList 
}: { 
    nameList: Promise<{ name: string }[]>
}) {
    const allNames = use(nameList);

    return (
        <div>
            <SelectSection showDivider title="Mammals">
                <SelectItem key="Lion">Lion</SelectItem>
            </SelectSection>
            <Select
                className="max-w-xs"
                items={allNames}
                label="Participating with strategy"
                placeholder="Select a strategy"
                isClearable={true} 
                onSelectionChange={(selected) => {
                    
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