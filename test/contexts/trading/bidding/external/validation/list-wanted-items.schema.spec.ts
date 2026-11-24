import { listWantedItemsSchema } from "@/contexts/trading/bidding/external/validation/list-wanted-items.schema";
import { MAX_PAGE_SIZE } from "@/packages/building-blocks/pagination";

const ACCOUNT_ID = "1";
const PAGE = 2;
const PAGE_SIZE = 5;

const failingPaths = (input: unknown): string[] =>
    listWantedItemsSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("listWantedItemsSchema", () => {
    it("Should read only the account id when nothing else is asked", () => {
        const input = listWantedItemsSchema.parse({ accountId: ACCOUNT_ID });

        expect(input).toEqual({ accountId: 1 });
    });

    it("Should convert the query strings into the enabled state and the page", () => {
        const input = listWantedItemsSchema.parse({
            accountId: ACCOUNT_ID,
            enabled: "false",
            page: "2",
            pageSize: "5",
        });

        expect(input).toEqual({ accountId: 1, page: PAGE, pageSize: PAGE_SIZE, filters: { enabled: false } });
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

    it.each([["recent"], ["name-asc"], ["name-desc"], ["max-asc"], ["max-desc"], ["rarity"]] as const)(
        "Should read the sort %p",
        (sort) => {
            const input = listWantedItemsSchema.parse({ accountId: ACCOUNT_ID, sort });

            expect(input.sort).toBe(sort);
        },
    );

    it("Should reject a sort key the route doesn't offer", () => {
        const paths = failingPaths({ accountId: ACCOUNT_ID, sort: "price" });

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
