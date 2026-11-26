import type { FormEvent } from "react";
import { Button } from "@/shared/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/components/dialog";
import type { AddWantedItemViewModel } from "../view-model/useAddWantedItemViewModel";
import { AlreadyWantedNotice } from "./components/already-wanted-notice";
import { DialogFailure } from "./components/dialog-failure";
import { ItemHero } from "./components/item-hero";
import { WantedItemMaxFields } from "./components/wanted-item-max-fields";
import { WantedItemTags } from "./components/wanted-item-tags";
import { StartEnabledField, WearField } from "./components/wanted-item-form";

const WEAR_HINT = "Prefilled from the item";

function AddWantedItemForm(viewModel: AddWantedItemViewModel) {
    const { item, draft, maxError, percentageHint, alreadyWanted, failed, pending, changeDraft, submit, close } =
        viewModel;
    if (!item || !draft) return null;
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        submit();
    };
    return (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col">
            <header className="flex flex-col gap-1 px-6 pt-6 pr-8">
                <DialogTitle className="text-heading text-ink">Add wanted item</DialogTitle>
                <DialogDescription className="text-helper text-muted">
                    The bot will bid on this item in CSGOEmpire auctions.
                </DialogDescription>
            </header>
            <section className="flex flex-col gap-6 p-6">
                {alreadyWanted && <AlreadyWantedNotice />}
                <ItemHero
                    tone={item.tone}
                    imageUrl={item.imageUrl}
                    rarity={`${item.rarity} · ${item.weapon}`}
                    title={item.title}
                    detail={item.wear}
                >
                    <span className="flex gap-1 empty:hidden">
                        <WantedItemTags stattrak={item.stattrak} souvenir={item.souvenir} />
                    </span>
                </ItemHero>
                <WantedItemMaxFields
                    draft={draft}
                    error={maxError}
                    percentageHint={percentageHint}
                    onChange={changeDraft}
                />
                {item.wear && (
                    <WearField value={draft.wear} hint={WEAR_HINT} onChange={(wear) => changeDraft({ wear })} />
                )}
                <StartEnabledField value={draft.enabled} onChange={(enabled) => changeDraft({ enabled })} />
                {failed && <DialogFailure>The bot couldn't add this item. Try again in a moment.</DialogFailure>}
            </section>
            <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
                <Button type="button" variant="ghost" onClick={close}>
                    Cancel
                </Button>
                <Button type="submit" disabled={pending || alreadyWanted}>
                    Add wanted item
                </Button>
            </footer>
        </form>
    );
}

export function AddWantedItemView(viewModel: AddWantedItemViewModel) {
    return (
        <Dialog open={viewModel.item !== null} onOpenChange={(open) => !open && viewModel.close()}>
            <DialogContent className="max-h-screen max-w-lg gap-0 overflow-y-auto rounded-xl border border-line-strong bg-surface p-0 shadow-modal sm:max-w-lg">
                <AddWantedItemForm {...viewModel} />
            </DialogContent>
        </Dialog>
    );
}
