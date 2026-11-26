import { describe, expect, it } from "bun:test";
import { DEFAULT_WANTED_ITEMS_SEARCH } from "@/features/wanted-items/model/default-wanted-items-search";
import { toWantedItemsPagination } from "@/features/wanted-items/model/to-wanted-items-pagination";

const TOTAL = 47;

describe("toWantedItemsPagination", () => {
    it("Should describe the range the page shows", () => {
        const pagination = toWantedItemsPagination(TOTAL, { ...DEFAULT_WANTED_ITEMS_SEARCH, page: 3 });

        expect(pagination).toMatchObject({ page: 3, pageCount: 3, from: 37, to: 47, total: TOTAL });
    });

    it("Should show an empty range when nothing matches", () => {
        expect(toWantedItemsPagination(0, DEFAULT_WANTED_ITEMS_SEARCH)).toMatchObject({ from: 0, to: 0, pageCount: 1 });
    });
});
