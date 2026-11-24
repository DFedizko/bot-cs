import type { QueryOptions } from "@/packages/building-blocks/query-options";

type FooSort = "name" | "size";
type FooFilters = { color?: string };
type FooOptions = QueryOptions<FooSort, FooFilters>;

describe("QueryOptions", () => {
    it("Should make every option optional", () => {
        const options: FooOptions = {};

        expectTypeOf(options).toEqualTypeOf<FooOptions>();
    });

    it("Should carry the pagination and the limit as numbers", () => {
        expectTypeOf<FooOptions["page"]>().toEqualTypeOf<number | undefined>();
        expectTypeOf<FooOptions["pageSize"]>().toEqualTypeOf<number | undefined>();
        expectTypeOf<FooOptions["limit"]>().toEqualTypeOf<number | undefined>();
    });

    it("Should accept only the sort keys of its query", () => {
        expectTypeOf<FooOptions["sort"]>().toEqualTypeOf<FooSort | undefined>();
    });

    it("Should carry the filters of its query", () => {
        expectTypeOf<FooOptions["filters"]>().toEqualTypeOf<FooFilters | undefined>();
    });

    it("Should have no sort and no filters when its query has none", () => {
        expectTypeOf<QueryOptions["sort"]>().toEqualTypeOf<undefined>();
        expectTypeOf<QueryOptions["filters"]>().toEqualTypeOf<undefined>();
    });
});
