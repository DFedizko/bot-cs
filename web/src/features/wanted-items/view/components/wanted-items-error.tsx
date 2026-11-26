import { RotateCw } from "lucide-react";
import { Button } from "@/shared/ui/components/button";

type WantedItemsErrorProps = { onRetry: () => void };

export function WantedItemsError({ onRetry }: WantedItemsErrorProps) {
    return (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div role="alert" className="flex flex-col gap-2">
                <h2 className="text-heading text-ink">Couldn't load your wanted items</h2>
                <p className="text-body text-muted">The bot didn't answer. Check that it is running and try again.</p>
            </div>
            <Button variant="secondary" onClick={onRetry}>
                <RotateCw data-icon="inline-start" aria-hidden />
                Try again
            </Button>
        </section>
    );
}
