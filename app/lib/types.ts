export type Tournament = {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed";
  roundsPerMatch: number;
  scheduledAt?: string | Date | null;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  errorMessage?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};