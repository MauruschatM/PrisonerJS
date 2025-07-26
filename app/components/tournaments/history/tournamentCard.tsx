import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { formatDate } from "@/shared/utils";
import { Tournament } from "@/app/lib/types";
import Link from 'next/link'

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

type TournamentCardProps = {
  tournament: Tournament;
};

export default function TournamentCard({ tournament }: TournamentCardProps) {
	return (
		<Card
			as={Link}
			href={`/tournaments/${tournament.id}`}
			key={tournament.id}
			isPressable
			className="cursor-pointer hover:shadow-lg transition-shadow"
			//onPress={() => router.push(`/tournaments/${tournament.id}`)}
			>
			<CardHeader className="flex justify-between items-start">
				<div>
					<h3 className="text-lg font-semibold">{tournament.name}</h3>
					{tournament.description && (
						<p className="text-gray-600 text-sm">{tournament.description}</p>
					)}
				</div>
				<Chip color={getStatusColor(tournament.status)} variant="flat">
					{getStatusText(tournament.status)}
				</Chip>
			</CardHeader>
			<CardBody>
				<div className="space-y-3">
					<div className="flex justify-between text-sm">
						<span>Runden pro Spiel:</span>
						<span>{tournament.roundsPerMatch}</span>
					</div>

					{tournament.status === "running" && (
						<Progress label="Tournament läuft..." color="warning" isIndeterminate />
					)}

					<Divider />

					<div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
						<div>
							<span className="font-medium">Erstellt:</span>
							<br />
							{formatDate(tournament.createdAt)}
						</div>
						{tournament.startedAt && (
							<div>
								<span className="font-medium">Gestartet:</span>
								<br />
								{formatDate(tournament.startedAt)}
							</div>
						)}
						{tournament.completedAt && (
							<div>
								<span className="font-medium">Abgeschlossen:</span>
								<br />
								{formatDate(tournament.completedAt)}
							</div>
						)}
						{tournament.scheduledAt && (
							<div>
								<span className="font-medium">Geplant:</span>
								<br />
								{formatDate(tournament.scheduledAt)}
							</div>
						)}
					</div>
				</div>
			</CardBody>
		</Card>
	
    )
}