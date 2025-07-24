import db from "@/lib/db";
import {
  tournaments,
  tournamentParticipants,
  strategies,
  games,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// Prisoner's Dilemma payoff matrix
const PAYOFF_MATRIX = {
  CC: [3, 3], // Both cooperate
  CD: [0, 5], // Player 1 cooperates, Player 2 defects
  DC: [5, 0], // Player 1 defects, Player 2 cooperates
  DD: [1, 1], // Both defect
};

export interface GameMove {
  round: number;
  player1Move: "C" | "D";
  player2Move: "C" | "D";
  player1Score: number;
  player2Score: number;
}

export interface GameResult {
  player1TotalScore: number;
  player2TotalScore: number;
  moves: GameMove[];
  winner: "player1" | "player2" | "draw";
  rounds: number;
}

// Safe code execution environment
function createSafeExecutionContext() {
  const safeGlobal = {
    Array,
    Object,
    Math,
    JSON,
    String,
    Number,
    Boolean,
    Date: Date, // Limited Date access
  };

  return safeGlobal;
}

// Execute strategy code safely
function executeStrategy(
  code: string,
  opponentHistory: string[],
  myHistory: string[],
  round: number
): "C" | "D" {
  try {
    const safeContext = createSafeExecutionContext();

    // Create a safe function that returns the strategy function
    const strategyWrapper = new Function(
      "context",
      "opponentHistory",
      "myHistory",
      "round",
      `
      with (context) {
        ${code}
        if (typeof strategy === 'function') {
          return strategy(opponentHistory, myHistory, round);
        } else {
          throw new Error('Strategy function not found');
        }
      }
      `
    );

    const result = strategyWrapper(
      safeContext,
      opponentHistory,
      myHistory,
      round
    );

    // Validate result
    if (result !== "C" && result !== "D") {
      console.warn(`Invalid strategy result: ${result}, defaulting to D`);
      return "D";
    }

    return result;
  } catch (error) {
    console.error("Strategy execution error:", error);
    return "D"; // Default to defect on error
  }
}

// Play a single game between two strategies
export async function playGame(
  strategy1Code: string,
  strategy2Code: string,
  rounds: number = 200
): Promise<GameResult> {
  const moves: GameMove[] = [];
  let player1TotalScore = 0;
  let player2TotalScore = 0;

  const player1History: string[] = [];
  const player2History: string[] = [];

  for (let round = 0; round < rounds; round++) {
    try {
      // Get moves from both strategies
      const player1Move = executeStrategy(
        strategy1Code,
        player2History,
        player1History,
        round
      );
      const player2Move = executeStrategy(
        strategy2Code,
        player1History,
        player2History,
        round
      );

      // Calculate scores for this round
      const moveKey =
        `${player1Move}${player2Move}` as keyof typeof PAYOFF_MATRIX;
      const [player1RoundScore, player2RoundScore] = PAYOFF_MATRIX[moveKey];

      player1TotalScore += player1RoundScore;
      player2TotalScore += player2RoundScore;

      // Record the move
      moves.push({
        round: round + 1,
        player1Move,
        player2Move,
        player1Score: player1RoundScore,
        player2Score: player2RoundScore,
      });

      // Update histories
      player1History.push(player1Move);
      player2History.push(player2Move);
    } catch (error) {
      console.error(`Error in round ${round + 1}:`, error);
      // Continue with default moves if there's an error
      player1History.push("D");
      player2History.push("D");
      player1TotalScore += 1;
      player2TotalScore += 1;
    }
  }

  // Determine winner
  let winner: "player1" | "player2" | "draw";
  if (player1TotalScore > player2TotalScore) {
    winner = "player1";
  } else if (player2TotalScore > player1TotalScore) {
    winner = "player2";
  } else {
    winner = "draw";
  }

  return {
    player1TotalScore,
    player2TotalScore,
    moves,
    winner,
    rounds,
  };
}

// Run a complete tournament
export async function runTournament(tournamentId: string): Promise<void> {
  try {
    console.log(`Starting tournament: ${tournamentId}`);

    // Update tournament status
    await db
      .update(tournaments)
      .set({
        status: "running",
        startedAt: new Date(),
        errorMessage: null,
      })
      .where(eq(tournaments.id, tournamentId));

    // Get tournament details
    const tournamentData = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1);

    if (tournamentData.length === 0) {
      throw new Error("Tournament not found");
    }

    const tournamentInfo = tournamentData[0];

    // Get all active strategies
    const strategiesData = await db
      .select({
        id: strategies.id,
        name: strategies.name,
        code: strategies.code,
        userId: strategies.userId,
      })
      .from(strategies)
      .where(eq(strategies.isActive, true));

    if (strategiesData.length < 2) {
      throw new Error("Need at least 2 active strategies to run tournament");
    }

    console.log(`Found ${strategiesData.length} active strategies`);

    // Clear existing participants for this tournament
    await db
      .delete(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId));

    // Create participants
    const participants = strategiesData.map((s) => ({
      id: generateId(),
      tournamentId,
      strategyId: s.id,
      userId: s.userId,
      totalScore: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      averageScore: 0,
    }));

    await db.insert(tournamentParticipants).values(participants);

    // Run all games (round robin)
    const gamesData: any[] = [];
    for (let i = 0; i < strategiesData.length; i++) {
      for (let j = i + 1; j < strategiesData.length; j++) {
        const strategy1 = strategiesData[i];
        const strategy2 = strategiesData[j];

        console.log(`Playing: ${strategy1.name} vs ${strategy2.name}`);

        const gameResult = await playGame(
          strategy1.code,
          strategy2.code,
          tournamentInfo.roundsPerMatch
        );

        // Record game in database
        const gameRecord = {
          id: generateId(),
          tournamentId,
          strategy1Id: strategy1.id,
          strategy2Id: strategy2.id,
          user1Id: strategy1.userId,
          user2Id: strategy2.userId,
          rounds: gameResult.rounds,
          strategy1Score: gameResult.player1TotalScore,
          strategy2Score: gameResult.player2TotalScore,
          winner:
            gameResult.winner === "player1"
              ? "strategy1"
              : gameResult.winner === "player2"
                ? "strategy2"
                : "draw",
          moves: JSON.stringify(gameResult.moves),
        };

        gamesData.push(gameRecord);

        // Update participant scores - Get current values first
        const participant1 = await db
          .select()
          .from(tournamentParticipants)
          .where(
            and(
              eq(tournamentParticipants.tournamentId, tournamentId),
              eq(tournamentParticipants.strategyId, strategy1.id)
            )
          )
          .limit(1);

        const participant2 = await db
          .select()
          .from(tournamentParticipants)
          .where(
            and(
              eq(tournamentParticipants.tournamentId, tournamentId),
              eq(tournamentParticipants.strategyId, strategy2.id)
            )
          )
          .limit(1);

        if (participant1.length > 0) {
          const p1 = participant1[0];
          await db
            .update(tournamentParticipants)
            .set({
              totalScore: (p1.totalScore || 0) + gameResult.player1TotalScore,
              wins:
                gameResult.winner === "player1"
                  ? (p1.wins || 0) + 1
                  : p1.wins || 0,
              losses:
                gameResult.winner === "player2"
                  ? (p1.losses || 0) + 1
                  : p1.losses || 0,
              draws:
                gameResult.winner === "draw"
                  ? (p1.draws || 0) + 1
                  : p1.draws || 0,
            })
            .where(eq(tournamentParticipants.id, p1.id));
        }

        if (participant2.length > 0) {
          const p2 = participant2[0];
          await db
            .update(tournamentParticipants)
            .set({
              totalScore: (p2.totalScore || 0) + gameResult.player2TotalScore,
              wins:
                gameResult.winner === "player2"
                  ? (p2.wins || 0) + 1
                  : p2.wins || 0,
              losses:
                gameResult.winner === "player1"
                  ? (p2.losses || 0) + 1
                  : p2.losses || 0,
              draws:
                gameResult.winner === "draw"
                  ? (p2.draws || 0) + 1
                  : p2.draws || 0,
            })
            .where(eq(tournamentParticipants.id, p2.id));
        }
      }
    }

    // Insert all games
    if (gamesData.length > 0) {
      await db.insert(games).values(gamesData);
    }

    // Calculate final rankings
    const finalParticipants = await db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId));

    // Sort by total score and assign ranks
    finalParticipants.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    for (let i = 0; i < finalParticipants.length; i++) {
      const participant = finalParticipants[i];
      const totalGames =
        (participant.wins || 0) +
        (participant.losses || 0) +
        (participant.draws || 0);
      const averageScore =
        totalGames > 0 ? (participant.totalScore || 0) / totalGames : 0;

      await db
        .update(tournamentParticipants)
        .set({
          rank: i + 1,
          averageScore,
        })
        .where(eq(tournamentParticipants.id, participant.id));
    }

    // Mark tournament as completed
    await db
      .update(tournaments)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(tournaments.id, tournamentId));

    console.log(`Tournament ${tournamentId} completed successfully`);
  } catch (error) {
    console.error(`Tournament ${tournamentId} failed:`, error);

    // Mark tournament as failed
    await db
      .update(tournaments)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(tournaments.id, tournamentId));

    throw error;
  }
}
