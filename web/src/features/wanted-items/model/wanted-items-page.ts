import type { WantedItem } from "./wanted-item";

export type WantedItemsCounts = { all: number; enabled: number; disabled: number };

export type WantedItemsPage = {
    items: Array<WantedItem>;
    page: number;
    pageSize: number;
    total: number;
    counts: WantedItemsCounts;
};
