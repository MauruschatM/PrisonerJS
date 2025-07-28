"use client";

import { runTournamentWithParticipants } from "@/server/lib/actions";
import { Button } from "@heroui/button";
import { use, useState } from "react";
import { startTournament } from "@/server/lib/actions";

interface RunTournamentButtonProps {
    created_by: Promise<string>;
    tournamentId: Promise<string>;
    tournamentStatus: Promise<string>;
}

export default function RunTournamentButton({
    created_by,
    tournamentId,
    tournamentStatus
}: RunTournamentButtonProps) {
    const createdBy = use(created_by);
    const id = use(tournamentId);
    const status = use(tournamentStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleRunTournament = async () => {
        if (isLoading) return; // Prevent multiple clicks
        
        setIsLoading(true);
        try {
            // First validate the tournament can be started
            await startTournament(id);
            // Then run the tournament
            await runTournamentWithParticipants(id);
            // Optionally refresh the page or show success message
            window.location.reload();
        } catch (error) {
            console.error("Failed to run tournament:", error);
            alert(`Failed to run tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Only show the button if tournament is pending
    if (status !== "pending") {
        return null;
    }

    return (
        <Button 
            onPress={handleRunTournament}
            color="primary"
            isLoading={isLoading}
            disabled={isLoading}
        >
            {isLoading ? "Starting Tournament..." : "Run Tournament"}
        </Button>
    );
}