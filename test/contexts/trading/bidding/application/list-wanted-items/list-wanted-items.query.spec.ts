import { ListWantedItemsQuery } from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.query";

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
            sort: "name",
            filters: { enabled: true },
        });

        expect({ ...query }).toEqual({
            name: QUERY_NAME,
            accountId: ACCOUNT_ID,
            page: PAGE,
            pageSize: PAGE_SIZE,
            sort: "name",
            filters: { enabled: true },
        });
    });
});
