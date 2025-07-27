"use client";
import TournamentCard from "./history/tournamentCard";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Tournament } from "@/app/lib/types";
import { use } from "react";

export default function TournamentList({
    tournaments,
}: {
    tournaments: Promise<Tournament[]>;
}) {
    const allTournaments = use(tournaments);

    return (
        allTournaments.length === 0 ? (
            <Card>
                <CardBody>
                    <p className="text-center text-gray-600">
                        Insert proper Skeleton pwease.
                    </p>
                </CardBody>
            </Card>
        ) : (
            allTournaments.map(tournament => (
                <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament}
                />
            ))
        )
    );
}