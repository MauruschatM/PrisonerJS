import { tournaments } from "../../server/lib/db/schema/tables/tournaments";
import { tournamentParticipants } from "../../server/lib/db/schema/tables/tournament_participants";
import exp from "constants";

// For a row returned from the tournaments table
export type Tournament = typeof tournaments.$inferSelect;

export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;