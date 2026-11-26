import type { WantedItemsCounts } from "./wanted-items-page";

export type WantedItemsStatus = "loading" | "error" | "empty" | "ready";

type WantedItemsQueryState = { isPending: boolean; isError: boolean; counts: WantedItemsCounts | undefined };

export function toWantedItemsStatus({ isPending, isError, counts }: WantedItemsQueryState): WantedItemsStatus {
    if (isError) return "error";
    if (isPending || !counts) return "loading";
    return counts.all === 0 ? "empty" : "ready";
}
