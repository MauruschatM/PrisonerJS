"use client";
import { Tournament, TournamentParticipant } from "@/app/lib/types"
import { use } from "react";
import { formatDate, formatScore } from "@/shared/utils";
import { Progress } from "@heroui/progress";

export default function TournamentInfo({
    unresTournament, 
    unresParticipants 
} : { 
    unresTournament: Promise<Tournament> 
    unresParticipants: Promise<TournamentParticipant[]>
}) {

    const tournament = use(unresTournament);
    const participants = use(unresParticipants);

    return (
        <>
            <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
            {tournament.description && <p className="text-gray-600 mb-4">{tournament.description}</p>}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span className="font-medium">Runden pro Spiel:</span>
                    <div>{tournament.roundsPerMatch}</div>
                </div>
                {tournament.startedAt ? (
                    <div>
                        <span className="font-medium">Gestartet:</span>
                        <div>{formatDate(tournament.startedAt as Date)}</div>
                    </div>
                ) : null}
                {tournament.completedAt ? (
                    <div>
                        <span className="font-medium">Abgeschlossen:</span>
                        <div>{formatDate(tournament.completedAt as Date)}</div>
                    </div>
                ) : null}
                <div>
                    <span className="font-medium">Teilnehmer:</span>
                    <div>{participants.length}</div>
                </div>
            </div>   
            {tournament.status === "running" && (
                <Progress label="Tournament läuft..." color="warning" isIndeterminate className="mt-4" />
            )}
        </>
    );
}