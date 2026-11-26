import type { WantedItemsSort } from "./wanted-items-sort";

export type SortField = "addedAt" | "name" | "max" | "rarity";

export type SortOrder = "asc" | "desc";

export type WantedItemsSortOption = { label: string; hint: string; sort: SortField; order: SortOrder };

export const WANTED_ITEMS_SORT_OPTIONS: Readonly<Record<WantedItemsSort, WantedItemsSortOption>> = {
    recent: { label: "Most recent", hint: "newest first", sort: "addedAt", order: "desc" },
    "name-asc": { label: "Name A → Z", hint: "alphabetical", sort: "name", order: "asc" },
    "name-desc": { label: "Name Z → A", hint: "reverse", sort: "name", order: "desc" },
    "max-asc": { label: "Max lowest", hint: "lowest first", sort: "max", order: "asc" },
    "max-desc": { label: "Max highest", hint: "highest first", sort: "max", order: "desc" },
    rarity: { label: "Rarity", hint: "highest first", sort: "rarity", order: "desc" },
};
