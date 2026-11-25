import z from "zod";
import { sortParams, sortSchema } from "@/packages/external/validation/sort.fields";
import type { Sort } from "@/packages/building-blocks/sort";

const FIELDS = ["name", "size"] as const;
const DEFAULT_SORT: Sort<"name" | "size"> = { field: "size", order: "desc" };
const schema = sortSchema(FIELDS, DEFAULT_SORT);

const failingPaths = (input: unknown): string[] =>
    schema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("sortSchema", () => {
    it("Should read the asked field and order as a sort", () => {
        const sort = schema.parse({ sort: "name", order: "asc" });

        expect(sort).toEqual({ field: "name", order: "asc" });
    });

    it("Should give the default sort when neither is asked", () => {
        const sort = schema.parse({});

        expect(sort).toEqual(DEFAULT_SORT);
    });

    it("Should take the default order when only the field is asked", () => {
        const sort = schema.parse({ sort: "name" });

        expect(sort).toEqual({ field: "name", order: "desc" });
    });

    it("Should take the default field when only the order is asked", () => {
        const sort = schema.parse({ order: "asc" });

        expect(sort).toEqual({ field: "size", order: "asc" });
    });

    it("Should reject a field the query doesn't offer", () => {
        const paths = failingPaths({ sort: "weight" });

        expect(paths).toEqual(["sort"]);
    });

    it("Should reject an order that is neither asc nor desc", () => {
        const paths = failingPaths({ order: "up" });

        expect(paths).toEqual(["order"]);
    });

    it("Should give back a sort typed for its query", () => {
        const sort = schema.parse({});

        expectTypeOf(sort).toEqualTypeOf<Sort<"name" | "size">>();
    });
});

describe("sortParams", () => {
    it("Should build the sort and order query params", () => {
        const params = sortParams(FIELDS, DEFAULT_SORT);

        expect(Object.keys(params)).toEqual(["sort", "order"]);
    });

    it("Should describe each param with its default", () => {
        const { sort, order } = sortParams(FIELDS, DEFAULT_SORT);

        expect([z.globalRegistry.get(sort)?.description, z.globalRegistry.get(order)?.description]).toEqual([
            "The field to sort the items by: name or size (default size)",
            "asc puts the lowest first, desc the highest first (default desc)",
        ]);
    });
});
