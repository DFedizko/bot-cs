import type { WantedItemsFilter } from "../../model/wanted-items-filter";

export const FILTER_LABELS: Readonly<Record<WantedItemsFilter, string>> = {
    all: "All",
    active: "Active",
    paused: "Paused",
};
