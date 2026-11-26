import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/components/button";
import type { ShortcutModifier } from "@/shared/lib/keyboard/shortcut-modifier";
import { ShortcutKbd } from "@/shared/ui/components/shortcut-kbd";

const PLUS_STROKE = 1.8;
const SEARCH_KEY = "k";

type WantedItemsEmptyProps = { shortcutModifier: ShortcutModifier };

export function WantedItemsEmpty({ shortcutModifier }: WantedItemsEmptyProps) {
    return (
        <section
            aria-labelledby="wanted-items-empty"
            className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
            <span
                aria-hidden
                className="mb-4 grid size-32 place-items-center rounded-full border border-dashed border-line"
            >
                <span className="grid size-22 place-items-center rounded-full border border-line-strong">
                    <span className="grid size-14 place-items-center rounded-lg border border-line-strong bg-surface-2 text-accent">
                        <Plus className="size-6" strokeWidth={PLUS_STROKE} />
                    </span>
                </span>
            </span>
            <h2 id="wanted-items-empty" className="text-item-title text-ink">
                No wanted items yet
            </h2>
            <p className="max-w-sm text-body text-muted">
                Add a skin, knife or gloves and the bot will bid on it in CSGOEmpire auctions — never above the max you
                set.
            </p>
            <p className="mt-2 flex items-center gap-2 text-helper text-muted">
                Press <ShortcutKbd modifier={shortcutModifier} shortcutKey={SEARCH_KEY} /> to add one
            </p>
            <Button variant="secondary">
                <Plus data-icon="inline-start" aria-hidden />
                Add wanted item
            </Button>
        </section>
    );
}
