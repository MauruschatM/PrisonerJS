'use client';

import { Button } from "@heroui/button";
import { useRouter } from 'next/navigation';

export default function ReloadButton() {
    const router = useRouter();

    return (
        <Button 
            variant="light" 
            onPress={() => router.refresh()}
        >
            Aktualisieren
        </Button>
        //Alternativ vollständig serverseitig:
        // <Button action -> server action
        // diese fetched die tournaments neu:)
    );
}   