
import { Suspense, use } from "react";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import StatusChip from "@/app/components/tournaments/statusChip";
import TournamentInfo from "@/app/components/tournaments/[id]/info";
import TournamentInfoBody from "@/app/components/tournaments/[id]/body";
import { fetchTournamentFromId, fetchTournamentGames, fetchTournamentParticipants } from "@/server/lib/data";


export default function TournamentDetailPage({
	params,
  }: {
	params: Promise<{ id: string }>
  }) {
	const tournamentId = use(params).id as string;

	const recentGames = fetchTournamentGames(tournamentId);
	const tournament = fetchTournamentFromId(tournamentId);
	const participants = fetchTournamentParticipants(tournamentId);

	// const [tournament, setTournament] = useState<Tournament | null>(null);
	// const [participants, setParticipants] = useState<Participant[]>([]);
	// const [recentGames, setRecentGames] = useState<Game[]>([]);

	

	// const tournament = data.tournament;
	// const participants = data.participants;
	// const recentGames = data.recentGames;
	// useEffect(() => {
	// 	if (tournamentId) {
	// 		fetchTournamentDetails();

	// 		// Poll for updates if tournament is running
	// 		const interval = setInterval(() => {
	// 			if (tournament?.status === "running") {
	// 				fetchTournamentDetails();
	// 			}
	// 		}, 5000);

	// 		return () => clearInterval(interval);
	// 	}
	// }, [tournamentId, tournament?.status]);

	// const fetchTournamentDetails = async () => {
	// 	try {
	// 		const response = await fetch(`/api/tournaments/${tournamentId}`);
	// 		if (response.ok) {
	// 			const data = await response.json();
	// 			setTournament(data.tournament);
	// 			setParticipants(data.participants);
	// 			setRecentGames(data.recentGames);
	// 		} else {
	// 			setError("Tournament nicht gefunden");
	// 		}
	// 	} catch (error) {
	// 		console.error("Error fetching tournament details:", error);
	// 		setError("Fehler beim Laden der Tournament-Details");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

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
						<StatusChip tournament={tournament}/>
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
					<TournamentInfo unresTournament={tournament} unresParticipants={participants} />	
				</Suspense>
			</div>
			
			<Suspense fallback={
				<h1>Loading...</h1>
			}>
				<TournamentInfoBody 
					unresParticipants={participants} 
					unresTournaments={tournament}
					unresRecentGames={recentGames} 
				/>
			</Suspense>
			
		</div>
	);
}
