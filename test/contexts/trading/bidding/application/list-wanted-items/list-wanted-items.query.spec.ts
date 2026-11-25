import {
    ListWantedItemsQuery,
    DEFAULT_WANTED_ITEMS_SORT,
    WANTED_ITEMS_SORT_FIELDS,
} from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.query";

const ACCOUNT_ID = 1;
const PAGE = 2;
const PAGE_SIZE = 10;
const QUERY_NAME = "list_wanted_items";

describe("ListWantedItemsQuery", () => {
    it("Should be named after the list wanted items use case", () => {
        const query = new ListWantedItemsQuery({ accountId: ACCOUNT_ID });

        expect(query.name).toBe(QUERY_NAME);
    });

    it("Should carry what the driver asked", () => {
        const query = new ListWantedItemsQuery({
            accountId: ACCOUNT_ID,
            page: PAGE,
            pageSize: PAGE_SIZE,
            sort: { field: "name", order: "asc" },
            filters: { enabled: true },
        });

        expect({ ...query }).toEqual({
            name: QUERY_NAME,
            accountId: ACCOUNT_ID,
            page: PAGE,
            pageSize: PAGE_SIZE,
            sort: { field: "name", order: "asc" },
            filters: { enabled: true },
        });
    });

    it("Should offer the fields the wanted items page sorts by", () => {
        expect(WANTED_ITEMS_SORT_FIELDS).toEqual(["addedAt", "name", "max", "rarity"]);
    });

    it("Should sort the newest items first by default", () => {
        expect(DEFAULT_WANTED_ITEMS_SORT).toEqual({ field: "addedAt", order: "desc" });
    });
});
