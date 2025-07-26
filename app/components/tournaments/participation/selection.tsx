
import {Select, SelectItem} from "@heroui/select";


export default function StrategySelection(nameList: { name: string }[]) {

    return (
        <Select
            className="max-w-xs"
            items={nameList}
            label="Favorite Strategy"
            placeholder="Select a strategy"
        >
            {(strategy) => <SelectItem key={strategy.name}>{strategy.name}</SelectItem>}
        </Select>
    );
}