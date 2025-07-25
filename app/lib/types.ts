import { tournaments } from "../../server/lib/db/schema/tables/tournaments";

// For a row returned from the tournaments table
export type Tournament = typeof tournaments.$inferSelect;
