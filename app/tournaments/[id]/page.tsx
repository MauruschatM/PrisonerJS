"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { formatDate, formatScore } from "@/shared/utils";
import Link from "next/link";
import StatusChip from "@/app/components/tournaments/statusChip";
import { Tournament } from "@/app/lib/types";
import TournamentInfo from "@/app/components/tournaments/[id]/info";

interface Participant {
	id: string;
	totalScore: number;
	wins: number;
	losses: number;
	draws: number;
	averageScore: number;
	rank: number;
	strategyName: string;
	strategyDescription: string | null;
	userName: string;
	userId: string;
}

interface Game {
	id: string;
	rounds: number;
	strategy1Score: number;
	strategy2Score: number;
	winner: string | null;
	createdAt: string;
	strategy1Name: string;
	strategy2Name: string;
}

export default function TournamentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const tournamentId = params.id as string;

	const [tournament, setTournament] = useState<Tournament | null>(null);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [recentGames, setRecentGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (tournamentId) {
			fetchTournamentDetails();

			// Poll for updates if tournament is running
			const interval = setInterval(() => {
				if (tournament?.status === "running") {
					fetchTournamentDetails();
				}
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [tournamentId, tournament?.status]);

	const fetchTournamentDetails = async () => {
		try {
			const response = await fetch(`/api/tournaments/${tournamentId}`);
			if (response.ok) {
				const data = await response.json();
				setTournament(data.tournament);
				setParticipants(data.participants);
				setRecentGames(data.recentGames);
			} else {
				setError("Tournament nicht gefunden");
			}
		} catch (error) {
			console.error("Error fetching tournament details:", error);
			setError("Fehler beim Laden der Tournament-Details");
		} finally {
			setLoading(false);
		}
	};

	const getRankingColor = (rank: number) => {
		if (rank === 1) return "warning"; // Gold
		if (rank === 2) return "default"; // Silver
		if (rank === 3) return "secondary"; // Bronze
		return undefined;
	};

	const getRankingIcon = (rank: number) => {
		if (rank === 1) return "🥇";
		if (rank === 2) return "🥈";
		if (rank === 3) return "🥉";
		return rank;
	};

	if (loading) {
		return <div className="flex justify-center p-8">Laden...</div>;
	}

	if (error || !tournament) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<Card>
					<CardBody className="text-center">
						<p className="text-red-600">{error || "Tournament nicht gefunden"}</p>
						<Button className="mt-4" variant="light" onClick={() => router.push("/tournaments")}>
							Zurück zu Tournaments
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* Tournament Header */}
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<Link href="/tournaments">
						<Button variant="light">
							← Zurück
						</Button>
					</Link>
					<Suspense 
						fallback={
							<Chip color="default" variant="flat">
								Lade Status...
							</Chip>						
						}
					>
						<StatusChip status={Promise.resolve(tournament.status)}/>
					</Suspense>
				</div>
				
				<Suspense fallback={
					<Card className="animate-pulse">
						<CardHeader>
							<h3 className="text-lg font-semibold">Lade Tournament...</h3>
						</CardHeader>
						<CardBody>
							<p className="text-gray-600">Bitte warten...</p>
						</CardBody>
					</Card>
				}>
					<TournamentInfo unresTournament={Promise.resolve(tournament)} unresParticipants={Promise.resolve(participants)} />	
				</Suspense>
			</div>

			
		</div>
	);
}
