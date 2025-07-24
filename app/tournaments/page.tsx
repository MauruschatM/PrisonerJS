"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Badge } from "@heroui/badge";
import { Divider } from "@heroui/divider";
import { formatDate, formatScore } from "@/shared/utils";
import { useRouter } from "next/navigation";

interface Tournament {
	id: string;
	name: string;
	description: string | null;
	status: "pending" | "running" | "completed" | "failed";
	roundsPerMatch: number;
	scheduledAt: string | null;
	startedAt: string | null;
	completedAt: string | null;
	createdAt: string;
}

export default function TournamentsPage() {
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [loading, setLoading] = useState(true);
	const [runningTournament, setRunningTournament] = useState(false);
	const router = useRouter();

	useEffect(() => {
		fetchTournaments();
		// Poll for updates every 5 seconds if there's a running tournament
		const interval = setInterval(() => {
			if (tournaments.some(t => t.status === "running")) {
				fetchTournaments();
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [tournaments]);

	const fetchTournaments = async () => {
		try {
			const response = await fetch("/api/tournaments");
			if (response.ok) {
				const data = await response.json();
				setTournaments(data.tournaments);
			}
		} catch (error) {
			console.error("Error fetching tournaments:", error);
		} finally {
			setLoading(false);
		}
	};

	const createTestTournament = async () => {
		try {
			setRunningTournament(true);
			const response = await fetch("/api/tournaments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: `Test Tournament ${new Date().toLocaleDateString()}`,
					description: "Manuell gestartetes Test-Tournament",
					roundsPerMatch: 100,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				await runTournament(data.tournament.id);
			}
		} catch (error) {
			console.error("Error creating tournament:", error);
		} finally {
			setRunningTournament(false);
		}
	};

	const runTournament = async (tournamentId: string) => {
		try {
			const response = await fetch("/api/tournaments/run", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tournamentId }),
			});

			if (response.ok) {
				await fetchTournaments();
			}
		} catch (error) {
			console.error("Error running tournament:", error);
		}
	};

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

	const getNextSaturday = () => {
		const now = new Date();
		const dayOfWeek = now.getDay();
		const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
		const nextSaturday = new Date(now);
		nextSaturday.setDate(now.getDate() + (daysUntilSaturday || 7));
		nextSaturday.setHours(20, 0, 0, 0); // 8 PM
		return nextSaturday;
	};

	if (loading) {
		return <div className="flex justify-center p-8">Laden...</div>;
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
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
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">{formatDate(getNextSaturday())}</p>
								<p className="text-xs text-gray-500">Alle aktiven Strategien nehmen automatisch teil</p>
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
					<Button color="primary" onClick={createTestTournament} isLoading={runningTournament}>
						Test Tournament starten
					</Button>
					<Button variant="light" onClick={fetchTournaments}>
						Aktualisieren
					</Button>
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-2xl font-semibold">Tournament Historie</h2>

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
						<Card
							key={tournament.id}
							isPressable
							className="cursor-pointer hover:shadow-lg transition-shadow"
							onClick={() => router.push(`/tournaments/${tournament.id}`)}>
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

									<div className="flex justify-end">
										<Button
											size="sm"
											variant="light"
											onClick={e => {
												e.stopPropagation();
												router.push(`/tournaments/${tournament.id}`);
											}}>
											Details ansehen →
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
