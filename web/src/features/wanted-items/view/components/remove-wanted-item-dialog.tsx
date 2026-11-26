import { XIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog";
import { Button } from "@/shared/ui/components/button";
import type { WantedItemView } from "../../model/wanted-item-view";
import { DialogFailure } from "./dialog-failure";
import { ItemHero } from "./item-hero";

const MAX_LABEL = "Max";

type RemoveWantedItemDialogProps = {
    item: WantedItemView | null;
    pending: boolean;
    failed: boolean;
    onCancel: () => void;
    onRemove: () => void;
    onPause: () => void;
};

const describeItem = ({ wear, max }: WantedItemView) => [wear, `${MAX_LABEL} ${max.value}`].filter(Boolean).join(" · ");

export function RemoveWantedItemDialog({
    item,
    pending,
    failed,
    onCancel,
    onRemove,
    onPause,
}: RemoveWantedItemDialogProps) {
    return (
        <AlertDialog open={item !== null} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent>
                {item && (
                    <>
                        <header className="flex items-start justify-between gap-3 pt-6 pr-4 pl-6">
                            <AlertDialogTitle>Remove from wanted items?</AlertDialogTitle>
                            <AlertDialogClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
                                <XIcon aria-hidden />
                            </AlertDialogClose>
                        </header>
                        <section className="flex flex-col gap-4 px-6 py-4">
                            <section className="rounded-lg border border-line bg-surface-2 p-3">
                                <ItemHero
                                    size="sm"
                                    tone={item.tone}
                                    imageUrl={item.imageUrl}
                                    rarity={item.rarityName}
                                    title={item.shortName}
                                    detail={describeItem(item)}
                                />
                            </section>
                            <AlertDialogDescription>
                                The bot stops bidding on this item right away. Auctions it has already won still get
                                delivered. To stop bidding but keep the item, pause it instead.
                            </AlertDialogDescription>
                            {failed && (
                                <DialogFailure>The bot couldn't remove this item. Try again in a moment.</DialogFailure>
                            )}
                        </section>
                        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
                            <Button variant="ghost" onClick={onCancel}>
                                Cancel
                            </Button>
                            {item.enabled && (
                                <Button variant="secondary" disabled={pending} onClick={onPause}>
                                    Pause instead
                                </Button>
                            )}
                            <Button variant="danger" disabled={pending} onClick={onRemove}>
                                Remove
                            </Button>
                        </footer>
                    </>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}
