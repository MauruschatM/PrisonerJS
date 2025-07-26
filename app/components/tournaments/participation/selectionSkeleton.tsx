"use client"
import { Select, SelectSection, SelectItem } from "@heroui/select";

export default function SelectionSkeleton() {
    return (
        <Select
            //isDisabled
            className="max-w-xs"
            isLoading={true}
            label="Participating with strategy"
            placeholder="Select a strategy"
            disabledKeys={["loading"]}
        >
            <SelectItem key="loading">loading...</SelectItem>
        </Select>
    );
}