import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import { formatDate, formatScore } from "@/shared/utils";
import TournamentCard from "../components/tournaments/tournamentCard";
import { Tournament } from "@/app/lib/types";
import { fetchTournaments } from "@/server/lib/data";
import { revalidatePath } from "next/cache";
import ReloadButton from "../components/tournaments/reloadButton";
import CreateTournamentButton from "../components/tournaments/createTournamentButton";
import ParticipateButton from "../components/tournaments/participation/participateButton";
import Participation from "../components/tournaments/participation/participation";

export default async function TournamentsPage() {
	const tournaments: Tournament[] = await fetchTournaments();


	const getNextSaturday = () => {
		const now = new Date();
		const dayOfWeek = now.getDay();
		const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
		const nextSaturday = new Date(now);
		nextSaturday.setDate(now.getDate() + (daysUntilSaturday || 7));
		nextSaturday.setHours(20, 0, 0, 0); // 8 PM
		return nextSaturday;
	};


	return (
		<div className="container mx-auto p-6 max-w-3xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Tournament Dashboard</h1>
				<p className="text-gray-600 mb-6">
					Verfolgen Sie die Ergebnisse der Prisoner's Dilemma Tournaments. Tournaments laufen automatisch
					jeden Samstagabend um 20:00 Uhr.
				</p>

				<Card className="mb-6">
					<CardHeader>
						<h3 className="text-lg font-semibold">Nächstes automatisches Tournament</h3>
					</CardHeader>
					<CardBody>
						<Participation/>
						<div className="h-4" />
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">{formatDate(getNextSaturday())}</p>
							</div>
							<Badge content="Auto" color="primary">
								<Chip color="primary" variant="flat">
									Geplant
								</Chip>
							</Badge>
						</div>
					</CardBody>
				</Card>

				<div className="flex gap-4 mb-6">
					<CreateTournamentButton/>
					<ReloadButton />
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-2xl font-semibold">Tournament Historie</h2>

				{/* TODO: Replace with Skeleton :) */}
				{tournaments.length === 0 ? (
					<Card>
						<CardBody>
							<p className="text-center text-gray-600">
								Noch keine Tournaments durchgeführt. Das erste Tournament startet automatisch am nächsten
								Samstag!
							</p>
						</CardBody>
					</Card>
				) : (
					tournaments.map(tournament => (
						<TournamentCard 
							key={tournament.id} 
							tournament={tournament}
						/>
					))
				)}
			</div>
		</div>
	);
}
