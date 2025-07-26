"use client";
import { useEffect, useState } from "react";
import { fetchStrategyNameList } from "@/server/lib/data";
import { Select, SelectSection, SelectItem } from "@heroui/select";

export default function Participation() {
    const [strategies, setStrategies] = useState<{ name: string }[]>([]);

    useEffect(() => {
        fetchStrategyNameList().then(setStrategies).catch(() => setStrategies([]));
    }, []);

    return (
        <Select
            className="max-w-xs"
            items={strategies}
            label="Favorite Animal"
            placeholder="Select an animal"
        >
            {(strategy) => <SelectItem>{strategy.name}</SelectItem>}
        </Select>
    );
}