"use client";


import { use } from "react";
import { Chip } from "@heroui/chip";


export default function StatusChip({ status }: { status: Promise<string> }) {
    const resolvedStatus = use(status);

    const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "default";
			case "running":
				return "warning";
			case "completed":
				return "success";
			case "failed":
				return "danger";
			default:
				return "default";
		}
	};

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Wartend";
            case "running":
                return "Läuft";
            case "completed":
                return "Abgeschlossen";
            case "failed":
                return "Fehlgeschlagen";
            default:
                return status;
        }
    };

    return (
        <Chip color={getStatusColor(resolvedStatus)} variant="flat">
            {getStatusText(resolvedStatus)}
        </Chip>
    );
    
}