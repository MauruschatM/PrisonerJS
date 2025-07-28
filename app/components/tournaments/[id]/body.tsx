"use client";
import { Game, Tournament, TournamentParticipant } from "@/app/lib/types"
import { use } from "react";
import { formatDate, formatScore } from "@/shared/utils";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";


export default function TournamentInfoBody(
{     
    unresTournaments, 
    unresParticipants,
	unresRecentGames,
}: { 
    unresTournaments: Promise<Tournament>, 
    unresParticipants: Promise<TournamentParticipant[]> 
	unresRecentGames: Promise<Game[]>
}) {

    const tournament = use(unresTournaments);
    const participants = use(unresParticipants);
	const recentGames = use(unresRecentGames);

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

    return (
        <>
        {/* Rankings */}
			<section className="mb-8">
				<h2 className="text-2xl font-semibold mb-4">Rangliste</h2>

				{participants.length === 0 ? (
                    <Card>
						<CardBody>
							<p className="text-center text-gray-600">
								{tournament.status === "pending"
									? "Tournament wurde noch nicht gestartet"
									: "Keine Teilnehmer gefunden"}
							</p>
						</CardBody>
					</Card>
				) : (
                    <div className="space-y-3">
						{participants.map((participant, index) => (
                            <Card key={participant.id}>
								<CardBody>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="text-2xl font-bold min-w-[3rem] text-center">
												{participant.rank ? (
                                                    <Chip color={getRankingColor(participant.rank)} variant="flat" className="text-lg">
														{getRankingIcon(participant.rank)}
													</Chip>
												) : (
                                                    "-"
												)}
											</div>

											<div>
												<h3 className="font-semibold">{participant.strategyName}</h3>
												<p className="text-sm text-gray-600">von {participant.userName}</p>
												{participant.strategyDescription && (
                                                    <p className="text-xs text-gray-500 mt-1">{participant.strategyDescription}</p>
												)}
											</div>
										</div>

										<div className="text-right space-y-1">
											<div className="text-xl font-bold">
												{formatScore(participant.totalScore || 0)} Punkte
											</div>
											<div className="text-sm text-gray-600">
												Ø {(participant.averageScore || 0).toFixed(1)} pro Spiel
											</div>
											<div className="flex gap-2 text-xs">
												<Chip size="sm" color="success" variant="flat">
													{participant.wins || 0}S
												</Chip>
												<Chip size="sm" color="danger" variant="flat">
													{participant.losses || 0}N
												</Chip>
												<Chip size="sm" color="default" variant="flat">
													{participant.draws || 0}U
												</Chip>
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				)}
			</section>

			{/* Recent Games */}
			{recentGames.length > 0 && (
                <section>
					<h2 className="text-2xl font-semibold mb-4">Letzte Spiele</h2>

					<div className="space-y-3">
						{recentGames.map(game => (
                            <Card key={game.id}>
								<CardBody>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="text-sm text-gray-600">{formatDate(game.createdAt)}</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">{game.strategy1Name}</span>
												<span className="text-gray-400">vs</span>
												<span className="font-medium">{game.strategy2Name}</span>
											</div>
										</div>

										<div className="flex items-center gap-4">
											<div className="text-right">
												<div className="text-lg font-semibold">
													{game.strategy1Score} : {game.strategy2Score}
												</div>
												<div className="text-xs text-gray-600">{game.rounds} Runden</div>
											</div>

											{game.winner && (
                                                <Chip color={game.winner === "draw" ? "default" : "success"} variant="flat" size="sm">
													{game.winner === "draw"
														? "Unentschieden"
														: game.winner === "strategy1"
                                                        ? game.strategy1Name
                                                        : game.strategy2Name}
												</Chip>
											)}
										</div>
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				</section>
			)}
        </>
    );
}