
import { Suspense, use } from "react";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import StatusChip from "@/app/components/tournaments/statusChip";
import TournamentInfo from "@/app/components/tournaments/[id]/info";
import TournamentInfoBody from "@/app/components/tournaments/[id]/body";
import { fetchTournamentInfo } from "@/server/lib/data";
import Participation from "@/app/components/tournaments/participation/participation";


export default function TournamentDetailPage({
	params,
  }: {
	params: Promise<{ id: string }>
  }) {
	const tournamentId = use(params).id as string;

	const tournamentInfo = fetchTournamentInfo(tournamentId);

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
						<StatusChip tournament={tournamentInfo.then(t => t.tournament)}/>
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
					<TournamentInfo 
						unresTournament={tournamentInfo.then(t => t.tournament)} 
						unresParticipants={tournamentInfo.then(t => t.participants)} 
					/> 	
				</Suspense>
			</div>
			
			<Suspense fallback={
				<h1>Loading...</h1>
			}>
				<TournamentInfoBody 
					unresParticipants={tournamentInfo.then(t => t.participants)} 
					unresTournaments={tournamentInfo.then(t => t.tournament)}
					unresRecentGames={tournamentInfo.then(t => t.recentGames)} 
				/>
			</Suspense>
			<Suspense fallback={
				<h1>Loading...</h1>
			}>
				<Participation 
					tournamentId={tournamentId} />
			</Suspense>
			
		</div>
	);
}
