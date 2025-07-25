import { Button } from "@heroui/button";
import { revalidatePath } from "next/cache";
import { createTestTournament } from "@/server/lib/actions";
import { create } from "domain";

export default async function createTournamentButton() {
    return (
        <form action={createTestTournament}>
        <Button
            color="primary"
            type="submit"
        >
            Test-Tournament starten
        </Button>
        </form>
    );
}