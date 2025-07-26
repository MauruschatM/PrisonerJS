// "use client";
// import { useEffect, useState } from "react";
import { fetchStrategyNameList } from "@/server/lib/data";
import { Listbox } from "@heroui/listbox";
import { Select, SelectSection, SelectItem } from "@heroui/select";

export default async function Participation() {
    const nameList = await fetchStrategyNameList();
    
    return (
        nameList.map((strategy) =>
            <h1 key={strategy.name} className="text-lg font-semibold">
                {strategy.name}
            </h1>
        )

        
        
    
    );
    // const [strategies, setStrategies] = useState<{ name: string }[]>([]);

    // useEffect(() => {
    //     fetchStrategyNameList().then(setStrategies).catch(() => setStrategies([]));
    // }, []);

    // return (
    //     <Select
    //         className="max-w-xs"
    //         items={strategies}
    //         label="Favorite Animal"
    //         placeholder="Select an animal"
    //     >
    //         {(strategy) => <SelectItem>{strategy.name}</SelectItem>}
    //     </Select>
    // );
}