import { describe, expect, it } from "bun:test";
import { DEFAULT_WANTED_ITEMS_SEARCH } from "@/features/wanted-items/model/default-wanted-items-search";
import { toWantedItemsQuery } from "@/features/wanted-items/model/to-wanted-items-query";
import type { WantedItemsSort } from "@/features/wanted-items/model/wanted-items-sort";

const SORTS: ReadonlyArray<[WantedItemsSort, string, string]> = [
    ["recent", "addedAt", "desc"],
    ["name-asc", "name", "asc"],
    ["name-desc", "name", "desc"],
    ["max-asc", "max", "asc"],
    ["max-desc", "max", "desc"],
    ["rarity", "rarity", "desc"],
];

describe("toWantedItemsQuery", () => {
    it.each(SORTS)("Should sort %s by %s %s", (sort, field, order) => {
        expect(toWantedItemsQuery({ ...DEFAULT_WANTED_ITEMS_SEARCH, sort })).toMatchObject({ sort: field, order });
    });

    it("Should ask for every item when the filter is all", () => {
        expect(toWantedItemsQuery(DEFAULT_WANTED_ITEMS_SEARCH).enabled).toBeUndefined();
    });

    it("Should ask for the enabled items when the filter is active", () => {
        expect(toWantedItemsQuery({ ...DEFAULT_WANTED_ITEMS_SEARCH, filter: "active" }).enabled).toBe(true);
    });

    it("Should ask for the disabled items when the filter is paused", () => {
        expect(toWantedItemsQuery({ ...DEFAULT_WANTED_ITEMS_SEARCH, filter: "paused" }).enabled).toBe(false);
    });

    it("Should ask for the page and its size", () => {
        expect(toWantedItemsQuery({ ...DEFAULT_WANTED_ITEMS_SEARCH, page: 2, pageSize: 36 })).toMatchObject({
            page: 2,
            pageSize: 36,
        });
    });
});
