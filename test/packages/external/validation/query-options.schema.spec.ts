import z from "zod";
import { queryOptionsSchema } from "@/packages/external/validation/query-options.schema";
import { MAX_PAGE_SIZE } from "@/packages/building-blocks/pagination";
import type { QueryOptions } from "@/packages/building-blocks/query-options";

const OWNER_ID = "7";
const PAGE = 2;
const PAGE_SIZE = 5;
const LIMIT = 3;

const DEFAULT_SORT = { field: "name", order: "asc" } as const;
const fooSchema = queryOptionsSchema(
    { ownerId: z.string() },
    {
        sort: { fields: ["name", "size"], default: DEFAULT_SORT },
        filters: { color: z.string().optional() },
        limit: true,
    },
);

const failingPaths = (input: unknown): string[] =>
    fooSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("queryOptionsSchema", () => {
    it("Should read the query's own fields and its default sort when no option is given", () => {
        const input = fooSchema.parse({ ownerId: OWNER_ID });

        expect(input).toEqual({ ownerId: OWNER_ID, sort: DEFAULT_SORT });
    });

    it("Should read the page, the page size, the limit and the sort from the query string", () => {
        const input = fooSchema.parse({
            ownerId: OWNER_ID,
            page: String(PAGE),
            pageSize: String(PAGE_SIZE),
            limit: String(LIMIT),
            sort: "size",
            order: "desc",
        });

        expect(input).toEqual({
            ownerId: OWNER_ID,
            page: PAGE,
            pageSize: PAGE_SIZE,
            limit: LIMIT,
            sort: { field: "size", order: "desc" },
        });
    });

    it("Should gather the query's filters under filters", () => {
        const input = fooSchema.parse({ ownerId: OWNER_ID, color: "red" });

        expect(input).toEqual({ ownerId: OWNER_ID, sort: DEFAULT_SORT, filters: { color: "red" } });
    });

    it("Should reject a sort field the query doesn't offer", () => {
        const paths = failingPaths({ ownerId: OWNER_ID, sort: "weight" });

        expect(paths).toEqual(["sort"]);
    });

    it("Should reject an order that is neither asc nor desc", () => {
        const paths = failingPaths({ ownerId: OWNER_ID, order: "up" });

        expect(paths).toEqual(["order"]);
    });

    it.each([
        ["page", "0"],
        ["pageSize", String(MAX_PAGE_SIZE + 1)],
        ["limit", "0"],
        ["limit", String(MAX_PAGE_SIZE + 1)],
    ])("Should reject the %s %p", (name, value) => {
        const paths = failingPaths({ ownerId: OWNER_ID, [name]: value });

        expect(paths).toEqual([name]);
    });

    it("Should not offer a sort, a limit or filters the query didn't ask for", () => {
        const pagedOnly = queryOptionsSchema({ ownerId: z.string() });

        const input = pagedOnly.parse({
            ownerId: OWNER_ID,
            sort: "name",
            order: "asc",
            limit: String(LIMIT),
            color: "red",
        });

        expect(input).toEqual({ ownerId: OWNER_ID });
    });

    it("Should give back the query options typed for its query", () => {
        const input = fooSchema.parse({ ownerId: OWNER_ID });

        expectTypeOf(input).toEqualTypeOf<
            { ownerId: string } & QueryOptions<"name" | "size", { color?: string | undefined }>
        >();
    });
});
