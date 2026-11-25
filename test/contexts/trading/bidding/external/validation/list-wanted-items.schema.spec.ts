import { listWantedItemsSchema } from "@/contexts/trading/bidding/external/validation/list-wanted-items.schema";
import { MAX_PAGE_SIZE } from "@/packages/building-blocks/pagination";

const ACCOUNT_ID = "1";
const PAGE = 2;
const PAGE_SIZE = 5;
const NEWEST_FIRST = { field: "addedAt", order: "desc" } as const;

const failingPaths = (input: unknown): string[] =>
    listWantedItemsSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("listWantedItemsSchema", () => {
    it("Should read only the account id and the default sort when nothing else is asked", () => {
        const input = listWantedItemsSchema.parse({ accountId: ACCOUNT_ID });

        expect(input).toEqual({ accountId: 1, sort: NEWEST_FIRST });
    });

    it("Should convert the query strings into the enabled state and the page", () => {
        const input = listWantedItemsSchema.parse({
            accountId: ACCOUNT_ID,
            enabled: "false",
            page: "2",
            pageSize: "5",
        });

        expect(input).toEqual({
            accountId: 1,
            page: PAGE,
            pageSize: PAGE_SIZE,
            sort: NEWEST_FIRST,
            filters: { enabled: false },
        });
    });

    it("Should read an enabled state of true", () => {
        const input = listWantedItemsSchema.parse({ accountId: ACCOUNT_ID, enabled: "true" });

        expect(input.filters).toEqual({ enabled: true });
    });

    it.each([["yes"], ["1"], [""]])("Should reject the enabled state %p", (enabled) => {
        const paths = failingPaths({ accountId: ACCOUNT_ID, enabled });

        expect(paths).toEqual(["enabled"]);
    });

    it.each([["0"], ["-1"], ["1.5"], ["first"]])("Should reject the page %p", (page) => {
        const paths = failingPaths({ accountId: ACCOUNT_ID, page });

        expect(paths).toEqual(["page"]);
    });

    it.each([["0"], [String(MAX_PAGE_SIZE + 1)], ["ten"]])("Should reject the page size %p", (pageSize) => {
        const paths = failingPaths({ accountId: ACCOUNT_ID, pageSize });

        expect(paths).toEqual(["pageSize"]);
    });

    it.each([["addedAt"], ["name"], ["max"], ["rarity"]] as const)("Should read a sort by %p", (field) => {
        const input = listWantedItemsSchema.parse({ accountId: ACCOUNT_ID, sort: field, order: "asc" });

        expect(input.sort).toEqual({ field, order: "asc" });
    });

    it("Should reject an order that is neither asc nor desc", () => {
        const paths = failingPaths({ accountId: ACCOUNT_ID, order: "up" });

        expect(paths).toEqual(["order"]);
    });

    it.each([["price"], ["recent"]])("Should reject the sort field %p", (sort) => {
        const paths = failingPaths({ accountId: ACCOUNT_ID, sort });

        expect(paths).toEqual(["sort"]);
    });

    it("Should accept the max page size", () => {
        const input = listWantedItemsSchema.parse({ accountId: ACCOUNT_ID, pageSize: String(MAX_PAGE_SIZE) });

        expect(input.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it("Should reject an account id that is not a positive whole number", () => {
        const paths = failingPaths({ accountId: "-1" });

        expect(paths).toEqual(["accountId"]);
    });
});
