import { tournaments } from "../../server/lib/db/schema/tables/tournaments";
import { tournamentParticipants } from "../../server/lib/db/schema/tables/tournament_participants";
import { games } from "@/server/lib/db/schema";
// For a row returned from the tournaments table
export type Tournament = typeof tournaments.$inferSelect;

export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;

export type Game = typeof games.$inferSelect;

export type TournamentInfo = {
  tournament: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    roundsPerMatch: number;
    scheduledAt?: Date | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    created_by: string;
    errorMessage: string | null;
  };
  participants: Array<{
    id: string;
    totalScore: number;
    wins: number;
    losses: number;
    draws: number;
    averageScore: number;
    rank?: number | null;
    strategy: {
      id: string;
      name: string;
      description?: string | null;
    };
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
  }>;
  recentGames: Array<{
    id: string;
    rounds: number;
    strategy1Score: number;
    strategy2Score: number;
    winner?: string | null;
    createdAt: Date;
    strategy1: {
      id: string;
      name: string;
    };
    strategy2: {
      id: string;
      name: string;
    };
    user1: {
      id: string;
      name: string;
    };
    user2: {
      id: string;
      name: string;
    };
  }>;
};