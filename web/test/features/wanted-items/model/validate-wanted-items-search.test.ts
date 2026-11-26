import { describe, expect, it } from "bun:test";
import { DEFAULT_WANTED_ITEMS_SEARCH } from "@/features/wanted-items/model/default-wanted-items-search";
import { validateWantedItemsSearch } from "@/features/wanted-items/model/validate-wanted-items-search";
import type { WantedItemsSearch } from "@/features/wanted-items/model/wanted-items-search";

describe("validateWantedItemsSearch", () => {
    it("Should start with every item, most recent first, on the first page of 18, as a grid", () => {
        expect(validateWantedItemsSearch({})).toEqual({
            filter: "all",
            sort: "recent",
            page: 1,
            pageSize: 18,
            view: "grid",
        });
    });

    it("Should keep the values a link carries", () => {
        const search: WantedItemsSearch = { filter: "paused", sort: "name-desc", page: 3, pageSize: 36, view: "list" };

        expect(validateWantedItemsSearch(search)).toEqual(search);
    });

    it("Should read a page written as text", () => {
        expect(validateWantedItemsSearch({ page: "2" }).page).toBe(2);
    });

    it("Should fall back to the defaults for values it doesn't know", () => {
        const search = { filter: "sold", sort: "price", page: -4, pageSize: 7, view: "table" };

        expect(validateWantedItemsSearch(search)).toEqual(DEFAULT_WANTED_ITEMS_SEARCH);
    });

    it("Should fall back to the first page for a page that isn't whole", () => {
        expect(validateWantedItemsSearch({ page: 1.5 }).page).toBe(1);
    });
});
