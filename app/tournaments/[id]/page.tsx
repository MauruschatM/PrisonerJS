"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { formatDate, formatScore } from "@/lib/utils";

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
            <p className="text-red-600">
              {error || "Tournament nicht gefunden"}
            </p>
            <Button
              className="mt-4"
              variant="light"
              onClick={() => router.push("/tournaments")}
            >
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
          <Button variant="light" onClick={() => router.push("/tournaments")}>
            ← Zurück
          </Button>
          <Chip color={getStatusColor(tournament.status)} variant="flat">
            {getStatusText(tournament.status)}
          </Chip>
        </div>

        <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
        {tournament.description && (
          <p className="text-gray-600 mb-4">{tournament.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Runden pro Spiel:</span>
            <div>{tournament.roundsPerMatch}</div>
          </div>
          {tournament.startedAt && (
            <div>
              <span className="font-medium">Gestartet:</span>
              <div>{formatDate(tournament.startedAt)}</div>
            </div>
          )}
          {tournament.completedAt && (
            <div>
              <span className="font-medium">Abgeschlossen:</span>
              <div>{formatDate(tournament.completedAt)}</div>
            </div>
          )}
          <div>
            <span className="font-medium">Teilnehmer:</span>
            <div>{participants.length}</div>
          </div>
        </div>

        {tournament.status === "running" && (
          <Progress
            label="Tournament läuft..."
            color="warning"
            isIndeterminate
            className="mt-4"
          />
        )}
      </div>

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
                          <Chip
                            color={getRankingColor(participant.rank)}
                            variant="flat"
                            className="text-lg"
                          >
                            {getRankingIcon(participant.rank)}
                          </Chip>
                        ) : (
                          "-"
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {participant.strategyName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          von {participant.userName}
                        </p>
                        {participant.strategyDescription && (
                          <p className="text-xs text-gray-500 mt-1">
                            {participant.strategyDescription}
                          </p>
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
            {recentGames.map((game) => (
              <Card key={game.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(game.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {game.strategy1Name}
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium">
                          {game.strategy2Name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {game.strategy1Score} : {game.strategy2Score}
                        </div>
                        <div className="text-xs text-gray-600">
                          {game.rounds} Runden
                        </div>
                      </div>

                      {game.winner && (
                        <Chip
                          color={game.winner === "draw" ? "default" : "success"}
                          variant="flat"
                          size="sm"
                        >
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
    </div>
  );
}
