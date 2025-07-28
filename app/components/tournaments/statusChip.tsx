"use client";


import { use } from "react";
import { Chip } from "@heroui/chip";
import { Tournament } from "@/app/lib/types";

type StatusChipProps = {
    status?: string | Promise<string>;
    tournament?: Tournament | Promise<Tournament>;
  };


export default function StatusChip({ status, tournament }: StatusChipProps) {
    let resolvedStatus: string | undefined;

    if (status !== undefined) {
      resolvedStatus = typeof status === "string" ? status : use(status);
    } else if (tournament !== undefined) {
      const resolvedTournament =
        typeof tournament === "object" && "then" in tournament
          ? use(tournament)
          : tournament;
      resolvedStatus = resolvedTournament?.status;
    }
  
    if (!resolvedStatus) {
      throw new Error("StatusChip benötigt mindestens status oder tournament als Prop.");
    }
    

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