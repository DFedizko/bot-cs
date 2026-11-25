import type { QueryOptions } from "@/packages/building-blocks/query-options";
import type { Sort } from "@/packages/building-blocks/sort";

type FooSortField = "name" | "size";
type FooFilters = { color?: string };
type FooOptions = QueryOptions<FooSortField, FooFilters>;

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

    it("Should sort by a field of its query and an order", () => {
        expectTypeOf<FooOptions["sort"]>().toEqualTypeOf<Sort<FooSortField> | undefined>();
    });

    it("Should carry the filters of its query", () => {
        expectTypeOf<FooOptions["filters"]>().toEqualTypeOf<FooFilters | undefined>();
    });

    it("Should have no sort and no filters when its query has none", () => {
        expectTypeOf<QueryOptions["sort"]>().toEqualTypeOf<undefined>();
        expectTypeOf<QueryOptions["filters"]>().toEqualTypeOf<undefined>();
    });
});
